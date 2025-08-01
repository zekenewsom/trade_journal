// packages/electron-app/src/database/tradeService.js
const { getDb } = require('./connection');
const { decimal, toNumber, multiply, add, subtract, divide, isEqual, determineTradeOutcome } = require('./financialUtils');

// Consolidated and primary version of P&L calculation using precise decimal arithmetic
function calculateTradePnlFifoEnhanced(trade, transactionsForThisTrade) {
    let realizedGrossPnlDecimal = decimal(0);
    let feesAttributableToClosedPortionDecimal = decimal(0);
    let closedQuantityThisTradeDecimal = decimal(0);
    let totalValueForOpenEntriesDecimal = decimal(0);
    let cumulativeEntryQuantityForOpenDecimal = decimal(0);
    let weightedAvgEntryPriceForOpenPortion = null;

    const entries = transactionsForThisTrade
        .filter(tx => (trade.trade_direction === 'Long' && tx.action === 'Buy') || (trade.trade_direction === 'Short' && tx.action === 'Sell'))
        .map(tx => ({ ...tx, remainingQuantity: Math.abs(tx.quantity) }))
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

    const exits = transactionsForThisTrade
        .filter(tx => (trade.trade_direction === 'Long' && tx.action === 'Sell') || (trade.trade_direction === 'Short' && tx.action === 'Buy'))
        .map(tx => ({ ...tx, remainingQuantity: Math.abs(tx.quantity) }))
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

    const directionMultiplier = trade.trade_direction === 'Long' ? 1 : -1;
    
    for (const exit of exits) {
        let exitQtyToMatchDecimal = decimal(exit.quantity);
        feesAttributableToClosedPortionDecimal = feesAttributableToClosedPortionDecimal.plus(exit.fees || 0);
        for (const entry of entries) {
            if (entry.remainingQuantity === 0 || exitQtyToMatchDecimal.isZero()) continue;
            const matchedQtyDecimal = decimal(Math.min(toNumber(exitQtyToMatchDecimal), entry.remainingQuantity));
            const priceDiff = subtract(exit.price, entry.price);
            const pnl = multiply(multiply(priceDiff, matchedQtyDecimal), directionMultiplier);
            realizedGrossPnlDecimal = realizedGrossPnlDecimal.plus(pnl);
            if (entry.quantity > 0) { // Ensure entry quantity is not zero to avoid division by zero
                const feeRatio = divide(matchedQtyDecimal, entry.quantity);
                const attributableFee = multiply(entry.fees || 0, feeRatio);
                feesAttributableToClosedPortionDecimal = feesAttributableToClosedPortionDecimal.plus(attributableFee);
            }
            entry.remainingQuantity = toNumber(subtract(entry.remainingQuantity, matchedQtyDecimal));
            exitQtyToMatchDecimal = exitQtyToMatchDecimal.minus(matchedQtyDecimal);
            closedQuantityThisTradeDecimal = closedQuantityThisTradeDecimal.plus(matchedQtyDecimal);
            if (exitQtyToMatchDecimal.isZero()) break;
        }
    }

    entries.forEach(entry => {
        if(entry.remainingQuantity > 0){
            const entryValue = multiply(entry.price, entry.remainingQuantity);
            totalValueForOpenEntriesDecimal = totalValueForOpenEntriesDecimal.plus(entryValue);
            cumulativeEntryQuantityForOpenDecimal = cumulativeEntryQuantityForOpenDecimal.plus(entry.remainingQuantity);
        }
    });

    if(cumulativeEntryQuantityForOpenDecimal.gt(0)){
        weightedAvgEntryPriceForOpenPortion = toNumber(divide(totalValueForOpenEntriesDecimal, cumulativeEntryQuantityForOpenDecimal));
    }

    const realizedGrossPnl = toNumber(realizedGrossPnlDecimal);
    const feesAttributableToClosedPortion = toNumber(feesAttributableToClosedPortionDecimal);
    const realizedNetPnl = toNumber(subtract(realizedGrossPnlDecimal, feesAttributableToClosedPortionDecimal));
    const openQuantity = toNumber(cumulativeEntryQuantityForOpenDecimal);
    const closedQuantityThisTrade = toNumber(closedQuantityThisTradeDecimal);
    let unrealizedGrossPnlOnOpenPortion = null;

    if (openQuantity > 0 && weightedAvgEntryPriceForOpenPortion !== null && trade.current_market_price !== null && trade.current_market_price !== undefined) {
        unrealizedGrossPnlOnOpenPortion = (trade.current_market_price - weightedAvgEntryPriceForOpenPortion) * openQuantity * directionMultiplier;
    }
    
    let rMultipleActual = null;
    if (trade.status === 'Closed' && trade.r_multiple_initial_risk && trade.r_multiple_initial_risk !== 0) {
        const finalNetPnlForR = realizedGrossPnl - (trade.fees_total || 0);
        rMultipleActual = finalNetPnlForR / trade.r_multiple_initial_risk;
    }

    let durationMs = null;
    if (trade.status === 'Closed' && trade.open_datetime && trade.close_datetime) {
        durationMs = new Date(trade.close_datetime).getTime() - new Date(trade.open_datetime).getTime();
    }
    
    let outcome = null;
    if (trade.status === 'Closed') {
        const finalNetPnlForOutcome = toNumber(subtract(realizedGrossPnl, trade.fees_total || 0));
        outcome = determineTradeOutcome(finalNetPnlForOutcome);
    }

    console.log('[TRADE_SERVICE - P&L CALC DEBUG]', {
        trade_id: trade.trade_id, openQuantity, weightedAvgEntryPriceForOpenPortion,
        current_market_price: trade.current_market_price, unrealizedGrossPnlOnOpenPortion,
        realizedGrossPnl, realizedNetPnl, outcome
    });

    return {
        trade_id: trade.trade_id,
        realizedGrossPnl,
        realizedNetPnl,
        feesAttributableToClosedPortion,
        isFullyClosed: trade.status === 'Closed' && openQuantity === 0,
        closedQuantity: closedQuantityThisTrade,
        openQuantity,
        averageOpenPrice: weightedAvgEntryPriceForOpenPortion,
        unrealizedGrossPnlOnOpenPortion,
        rMultipleActual,
        durationMs,
        outcome,
        relevantDate: trade.status === 'Closed' ? trade.close_datetime : trade.open_datetime || trade.created_at,
        asset_class: trade.asset_class,
        exchange: trade.exchange,
        strategy_id: trade.strategy_id,
    };
}


