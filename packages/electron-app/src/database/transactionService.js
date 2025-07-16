// packages/electron-app/src/database/transactionService.js
const { getDb } = require('./connection');
const tradeService = require('./tradeService'); // To call _recalculateTradeState
const accountService = require('./accountService');
const { decimal, toNumber, isGreaterThan, isValidFinancialNumber } = require('./financialUtils');

function addTransactionAndManageTrade(transactionData) {
  // Accepts optional account_id; fallback to first available cash account if not provided
  let { account_id } = transactionData;

  console.log('[TRANSACTION_SERVICE] addTransactionAndManageTrade CALLED');
  const db = getDb();
  const {
    instrument_ticker, asset_class, exchange,
    action, quantity, price, datetime,
    fees_for_transaction = 0, notes_for_transaction = null,
    // Include other potential fields from LogTransactionPayload if they are to be stored directly on transaction
    strategy_id, market_conditions, setup_description, reasoning, lessons_learned, r_multiple_initial_risk, emotion_ids = []
  } = transactionData;

  if (!instrument_ticker || !asset_class || !exchange || !action || quantity <= 0 || price <= 0 || !datetime) {
    throw new Error("[TRANSACTION_SERVICE] Invalid transaction: Missing required fields or values are not positive.");
  }

  const transactFnResult = db.transaction(() => {
    let trade;
    // Find the most recent trade for this instrument, asset class, and exchange
    const findMostRecentTradeQuery = `
      SELECT trade_id, trade_direction, status 
      FROM trades  
      WHERE instrument_ticker = @instrument_ticker  
      AND asset_class = @asset_class  
      AND exchange = @exchange  
      ORDER BY trade_id DESC LIMIT 1
    `;
    trade = db.prepare(findMostRecentTradeQuery).get({ instrument_ticker, asset_class, exchange });

    let current_trade_id;
    let position_trade_direction;

    // If no trade exists, or the most recent trade is closed, create a new trade
    if (!trade || trade.status !== 'Open') {
      position_trade_direction = (action === 'Buy') ? 'Long' : 'Short';
      const newTradeStmt = db.prepare(
        `INSERT INTO trades (
          instrument_ticker, asset_class, exchange, trade_direction, status, open_datetime, 
          fees_total, created_at, updated_at, latest_trade
        ) VALUES (
          @instrument_ticker, @asset_class, @exchange, @trade_direction, 'Open', @open_datetime, 
          0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, @datetime
        ) RETURNING trade_id` // Set latest_trade on creation
      );
      const newTradeResult = newTradeStmt.get({
        instrument_ticker, asset_class, exchange,
        trade_direction: position_trade_direction, open_datetime: datetime, datetime
      });
      current_trade_id = newTradeResult.trade_id;
      if (!current_trade_id) throw new Error("[TRANSACTION_SERVICE] DB error: Failed to create new trade.");
      // On new trade (first transaction), subtract initial cost from account as "trade_open"
      // For now, assume full notional: quantity * price + fees
      const openAmount = -1 * (quantity * price + (fees_for_transaction || 0));
      accountService.addAccountTransaction({
        accountId: account_id,
        type: 'trade_open',
        amount: openAmount,
        relatedTradeId: current_trade_id,
        memo: `Open trade for ${instrument_ticker}`
      });
    } else {
      // Defensive: ensure trade is still open
      const tradeStatusCheck = db.prepare('SELECT status FROM trades WHERE trade_id = ?').get(trade.trade_id);
      if (!tradeStatusCheck || tradeStatusCheck.status !== 'Open') {
        throw new Error(`[TRANSACTION_SERVICE] Attempted to append transaction to a closed trade (ID: ${trade.trade_id}). This should never happen.`);
      }
      current_trade_id = trade.trade_id;
      position_trade_direction = trade.trade_direction;
    }

    // Check position size before exiting using precise decimal arithmetic
    const transactionsForThisTrade = db.prepare('SELECT action, quantity FROM transactions WHERE trade_id = ?').all(current_trade_id);
    let currentOpenPositionDecimal = decimal(0);
    transactionsForThisTrade.forEach(tx => {
      if (position_trade_direction === 'Long') {
        currentOpenPositionDecimal = currentOpenPositionDecimal.plus(tx.action === 'Buy' ? tx.quantity : -tx.quantity);
      } else {
        currentOpenPositionDecimal = currentOpenPositionDecimal.plus(tx.action === 'Sell' ? tx.quantity : -tx.quantity);
      }
    });
    const currentOpenPositionSize = toNumber(currentOpenPositionDecimal);

    const isExitingAction = (position_trade_direction === 'Long' && action === 'Sell') ||
                           (position_trade_direction === 'Short' && action === 'Buy');

    // Use precise comparison instead of arbitrary epsilon
    if (isExitingAction && isGreaterThan(quantity, currentOpenPositionSize)) {
      throw new Error(`[TRANSACTION_SERVICE] Cannot ${action.toLowerCase()} ${quantity}. Only ${currentOpenPositionSize} effectively open for trade ID ${current_trade_id}.`);
    }

    // Insert strategy_id and all relevant fields into transactions
    const transactionInsertStmt = db.prepare(
      `INSERT INTO transactions (
         trade_id, action, quantity, price, datetime, fees, notes, 
         strategy_id, market_conditions, setup_description, reasoning, lessons_learned, r_multiple_initial_risk
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING transaction_id`
    );
    const transactionResult = transactionInsertStmt.get(
      current_trade_id, action, quantity, price, datetime, fees_for_transaction, notes_for_transaction,
      strategy_id, market_conditions, setup_description, reasoning, lessons_learned, r_multiple_initial_risk
    );
    if (!transactionResult || !transactionResult.transaction_id) throw new Error("[TRANSACTION_SERVICE] DB error: Failed to insert transaction.");
    
    // Link emotions to transaction
    if (emotion_ids && emotion_ids.length > 0) {
        const insertEmotionStmt = db.prepare('INSERT INTO transaction_emotions (transaction_id, emotion_id) VALUES (?, ?)');
        for (const emotionId of emotion_ids) {
            insertEmotionStmt.run(transactionResult.transaction_id, emotionId);
        }
    }

    // Credit account for every closing transaction (partial or full close)
    if (isExitingAction) {
      // Proceeds = quantity * price - fees
      const proceeds = quantity * price - (fees_for_transaction || 0);
      accountService.addAccountTransaction({
        accountId: account_id,
        type: 'trade_close',
        amount: proceeds,
        relatedTradeId: current_trade_id,
        memo: `Close (partial or full) for ${instrument_ticker}`
      });
    }

    tradeService._recalculateTradeState(current_trade_id, db); // Pass db instance for transaction

    return {
      transaction_id: transactionResult.transaction_id,
      trade_id: current_trade_id,
      trade_direction: position_trade_direction
    };
  })(); // Immediately invoke the transaction

  return { success: true, message: 'Transaction logged successfully.', ...transactFnResult };
}


