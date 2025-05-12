// File: zekenewsom-trade_journal/packages/electron-app/src/database/db.js
// Stage 6: Full DB logic including Advanced Analytics and Emotion Tagging

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { createTables } = require('./schema');

let db;

// --- Initialization and Connection Management ---
function initializeDatabase(dbFilePath) {
  if (db && db.open) {
    // console.warn('Database already initialized and open.'); // Less noisy
    return db;
  }
  try {
    const dbDir = path.dirname(dbFilePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Created database directory: ${dbDir}`);
    }
    db = new Database(dbFilePath); // Removed verbose logging by default
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    createTables(db); // Applies schema (Stage 5, plus emotion tables assumed in schema)
    seedInitialData(db); // Seed necessary lookup data like emotions
    console.log(`Database initialized successfully: ${dbFilePath}`);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    db = null;
    throw error;
  }
  return db;
}

function getDb() {
  if (!db || !db.open) {
    throw new Error('Database not initialized or has been closed. Ensure initializeDatabase() is called on app start.');
  }
  return db;
}

function closeDatabase() {
  if (db && db.open) {
    db.close((err) => {
      if (err) console.error('Error closing the database connection:', err.message);
      else console.log('Database connection closed successfully.');
    });
    db = null;
  }
}

function seedInitialData(currentDb) {
  const emotions = ['Confident', 'Greedy', 'Fearful', 'Anxious', 'Disciplined', 'Impatient', 'Hopeful', 'Frustrated', 'Bored', 'Excited', 'Focused', 'Overwhelmed'];
  const insertEmotion = currentDb.prepare('INSERT OR IGNORE INTO emotions (emotion_name) VALUES (?)');
  const seedTx = currentDb.transaction(() => {
    emotions.forEach(name => insertEmotion.run(name));
  });
  try {
    seedTx();
    console.log('Initial emotions seeded/checked.');
  } catch (error) {
    console.error("Error seeding emotions:", error);
  }
  // Add other seed data here if needed (e.g., default strategies, accounts/exchanges if normalized)
}

// --- Internal Helper: Recalculate Trade State ---
function _recalculateTradeState(trade_id) {
  const currentDb = getDb();
  console.log(`Recalculating state for trade ID: ${trade_id}`);

  const allTransactions = currentDb.prepare(
    'SELECT transaction_id, action, quantity, fees, datetime FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC'
  ).all(trade_id);

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
      updated_at = CURRENT_TIMESTAMP
    WHERE trade_id = ?
  `);

  updateTrade.run(
    newStatus,
    newOpenDatetime,
    newCloseDatetime,
    accumulated_fees,
    trade_id
  );

  console.log(`Trade ID ${trade_id} state recalculated: Status=${newStatus}, Fees=${accumulated_fees}`);
  return { status: newStatus, fees_total: accumulated_fees };
}

// --- Stage 6: New DB Function for Mark-to-Market ---
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
        if (tradeCheck.status !== 'Open') throw new Error(`Trade ID ${tradeId} is not open. Cannot set mark price.`);
        console.warn(`Mark price for Trade ID ${tradeId} was not updated (possibly same price or other issue).`);
    }
    // Fetch updated trade and transactions
    const trade = currentDb.prepare('SELECT * FROM trades WHERE trade_id = ?').get(tradeId);
    const transactions = currentDb.prepare('SELECT * FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC').all(tradeId);
    // Calculate updated P&L
    const pnl = calculateTradePnlFifoEnhanced(trade, transactions);
    return {
        success: true,
        message: 'Mark price updated.',
        unrealized_pnl: pnl.unrealizedGrossPnlOnOpenPortion,
        current_open_quantity: pnl.openQuantity,
        average_open_price: pnl.averageOpenPrice,
        trade_id: tradeId
    };
}