function _recalculateTradeState(trade_id, currentDbInstance) {
  const db = currentDbInstance || getDb();
  console.log(`[TRADE_SERVICE] Recalculating state for trade ID: ${trade_id}`);

  const allTransactions = db.prepare(
    'SELECT transaction_id, action, quantity, fees, datetime FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC'
  ).all(trade_id);

  const tradeInfoForLatest = db.prepare('SELECT instrument_ticker, asset_class, exchange, trade_direction FROM trades WHERE trade_id = ?').get(trade_id);
  let latestTradeDatetime = null;
  if (tradeInfoForLatest) {
    const posTx = db.prepare(`
      SELECT MAX(t.datetime) as max_datetime 
      FROM transactions t
      JOIN trades tr ON t.trade_id = tr.trade_id
      WHERE tr.instrument_ticker = @instrument_ticker AND tr.asset_class = @asset_class AND tr.exchange = @exchange AND tr.trade_direction = @trade_direction
    `).get({
        instrument_ticker: tradeInfoForLatest.instrument_ticker, 
        asset_class: tradeInfoForLatest.asset_class, 
        exchange: tradeInfoForLatest.exchange, 
        trade_direction: tradeInfoForLatest.trade_direction
    });
    latestTradeDatetime = posTx && posTx.max_datetime ? posTx.max_datetime : null;
  }
  
  if (allTransactions.length === 0) {
    console.warn(`[TRADE_SERVICE] Trade ID ${trade_id} has no transactions. Deleting parent trade and related data.`);
    db.prepare('DELETE FROM trade_emotions WHERE trade_id = ?').run(trade_id);
    db.prepare('DELETE FROM trade_attachments WHERE trade_id = ?').run(trade_id);
    db.prepare('DELETE FROM trades WHERE trade_id = ?').run(trade_id);
    return { deleted: true };
  }

  const tradeDetails = db.prepare('SELECT trade_direction, open_datetime FROM trades WHERE trade_id = ?').get(trade_id);
  if (!tradeDetails) {
    console.error(`[TRADE_SERVICE] Cannot recalculate state: Trade ID ${trade_id} not found.`);
    return { error: `Trade ID ${trade_id} not found.` };
  }
  const positionDirection = tradeDetails.trade_direction;

  let total_entry_quantity = 0;
  let total_exit_quantity = 0;
  let accumulated_fees = 0;
  let first_tx_datetime = allTransactions[0].datetime;
  let last_tx_datetime = allTransactions[allTransactions.length - 1].datetime;

  allTransactions.forEach(tx => {
    accumulated_fees += (tx.fees || 0);
    if (positionDirection === 'Long') {
      if (tx.action === 'Buy') total_entry_quantity += tx.quantity;
      else if (tx.action === 'Sell') total_exit_quantity += tx.quantity;
    } else {
      if (tx.action === 'Sell') total_entry_quantity += tx.quantity;
      else if (tx.action === 'Buy') total_exit_quantity += tx.quantity;
    }
  });

  let newStatus = 'Open';
  let newCloseDatetime = null;
  let newOpenDatetime = tradeDetails.open_datetime || first_tx_datetime;

  if (total_exit_quantity >= total_entry_quantity && total_entry_quantity > 0) {
    newStatus = 'Closed';
    newCloseDatetime = last_tx_datetime;
  }

  const updateTradeStmt = db.prepare(`
    UPDATE trades SET 
      status = @status, 
      open_datetime = @open_datetime,
      close_datetime = @close_datetime,
      fees_total = @fees_total,
      latest_trade = @latest_trade,
      updated_at = CURRENT_TIMESTAMP
    WHERE trade_id = @trade_id
  `);
  
  updateTradeStmt.run({
    status: newStatus,
    open_datetime: newOpenDatetime,
    close_datetime: newCloseDatetime,
    fees_total: accumulated_fees,
    latest_trade: latestTradeDatetime,
    trade_id: trade_id
  });

  console.log(`[TRADE_SERVICE] Trade ID ${trade_id} state recalculated: Status=${newStatus}, Fees=${accumulated_fees}`);
  return { status: newStatus, fees_total: accumulated_fees, deleted: false };
}

