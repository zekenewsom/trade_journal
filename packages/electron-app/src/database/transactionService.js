// packages/electron-app/src/database/transactionService.js
const { getDb } = require('./connection');
const tradeService = require('./tradeService'); // To call _recalculateTradeState
const accountService = require('./accountService');
const { decimal, toNumber, isGreaterThan, isValidFinancialNumber } = require('./financialUtils');
const { processTransactionWithPositionTracking, processCSVTransactionForImport } = require('./positionTracker');

function _addTransactionInternal(transactionData, isCSV = false) {
  let { account_id } = transactionData;
  const db = getDb();
  const {
    instrument_ticker, asset_class, exchange,
    action: rawAction, quantity, price, datetime,
    fees_for_transaction = 0, notes_for_transaction = null,
    strategy_id, market_conditions, setup_description, reasoning, lessons_learned, r_multiple_initial_risk, emotion_ids = [],
    closedPnl = null
  } = transactionData;

  if (!instrument_ticker || !asset_class || !exchange || !rawAction || quantity <= 0 || price <= 0 || !datetime) {
    throw new Error(`[TRANSACTION_SERVICE] Invalid${isCSV ? ' CSV' : ''} transaction: Missing required fields or values are not positive.`);
  }

  const transactFnResult = db.transaction(() => {
    // Use appropriate position tracking
    const positionAnalysis = isCSV
      ? processCSVTransactionForImport(db, { instrument_ticker, asset_class, exchange, action: rawAction, quantity })
      : processTransactionWithPositionTracking(db, { instrument_ticker, asset_class, exchange, action: rawAction, quantity });

    console.log(`[TRANSACTION_SERVICE]${isCSV ? ' CSV' : ''} Position analysis:`, positionAnalysis);

    let current_trade_id;
    let position_trade_direction = positionAnalysis.trade_direction;
    const finalAction = positionAnalysis.action;

    // Create new trade if needed
    if (positionAnalysis.shouldCreateNewTrade) {
      console.log(`[TRANSACTION_SERVICE] Creating new trade${isCSV ? ' for CSV' : ''}: ${positionAnalysis.processingReason}`);
      const isLeveraged = exchange === 'HyperLiquid' || closedPnl !== null;
      const newTradeStmt = db.prepare(
        `INSERT INTO trades (
          instrument_ticker, asset_class, exchange, trade_direction, status, open_datetime, 
          fees_total, is_leveraged, leverage_ratio, created_at, updated_at, latest_trade
        ) VALUES (
          @instrument_ticker, @asset_class, @exchange, @trade_direction, 'Open', @open_datetime, 
          0, @is_leveraged, @leverage_ratio, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, @datetime
        ) RETURNING trade_id`
      );
      const newTradeResult = newTradeStmt.get({
        instrument_ticker, asset_class, exchange,
        trade_direction: position_trade_direction, 
        open_datetime: datetime, 
        datetime,
        is_leveraged: isLeveraged ? 1 : 0,
        leverage_ratio: isLeveraged ? 1.0 : null
      });
      current_trade_id = newTradeResult.trade_id;
      if (!current_trade_id) throw new Error(`[TRANSACTION_SERVICE] DB error: Failed to create new trade${isCSV ? ' for CSV' : ''}.`);
    } else {
      current_trade_id = positionAnalysis.trade_id;
      console.log(`[TRANSACTION_SERVICE] Using existing trade ${current_trade_id}${isCSV ? ' for CSV' : ''}: ${positionAnalysis.processingReason}`);
      const tradeStatusCheck = db.prepare('SELECT status FROM trades WHERE trade_id = ?').get(current_trade_id);
      if (!tradeStatusCheck || tradeStatusCheck.status !== 'Open') {
        throw new Error(`[TRANSACTION_SERVICE] Attempted to append${isCSV ? ' CSV' : ''} transaction to a closed trade (ID: ${current_trade_id}). This should never happen.`);
      }
    }

    // Position validation with special handling for CSV imports
    const transactionsForThisTrade = db.prepare('SELECT action, quantity FROM transactions WHERE trade_id = ?').all(current_trade_id);
    let currentOpenPositionDecimal = decimal(0);
    transactionsForThisTrade.forEach(tx => {
      const txQuantity = decimal(tx.quantity);
      if (position_trade_direction === 'Long') {
        currentOpenPositionDecimal = tx.action === 'Buy' 
          ? currentOpenPositionDecimal.plus(txQuantity) 
          : currentOpenPositionDecimal.minus(txQuantity);
      } else {
        currentOpenPositionDecimal = tx.action === 'Sell' 
          ? currentOpenPositionDecimal.plus(txQuantity) 
          : currentOpenPositionDecimal.minus(txQuantity);
      }
    });
    const currentOpenPositionSize = toNumber(currentOpenPositionDecimal);
    const isExitingAction = (position_trade_direction === 'Long' && finalAction === 'Sell') ||
                           (position_trade_direction === 'Short' && finalAction === 'Buy');
    const quantityDecimal = decimal(quantity);
    const tolerance = decimal(0.00000001);
    
    if (isExitingAction && quantityDecimal.gt(currentOpenPositionDecimal.plus(tolerance))) {
      if (isCSV) {
        // For CSV imports, log warning and flag for review instead of blocking
        console.warn(`[TRANSACTION_SERVICE] CSV IMPORT WARNING: Position validation failed for trade ID ${current_trade_id}. Attempting to ${finalAction.toLowerCase()} ${quantity} but only ${currentOpenPositionSize} effectively open. Transaction will be flagged for review.`);
        // Flag this transaction for later review by adding a note
        const reviewNote = `[REVIEW NEEDED] Position validation failed: Attempting to ${finalAction.toLowerCase()} ${quantity} but only ${currentOpenPositionSize} effectively open. CSV import may contain inconsistent data.`;
        notes_for_transaction = notes_for_transaction ? `${notes_for_transaction} ${reviewNote}` : reviewNote;
      } else {
        // For non-CSV transactions, maintain strict validation
        throw new Error(`[TRANSACTION_SERVICE] Cannot ${finalAction.toLowerCase()} ${quantity}. Only ${currentOpenPositionSize} effectively open for trade ID ${current_trade_id}.`);
      }
    }

    // Insert transaction with final processed action
    const transactionInsertStmt = db.prepare(
      `INSERT INTO transactions (
         trade_id, action, quantity, price, datetime, fees, notes, 
         strategy_id, market_conditions, setup_description, reasoning, lessons_learned, r_multiple_initial_risk, closed_pnl
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING transaction_id`
    );
    const notesValue = isCSV
      ? (notes_for_transaction || `CSV Import: ${positionAnalysis.processingReason}${positionAnalysis.isLiquidation ? ' (Liquidation)' : ''}`)
      : (notes_for_transaction || `${positionAnalysis.processingReason}${positionAnalysis.isLiquidation ? ' (Liquidation)' : ''}`);
    const transactionResult = transactionInsertStmt.get(
      current_trade_id, finalAction, quantity, price, datetime, fees_for_transaction, 
      notesValue,
      strategy_id, market_conditions, setup_description, reasoning, lessons_learned, r_multiple_initial_risk, closedPnl
    );
    if (!transactionResult || !transactionResult.transaction_id) throw new Error(`[TRANSACTION_SERVICE] DB error: Failed to insert${isCSV ? ' CSV' : ''} transaction.`);

    // Link emotions to transaction
    if (emotion_ids && emotion_ids.length > 0) {
        const insertEmotionStmt = db.prepare('INSERT INTO transaction_emotions (transaction_id, emotion_id) VALUES (?, ?)');
        for (const emotionId of emotion_ids) {
            insertEmotionStmt.run(transactionResult.transaction_id, emotionId);
        }
    }

    // Record cash flow when closedPnl is provided (from HyperLiquid CSV)
    if (closedPnl !== null && closedPnl !== undefined && parseFloat(closedPnl) !== 0) {
      accountService.addAccountTransaction({
        accountId: account_id,
        type: 'trade_transaction',
        amount: parseFloat(closedPnl),
        relatedTradeId: current_trade_id,
        memo: `${finalAction} ${quantity} ${instrument_ticker} @ ${price} (Realized P&L: ${closedPnl})`
      });
    }

    // Recalculate trade state
    tradeService._recalculateTradeState(current_trade_id, db);

    return {
      transaction_id: transactionResult.transaction_id,
      trade_id: current_trade_id,
      trade_direction: position_trade_direction,
      processed_action: finalAction,
      original_action: rawAction,
      position_analysis: positionAnalysis
    };
  })();

  console.log(`[TRANSACTION_SERVICE]${isCSV ? ' CSV' : ''} Transaction processed successfully:`, {
    trade_id: transactFnResult.trade_id,
    original_action: transactFnResult.original_action,
    processed_action: transactFnResult.processed_action,
    reason: transactFnResult.position_analysis.processingReason
  });

  return { success: true, message: `${isCSV ? 'CSV ' : ''}transaction logged successfully.`, ...transactFnResult };
}