// --- Read Operations for UI (Modified for Stage 6) ---
function fetchTradesForListView() {
  const currentDb = getDb();
  // Include current_market_price for open trades
  return currentDb.prepare(
    `SELECT 
        trade_id, instrument_ticker, asset_class, exchange, trade_direction, 
        status, open_datetime, close_datetime, fees_total, strategy_id, 
        current_market_price, -- Added for Stage 6
        created_at, updated_at 
     FROM trades ORDER BY 
     CASE status WHEN 'Open' THEN 0 ELSE 1 END, -- Show open trades first
     COALESCE(open_datetime, created_at) DESC`
  ).all();
}

function fetchTradeWithTransactions(tradeId) {
  const currentDb = getDb();
  console.log(`[fetchTradeWithTransactions] Fetching trade ID: ${tradeId}`);
  
  const trade = currentDb.prepare('SELECT * FROM trades WHERE trade_id = ?').get(tradeId);
  console.log(`[fetchTradeWithTransactions] Found trade:`, trade);
  
  if (!trade) {
    console.log(`[fetchTradeWithTransactions] No trade found for ID: ${tradeId}`);
    return null;
  }
  
  // First, let's check if there are any transactions at all
  const transactionCount = currentDb.prepare('SELECT COUNT(*) as count FROM transactions WHERE trade_id = ?').get(tradeId);
  console.log(`[fetchTradeWithTransactions] Transaction count:`, transactionCount);
  
  const transactions = currentDb.prepare(
    'SELECT * FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC'
  ).all(tradeId);
  console.log(`[fetchTradeWithTransactions] Found ${transactions.length} transactions:`, transactions);
  
  // Log the SQL query for debugging
  const query = currentDb.prepare('SELECT * FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC').toString();
  console.log(`[fetchTradeWithTransactions] SQL Query:`, query);
  
  // Calculate P&L for the trade
  const pnl = calculateTradePnlFifoEnhanced(trade, transactions);
  console.log(`[fetchTradeWithTransactions] Calculated P&L:`, pnl);
  
  const result = { 
    ...trade, 
    transactions,
    openQuantity: pnl.openQuantity,
    unrealizedGrossPnlOnOpenPortion: pnl.unrealizedGrossPnlOnOpenPortion,
    averageOpenPrice: pnl.averageOpenPrice
  };
  console.log(`[fetchTradeWithTransactions] Returning combined result:`, result);
  return result;
}

console.log('[DB.JS LOADED]');
// --- Stage 6: Enhanced Analytics Calculations ---
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
            
            realizedGrossPnl += (exit.price - entry.price) * matchedQty * directionMultiplier;
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
        unrealizedGrossPnlOnOpenPortion
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