function updateMarkToMarketPrice(tradeId, marketPrice) {
  console.log(`[TRADE_SERVICE] updateMarkToMarketPrice CALLED for ID: ${tradeId}, Price: ${marketPrice}`);
  const db = getDb();
  // Ensure the trade is open before attempting to update its mark price
  const tradeStatusCheck = db.prepare("SELECT status FROM trades WHERE trade_id = ?").get(tradeId);
  if (!tradeStatusCheck) {
      throw new Error(`Trade ID ${tradeId} not found.`);
  }
  if (tradeStatusCheck.status !== 'Open') {
      throw new Error(`Trade ID ${tradeId} is not open. Cannot set mark price.`);
  }

  const stmt = db.prepare(
    "UPDATE trades SET current_market_price = ?, updated_at = CURRENT_TIMESTAMP WHERE trade_id = ? AND status = 'Open'"
  );
  const result = stmt.run(marketPrice, tradeId);

  if (result.changes === 0) {
    // This case should ideally not be reached if the above checks are done,
    // but it's a fallback. It might mean the price was the same.
    console.warn(`[TRADE_SERVICE] Mark price for Trade ID ${tradeId} was not updated via SQL (possibly same price or race condition).`);
  }

  const trade = db.prepare('SELECT * FROM trades WHERE trade_id = ?').get(tradeId);
  if (!trade) { // Should not happen if initial check passed and trade wasn't deleted by another process
      throw new Error(`Trade ID ${tradeId} not found after attempting update.`);
  }
  
  const transactions = db.prepare('SELECT * FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC').all(tradeId);
  const pnl = calculateTradePnlFifoEnhanced(trade, transactions);
  
  return {
    success: true,
    message: 'Mark price updated successfully.',
    trade_id: tradeId,
    unrealized_pnl: pnl.unrealizedGrossPnlOnOpenPortion,
    current_open_quantity: pnl.openQuantity,
    average_open_price: pnl.averageOpenPrice,
  };
}


