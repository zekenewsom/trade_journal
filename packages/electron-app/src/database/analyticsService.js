// packages/electron-app/src/database/analyticsService.js
const { getDb } = require('./connection');
const tradeService = require('./tradeService'); // To use calculateTradePnlFifoEnhanced
const { format } = require('date-fns'); // For date formatting
const { enhanceAnalyticsWithInstitutional } = require('./institutionalAnalyticsService');

const DEFAULT_RISK_FREE_RATE = 4.5;

async function calculateAnalyticsData(filters = {}) {
  console.log('[ANALYTICS_SERVICE] calculateAnalyticsData CALLED with filters:', filters);
  try {
    const db = getDb();

    let whereClause = '';
    const queryParams = {};

    if (filters.dateRange?.startDate) { //
      whereClause += (Object.keys(queryParams).length > 0 ? 'AND ' : 'WHERE ') +
                     '( (t.close_datetime IS NOT NULL AND t.close_datetime >= @startDate) OR (t.close_datetime IS NULL AND t.open_datetime >= @startDate) ) ';
      queryParams.startDate = filters.dateRange.startDate;
    }
    if (filters.dateRange?.endDate) { //
      whereClause += (Object.keys(queryParams).length > 0 ? 'AND ' : 'WHERE ') +
                     '( (t.close_datetime IS NOT NULL AND t.close_datetime <= @endDate) OR (t.close_datetime IS NULL AND t.open_datetime <= @endDate) ) ';
      queryParams.endDate = filters.dateRange.endDate;
    }
    if (filters.strategies && filters.strategies.length > 0) {
      whereClause += (Object.keys(queryParams).length > 0 ? 'AND ' : 'WHERE ') +
                     `t.strategy_id IN (${filters.strategies.map(() => '?').join(',')}) `;
      filters.strategies.forEach(sId => queryParams[Object.keys(queryParams).length] = sId); // This needs careful handling of param names for better-sqlite3
    }
    // Add similar blocks for assetClasses, exchanges, tickers if needed for the main tradesFromDb query

    // Optimized query: Fetch all trades and their transactions in one go
    const tradesAndTransactionsResult = db.prepare(`
      SELECT 
        t.*, s.strategy_name,
        tr.transaction_id, tr.action, tr.quantity, tr.price, tr.datetime, 
        tr.fees, tr.notes, tr.strategy_id as tx_strategy_id, tr.market_conditions,
        tr.setup_description, tr.reasoning, tr.lessons_learned, tr.r_multiple_initial_risk,
        tr.created_at as tx_created_at
      FROM trades t
      LEFT JOIN strategies s ON t.strategy_id = s.strategy_id
      LEFT JOIN transactions tr ON t.trade_id = tr.trade_id
      ${whereClause}
      ORDER BY t.trade_id, tr.datetime ASC, tr.transaction_id ASC
    `).all(queryParams);
    
    console.log(`[ANALYTICS_SERVICE] Fetched ${tradesAndTransactionsResult.length} trade-transaction rows in single query`);
    
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
    
    const tradesFromDb = Array.from(tradesMap.values());
    console.log(`[ANALYTICS_SERVICE] Found ${tradesFromDb.length} trades matching filters`);

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
      winLossBreakEvenCounts: [{ name: 'Wins', value: 0 }, { name: 'Losses', value: 0 }, { name: 'Break Even', value: 0 }],
      rMultipleDistribution: [],
      pnlByMonth: [],
      pnlByDayOfWeek: [],
      pnlVsDurationSeries: [],
      pnlByAssetClass: [],
      pnlByExchange: [],
      pnlByStrategy: [],
      pnlByEmotion: [],
      pnlByAsset: [], // NEW FIELD
      maxDrawdownPercentage: null,
      // --- NEW FIELDS INITIALIZATION ---
      kellyCriterion: null,
      ulcerIndex: null, // Placeholder - requires complex calculation
      valueAtRisk95: { amount: null, percentage: null }, // Placeholder
      netAccountBalanceTrend: [],
      dailyPnlForHeatmap: [],
      riskReturnScatterData: [],
      // --- END NEW FIELDS ---
      availableStrategies: db.prepare('SELECT strategy_id, strategy_name FROM strategies ORDER BY strategy_name').all(), //
      availableExchanges: db.prepare('SELECT DISTINCT exchange FROM trades WHERE exchange IS NOT NULL ORDER BY exchange').all().map(r => r.exchange), //
      availableAssetClasses: db.prepare('SELECT DISTINCT asset_class FROM trades ORDER BY asset_class').all().map(r => r.asset_class), //
      availableEmotions: db.prepare('SELECT emotion_id, emotion_name FROM emotions ORDER BY emotion_name').all(), //
      availableTickers: db.prepare('SELECT DISTINCT instrument_ticker FROM trades ORDER BY instrument_ticker').all().map(r => r.instrument_ticker), //
    };

    let sumWinningPnl = 0;
    let sumLosingPnl = 0;
    let currentWinStreak = 0; //
    let currentLossStreak = 0; //
    let sumRMultiples = 0; //
    let countRMultiples = 0; //
    const rMultipleBuckets = {"<-2R": 0, "-2R to -1R": 0, "-1R to 0R": 0, "0R to 1R": 0, "1R to 2R": 0, ">2R": 0, "N/A": 0 }; //
    
    const dailyPnlMap = new Map();

    for (const tradeData of tradesFromDb) { //
      const trade = tradeData.trade;
      const transactions = tradeData.transactions;
      const pnlDetails = tradeService.calculateTradePnlFifoEnhanced(trade, transactions); //

      if (pnlDetails.openQuantity > 0 && pnlDetails.unrealizedGrossPnlOnOpenPortion !== null) { //
        analyticsData.totalUnrealizedPnl = (analyticsData.totalUnrealizedPnl || 0) + pnlDetails.unrealizedGrossPnlOnOpenPortion;
      }
      
      if (pnlDetails.realizedNetPnl !== 0 || pnlDetails.isFullyClosed) { //
        analyticsData.pnlPerTradeSeries.push({
            date: new Date(pnlDetails.relevantDate).getTime(),
            pnl: pnlDetails.realizedNetPnl,
            isFullyClosed: pnlDetails.isFullyClosed
        });
        // Aggregate P&L for daily heatmap
        if (pnlDetails.isFullyClosed) {
            const tradeCloseDateStr = format(new Date(pnlDetails.relevantDate), 'yyyy-MM-dd');
            dailyPnlMap.set(tradeCloseDateStr, (dailyPnlMap.get(tradeCloseDateStr) || 0) + pnlDetails.realizedNetPnl);
        }
      }

      if (pnlDetails.isFullyClosed) { //
        analyticsData.totalFullyClosedTrades++;
        analyticsData.totalRealizedNetPnl += pnlDetails.realizedNetPnl; //
        analyticsData.totalRealizedGrossPnl += pnlDetails.realizedGrossPnl; //
        analyticsData.totalFeesPaidOnClosedPortions += (trade.fees_total || 0); //

        if (pnlDetails.outcome === 'Win') { //
          analyticsData.numberOfWinningTrades++;
          sumWinningPnl += pnlDetails.realizedNetPnl; currentWinStreak++; currentLossStreak = 0;
          analyticsData.longestWinStreak = Math.max(analyticsData.longestWinStreak, currentWinStreak);
        } else if (pnlDetails.outcome === 'Loss') { //
          analyticsData.numberOfLosingTrades++; sumLosingPnl += pnlDetails.realizedNetPnl;
          currentLossStreak++; currentWinStreak = 0;
          analyticsData.longestLossStreak = Math.max(analyticsData.longestLossStreak, currentLossStreak);
        } else { 
          analyticsData.numberOfBreakEvenTrades++; //
          currentWinStreak = 0; currentLossStreak = 0;
        }
        // ... (winLossBreakEvenCounts, largestWin/Loss, R-Multiple distribution, PnL by groups, etc. - existing logic from)
         const outcomeIndex = analyticsData.winLossBreakEvenCounts.findIndex(c => c.name.toLowerCase() === (pnlDetails.outcome?.toLowerCase() || 'break even'));
         if (outcomeIndex > -1) {
             analyticsData.winLossBreakEvenCounts[outcomeIndex].value++;
         }

         if (pnlDetails.realizedNetPnl > (analyticsData.largestWinPnl || -Infinity)) analyticsData.largestWinPnl = pnlDetails.realizedNetPnl; //
         if (pnlDetails.realizedNetPnl < (analyticsData.largestLossPnl || Infinity)) analyticsData.largestLossPnl = pnlDetails.realizedNetPnl; //
        
         if (pnlDetails.rMultipleActual !== null && pnlDetails.rMultipleActual !== undefined) { //
           sumRMultiples += pnlDetails.rMultipleActual;
           countRMultiples++;
           if (pnlDetails.rMultipleActual <= -2) rMultipleBuckets["<-2R"]++;
           else if (pnlDetails.rMultipleActual <= -1) rMultipleBuckets["-2R to -1R"]++;
           else if (pnlDetails.rMultipleActual < 0) rMultipleBuckets["-1R to 0R"]++;
           else if (pnlDetails.rMultipleActual < 1) rMultipleBuckets["0R to 1R"]++;
           else if (pnlDetails.rMultipleActual <= 2) rMultipleBuckets["1R to 2R"]++;
           else rMultipleBuckets[">2R"]++;
         } else { rMultipleBuckets["N/A"]++; }

         if (pnlDetails.durationMs !== null) { //
           analyticsData.pnlVsDurationSeries.push({
             durationHours: pnlDetails.durationMs / (3600000), netPnl: pnlDetails.realizedNetPnl,
             rMultiple: pnlDetails.rMultipleActual, trade_id: pnlDetails.trade_id, instrument_ticker: trade.instrument_ticker, isFullyClosed: true,
           });
         }
        
        // --- P&L By Group (Month, DayOfWeek, AssetClass, Exchange, Strategy, Emotion) ---
        // This logic remains largely the same as in
        const groupDate = new Date(pnlDetails.relevantDate);
        const monthKey = `${groupDate.getFullYear()}-${String(groupDate.getMonth() + 1).padStart(2, '0')} (${groupDate.toLocaleString('default', { month: 'short' })})`;
        let monthData = analyticsData.pnlByMonth.find(m => m.period === monthKey);
        if (!monthData) { monthData = { period: monthKey, totalNetPnl: 0, tradeCount: 0, winRate: null, wins: 0, losses: 0, breakEvens: 0 }; analyticsData.pnlByMonth.push(monthData); }
        monthData.totalNetPnl += pnlDetails.realizedNetPnl; monthData.tradeCount++;
        if (pnlDetails.outcome === 'Win') monthData.wins++; else if (pnlDetails.outcome === 'Loss') monthData.losses++; else monthData.breakEvens++;

        const dayKey = groupDate.toLocaleString('default', { weekday: 'long' });
        let dayOfWeekData = analyticsData.pnlByDayOfWeek.find(d => d.period === dayKey);
        if (!dayOfWeekData) { dayOfWeekData = { period: dayKey, totalNetPnl: 0, tradeCount: 0, winRate: null, wins: 0, losses: 0, breakEvens: 0 }; analyticsData.pnlByDayOfWeek.push(dayOfWeekData); }
        dayOfWeekData.totalNetPnl += pnlDetails.realizedNetPnl; dayOfWeekData.tradeCount++;
        if (pnlDetails.outcome === 'Win') dayOfWeekData.wins++; else if (pnlDetails.outcome === 'Loss') dayOfWeekData.losses++; else dayOfWeekData.breakEvens++;
        
        // --- P&L By Asset ---
        if (trade.instrument_ticker) {
          let assetData = analyticsData.pnlByAsset.find(a => a.name === trade.instrument_ticker);
          if (!assetData) {
            assetData = {
              name: trade.instrument_ticker,
              totalNetPnl: 0,
              tradeCount: 0,
              winRate: null,
              wins: 0,
              losses: 0,
              breakEvens: 0
            };
            analyticsData.pnlByAsset.push(assetData);
          }
          assetData.totalNetPnl += pnlDetails.realizedNetPnl;
          assetData.tradeCount++;
          if (pnlDetails.outcome === 'Win') assetData.wins++;
          else if (pnlDetails.outcome === 'Loss') assetData.losses++;
          else assetData.breakEvens++;
        }
// END P&L By Asset

        // --- P&L By Asset Class ---
        if (trade.asset_class) {
          let assetClassData = analyticsData.pnlByAssetClass.find(a => a.name === trade.asset_class);
          if (!assetClassData) {
            assetClassData = {
              name: trade.asset_class,
              totalNetPnl: 0,
              tradeCount: 0,
              winRate: null,
              wins: 0,
              losses: 0,
              breakEvens: 0
            };
            analyticsData.pnlByAssetClass.push(assetClassData);
          }
          assetClassData.totalNetPnl += pnlDetails.realizedNetPnl;
          assetClassData.tradeCount++;
          if (pnlDetails.outcome === 'Win') assetClassData.wins++;
          else if (pnlDetails.outcome === 'Loss') assetClassData.losses++;
          else assetClassData.breakEvens++;
        }
// END P&L By Asset Class

        // --- P&L By Exchange ---
        if (trade.exchange) {
          let exchangeData = analyticsData.pnlByExchange.find(e => e.name === trade.exchange);
          if (!exchangeData) {
            exchangeData = {
              name: trade.exchange,
              totalNetPnl: 0,
              tradeCount: 0,
              winRate: null,
              wins: 0,
              losses: 0,
              breakEvens: 0
            };
            analyticsData.pnlByExchange.push(exchangeData);
          }
          exchangeData.totalNetPnl += pnlDetails.realizedNetPnl;
          exchangeData.tradeCount++;
          if (pnlDetails.outcome === 'Win') exchangeData.wins++;
          else if (pnlDetails.outcome === 'Loss') exchangeData.losses++;
          else exchangeData.breakEvens++;
        }
// END P&L By Exchange

        // --- P&L By Emotion (Updated: aggregate all emotions linked to this trade, not just trade.emotion_id) ---
        // For each closed trade, fetch all unique emotion_ids from transaction_emotions
        const emotionLinks = db.prepare('SELECT DISTINCT emotion_id FROM transaction_emotions WHERE transaction_id IN (SELECT transaction_id FROM transactions WHERE trade_id = ?)').all(trade.trade_id);
        for (const { emotion_id } of emotionLinks) {
          if (!emotion_id) continue;
          let emotionName = null;
          if (analyticsData.availableEmotions && Array.isArray(analyticsData.availableEmotions)) {
            const found = analyticsData.availableEmotions.find(e => e.emotion_id === emotion_id);
            if (found) emotionName = found.emotion_name;
          }
          const emotionKey = emotionName || `Emotion #${emotion_id}`;
          let emotionData = analyticsData.pnlByEmotion.find(e => e.name === emotionKey);
          if (!emotionData) {
            emotionData = {
              name: emotionKey,
              totalNetPnl: 0,
              tradeCount: 0,
              winRate: null,
              wins: 0,
              losses: 0,
              breakEvens: 0
            };
            analyticsData.pnlByEmotion.push(emotionData);
          }
          emotionData.totalNetPnl += pnlDetails.realizedNetPnl;
          emotionData.tradeCount++;
          if (pnlDetails.outcome === 'Win') emotionData.wins++;
          else if (pnlDetails.outcome === 'Loss') emotionData.losses++;
          else emotionData.breakEvens++;
        }
// END P&L By Emotion


        // --- Data for Risk/Return Scatter Plot ---
        let initialRiskValue = trade.r_multiple_initial_risk ? trade.r_multiple_initial_risk : (trade.initial_stop_loss_price && pnlDetails.averageOpenPrice ? Math.abs(pnlDetails.averageOpenPrice - trade.initial_stop_loss_price) * pnlDetails.closedQuantity : null);
        let returnPercentage = null;
        if (pnlDetails.averageOpenPrice && pnlDetails.averageOpenPrice !== 0 && pnlDetails.closedQuantity > 0) {
            const costBasis = pnlDetails.averageOpenPrice * pnlDetails.closedQuantity;
            if (costBasis !== 0) {
                 returnPercentage = (pnlDetails.realizedNetPnl / Math.abs(costBasis)) * 100;
            }
        }
        analyticsData.riskReturnScatterData.push({
            trade_id: trade.trade_id,
            ticker: trade.instrument_ticker,
            risk: initialRiskValue,
            returnPercent: returnPercentage,
            tradeVolume: pnlDetails.averageOpenPrice ? pnlDetails.averageOpenPrice * pnlDetails.closedQuantity : undefined,
        });
      }
    }

    analyticsData.rMultipleDistribution = Object.entries(rMultipleBuckets).map(([range, count]) => ({ range, count })).filter(item => item.count > 0 || item.range === "N/A"); //
    
    // Calculate initial portfolio value
    // For leverage trading, this should be the starting portfolio value, not necessarily account cash balance
    let initialPortfolioValue = 0;
    
    try {
        const accountService = require('./accountService');
        
        // Check if we have any leveraged trades to determine the right starting point
        const leveragedTradesCount = db.prepare('SELECT COUNT(*) as count FROM trades WHERE is_leveraged = 1').get();
        const hasLeveragedTrades = leveragedTradesCount && leveragedTradesCount.count > 0;
        
        if (hasLeveragedTrades) {
            // For leveraged trading, use account balance as starting portfolio value
            // This represents the initial collateral/margin used
            const accounts = db.prepare('SELECT id FROM accounts WHERE archived = 0 AND deleted = 0').all();
            if (accounts.length > 0) {
                for (const account of accounts) {
                    const accountBalance = accountService.getAccountBalance(account.id);
                    initialPortfolioValue += accountBalance || 0;
                }
            }
            
            // If no account balance but we have trades, estimate from first trade size
            if (initialPortfolioValue === 0 && analyticsData.pnlPerTradeSeries.length > 0) {
                console.log('[ANALYTICS_SERVICE] No account balance found, estimating portfolio value from trade data');
                // Use a reasonable default based on trade sizes - this is an approximation
                initialPortfolioValue = Math.abs(analyticsData.totalRealizedNetPnl) * 2 || 10000;
            }
        } else {
            // For spot trading, account balance represents actual portfolio value
            const accounts = db.prepare('SELECT id FROM accounts WHERE archived = 0 AND deleted = 0').all();
            if (accounts.length > 0) {
                for (const account of accounts) {
                    const accountBalance = accountService.getAccountBalance(account.id);
                    initialPortfolioValue += accountBalance || 0;
                }
            }
        }
        
        console.log('[ANALYTICS_SERVICE] Initial portfolio value:', initialPortfolioValue, '(leveraged trades:', hasLeveragedTrades, ')');
    } catch (accountError) {
        console.log('[ANALYTICS_SERVICE] Error calculating portfolio value, using fallback:', accountError.message);
        // Fallback: estimate from trade P&L patterns
        initialPortfolioValue = Math.max(Math.abs(analyticsData.totalRealizedNetPnl) * 2, 10000);
    }
    
    // Generate equity curve representing portfolio value progression
    if (analyticsData.pnlPerTradeSeries.length === 0) {
        // No trades, use current portfolio value as equity
        analyticsData.equityCurve = [{
            date: new Date().getTime(),
            equity: initialPortfolioValue
        }];
    } else {
        // Generate equity curve starting from initial portfolio value
        let cumulativePnlForEquity = 0;
        const sortedTrades = analyticsData.pnlPerTradeSeries.sort((a, b) => a.date - b.date);
        
        analyticsData.equityCurve = sortedTrades.map(point => {
            cumulativePnlForEquity += point.pnl;
            return { date: point.date, equity: initialPortfolioValue + cumulativePnlForEquity };
        });
        
        // Add starting point before first trade
        if (analyticsData.equityCurve.length > 0) {
            analyticsData.equityCurve.unshift({
                date: analyticsData.equityCurve[0].date - 86400000, // 1 day before first trade
                equity: initialPortfolioValue
            });
        }
        
        console.log('[ANALYTICS_SERVICE] Generated equity curve with', analyticsData.equityCurve.length, 'points');
    }

    if (analyticsData.totalFullyClosedTrades > 0) { //
      analyticsData.winRateOverall = analyticsData.numberOfWinningTrades / analyticsData.totalFullyClosedTrades;
      if (analyticsData.numberOfWinningTrades > 0) analyticsData.avgWinPnlOverall = sumWinningPnl / analyticsData.numberOfWinningTrades; //
      if (analyticsData.numberOfLosingTrades > 0) analyticsData.avgLossPnlOverall = sumLosingPnl / analyticsData.numberOfLosingTrades; //
      if (countRMultiples > 0) analyticsData.avgRMultiple = sumRMultiples / countRMultiples; //

      // Simplified Kelly Criterion %
      if (analyticsData.winRateOverall !== null && analyticsData.avgWinPnlOverall !== null && analyticsData.avgLossPnlOverall !== null && analyticsData.avgLossPnlOverall !== 0) {
        const W = analyticsData.winRateOverall;
        const R = analyticsData.avgWinPnlOverall / Math.abs(analyticsData.avgLossPnlOverall);
        if (R > 0) { // Win/Loss Ratio must be positive
            analyticsData.kellyCriterion = (W - (1 - W) / R) * 100;
        }
      }
    }
    
    const calculateWinRateForGroup = (group) => { if (group.tradeCount > 0 && typeof group.wins === 'number') group.winRate = (group.wins / group.tradeCount) * 100; }; //
    [analyticsData.pnlByMonth, analyticsData.pnlByDayOfWeek, analyticsData.pnlByAssetClass, analyticsData.pnlByExchange, analyticsData.pnlByStrategy, analyticsData.pnlByEmotion, analyticsData.pnlByAsset].forEach(groupArray => groupArray.forEach(calculateWinRateForGroup));
    analyticsData.pnlByMonth.sort((a,b) => a.period.localeCompare(b.period)); //
    analyticsData.pnlByAsset.sort((a, b) => b.totalNetPnl - a.totalNetPnl); // Sort descending by P&L

    let peakEquity = initialPortfolioValue; let maxDrawdownRatio = 0; //
    if (analyticsData.equityCurve.length > 0) {
        // Start with the same initial portfolio value used for equity curve
        peakEquity = initialPortfolioValue;
        for (const point of analyticsData.equityCurve) { //
            if (point.equity > peakEquity) peakEquity = point.equity;
            const currentDrawdown = (peakEquity > 0) ? (point.equity - peakEquity) / peakEquity : 0; //
            if (currentDrawdown < maxDrawdownRatio) maxDrawdownRatio = currentDrawdown; //
        }
    }
    analyticsData.maxDrawdownPercentage = Math.abs(maxDrawdownRatio * 100);

    // Prepare Net Account Balance Trend (last 30 points of equity curve)
    analyticsData.netAccountBalanceTrend = analyticsData.equityCurve.slice(-30);

    // Prepare Daily P&L for Heatmap
    analyticsData.dailyPnlForHeatmap = Array.from(dailyPnlMap.entries()).map(([dateStr, pnl]) => ({
        date: dateStr, // YYYY-MM-DD
        pnl: pnl,
        dayOfMonth: parseInt(dateStr.split('-')[2])
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Ulcer Index and VaR - Placeholders, as full calculation is complex
    analyticsData.ulcerIndex = null; // Requires more detailed daily % ROR and peak tracking
    analyticsData.valueAtRisk95 = { amount: null, percentage: null }; // Requires historical daily portfolio returns and statistical modeling

    console.log('[ANALYTICS_SERVICE] Analytics data calculated successfully.');
    
    // Enhance with institutional-level metrics
    const riskFreeRate = (filters && typeof filters.riskFreeRate === 'number') ? filters.riskFreeRate : DEFAULT_RISK_FREE_RATE;
    let institutionalAnalytics;
    try {
      institutionalAnalytics = enhanceAnalyticsWithInstitutional(analyticsData, riskFreeRate);
      console.log('[ANALYTICS_SERVICE] Institutional analytics enhancement completed.');
      return institutionalAnalytics;
    } catch (enhanceError) {
      console.error('[ANALYTICS_SERVICE] Error enhancing analytics with institutional metrics:', enhanceError);
      return analyticsData;
    }
  } catch (error) {
    console.error('[ANALYTICS_SERVICE] Error calculating analytics data:', error);
    return { error: (error instanceof Error ? error.message : String(error)) || 'Failed to calculate analytics data' }; //
  }
}

module.exports = {
  calculateAnalyticsData,
};