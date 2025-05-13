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
    console.log('Database already initialized and open');
    return db;
  }
  try {
    const dbDir = path.dirname(dbFilePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Created database directory: ${dbDir}`);
    }
    db = new Database(dbFilePath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    createTables(db);
    seedInitialData(db);
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
    console.error('Database not initialized or has been closed');
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
  console.log('[fetchTradesForListView CALLED]');
  const currentDb = getDb();
  // Fetch all trades with strategy names
  const trades = currentDb.prepare(
    `SELECT 
      t.trade_id, 
      t.instrument_ticker, 
      t.asset_class, 
      t.exchange, 
      t.trade_direction, 
      t.status, 
      t.open_datetime, 
      t.close_datetime, 
      t.fees_total, 
      t.strategy_id,
      s.strategy_name,
      t.current_market_price, 
      t.created_at, 
      t.updated_at 
    FROM trades t
    LEFT JOIN strategies s ON t.strategy_id = s.strategy_id
    ORDER BY COALESCE(t.open_datetime, t.created_at) DESC`
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

async function calculateAnalyticsData(filters = {}) {
  try {
    const db = await getDb();
    console.log('Executing analytics query with filters:', filters);

    // Build the WHERE clause based on filters
    let whereClause = '';
    const params = [];

    if (filters.dateRange?.startDate || filters.dateRange?.endDate) {
      whereClause = 'WHERE ';
      if (filters.dateRange.startDate) {
        whereClause += 't.open_datetime >= ? ';
        params.push(filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        whereClause += filters.dateRange.startDate ? 'AND ' : '';
        whereClause += 't.open_datetime <= ? ';
        params.push(filters.dateRange.endDate);
      }
    }

    const trades = db.prepare(`
      SELECT t.*, s.strategy_name 
      FROM trades t 
      LEFT JOIN strategies s ON t.strategy_id = s.strategy_id 
      ${whereClause}
      ORDER BY t.open_datetime ASC
    `).all(...params);

    console.log(`Found ${trades.length} trades matching filters`);

    // Initialize analytics data structure
    const analyticsData = {
      totalRealizedNetPnl: 0,
      totalRealizedGrossPnl: 0,
      totalFeesPaidOnClosedPortions: 0,
      totalUnrealizedPnl: 0,
      winRateOverall: null,
      avgWinPnlOverall: null,
      avgLossPnlOverall: null,
      largestWinPnl: null,
      largestLossPnl: null,
      longestWinStreak: 0,
      longestLossStreak: 0,
      numberOfWinningTrades: 0,
      numberOfLosingTrades: 0,
      numberOfBreakEvenTrades: 0,
      totalFullyClosedTrades: 0,
      avgRMultiple: null,
      equityCurve: [],
      pnlPerTradeSeries: [],
      winLossBreakEvenCounts: [
        { name: 'Wins', value: 0 },
        { name: 'Losses', value: 0 },
        { name: 'Break Even', value: 0 }
      ],
      rMultipleDistribution: [],
      pnlByMonth: [],
      pnlByDayOfWeek: [],
      pnlVsDurationSeries: [],
      pnlByAssetClass: [],
      pnlByExchange: [],
      pnlByStrategy: [],
      pnlByEmotion: [],
      maxDrawdownPercentage: null
    };

    // Track sums for averages
    let sumWinningPnl = 0;
    let sumLosingPnl = 0;

    // Process each trade
    for (const trade of trades) {
      const transactions = db.prepare('SELECT * FROM transactions WHERE trade_id = ? ORDER BY datetime ASC').all(trade.trade_id);
      trade.transactions = transactions;

      // Calculate P&L for this trade
      let realizedPnl = 0;
      let realizedGrossPnl = 0;
      let feesPaid = 0;
      let openQuantity = 0;
      let weightedAvgEntryPrice = 0;
      let totalQuantity = 0;
      let hasRealizedPnl = false;

      // Process transactions chronologically
      for (const tx of transactions) {
        if (tx.action === 'Buy') {
          openQuantity += tx.quantity;
          totalQuantity += tx.quantity;
          weightedAvgEntryPrice = ((weightedAvgEntryPrice * (totalQuantity - tx.quantity)) + (tx.price * tx.quantity)) / totalQuantity;
        } else if (tx.action === 'Sell') {
          const closedQuantity = Math.min(openQuantity, tx.quantity);
          const pnl = (tx.price - weightedAvgEntryPrice) * closedQuantity;
          realizedPnl += pnl;
          realizedGrossPnl += pnl;
          feesPaid += (tx.fees || 0);
          openQuantity -= closedQuantity;
          hasRealizedPnl = true;
        }
      }

      // Update analytics data
      analyticsData.totalRealizedNetPnl += realizedPnl;
      analyticsData.totalRealizedGrossPnl += realizedGrossPnl;
      analyticsData.totalFeesPaidOnClosedPortions += feesPaid;

      // Only count trades that have realized P&L (at least one sell transaction)
      if (hasRealizedPnl) {
        // Calculate trade outcome and update sums for averages
        if (realizedPnl > 0) {
          analyticsData.numberOfWinningTrades++;
          analyticsData.winLossBreakEvenCounts[0].value++;
          sumWinningPnl += realizedPnl;
        } else if (realizedPnl < 0) {
          analyticsData.numberOfLosingTrades++;
          analyticsData.winLossBreakEvenCounts[1].value++;
          sumLosingPnl += realizedPnl;
        } else {
          analyticsData.numberOfBreakEvenTrades++;
          analyticsData.winLossBreakEvenCounts[2].value++;
        }

        // Update largest win/loss
        if (realizedPnl > 0 && (analyticsData.largestWinPnl === null || realizedPnl > analyticsData.largestWinPnl)) {
          analyticsData.largestWinPnl = realizedPnl;
        }
        if (realizedPnl < 0 && (analyticsData.largestLossPnl === null || realizedPnl < analyticsData.largestLossPnl)) {
          analyticsData.largestLossPnl = realizedPnl;
        }

        // Add to P&L series for all trades with realized P&L
        if (transactions.length > 0) {
          const lastTx = transactions[transactions.length - 1];
          analyticsData.pnlPerTradeSeries.push({
            date: new Date(lastTx.datetime).getTime(),
            pnl: realizedPnl,
            isFullyClosed: openQuantity === 0
          });

          // Calculate duration for all trades with realized P&L
          if (trade.open_datetime) {
            const durationMs = new Date(lastTx.datetime) - new Date(trade.open_datetime);
            const durationHours = durationMs / (1000 * 60 * 60);
            analyticsData.pnlVsDurationSeries.push({
              durationHours,
              netPnl: realizedPnl,
              rMultiple: trade.r_multiple_actual,
              trade_id: trade.trade_id,
              instrument_ticker: trade.instrument_ticker,
              isFullyClosed: openQuantity === 0
            });
          }
        }
      }

      // Group by month and day of week for all trades
      if (trade.open_datetime) {
        const openDate = new Date(trade.open_datetime);
        const monthKey = openDate.toLocaleString('default', { month: 'long' });
        const dayKey = openDate.toLocaleString('default', { weekday: 'long' });

        // Update monthly P&L
        let monthData = analyticsData.pnlByMonth.find(m => m.period === monthKey);
        if (!monthData) {
          monthData = { period: monthKey, totalNetPnl: 0, tradeCount: 0, winRate: null };
          analyticsData.pnlByMonth.push(monthData);
        }
        monthData.totalNetPnl += realizedPnl;
        if (hasRealizedPnl) {
          monthData.tradeCount++;
        }

        // Update daily P&L
        let dayData = analyticsData.pnlByDayOfWeek.find(d => d.period === dayKey);
        if (!dayData) {
          dayData = { period: dayKey, totalNetPnl: 0, tradeCount: 0, winRate: null };
          analyticsData.pnlByDayOfWeek.push(dayData);
        }
        dayData.totalNetPnl += realizedPnl;
        if (hasRealizedPnl) {
          dayData.tradeCount++;
        }

        // Update grouped performance data
        // Asset Class
        let assetClassData = analyticsData.pnlByAssetClass.find(a => a.name === trade.asset_class);
        if (!assetClassData) {
          assetClassData = {
            name: trade.asset_class,
            totalNetPnl: 0,
            tradeCount: 0,
            wins: 0,
            losses: 0,
            breakEvens: 0,
            winRate: null
          };
          analyticsData.pnlByAssetClass.push(assetClassData);
        }
        assetClassData.totalNetPnl += realizedPnl;
        if (hasRealizedPnl) {
          assetClassData.tradeCount++;
          if (realizedPnl > 0) assetClassData.wins++;
          else if (realizedPnl < 0) assetClassData.losses++;
          else assetClassData.breakEvens++;
        }

        // Exchange
        let exchangeData = analyticsData.pnlByExchange.find(e => e.name === trade.exchange);
        if (!exchangeData) {
          exchangeData = {
            name: trade.exchange,
            totalNetPnl: 0,
            tradeCount: 0,
            wins: 0,
            losses: 0,
            breakEvens: 0,
            winRate: null
          };
          analyticsData.pnlByExchange.push(exchangeData);
        }
        exchangeData.totalNetPnl += realizedPnl;
        if (hasRealizedPnl) {
          exchangeData.tradeCount++;
          if (realizedPnl > 0) exchangeData.wins++;
          else if (realizedPnl < 0) exchangeData.losses++;
          else exchangeData.breakEvens++;
        }

        // Strategy
        let strategyData = analyticsData.pnlByStrategy.find(s => s.name === trade.strategy);
        if (!strategyData) {
          strategyData = {
            name: trade.strategy || 'Unspecified',
            totalNetPnl: 0,
            tradeCount: 0,
            wins: 0,
            losses: 0,
            breakEvens: 0,
            winRate: null
          };
          analyticsData.pnlByStrategy.push(strategyData);
        }
        strategyData.totalNetPnl += realizedPnl;
        if (hasRealizedPnl) {
          strategyData.tradeCount++;
          if (realizedPnl > 0) strategyData.wins++;
          else if (realizedPnl < 0) strategyData.losses++;
          else strategyData.breakEvens++;
        }

        // Emotion
        const emotions = db.prepare(`
          SELECT e.emotion_name 
          FROM emotions e
          JOIN transaction_emotions te ON e.emotion_id = te.emotion_id
          JOIN transactions t ON te.transaction_id = t.transaction_id
          WHERE t.trade_id = ?
        `).all(trade.trade_id);
        const emotionNames = emotions.map(e => e.emotion_name);
        if (emotionNames.length > 0) {
          emotionNames.forEach(emotion => {
            let emotionData = analyticsData.pnlByEmotion.find(e => e.name === emotion);
            if (!emotionData) {
              emotionData = {
                name: emotion,
                totalNetPnl: 0,
                tradeCount: 0,
                wins: 0,
                losses: 0,
                breakEvens: 0,
                winRate: null
              };
              analyticsData.pnlByEmotion.push(emotionData);
            }
            emotionData.totalNetPnl += realizedPnl;
            if (hasRealizedPnl) {
              emotionData.tradeCount++;
              if (realizedPnl > 0) emotionData.wins++;
              else if (realizedPnl < 0) emotionData.losses++;
              else emotionData.breakEvens++;
            }
          });
        }
      }
    }

    // Calculate win rates for grouped data
    const calculateWinRate = (group) => {
      if (group.tradeCount > 0) {
        group.winRate = (group.wins / group.tradeCount) * 100;
      }
    };

    analyticsData.pnlByAssetClass.forEach(calculateWinRate);
    analyticsData.pnlByExchange.forEach(calculateWinRate);
    analyticsData.pnlByStrategy.forEach(calculateWinRate);
    analyticsData.pnlByEmotion.forEach(calculateWinRate);

    // Sort grouped data by total P&L
    const sortByPnl = (a, b) => b.totalNetPnl - a.totalNetPnl;
    analyticsData.pnlByAssetClass.sort(sortByPnl);
    analyticsData.pnlByExchange.sort(sortByPnl);
    analyticsData.pnlByStrategy.sort(sortByPnl);
    analyticsData.pnlByEmotion.sort(sortByPnl);

    // Calculate win rates and averages
    const totalTrades = analyticsData.numberOfWinningTrades + analyticsData.numberOfLosingTrades + analyticsData.numberOfBreakEvenTrades;
    if (totalTrades > 0) {
      analyticsData.winRateOverall = analyticsData.numberOfWinningTrades / totalTrades;
    }

    // Calculate average win and loss P&L
    if (analyticsData.numberOfWinningTrades > 0) {
      analyticsData.avgWinPnlOverall = sumWinningPnl / analyticsData.numberOfWinningTrades;
    }
    if (analyticsData.numberOfLosingTrades > 0) {
      analyticsData.avgLossPnlOverall = sumLosingPnl / analyticsData.numberOfLosingTrades;
    }

    // Sort and calculate cumulative P&L
    analyticsData.pnlPerTradeSeries.sort((a, b) => a.date - b.date);
    let cumulativePnl = 0;
    analyticsData.equityCurve = analyticsData.pnlPerTradeSeries.map(point => {
      cumulativePnl += point.pnl;
      return {
        date: point.date,
        equity: cumulativePnl
      };
    });

    // Calculate max drawdown
    let peak = -Infinity;
    let maxDrawdown = 0;
    if (analyticsData.equityCurve.length > 0) {
      for (const point of analyticsData.equityCurve) {
        if (point.equity > peak) {
          peak = point.equity;
        }
        if (peak > 0) {  // Only calculate drawdown if we have a positive peak
          const drawdown = (point.equity - peak) / peak;  // Changed order to match standard definition
          maxDrawdown = Math.min(maxDrawdown, drawdown);  // Changed to min since drawdown is now negative
        }
      }
    }
    analyticsData.maxDrawdownPercentage = Math.abs(maxDrawdown * 100);  // Take absolute value for display

    return analyticsData;
  } catch (error) {
    console.error('Error calculating analytics data:', error);
    throw error;
  }
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
    const { 
      transaction_id, 
      quantity, 
      price, 
      datetime, 
      fees, 
      notes,
      strategy_id,
      market_conditions,
      setup_description,
      reasoning,
      lessons_learned,
      r_multiple_initial_risk,
      emotion_ids
    } = data;

    const txDetails = currentDb.prepare('SELECT trade_id FROM transactions WHERE transaction_id = ?').get(transaction_id);
    if (!txDetails) {
      return { success: false, message: `Update failed: Transaction ID ${transaction_id} not found.` };
    }

    // Update transaction details
    const stmt = currentDb.prepare(`
      UPDATE transactions 
      SET quantity = ?, 
          price = ?, 
          datetime = ?, 
          fees = ?, 
          notes = ?,
          strategy_id = ?,
          market_conditions = ?,
          setup_description = ?,
          reasoning = ?,
          lessons_learned = ?,
          r_multiple_initial_risk = ?
      WHERE transaction_id = ?
    `);
    
    stmt.run(
      quantity, 
      price, 
      datetime, 
      fees, 
      notes,
      strategy_id || null,
      market_conditions || null,
      setup_description || null,
      reasoning || null,
      lessons_learned || null,
      r_multiple_initial_risk || null,
      transaction_id
    );

    // Update emotions
    if (emotion_ids) {
      // Delete existing emotions
      currentDb.prepare('DELETE FROM transaction_emotions WHERE transaction_id = ?').run(transaction_id);
      
      // Insert new emotions
      const insertEmotionStmt = currentDb.prepare(
        'INSERT INTO transaction_emotions (transaction_id, emotion_id) VALUES (?, ?)'
      );
      
      for (const emotionId of emotion_ids) {
        insertEmotionStmt.run(transaction_id, emotionId);
      }
    }

    _recalculateTradeState(txDetails.trade_id);
    
    return { success: true, message: 'Transaction updated successfully.' };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return { success: false, message: error.message || 'Failed to update transaction.' };
  }
}

function deleteSingleTransaction(transaction_id) {
const currentDb = getDb();
  try {
const transactFn = currentDb.transaction(() => {
const tx = currentDb.prepare('SELECT trade_id FROM transactions WHERE transaction_id = ?').get(transaction_id);
      if (!tx) {
        throw new Error(`Delete failed: Transaction ID ${transaction_id} not found.`);
      }
currentDb.prepare('DELETE FROM transactions WHERE transaction_id = ?').run(transaction_id);
_recalculateTradeState(tx.trade_id); // This might delete the parent trade if it's the last transaction
});
transactFn();
    return { success: true, message: 'Transaction deleted successfully.' };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return { success: false, message: error.message || 'Failed to delete transaction.' };
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