function fetchTradesForListView() {
  console.log('[TRADE_SERVICE] fetchTradesForListView CALLED');
  const db = getDb();
  
  // Optimized query: Get ALL trades with their transactions in one query to avoid N+1 problem
  const tradesAndTransactionsResult = db.prepare(
    `SELECT 
       t.*, s.strategy_name,
       tr.transaction_id, tr.action, tr.quantity, tr.price, tr.datetime, 
       tr.fees, tr.notes, tr.strategy_id as tx_strategy_id, tr.market_conditions,
       tr.setup_description, tr.reasoning, tr.lessons_learned, tr.r_multiple_initial_risk,
       tr.created_at as tx_created_at
     FROM trades t
     LEFT JOIN strategies s ON t.strategy_id = s.strategy_id
     LEFT JOIN transactions tr ON t.trade_id = tr.trade_id
     ORDER BY COALESCE(t.open_datetime, t.created_at) DESC, tr.datetime ASC, tr.transaction_id ASC`
  ).all();
  
  console.log(`[TRADE_SERVICE] Fetched ${tradesAndTransactionsResult.length} trade-transaction rows in single query for list view`);
  
  // Group transactions by trade_id
  const tradesMap = new Map();
  for (const row of tradesAndTransactionsResult) {
    const tradeId = row.trade_id;
    
    if (!tradesMap.has(tradeId)) {
      // Extract trade data (remove transaction fields)
      const trade = {
        trade_id: row.trade_id,
        instrument_ticker: row.instrument_ticker,
        asset_class: row.asset_class,
        exchange: row.exchange,
        trade_direction: row.trade_direction,
        status: row.status,
        open_datetime: row.open_datetime,
        close_datetime: row.close_datetime,
        strategy_id: row.strategy_id,
        strategy_name: row.strategy_name,
        initial_stop_loss_price: row.initial_stop_loss_price,
        initial_take_profit_price: row.initial_take_profit_price,
        r_multiple_initial_risk: row.r_multiple_initial_risk,
        conviction_score: row.conviction_score,
        thesis_validation: row.thesis_validation,
        adherence_to_plan: row.adherence_to_plan,
        unforeseen_events: row.unforeseen_events,
        overall_trade_rating: row.overall_trade_rating,
        current_market_price: row.current_market_price,
        fees_total: row.fees_total,
        latest_trade: row.latest_trade,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
      tradesMap.set(tradeId, { trade, transactions: [] });
    }
    
    // Add transaction if it exists (LEFT JOIN might have null transaction_id)
    if (row.transaction_id) {
      const transaction = {
        transaction_id: row.transaction_id,
        trade_id: row.trade_id,
        action: row.action,
        quantity: row.quantity,
        price: row.price,
        datetime: row.datetime,
        fees: row.fees,
        notes: row.notes,
        strategy_id: row.tx_strategy_id,
        market_conditions: row.market_conditions,
        setup_description: row.setup_description,
        reasoning: row.reasoning,
        lessons_learned: row.lessons_learned,
        r_multiple_initial_risk: row.r_multiple_initial_risk,
        created_at: row.tx_created_at
      };
      tradesMap.get(tradeId).transactions.push(transaction);
    }
  }
  
  // Process each trade with its transactions
  return Array.from(tradesMap.values()).map(({ trade, transactions }) => {
    const pnl = calculateTradePnlFifoEnhanced(trade, transactions);
    return {
      ...trade,
      current_open_quantity: pnl.openQuantity ?? null,
      unrealized_pnl: pnl.unrealizedGrossPnlOnOpenPortion ?? null,
      average_open_price: pnl.averageOpenPrice ?? null
    };
  });
}

function fetchTradeWithTransactions(tradeId) {
  console.log(`[TRADE_SERVICE] fetchTradeWithTransactions CALLED for ID: ${tradeId}`);
  const db = getDb();
  const trade = db.prepare('SELECT * FROM trades WHERE trade_id = ?').get(tradeId);
  if (!trade) return null;

  const transactions = db.prepare(
    'SELECT * FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC'
  ).all(tradeId);

  const transactionsWithEmotions = transactions.map(transaction => {
    const emotionIds = db.prepare(
      'SELECT emotion_id FROM transaction_emotions WHERE transaction_id = ?'
    ).all(transaction.transaction_id).map(row => row.emotion_id);
    return { ...transaction, emotion_ids: emotionIds };
  });
  return { ...trade, transactions: transactionsWithEmotions };
}

function updateTradeMetadata(payload) {
  console.log('[TRADE_SERVICE] updateTradeMetadata CALLED');
  const db = getDb();
  try {
    const {
      trade_id,
      strategy_id,
      conviction_score,
      market_conditions,
      setup_description,
      reasoning,
      lessons_learned,
      r_multiple_initial_risk,
      initial_take_profit_price,
      initial_stop_loss_price,
      thesis_validation,
      adherence_to_plan,
      unforeseen_events,
      overall_trade_rating
    } = payload;
    const stmt = db.prepare(
      `UPDATE trades SET 
        strategy_id = @strategy_id, 
        conviction_score = @conviction_score, 
        market_conditions = @market_conditions, 
        setup_description = @setup_description, 
        reasoning = @reasoning, 
        lessons_learned = @lessons_learned, 
        r_multiple_initial_risk = @r_multiple_initial_risk, 
        initial_take_profit_price = @initial_take_profit_price, 
        initial_stop_loss_price = @initial_stop_loss_price, 
        thesis_validation = @thesis_validation, 
        adherence_to_plan = @adherence_to_plan, 
        unforeseen_events = @unforeseen_events, 
        overall_trade_rating = @overall_trade_rating, 
        updated_at = CURRENT_TIMESTAMP
      WHERE trade_id = @trade_id`
    );
    const result = stmt.run({
      trade_id,
      strategy_id,
      conviction_score,
      market_conditions,
      setup_description,
      reasoning,
      lessons_learned,
      r_multiple_initial_risk,
      initial_take_profit_price,
      initial_stop_loss_price,
      thesis_validation,
      adherence_to_plan,
      unforeseen_events,
      overall_trade_rating
    });
    if (result.changes === 0) {
      // It's possible no fields actually changed, or ID not found. 
      // Consider if this should be an error if ID not found.
      console.warn(`[TRADE_SERVICE] updateTradeMetadata: No trade metadata updated for ID ${trade_id}.`);
      return { success: true, message: 'No changes made to trade metadata (fields may be unchanged or ID not found).' };
    }
    return { success: true, message: 'Trade metadata updated successfully.' };
  } catch (error) {
    console.error('[TRADE_SERVICE] Error updating trade metadata:', error);
    throw error; // Let the caller (IPC handler) format the error response
  }
}


function deleteFullTradeAndTransactions(tradeId) {
  console.log(`[TRADE_SERVICE] deleteFullTradeAndTransactions CALLED for ID: ${tradeId}`);
  const db = getDb();
  try {
    const transactFn = db.transaction(() => {
      db.prepare('DELETE FROM trade_emotions WHERE trade_id = ?').run(tradeId);
      db.prepare('DELETE FROM trade_attachments WHERE trade_id = ?').run(tradeId);
      db.prepare('DELETE FROM account_transactions WHERE related_trade_id = ?').run(tradeId); // Ensure no FK errors
      // transactions and transaction_emotions are deleted by CASCADE constraint on trades table
      const result = db.prepare('DELETE FROM trades WHERE trade_id = ?').run(tradeId);
      if (result.changes === 0) throw new Error(`Delete failed: Trade ID ${tradeId} not found or no changes made.`);
    });
    transactFn();
    return { success: true, message: `Trade ID ${tradeId} and all associated data deleted.` };
  } catch (error) {
    console.error('[TRADE_SERVICE] Error deleting full trade:', error);
    throw error; // Let the caller (IPC handler) format the error response
  }
}

function getAutocompleteData(field) {
  const db = getDb();
  try {
    const fieldMapping = {
      'instrument_ticker': 'instrument_ticker',
      'exchange': 'exchange', 
      'setup_description': 'setup_description',
      'market_conditions': 'market_conditions'
    };
    
    const dbField = fieldMapping[field];
    if (!dbField) {
      throw new Error(`Invalid field for autocomplete: ${field}`);
    }
    
    let query, values;
    
    if (field === 'instrument_ticker' || field === 'exchange') {
      // Get from trades table
      query = `SELECT DISTINCT ${dbField} as value 
               FROM trades 
               WHERE ${dbField} IS NOT NULL AND ${dbField} != ''
               ORDER BY ${dbField}`;
      values = [];
    } else {
      // Get from transactions table  
      query = `SELECT DISTINCT ${dbField} as value 
               FROM transactions 
               WHERE ${dbField} IS NOT NULL AND ${dbField} != ''
               ORDER BY ${dbField}`;
      values = [];
    }
    
    const stmt = db.prepare(query);
    const results = stmt.all(values);
    
    return results.map(row => row.value);
  } catch (error) {
    console.error('[tradeService:getAutocompleteData] Error:', error);
    throw error;
  }
}

module.exports = {
  _recalculateTradeState,
  calculateTradePnlFifoEnhanced,
  fetchTradesForListView,
  fetchTradeWithTransactions,
  updateTradeMetadata,
  deleteFullTradeAndTransactions,
  updateMarkToMarketPrice,
  getAutocompleteData,
};