function updateSingleTransaction(data) {
  console.log('[TRANSACTION_SERVICE] updateSingleTransaction CALLED');
  const db = getDb();
  try {
    const {
      transaction_id, quantity, price, datetime, fees, notes,
      strategy_id, market_conditions, setup_description, reasoning, lessons_learned, r_multiple_initial_risk, emotion_ids = []
    } = data;

    const txDetails = db.prepare('SELECT trade_id FROM transactions WHERE transaction_id = ?').get(transaction_id);
    if (!txDetails) {
      return { success: false, message: `[TRANSACTION_SERVICE] Update failed: Transaction ID ${transaction_id} not found.` };
    }

    db.transaction(() => {
      const stmt = db.prepare(`
        UPDATE transactions SET 
          quantity = @quantity, price = @price, datetime = @datetime, fees = @fees, notes = @notes,
          strategy_id = @strategy_id, market_conditions = @market_conditions, setup_description = @setup_description,
          reasoning = @reasoning, lessons_learned = @lessons_learned, r_multiple_initial_risk = @r_multiple_initial_risk
        WHERE transaction_id = @transaction_id
      `);
      stmt.run({
        quantity, price, datetime, fees, notes,
        strategy_id: strategy_id === undefined ? null : strategy_id,
        market_conditions: market_conditions === undefined ? null : market_conditions,
        setup_description: setup_description === undefined ? null : setup_description,
        reasoning: reasoning === undefined ? null : reasoning,
        lessons_learned: lessons_learned === undefined ? null : lessons_learned,
        r_multiple_initial_risk: (r_multiple_initial_risk === undefined || r_multiple_initial_risk === null || isNaN(parseFloat(r_multiple_initial_risk))) ? null : parseFloat(r_multiple_initial_risk),
        transaction_id
      });

      // Update emotions
      db.prepare('DELETE FROM transaction_emotions WHERE transaction_id = ?').run(transaction_id);
      if (emotion_ids && emotion_ids.length > 0) {
        const insertEmotionStmt = db.prepare('INSERT INTO transaction_emotions (transaction_id, emotion_id) VALUES (?, ?)');
        for (const emotionId of emotion_ids) {
          insertEmotionStmt.run(transaction_id, emotionId);
        }
      }
      tradeService._recalculateTradeState(txDetails.trade_id, db); // Pass db for transaction
    })();
    
    return { success: true, message: 'Transaction updated successfully.' };
  } catch (error) {
    console.error('[TRANSACTION_SERVICE] Error updating transaction:', error);
    return { success: false, message: (error instanceof Error ? error.message : String(error)) || 'Failed to update transaction.' };
  }
}

function deleteSingleTransaction(transaction_id) {
  console.log(`[TRANSACTION_SERVICE] deleteSingleTransaction CALLED for ID: ${transaction_id}`);
  const db = getDb();
  try {
    const transactFnResult = db.transaction(() => {
      const tx = db.prepare('SELECT trade_id FROM transactions WHERE transaction_id = ?').get(transaction_id);
      if (!tx) {
        throw new Error(`[TRANSACTION_SERVICE] Delete failed: Transaction ID ${transaction_id} not found.`);
      }
      // transaction_emotions will be deleted by CASCADE
      db.prepare('DELETE FROM transactions WHERE transaction_id = ?').run(transaction_id);
      const recalcResult = tradeService._recalculateTradeState(tx.trade_id, db); // Pass db for transaction
      return recalcResult; // Return result of recalculation (e.g., if trade was deleted)
    })();

    if (transactFnResult.error) { // If _recalculateTradeState returned an error object
        return { success: false, message: transactFnResult.error };
    }
    return { success: true, message: 'Transaction deleted successfully.' };
  } catch (error) {
    console.error('[TRANSACTION_SERVICE] Error deleting transaction:', error);
    return { success: false, message: (error instanceof Error ? error.message : String(error)) || 'Failed to delete transaction.' };
  }
}

module.exports = {
  addTransactionAndManageTrade,
  logTransaction: addTransactionAndManageTrade, // Alias for convenience
  updateSingleTransaction,
  deleteSingleTransaction,
};