function calculateAnalyticsData(filters = {}) {
  const currentDb = getDb();
  const allTradesWithData = fetchTradesForListView();

  let totalRealizedNetPnl = 0;
  let totalRealizedGrossPnl = 0;
  let totalFeesPaidOnClosedPortions = 0;

  let fullyClosedWins = 0;
  let fullyClosedLosses = 0;
  let fullyClosedBreakEvens = 0;
  let sumNetPnlWinningClosedTrades = 0;
  let sumNetPnlLosingClosedTrades = 0;
  let largestWin = null;
  let largestLoss = null;
  const closedTradeOutcomesForStreaks = [];

  const cumulativePnlSeries = [];
  let currentCumulativePnl = 0;
  const pnlPerTradeSeries = [];
  const rMultipleValues = [];

  const pnlByAssetClass = {};
  const pnlByExchange = {};
  const pnlByStrategy = {};

  // Fetch all transactions once, then group them by trade_id for processing
  const allDbTransactions = currentDb.prepare('SELECT * FROM transactions ORDER BY datetime ASC, transaction_id ASC').all();
  const transactionsByTradeId = allDbTransactions.reduce((acc, tx) => {
    if (!acc[tx.trade_id]) acc[tx.trade_id] = [];
    acc[tx.trade_id].push(tx);
    return acc;
  }, {});

  // Sort trades by their open datetime for chronological processing of cumulative P&L
  const chronoSortedTrades = [...allTradesWithData].sort((a,b) => new Date(a.open_datetime).getTime() - new Date(b.open_datetime).getTime());

  for (const trade of chronoSortedTrades) {
    const transactionsForThisTrade = transactionsByTradeId[trade.trade_id] || [];
    if (transactionsForThisTrade.length === 0) continue;

    const tradeAnalysis = calculateTradePnlFifoEnhanced(trade, transactionsForThisTrade);

    // Accumulate P&L realized from this trade (even if partial)
    if (tradeAnalysis.closedQuantity > 0) {
      totalRealizedGrossPnl += tradeAnalysis.realizedGrossPnl;
      totalRealizedNetPnl += tradeAnalysis.realizedNetPnl;
      totalFeesPaidOnClosedPortions += tradeAnalysis.feesAttributableToClosedPortion;
    }

    // For cumulative P&L, we want points as trades close or realize significant P&L
    if (tradeAnalysis.isFullyClosed) {
      currentCumulativePnl += tradeAnalysis.realizedNetPnl;
      cumulativePnlSeries.push({ date: tradeAnalysis.relevantDate, cumulativeNetPnl: currentCumulativePnl });
      
      pnlPerTradeSeries.push({ name: `${trade.instrument_ticker} (ID:${trade.trade_id})`, netPnl: tradeAnalysis.realizedNetPnl, trade_id: trade.trade_id });
      closedTradeOutcomesForStreaks.push({ pnl: tradeAnalysis.realizedNetPnl, date: tradeAnalysis.relevantDate });

      if (tradeAnalysis.outcome === 'Win') {
        fullyClosedWins++;
        sumNetPnlWinningClosedTrades += tradeAnalysis.realizedNetPnl;
        if (largestWin === null || tradeAnalysis.realizedNetPnl > largestWin) largestWin = tradeAnalysis.realizedNetPnl;
      } else if (tradeAnalysis.outcome === 'Loss') {
        fullyClosedLosses++;
        sumNetPnlLosingClosedTrades += tradeAnalysis.realizedNetPnl;
        if (largestLoss === null || tradeAnalysis.realizedNetPnl < largestLoss) largestLoss = tradeAnalysis.realizedNetPnl;
      } else if (tradeAnalysis.outcome === 'Break Even'){
        fullyClosedBreakEvens++;
      }

      if (tradeAnalysis.rMultipleActual !== null) {
        rMultipleValues.push(tradeAnalysis.rMultipleActual);
      }
      
      // Grouped P&L for fully closed trades
      const groups = [
        { key: trade.asset_class, dataObj: pnlByAssetClass, nameField: 'Asset Class' },
        { key: trade.exchange, dataObj: pnlByExchange, nameField: 'Exchange' },
        { key: trade.strategy_id ? trade.strategy_id.toString() : 'Untagged', dataObj: pnlByStrategy, nameField: 'Strategy' }
      ];
      groups.forEach(group => {
        if (!group.key) return;
        if (!group.dataObj[group.key]) group.dataObj[group.key] = { name: group.key, totalNetPnl: 0, wins: 0, losses: 0, bes: 0, tradeCount: 0 };
        const g = group.dataObj[group.key];
        g.totalNetPnl += tradeAnalysis.realizedNetPnl;
        g.tradeCount++;
        if(tradeAnalysis.outcome === 'Win') g.wins++;
        else if(tradeAnalysis.outcome === 'Loss') g.losses++;
        else if(tradeAnalysis.outcome === 'Break Even') g.bes++;
      });
    }
  }

  // Streaks
  closedTradeOutcomesForStreaks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let longestWinStreak = 0, currentWinStreak = 0, longestLossStreak = 0, currentLossStreak = 0;
  for (const outcome of closedTradeOutcomesForStreaks) {
    if (outcome.pnl > 0.000001) { currentWinStreak++; currentLossStreak = 0; longestWinStreak = Math.max(longestWinStreak, currentWinStreak); }
    else if (outcome.pnl < -0.000001) { currentLossStreak++; currentWinStreak = 0; longestLossStreak = Math.max(longestLossStreak, currentLossStreak); }
    else { currentWinStreak = 0; currentLossStreak = 0; }
  }

  const totalFullyClosedTrades = fullyClosedWins + fullyClosedLosses + fullyClosedBreakEvens;

  const rMultipleDistributionData = rMultipleValues.reduce((acc, r) => {
    let range;
    if (r < -2) range = '< -2R'; else if (r < -1) range = '-2R to -1R';
    else if (r < 0) range = '-1R to <0R'; else if (r === 0) range = '0R (BE)';
    else if (r <= 1) range = '>0R to 1R'; else if (r <= 2) range = '>1R to 2R';
    else range = '> 2R';
    acc[range] = (acc[range] || 0) + 1;
    return acc;
  }, {});

  const transformGroupedData = (dataObj) => Object.values(dataObj).map(d => ({
    ...d, winRate: (d.wins + d.losses) > 0 ? (d.wins / (d.wins + d.losses)) * 100 : null
  }));

  return {
    totalRealizedNetPnl, totalRealizedGrossPnl,
    totalFeesPaidOnClosedPortions,
    winRateOverall: totalFullyClosedTrades > 0 ? (fullyClosedWins / totalFullyClosedTrades) * 100 : null,
    avgWinPnlOverall: fullyClosedWins > 0 ? sumNetPnlWinningClosedTrades / fullyClosedWins : null,
    avgLossPnlOverall: fullyClosedLosses > 0 ? sumNetPnlLosingClosedTrades / fullyClosedLosses : null,
    largestWinPnl: largestWin, largestLossPnl: largestLoss,
    longestWinStreak, longestLossStreak,
    numberOfWinningTrades: fullyClosedWins, numberOfLosingTrades: fullyClosedLosses,
    numberOfBreakEvenTrades: fullyClosedBreakEvens, totalFullyClosedTrades,
    cumulativePnlSeries, pnlPerTradeSeries,
    winLossBreakEvenCounts: [ { name: 'Wins', value: fullyClosedWins }, { name: 'Losses', value: fullyClosedLosses }, { name: 'Break-Even', value: fullyClosedBreakEvens } ],
    rMultipleDistribution: Object.entries(rMultipleDistributionData).map(([range, count]) => ({ range, count })).sort((a,b) => a.range.localeCompare(b.range)), // Basic sort
    avgRMultiple: rMultipleValues.length > 0 ? rMultipleValues.reduce((a,b) => a+b, 0) / rMultipleValues.length : null,
    pnlByAssetClass: transformGroupedData(pnlByAssetClass),
    pnlByExchange: transformGroupedData(pnlByExchange),
    pnlByStrategy: transformGroupedData(pnlByStrategy)
  };
}

