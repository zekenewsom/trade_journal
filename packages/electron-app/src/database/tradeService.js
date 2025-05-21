// packages/electron-app/src/database/tradeService.js
const { getDb } = require('./connection');

// This function is internal to tradeService or called by transactionService.
// If called by transactionService, it should be exported.
// For now, let's make it internal and transactionService will call a higher-level trade update function.
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
      WHERE tr.instrument_ticker = ? AND tr.asset_class = ? AND tr.exchange = ? AND tr.trade_direction = ?
    `).get(tradeInfoForLatest.instrument_ticker, tradeInfoForLatest.asset_class, tradeInfoForLatest.exchange, tradeInfoForLatest.trade_direction);
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
      latest_trade = @latest_trade, /* Added from migrations */
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

function calculateTradePnlFifoEnhanced(trade, transactionsForThisTrade) {
    // ... (Keep the exact P&L calculation logic from db.js source 382-409)
    // This is the consolidated version based on latest zekenewsom-trade_journal(3).txt
    let realizedGrossPnl = 0;
    let feesAttributableToClosedPortion = 0;
    let closedQuantityThisTrade = 0;
    let totalValueForOpenEntries = 0;
    let cumulativeEntryQuantityForOpen = 0;
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
        let exitQtyToMatch = exit.quantity;
        feesAttributableToClosedPortion += (exit.fees || 0);
        for (const entry of entries) {
            if (entry.remainingQuantity === 0 || exitQtyToMatch === 0) continue;
            const matchedQty = Math.min(exitQtyToMatch, entry.remainingQuantity);
            const pnl = (exit.price - entry.price) * matchedQty * directionMultiplier;
            realizedGrossPnl += pnl;
            if (entry.quantity > 0) {
                feesAttributableToClosedPortion += (entry.fees || 0) * (matchedQty / entry.quantity);
            }
            entry.remainingQuantity -= matchedQty;
            exitQtyToMatch -= matchedQty;
            closedQuantityThisTrade += matchedQty;
            if (exitQtyToMatch === 0) break;
        }
    }
    entries.forEach(entry => {
        if(entry.remainingQuantity > 0){
            totalValueForOpenEntries += entry.price * entry.remainingQuantity;
            cumulativeEntryQuantityForOpen += entry.remainingQuantity;
        }
    });
    if(cumulativeEntryQuantityForOpen > 0){
        weightedAvgEntryPriceForOpenPortion = totalValueForOpenEntries / cumulativeEntryQuantityForOpen;
    }
    const realizedNetPnl = realizedGrossPnl - feesAttributableToClosedPortion;
    const openQuantity = cumulativeEntryQuantityForOpen;
    let unrealizedGrossPnlOnOpenPortion = null;
    if (openQuantity > 0 && weightedAvgEntryPriceForOpenPortion !== null && trade.current_market_price !== null && trade.current_market_price !== undefined) {
        unrealizedGrossPnlOnOpenPortion = (trade.current_market_price - weightedAvgEntryPriceForOpenPortion) * openQuantity * directionMultiplier;
    }
    let rMultipleActual = null;
    if (trade.status === 'Closed' && trade.r_multiple_initial_risk && trade.r_multiple_initial_risk !== 0) {
        const finalNetPnlForR = realizedGrossPnl - (trade.fees_total || 0); // Use trade.fees_total for fully closed PNL
        rMultipleActual = finalNetPnlForR / trade.r_multiple_initial_risk;
    }
    let durationMs = null;
    if (trade.status === 'Closed' && trade.open_datetime && trade.close_datetime) {
        durationMs = new Date(trade.close_datetime).getTime() - new Date(trade.open_datetime).getTime();
    }
    let outcome = null;
    if (trade.status === 'Closed') {
        const finalNetPnlForOutcome = realizedGrossPnl - (trade.fees_total || 0);
        if (finalNetPnlForOutcome > 0.000001) outcome = 'Win';
        else if (finalNetPnlForOutcome < -0.000001) outcome = 'Loss';
        else outcome = 'Break Even';
    }
    return {
        trade_id: trade.trade_id,
        realizedGrossPnl,
        realizedNetPnl, // This is PNL for closed portions based on their specific entry/exit fees
        feesAttributableToClosedPortion,
        isFullyClosed: trade.status === 'Closed' && openQuantity === 0, // More precise check
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


function fetchTradesForListView() {
  console.log('[TRADE_SERVICE] fetchTradesForListView CALLED');
  const db = getDb();
  const trades = db.prepare(
    `SELECT t1.*, s.strategy_name
     FROM trades t1
     LEFT JOIN strategies s ON t1.strategy_id = s.strategy_id
     INNER JOIN (
       SELECT instrument_ticker, asset_class, exchange, trade_direction, MAX(latest_trade) AS max_latest_trade
       FROM trades
       GROUP BY instrument_ticker, asset_class, exchange, trade_direction
     ) t2 ON t1.instrument_ticker = t2.instrument_ticker
           AND t1.asset_class = t2.asset_class
           AND t1.exchange = t2.exchange
           AND t1.trade_direction = t2.trade_direction
           AND t1.latest_trade = t2.max_latest_trade
     ORDER BY COALESCE(t1.open_datetime, t1.created_at) DESC`
  ).all();

  return trades.map(trade => {
    const transactions = db.prepare('SELECT * FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC').all(trade.trade_id);
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
    const { trade_id, strategy_id, market_conditions, setup_description, reasoning, lessons_learned, r_multiple_initial_risk } = payload;
    const stmt = db.prepare(
      `UPDATE trades SET 
        strategy_id = @strategy_id, 
        market_conditions = @market_conditions, 
        setup_description = @setup_description, 
        reasoning = @reasoning, 
        lessons_learned = @lessons_learned, 
        r_multiple_initial_risk = @r_multiple_initial_risk, 
        updated_at = CURRENT_TIMESTAMP 
      WHERE trade_id = @trade_id`
    );
    const result = stmt.run({
      trade_id,
      strategy_id: strategy_id === undefined ? null : strategy_id,
      market_conditions: market_conditions === undefined ? null : market_conditions,
      setup_description: setup_description === undefined ? null : setup_description,
      reasoning: reasoning === undefined ? null : reasoning,
      lessons_learned: lessons_learned === undefined ? null : lessons_learned,
      r_multiple_initial_risk: (r_multiple_initial_risk === undefined || r_multiple_initial_risk === null || isNaN(parseFloat(r_multiple_initial_risk))) ? null : parseFloat(r_multiple_initial_risk)
    });
    if (result.changes === 0) {
      return { success: true, message: 'No changes made to trade metadata.' };
    }
    return { success: true, message: 'Trade metadata updated successfully.' };
  } catch (error) {
    console.error('[TRADE_SERVICE] Error updating trade metadata:', error);
    return { success: false, message: (error instanceof Error ? error.message : String(error)) || 'Failed to update trade metadata.' };
  }
}

function deleteFullTradeAndTransactions(tradeId) {
  console.log(`[TRADE_SERVICE] deleteFullTradeAndTransactions CALLED for ID: ${tradeId}`);
  const db = getDb();
  try {
    const transactFn = db.transaction(() => {
      db.prepare('DELETE FROM trade_emotions WHERE trade_id = ?').run(tradeId);
      db.prepare('DELETE FROM trade_attachments WHERE trade_id = ?').run(tradeId);
      // transaction_emotions are deleted by CASCADE when transactions are deleted
      // transactions are deleted by CASCADE when 'trades' record is deleted (due to schema `ON DELETE CASCADE`)
      const result = db.prepare('DELETE FROM trades WHERE trade_id = ?').run(tradeId);
      if (result.changes === 0) throw new Error(`Delete failed: Trade ID ${tradeId} not found or no changes made.`);
    });
    transactFn();
    return { success: true, message: `Trade ID ${tradeId} and all associated data deleted.` };
  } catch (error) {
    console.error('[TRADE_SERVICE] Error deleting full trade:', error);
    return { success: false, message: (error instanceof Error ? error.message : String(error)) || `Failed to delete trade ${tradeId}.` };
  }
}

function updateMarkToMarketPrice(tradeId, marketPrice) {
  console.log(`[TRADE_SERVICE] updateMarkToMarketPrice CALLED for ID: ${tradeId}, Price: ${marketPrice}`);
  const db = getDb();
  const stmt = db.prepare(
    "UPDATE trades SET current_market_price = ?, updated_at = CURRENT_TIMESTAMP WHERE trade_id = ? AND status = 'Open'"
  );
  const result = stmt.run(marketPrice, tradeId);

  if (result.changes === 0) {
    const tradeCheck = db.prepare('SELECT status FROM trades WHERE trade_id = ?').get(tradeId);
    if (!tradeCheck) throw new Error(`Trade ID ${tradeId} not found.`);
    if (tradeCheck.status !== 'Open') throw new Error(`Trade ID ${tradeId} is not open. Cannot set mark price.`);
    // If no changes but trade is open, it might be the same price. Return current data.
  }

  const trade = db.prepare('SELECT * FROM trades WHERE trade_id = ?').get(tradeId);
  if (!trade) throw new Error(`Trade ID ${tradeId} not found after attempting update.`);
  
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


module.exports = {
  _recalculateTradeState, // Export if needed by transactionService
  calculateTradePnlFifoEnhanced,
  fetchTradesForListView,
  fetchTradeWithTransactions,
  updateTradeMetadata,
  deleteFullTradeAndTransactions,
  updateMarkToMarketPrice,
};