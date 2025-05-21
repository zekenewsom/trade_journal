// Trade management logic
const { getDb } = require('./connection');

function _recalculateTradeState(trade_id) {
  const currentDb = getDb();
  console.log(`Recalculating state for trade ID: ${trade_id}`);

  const allTransactions = currentDb.prepare(
    'SELECT transaction_id, action, quantity, fees, datetime FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC'
  ).all(trade_id);

  // Find the latest transaction datetime for all trades in this position
  // First, get the current trade's position-defining fields
  const tradeInfo = currentDb.prepare('SELECT instrument_ticker, asset_class, exchange, trade_direction FROM trades WHERE trade_id = ?').get(trade_id);
  let latestTradeDatetime = null;
  if (tradeInfo) {
    const posTx = currentDb.prepare(`
      SELECT MAX(datetime) as max_datetime FROM transactions
      WHERE trade_id IN (
        SELECT trade_id FROM trades
        WHERE instrument_ticker = ? AND asset_class = ? AND exchange = ? AND trade_direction = ?
      )
    `).get(tradeInfo.instrument_ticker, tradeInfo.asset_class, tradeInfo.exchange, tradeInfo.trade_direction);
    latestTradeDatetime = posTx && posTx.max_datetime ? posTx.max_datetime : null;
  }

  if (allTransactions.length === 0) {
    console.warn(`Trade ID ${trade_id} has no transactions. Deleting parent trade and related data.`);
    currentDb.prepare('DELETE FROM trade_emotions WHERE trade_id = ?').run(trade_id);
    currentDb.prepare('DELETE FROM trade_attachments WHERE trade_id = ?').run(trade_id);
    currentDb.prepare('DELETE FROM trades WHERE trade_id = ?').run(trade_id);
    return;
  }

  const tradeDetails = currentDb.prepare('SELECT trade_direction, open_datetime FROM trades WHERE trade_id = ?').get(trade_id);
  if (!tradeDetails) {
    console.error(`Cannot recalculate state: Trade ID ${trade_id} not found (possibly already deleted).`);
    return;
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
    } else { // Short position
      if (tx.action === 'Sell') total_entry_quantity += tx.quantity;
      else if (tx.action === 'Buy') total_exit_quantity += tx.quantity;
    }
  });

  let newStatus = 'Open';
  let newCloseDatetime = null;
  // Use existing open_datetime if available, otherwise set from first transaction
  let newOpenDatetime = tradeDetails.open_datetime || first_tx_datetime;

  // Trade is considered closed if exit quantity >= entry quantity (fully closed)
  if (total_exit_quantity >= total_entry_quantity && total_entry_quantity > 0) {
    newStatus = 'Closed';
    newCloseDatetime = last_tx_datetime;
  }

  // Update the trade record with new status and calculated values
  const updateTrade = currentDb.prepare(`
    UPDATE trades SET 
      status = ?, 
      open_datetime = ?,
      close_datetime = ?,
      fees_total = ?,
      latest_trade = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE trade_id = ?
  `);

  updateTrade.run(
    newStatus,
    newOpenDatetime,
    newCloseDatetime,
    accumulated_fees,
    latestTradeDatetime,
    trade_id
  );

  console.log(`Trade ID ${trade_id} state recalculated: Status=${newStatus}, Fees=${accumulated_fees}`);
  return { status: newStatus, fees_total: accumulated_fees };
}

function updateMarkToMarketPrice(tradeId, marketPrice) {
  const currentDb = getDb();
  const stmt = currentDb.prepare(
    "UPDATE trades SET current_market_price = ?, updated_at = CURRENT_TIMESTAMP WHERE trade_id = ? AND status = 'Open'"
  );
  const result = stmt.run(marketPrice, tradeId);
  if (result.changes === 0) {
    // Could be that the trade is not open, or ID not found
    const tradeCheck = currentDb.prepare('SELECT status FROM trades WHERE trade_id = ?').get(tradeId);
    if (!tradeCheck) throw new Error(`Trade ID ${tradeId} not found.`);
    if (tradeCheck.status !== 'Open') throw new Error(`Trade ID ${tradeId} is not open.`);
    throw new Error('Mark price update failed for unknown reasons.');
  }
  // After updating, recalculate and return latest P&L
  const trade = currentDb.prepare('SELECT * FROM trades WHERE trade_id = ?').get(tradeId);
  const transactions = currentDb.prepare('SELECT * FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC').all(tradeId);
  const pnl = calculateTradePnlFifoEnhanced(trade, transactions);
  return {
    success: true,
    message: 'Mark price updated.',
    trade_id: tradeId,
    unrealized_pnl: pnl.unrealizedGrossPnlOnOpenPortion ?? null,
    current_open_quantity: pnl.openQuantity ?? null,
    average_open_price: pnl.averageOpenPrice ?? null
  };
}

