// File: zekenewsom-trade_journal/packages/electron-app/src/database/db.js
// Stage 6: Full DB logic including Advanced Analytics and Emotion Tagging

// Modularized: Connection and initialization logic moved to connection.js
const connection = require('./connection');

// Re-export connection functions
const { initializeDatabase, getDb, closeDatabase, seedInitialData } = connection;

// Modularized: Trade management functions moved to tradeService.js
const tradeService = require('./tradeService');



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
    const currentDb = getDb();
    console.log('Executing analytics query with filters:', filters);

    let whereClause = '';
    const params = [];

    if (filters.dateRange?.startDate || filters.dateRange?.endDate) {
      whereClause = 'WHERE ';
      if (filters.dateRange.startDate) {
        whereClause += '(t.close_datetime >= ? OR (t.status = "Open" AND t.open_datetime >= ?)) ';
        params.push(filters.dateRange.startDate, filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        whereClause += (params.length > 0 ? 'AND ' : '');
        whereClause += '(t.close_datetime <= ? OR (t.status = "Open" AND t.open_datetime <= ?)) ';
        params.push(filters.dateRange.endDate, filters.dateRange.endDate);
      }
    }
    // Add other filters (asset_class, exchange, strategy_id) to whereClause and params if they exist in `filters`

    const tradesFromDb = currentDb.prepare(`
      SELECT t.*, s.strategy_name
      FROM trades t
      LEFT JOIN strategies s ON t.strategy_id = s.strategy_id
      ${whereClause}
      ORDER BY COALESCE(t.close_datetime, t.open_datetime, t.created_at) ASC
    `).all(...params);
    console.log(`Found ${tradesFromDb.length} trades matching filters`);

    const analyticsData = {
      totalRealizedNetPnl: 0,
      totalRealizedGrossPnl: 0,
      totalFeesPaidOnClosedPortions: 0,
      totalUnrealizedPnl: 0, // Will sum up from open trades
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
      maxDrawdownPercentage: null,
      availableStrategies: currentDb.prepare('SELECT strategy_id, strategy_name FROM strategies ORDER BY strategy_name').all(),
      availableExchanges: currentDb.prepare('SELECT DISTINCT exchange FROM trades WHERE exchange IS NOT NULL ORDER BY exchange').all().map(r => r.exchange),
      availableAssetClasses: currentDb.prepare('SELECT DISTINCT asset_class FROM trades ORDER BY asset_class').all().map(r => r.asset_class),
      availableEmotions: currentDb.prepare('SELECT emotion_id, emotion_name FROM emotions ORDER BY emotion_name').all(),
      availableTickers: currentDb.prepare('SELECT DISTINCT instrument_ticker FROM trades ORDER BY instrument_ticker').all().map(r => r.instrument_ticker),
    };

    let sumWinningPnl = 0;
    let sumLosingPnl = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let cumulativePnlForEquity = 0;
    let sumRMultiples = 0;
    let countRMultiples = 0;

    const rMultipleBuckets = {
         "<-2R": 0, "-2R to -1R": 0, "-1R to 0R": 0,
         "0R to 1R": 0, "1R to 2R": 0, ">2R": 0, "N/A": 0
    };

    for (const trade of tradesFromDb) {
      const transactions = currentDb.prepare('SELECT * FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC').all(trade.trade_id);
      const pnlDetails = calculateTradePnlFifoEnhanced(trade, transactions);

      // Aggregate Unrealized P&L from all trades (open or partially open)
      if (pnlDetails.openQuantity > 0 && pnlDetails.unrealizedGrossPnlOnOpenPortion !== null) {
        analyticsData.totalUnrealizedPnl = (analyticsData.totalUnrealizedPnl || 0) + pnlDetails.unrealizedGrossPnlOnOpenPortion;
      }

      // --- Metrics primarily based on REALIZED P&L from CLOSED trades/portions ---
      // Add P&L for each closed trade/portion to the P&L per trade series
      // This helps in building the equity curve based on realized P&L events
      if (pnlDetails.realizedNetPnl !== 0 || pnlDetails.isFullyClosed) { // Consider any realized P&L event
         analyticsData.pnlPerTradeSeries.push({
             date: new Date(pnlDetails.relevantDate).getTime(), // relevantDate is close_datetime or open_datetime
             pnl: pnlDetails.realizedNetPnl,
             isFullyClosed: pnlDetails.isFullyClosed
         });
      }

      // For aggregated historical stats, focus on fully closed trades
      if (pnlDetails.isFullyClosed) {
        analyticsData.totalFullyClosedTrades++;
        analyticsData.totalRealizedNetPnl += pnlDetails.realizedNetPnl;
        analyticsData.totalRealizedGrossPnl += pnlDetails.realizedGrossPnl;
        // trade.fees_total should be accurate due to _recalculateTradeState
        analyticsData.totalFeesPaidOnClosedPortions += (trade.fees_total || 0);

        if (pnlDetails.outcome === 'Win') {
          analyticsData.numberOfWinningTrades++;
          analyticsData.winLossBreakEvenCounts[0].value++;
          sumWinningPnl += pnlDetails.realizedNetPnl;
          currentWinStreak++;
          currentLossStreak = 0;
          analyticsData.longestWinStreak = Math.max(analyticsData.longestWinStreak, currentWinStreak);
        } else if (pnlDetails.outcome === 'Loss') {
          analyticsData.numberOfLosingTrades++;
          analyticsData.winLossBreakEvenCounts[1].value++;
          sumLosingPnl += pnlDetails.realizedNetPnl;
          currentLossStreak++;
          currentWinStreak = 0;
          analyticsData.longestLossStreak = Math.max(analyticsData.longestLossStreak, currentLossStreak);
        } else { // Break Even
          analyticsData.numberOfBreakEvenTrades++;
          analyticsData.winLossBreakEvenCounts[2].value++;
          currentWinStreak = 0;
          currentLossStreak = 0;
        }

        if (pnlDetails.realizedNetPnl > (analyticsData.largestWinPnl || -Infinity)) {
          analyticsData.largestWinPnl = pnlDetails.realizedNetPnl;
        }
        if (pnlDetails.realizedNetPnl < (analyticsData.largestLossPnl || Infinity)) {
          analyticsData.largestLossPnl = pnlDetails.realizedNetPnl;
        }

        // R-Multiple Actual for closed trades
        if (pnlDetails.rMultipleActual !== null && pnlDetails.rMultipleActual !== undefined) {
          sumRMultiples += pnlDetails.rMultipleActual;
          countRMultiples++;
          // Bucket R-Multiples
          if (pnlDetails.rMultipleActual <= -2) rMultipleBuckets["<-2R"]++;
          else if (pnlDetails.rMultipleActual <= -1) rMultipleBuckets["-2R to -1R"]++;
          else if (pnlDetails.rMultipleActual < 0) rMultipleBuckets["-1R to 0R"]++;
          else if (pnlDetails.rMultipleActual < 1) rMultipleBuckets["0R to 1R"]++;
          else if (pnlDetails.rMultipleActual <= 2) rMultipleBuckets["1R to 2R"]++;
          else rMultipleBuckets[">2R"]++;
        } else {
          rMultipleBuckets["N/A"]++;
        }

        // P&L vs Duration for closed trades
        if (pnlDetails.durationMs !== null) {
          analyticsData.pnlVsDurationSeries.push({
            durationHours: pnlDetails.durationMs / (1000 * 60 * 60),
            netPnl: pnlDetails.realizedNetPnl,
            rMultiple: pnlDetails.rMultipleActual,
            trade_id: pnlDetails.trade_id,
            instrument_ticker: trade.instrument_ticker,
            isFullyClosed: true
          });
        }

        // --- Grouped P&L for fully closed trades ---
        const groupDate = new Date(pnlDetails.relevantDate);

        // P&L By Month
        const monthKey = `${groupDate.getFullYear()}-${String(groupDate.getMonth() + 1).padStart(2, '0')} (${groupDate.toLocaleString('default', { month: 'short' })})`;
        let monthData = analyticsData.pnlByMonth.find(m => m.period === monthKey);
        if (!monthData) {
          monthData = { period: monthKey, totalNetPnl: 0, tradeCount: 0, winRate: null, wins: 0, losses: 0, breakEvens: 0 };
          analyticsData.pnlByMonth.push(monthData);
        }
        monthData.totalNetPnl += pnlDetails.realizedNetPnl;
        monthData.tradeCount++;
        if (pnlDetails.outcome === 'Win') monthData.wins++; else if (pnlDetails.outcome === 'Loss') monthData.losses++; else monthData.breakEvens++;

        // P&L By Day of Week
        const dayKey = groupDate.toLocaleString('default', { weekday: 'long' });
        let dayData = analyticsData.pnlByDayOfWeek.find(d => d.period === dayKey);
        if (!dayData) {
          dayData = { period: dayKey, totalNetPnl: 0, tradeCount: 0, winRate: null, wins: 0, losses: 0, breakEvens: 0 };
          analyticsData.pnlByDayOfWeek.push(dayData);
        }
        dayData.totalNetPnl += pnlDetails.realizedNetPnl;
        dayData.tradeCount++;
        if (pnlDetails.outcome === 'Win') dayData.wins++; else if (pnlDetails.outcome === 'Loss') dayData.losses++; else dayData.breakEvens++;

        // P&L By Asset Class
        const assetClassKey = trade.asset_class || 'N/A';
        let assetClassData = analyticsData.pnlByAssetClass.find(a => a.name === assetClassKey);
        if (!assetClassData) {
          assetClassData = { name: assetClassKey, totalNetPnl: 0, tradeCount: 0, winRate: null, wins: 0, losses: 0, breakEvens: 0 };
          analyticsData.pnlByAssetClass.push(assetClassData);
        }
        assetClassData.totalNetPnl += pnlDetails.realizedNetPnl;
        assetClassData.tradeCount++;
        if (pnlDetails.outcome === 'Win') assetClassData.wins++; else if (pnlDetails.outcome === 'Loss') assetClassData.losses++; else assetClassData.breakEvens++;

        // P&L By Exchange
        const exchangeKey = trade.exchange || 'N/A';
        let exchangeData = analyticsData.pnlByExchange.find(e => e.name === exchangeKey);
        if (!exchangeData) {
          exchangeData = { name: exchangeKey, totalNetPnl: 0, tradeCount: 0, winRate: null, wins: 0, losses: 0, breakEvens: 0 };
          analyticsData.pnlByExchange.push(exchangeData);
        }
        exchangeData.totalNetPnl += pnlDetails.realizedNetPnl;
        exchangeData.tradeCount++;
        if (pnlDetails.outcome === 'Win') exchangeData.wins++; else if (pnlDetails.outcome === 'Loss') exchangeData.losses++; else exchangeData.breakEvens++;

        // P&L By Strategy
        const strategyName = trade.strategy_name || 'Unspecified';
        let strategyData = analyticsData.pnlByStrategy.find(s => s.name === strategyName);
        if (!strategyData) {
          strategyData = { name: strategyName, totalNetPnl: 0, tradeCount: 0, winRate: null, wins: 0, losses: 0, breakEvens: 0 };
          analyticsData.pnlByStrategy.push(strategyData);
        }
        strategyData.totalNetPnl += pnlDetails.realizedNetPnl;
        strategyData.tradeCount++;
        if (pnlDetails.outcome === 'Win') strategyData.wins++; else if (pnlDetails.outcome === 'Loss') strategyData.losses++; else strategyData.breakEvens++;

        // P&L By Emotion (assuming emotions are per-trade)
        const tradeEmotions = currentDb.prepare(`
          SELECT e.emotion_name
          FROM emotions e
          JOIN trade_emotions te ON e.emotion_id = te.emotion_id
          WHERE te.trade_id = ?
        `).all(trade.trade_id).map(e => e.emotion_name);

        tradeEmotions.forEach(emotionName => {
          let emotionGroupData = analyticsData.pnlByEmotion.find(e => e.name === emotionName);
          if (!emotionGroupData) {
            emotionGroupData = { name: emotionName, totalNetPnl: 0, tradeCount: 0, winRate: null, wins: 0, losses: 0, breakEvens: 0 };
            analyticsData.pnlByEmotion.push(emotionGroupData);
          }
          emotionGroupData.totalNetPnl += pnlDetails.realizedNetPnl;
          emotionGroupData.tradeCount++;
          if (pnlDetails.outcome === 'Win') emotionGroupData.wins++; else if (pnlDetails.outcome === 'Loss') emotionGroupData.losses++; else emotionGroupData.breakEvens++;
        });
      }
    }

    // Populate R-Multiple Distribution
     analyticsData.rMultipleDistribution = Object.entries(rMultipleBuckets)
         .map(([range, count]) => ({ range, count }))
         .filter(item => item.count > 0 || item.range === "N/A");

    // Sort pnlPerTradeSeries for equity curve calculation
    analyticsData.pnlPerTradeSeries.sort((a, b) => a.date - b.date);
    analyticsData.pnlPerTradeSeries.forEach(point => {
      cumulativePnlForEquity += point.pnl;
      analyticsData.equityCurve.push({
        date: point.date,
        equity: cumulativePnlForEquity
      });
    });

    // Final calculations for averages, win rates
    if (analyticsData.totalFullyClosedTrades > 0) {
      analyticsData.winRateOverall = analyticsData.numberOfWinningTrades / analyticsData.totalFullyClosedTrades;
      if (analyticsData.numberOfWinningTrades > 0) {
        analyticsData.avgWinPnlOverall = sumWinningPnl / analyticsData.numberOfWinningTrades;
      }
      if (analyticsData.numberOfLosingTrades > 0) {
        analyticsData.avgLossPnlOverall = sumLosingPnl / analyticsData.numberOfLosingTrades;
      }
      if (countRMultiples > 0) {
          analyticsData.avgRMultiple = sumRMultiples / countRMultiples;
      }
    }

    const calculateWinRateForGroup = (group) => {
      if (group.tradeCount > 0 && group.wins !== undefined) {
        group.winRate = (group.wins / group.tradeCount) * 100;
      }
    };
    analyticsData.pnlByMonth.forEach(calculateWinRateForGroup);
    analyticsData.pnlByDayOfWeek.forEach(calculateWinRateForGroup);
    analyticsData.pnlByAssetClass.forEach(calculateWinRateForGroup);
    analyticsData.pnlByExchange.forEach(calculateWinRateForGroup);
    analyticsData.pnlByStrategy.forEach(calculateWinRateForGroup);
    analyticsData.pnlByEmotion.forEach(calculateWinRateForGroup);
    analyticsData.pnlByMonth.sort((a,b) => a.period.localeCompare(b.period));

    // Max Drawdown Calculation
    let peakEquity = 0;
    let maxDrawdownRatio = 0;
    if (analyticsData.equityCurve.length > 0) {
        peakEquity = Math.max(0, analyticsData.equityCurve[0].equity);
        for (const point of analyticsData.equityCurve) {
            if (point.equity > peakEquity) {
                peakEquity = point.equity;
            }
            const currentDrawdown = (peakEquity > 0) ? (point.equity - peakEquity) / peakEquity : 0;
            if (currentDrawdown < maxDrawdownRatio) {
                maxDrawdownRatio = currentDrawdown;
            }
        }
    }
    analyticsData.maxDrawdownPercentage = Math.abs(maxDrawdownRatio * 100);

    console.log('Consolidated analytics data calculated.');
    return analyticsData;
  } catch (error) {
    console.error('Error in consolidated calculateAnalyticsData:', error);
    return { error: (error).message || 'Failed to calculate analytics data' };
  }
}


        // Strategy

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

    tradeService._recalculateTradeState(current_trade_id);

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

    tradeService._recalculateTradeState(txDetails.trade_id);
    
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
tradeService._recalculateTradeState(tx.trade_id); // This might delete the parent trade if it's the last transaction
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
  fetchTradesForListView: tradeService.fetchTradesForListView,
  fetchTradeWithTransactions: tradeService.fetchTradeWithTransactions,
  updateTradeMetadata: tradeService.updateTradeMetadata,
  updateSingleTransaction,
  deleteSingleTransaction,
  deleteFullTradeAndTransactions: tradeService.deleteFullTradeAndTransactions,
  calculateAnalyticsData, 
  calculateTradePnlFifoEnhanced: tradeService.calculateTradePnlFifoEnhanced,
  _recalculateTradeState: tradeService._recalculateTradeState,
  getEmotions, 
  getEmotionsForTrade, 
  saveTradeEmotions,
  updateMarkToMarketPrice: tradeService.updateMarkToMarketPrice,
  testDbConnection,
};