// --- Stage 5: Core Transaction and Trade Management ---
function addTransactionAndManageTrade(transactionData) {
  const currentDb = getDb();
  const {
    instrument_ticker, asset_class, exchange,
    action, quantity, price, datetime,
    fees_for_transaction = 0, notes_for_transaction = null
  } = transactionData;

  if (!instrument_ticker || !asset_class || !exchange || !action || quantity <= 0 || price <= 0 || !datetime) {
    throw new Error("Invalid transaction: Missing required fields or values are not positive.");
  }

  const transactFn = currentDb.transaction(() => {
    let trade;

    const findOpenTradeQuery = `  
      SELECT trade_id, trade_direction 
      FROM trades  
      WHERE instrument_ticker = @instrument_ticker  
      AND asset_class = @asset_class  
      AND exchange = @exchange  
      AND status = 'Open' 
    `;
    trade = currentDb.prepare(findOpenTradeQuery).get({
      instrument_ticker,
      asset_class,
      exchange
    });

    let current_trade_id;
    let position_trade_direction;

    if (!trade) {
      position_trade_direction = (action === 'Buy') ? 'Long' : 'Short';
      const newTradeStmt = currentDb.prepare(
        `INSERT INTO trades (
          instrument_ticker, asset_class, exchange, trade_direction, status, open_datetime, fees_total, created_at, updated_at
        ) VALUES (
          @instrument_ticker, @asset_class, @exchange, @trade_direction, 'Open', @open_datetime, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING trade_id`
      );
      const newTradeResult = newTradeStmt.get({
        instrument_ticker, asset_class, exchange,
        trade_direction: position_trade_direction, open_datetime: datetime
      });
      current_trade_id = newTradeResult.trade_id;
      if (!current_trade_id) throw new Error("addTransactionAndManageTrade: DB error: Failed to create new trade record. Data: " + JSON.stringify(transactionData));
    } else {
      current_trade_id = trade.trade_id;
      position_trade_direction = trade.trade_direction;
    }

    const transactionsForThisTrade = currentDb.prepare('SELECT action, quantity FROM transactions WHERE trade_id = ?').all(current_trade_id);
    let currentOpenPositionSize = 0;
    transactionsForThisTrade.forEach(tx => {
      if (position_trade_direction === 'Long') {
        currentOpenPositionSize += (tx.action === 'Buy' ? tx.quantity : -tx.quantity);
      } else {
        currentOpenPositionSize += (tx.action === 'Sell' ? tx.quantity : -tx.quantity);
      }
    });
    currentOpenPositionSize = parseFloat(currentOpenPositionSize.toFixed(8)); // Address potential float precision issues

    const isExitingAction = (position_trade_direction === 'Long' && action === 'Sell') ||
      (position_trade_direction === 'Short' && action === 'Buy');

    if (isExitingAction && quantity > currentOpenPositionSize + 0.00000001) { // Add tolerance for float comparison
      throw new Error(`Cannot ${action.toLowerCase()} ${quantity}. Only ${currentOpenPositionSize} effectively open for trade ID ${current_trade_id}.`);
    }

    const transactionInsertStmt = currentDb.prepare(
      'INSERT INTO transactions (trade_id, action, quantity, price, datetime, fees, notes) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING transaction_id'
    );
    const transactionResult = transactionInsertStmt.get(current_trade_id, action, quantity, price, datetime, fees_for_transaction, notes_for_transaction);
    if (!transactionResult || !transactionResult.transaction_id) throw new Error("addTransactionAndManageTrade: DB error: Failed to insert transaction. Data: " + JSON.stringify({current_trade_id, action, quantity, price, datetime, fees_for_transaction, notes_for_transaction}));

    _recalculateTradeState(current_trade_id);

    // Return the transaction and trade IDs for reference
    return { 
      transaction_id: transactionResult.transaction_id, 
      trade_id: current_trade_id,
      trade_direction: position_trade_direction
    };
  });
  
  try {
    const result = transactFn();
    return { success: true, message: 'Transaction logged successfully.', ...result };
  } catch (error) {
    console.error('Error in addTransactionAndManageTrade:', error);
    return { success: false, message: error.message || 'Failed to log transaction.' };
  }
}