function fetchTradesForListView() {
  console.log('[fetchTradesForListView CALLED]');
  const currentDb = getDb();
  // For each position, select the trade with the most recent latest_trade value
  const trades = currentDb.prepare(
    `SELECT t1.*,
            s.strategy_name
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

  // For each trade, fetch transactions and calculate open qty & unrealized P&L
  return trades.map(trade => {
    const transactions = currentDb.prepare('SELECT * FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC').all(trade.trade_id);
    const pnl = calculateTradePnlFifoEnhanced(trade, transactions);
    console.log('[P&L MAP DEBUG]', {
      trade_id: trade.trade_id,
      status: trade.status,
      current_market_price: trade.current_market_price,
      openQuantity: pnl.openQuantity,
      unrealizedGrossPnlOnOpenPortion: pnl.unrealizedGrossPnlOnOpenPortion,
      averageOpenPrice: pnl.averageOpenPrice,
      transactions
    });
    return {
      ...trade,
      current_open_quantity: pnl.openQuantity ?? null,
      unrealized_pnl: pnl.unrealizedGrossPnlOnOpenPortion ?? null,
      average_open_price: pnl.averageOpenPrice ?? null
    };
  });
}

function fetchTradeWithTransactions(tradeId) {
  const currentDb = getDb();
  const trade = currentDb.prepare('SELECT * FROM trades WHERE trade_id = ?').get(tradeId);
  if (!trade) return null;

  const transactions = currentDb.prepare(
    'SELECT * FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC'
  ).all(tradeId);

  // Get emotions for each transaction
  const transactionsWithEmotions = transactions.map(transaction => {
    const emotionIds = currentDb.prepare(
      'SELECT emotion_id FROM transaction_emotions WHERE transaction_id = ?'
    ).all(transaction.transaction_id).map(row => row.emotion_id);
    
    return {
      ...transaction,
      emotion_ids: emotionIds
    };
  });

  return { ...trade, transactions: transactionsWithEmotions };
}

function updateTradeMetadata(payload) {
  const currentDb = getDb();
  try {
    const { trade_id, strategy_id, market_conditions, setup_description, reasoning, lessons_learned, r_multiple_initial_risk } = payload;
    const stmt = currentDb.prepare(`UPDATE trades SET strategy_id = @strategy_id, market_conditions = @market_conditions, setup_description = @setup_description, reasoning = @reasoning, lessons_learned = @lessons_learned, r_multiple_initial_risk = @r_multiple_initial_risk, updated_at = CURRENT_TIMESTAMP WHERE trade_id = @trade_id`);
    const result = stmt.run({
      trade_id,
      strategy_id: strategy_id || null,
      market_conditions: market_conditions || null,
      setup_description: setup_description || null,
      reasoning: reasoning || null,
      lessons_learned: lessons_learned || null,
      r_multiple_initial_risk: r_multiple_initial_risk || null,
    });
    
    if (result.changes === 0) {
      console.warn(`updateTradeMetadata: No trade metadata updated for ID ${trade_id}. Payload: ${JSON.stringify(payload)}`);
      return { success: true, message: 'No changes made (fields may be unchanged or all optional).' };
    }
    return { success: true, message: 'Trade metadata updated successfully.' };
  } catch (error) {
    console.error('Error updating trade metadata:', error);
    return { success: false, message: error.message || 'Failed to update trade metadata.' };
  }
}

function deleteFullTradeAndTransactions(tradeId) {
  const currentDb = getDb();
  const transactFn = currentDb.transaction(() => {
    currentDb.prepare('DELETE FROM trade_emotions WHERE trade_id = ?').run(tradeId);
    currentDb.prepare('DELETE FROM trade_attachments WHERE trade_id = ?').run(tradeId);
    // Transactions are deleted by CASCADE when 'trades' record is deleted
    const result = currentDb.prepare('DELETE FROM trades WHERE trade_id = ?').run(tradeId);
    if (result.changes === 0) throw new Error(`Delete failed: Trade ID ${tradeId} not found.`);
  });
  transactFn();
}

function calculateTradePnlFifoEnhanced(trade, transactionsForThisTrade) {
    let realizedGrossPnl = 0;
    let feesAttributableToClosedPortion = 0;
    let closedQuantityThisTrade = 0;
    let totalValueForOpenEntries = 0;
    let cumulativeEntryQuantityForOpen = 0;

    // --- Robust defaults ---
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
    
    let totalCostOfClosedEntries = 0;

    for (const exit of exits) {
        let exitQtyToMatch = exit.quantity;
        feesAttributableToClosedPortion += (exit.fees || 0);

        for (const entry of entries) {
            if (entry.remainingQuantity === 0 || exitQtyToMatch === 0) continue;
            const matchedQty = Math.min(exitQtyToMatch, entry.remainingQuantity);
            
            // For Long trades: P&L = (Sell Price - Buy Price) * Quantity
            // For Short trades: P&L = (Sell Price - Buy Price) * Quantity * -1
            const pnl = (exit.price - entry.price) * matchedQty * directionMultiplier;
            realizedGrossPnl += pnl;

            if (entry.quantity > 0) {
                feesAttributableToClosedPortion += (entry.fees || 0) * (matchedQty / entry.quantity);
            }
            totalCostOfClosedEntries += entry.price * matchedQty;

            entry.remainingQuantity -= matchedQty;
            exitQtyToMatch -= matchedQty;
            closedQuantityThisTrade += matchedQty;

            if (exitQtyToMatch === 0) break;
        }
    }

    // Calculate weighted average price for open portion
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
    if (openQuantity > 0 && weightedAvgEntryPriceForOpenPortion !== null && trade.current_market_price !== null) {
        unrealizedGrossPnlOnOpenPortion = (trade.current_market_price - weightedAvgEntryPriceForOpenPortion) * openQuantity * directionMultiplier;
    }

    // DEBUG LOGGING for P&L calculation
    console.log('[P&L CALC DEBUG]', {
        trade_id: trade.trade_id,
        openQuantity,
        weightedAvgEntryPriceForOpenPortion,
        current_market_price: trade.current_market_price,
        unrealizedGrossPnlOnOpenPortion,
        realizedGrossPnl,
        realizedNetPnl,
        directionMultiplier,
        entries: entries.map(e => ({ price: e.price, quantity: e.quantity, remaining: e.remainingQuantity })),
        exits: exits.map(e => ({ price: e.price, quantity: e.quantity }))
    });
    
    let rMultipleActual = null;
    if (trade.status === 'Closed' && trade.r_multiple_initial_risk && trade.r_multiple_initial_risk !== 0) {
        const finalNetPnl = realizedGrossPnl - (trade.fees_total || 0);
        rMultipleActual = finalNetPnl / trade.r_multiple_initial_risk;
    }

    let durationMs = null;
    if (trade.status === 'Closed' && trade.open_datetime && trade.close_datetime) {
        durationMs = new Date(trade.close_datetime).getTime() - new Date(trade.open_datetime).getTime();
    }
    
    let outcome = null;
    if (trade.status === 'Closed') {
        const finalNetPnlForOutcome = realizedGrossPnl - (trade.fees_total || 0);
        console.log('[OUTCOME DEBUG]', {
            trade_id: trade.trade_id,
            finalNetPnlForOutcome,
            realizedGrossPnl,
            fees_total: trade.fees_total
        });
        if (finalNetPnlForOutcome > 0.000001) outcome = 'Win';
        else if (finalNetPnlForOutcome < -0.000001) outcome = 'Loss';
        else outcome = 'Break Even';
    }

    return {
        trade_id: trade.trade_id,
        realizedGrossPnl,
        realizedNetPnl,
        feesAttributableToClosedPortion,
        isFullyClosed: trade.status === 'Closed',
        closedQuantity: closedQuantityThisTrade,
        openQuantity,
        averageOpenPrice: weightedAvgEntryPriceForOpenPortion,
        unrealizedGrossPnlOnOpenPortion,
        rMultipleActual,
        durationMs,
        outcome,
        relevantDate: trade.close_datetime || trade.open_datetime || trade.created_at,
        asset_class: trade.asset_class,
        exchange: trade.exchange,
        strategy_id: trade.strategy_id,
    };
}

module.exports = {
  _recalculateTradeState,
  updateMarkToMarketPrice,
  fetchTradesForListView,
  fetchTradeWithTransactions,
  updateTradeMetadata,
  deleteFullTradeAndTransactions,
  calculateTradePnlFifoEnhanced,
};