function addTransactionAndManageTrade(transactionData) {
  return _addTransactionInternal(transactionData, false);
}

function addCSVTransactionAndManageTrade(transactionData) {
  return _addTransactionInternal(transactionData, true);
}

function updateSingleTransaction(data) {
  console.log('[TRANSACTION_SERVICE] updateSingleTransaction CALLED');
  const db = getDb();
  try {
    const {
      transaction_id, quantity, price, datetime, fees, notes,
      strategy_id, market_conditions, setup_description, reasoning, lessons_learned, r_multiple_initial_risk, emotion_ids = [],
      closedPnl = null
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
          reasoning = @reasoning, lessons_learned = @lessons_learned, r_multiple_initial_risk = @r_multiple_initial_risk,
          closed_pnl = @closed_pnl
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
        closed_pnl: closedPnl === undefined ? null : closedPnl,
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
      tradeService._recalculateTradeState(txDetails.trade_id, db);
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
    const txDetails = db.prepare('SELECT trade_id FROM transactions WHERE transaction_id = ?').get(transaction_id);
    if (!txDetails) {
      return { success: false, message: `[TRANSACTION_SERVICE] Delete failed: Transaction ID ${transaction_id} not found.` };
    }

    db.transaction(() => {
      db.prepare('DELETE FROM transaction_emotions WHERE transaction_id = ?').run(transaction_id);
      db.prepare('DELETE FROM transactions WHERE transaction_id = ?').run(transaction_id);
      tradeService._recalculateTradeState(txDetails.trade_id, db);
    })();
    
    return { success: true, message: 'Transaction deleted successfully.' };
  } catch (error) {
    console.error('[TRANSACTION_SERVICE] Error deleting transaction:', error);
    return { success: false, message: (error instanceof Error ? error.message : String(error)) || 'Failed to delete transaction.' };
  }
}

module.exports = {
  addTransactionAndManageTrade,
  addCSVTransactionAndManageTrade,
  updateSingleTransaction,
  deleteSingleTransaction
};