function updateTradeMetadata(payload) {
  const currentDb = getDb();
  try {
    const { trade_id, strategy_id, market_conditions, setup_description, reasoning, lessons_learned, r_multiple_initial_risk } = payload;
    const stmt = currentDb.prepare(`UPDATE trades SET strategy_id = @strategy_id, market_conditions = @market_conditions, setup_description = @setup_description, reasoning = @reasoning, lessons_learned = @lessons_learned, r_multiple_initial_risk = @r_multiple_initial_risk, updated_at = CURRENT_TIMESTAMP WHERE trade_id = @trade_id`);
    const result = stmt.run({
      trade_id,
      strategy_id: strategy_id || null,
      market_conditions,
      setup_description,
      reasoning,
      lessons_learned,
      r_multiple_initial_risk: (r_multiple_initial_risk !== undefined && r_multiple_initial_risk !== null && !isNaN(parseFloat(r_multiple_initial_risk))) ? parseFloat(r_multiple_initial_risk) : null
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

function updateSingleTransaction(data) {
  const currentDb = getDb();
  try {
    const { transaction_id, quantity, price, datetime, fees, notes } = data;
    const txDetails = currentDb.prepare('SELECT trade_id FROM transactions WHERE transaction_id = ?').get(transaction_id);
    if (!txDetails) {
      return { success: false, message: `Update failed: Transaction ID ${transaction_id} not found.` };
    }

    const stmt = currentDb.prepare(`UPDATE transactions SET quantity = ?, price = ?, datetime = ?, fees = ?, notes = ? WHERE transaction_id = ?`);
    stmt.run(quantity, price, datetime, fees, notes, transaction_id);
    _recalculateTradeState(txDetails.trade_id);
    
    return { success: true, message: 'Transaction updated successfully.' };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return { success: false, message: error.message || 'Failed to update transaction.' };
  }
}

function deleteSingleTransaction(transaction_id) {
const currentDb = getDb();
const transactFn = currentDb.transaction(() => {
const tx = currentDb.prepare('SELECT trade_id FROM transactions WHERE transaction_id = ?').get(transaction_id);
if (!tx) throw new Error(`Delete failed: Transaction ID ${transaction_id} not found.`);
currentDb.prepare('DELETE FROM transactions WHERE transaction_id = ?').run(transaction_id);
_recalculateTradeState(tx.trade_id); // This might delete the parent trade if it's the last transaction
});
transactFn();
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

// --- Read Operations for UI ---
function fetchTradesForListView() {
  console.log('[fetchTradesForListView CALLED]');
  const currentDb = getDb();
  // Fetch all trades as before
  const trades = currentDb.prepare(
    `SELECT trade_id, instrument_ticker, asset_class, exchange, trade_direction, status, open_datetime, close_datetime, fees_total, strategy_id, current_market_price, created_at, updated_at FROM trades ORDER BY COALESCE(open_datetime, created_at) DESC`
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
  return { ...trade, transactions };
}

// --- Stage 6: Emotion Management Functions ---
function getEmotions() {
const currentDb = getDb();
return currentDb.prepare('SELECT emotion_id, emotion_name FROM emotions ORDER BY emotion_name ASC').all();
}

function getEmotionsForTrade(tradeId) {
const currentDb = getDb();
return currentDb.prepare('SELECT emotion_id FROM trade_emotions WHERE trade_id = ?').all(tradeId).map(row => row.emotion_id);
}

function saveTradeEmotions(tradeId, emotionIds = []) {
  const currentDb = getDb();
  try {
    const transactFn = currentDb.transaction(() => {
      currentDb.prepare('DELETE FROM trade_emotions WHERE trade_id = ?').run(tradeId);
      if (emotionIds && emotionIds.length > 0) {
        const stmt = currentDb.prepare('INSERT INTO trade_emotions (trade_id, emotion_id) VALUES (?, ?)');
        for (const emotionId of emotionIds) {
          stmt.run(tradeId, emotionId);
        }
      }
      currentDb.prepare('UPDATE trades SET updated_at = CURRENT_TIMESTAMP WHERE trade_id = ?').run(tradeId);
    });
    transactFn();
    return { success: true, message: 'Trade emotions updated successfully.' };
  } catch (error) {
    console.error('Error saving trade emotions:', error);
    return { success: false, message: error.message || 'Failed to save trade emotions.' };
  }
}

function testDbConnection() {
  try {
    if (db && db.open) {
      return { status: 'ok', message: 'Database connection is open.' };
    } else {
      return { status: 'error', message: 'Database is not initialized or not open.' };
    }
  } catch (err) {
    return { status: 'error', message: err.message || 'Unknown error.' };
  }
}

module.exports = {
  initializeDatabase,
  getDb,
  closeDatabase,
  addTransactionAndManageTrade,
  logTransaction: addTransactionAndManageTrade,
  fetchTradesForListView,
  fetchTradeWithTransactions,
  updateTradeMetadata,
  updateSingleTransaction,
  deleteSingleTransaction,
  deleteFullTradeAndTransactions,
  calculateAnalyticsData, 
  calculateTradePnlFifoEnhanced,
  _recalculateTradeState,
  getEmotions, 
  getEmotionsForTrade, 
  saveTradeEmotions,
  updateMarkToMarketPrice,
  testDbConnection,
};