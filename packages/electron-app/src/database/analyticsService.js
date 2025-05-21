// packages/electron-app/src/database/analyticsService.js
const { getDb } = require('./connection');
const tradeService = require('./tradeService'); // To use calculateTradePnlFifoEnhanced

async function calculateAnalyticsData(filters = {}) {
  console.log('[ANALYTICS_SERVICE] calculateAnalyticsData CALLED with filters:', filters);
  try {
    const db = getDb();

    let whereClause = '';
    const queryParams = {}; // Using named parameters for clarity

    if (filters.dateRange?.startDate) {
      whereClause += (Object.keys(queryParams).length > 0 ? 'AND ' : 'WHERE ') + 
                     '( (t.close_datetime IS NOT NULL AND t.close_datetime >= @startDate) OR (t.close_datetime IS NULL AND t.open_datetime >= @startDate) ) ';
      queryParams.startDate = filters.dateRange.startDate;
    }
    if (filters.dateRange?.endDate) {
      whereClause += (Object.keys(queryParams).length > 0 ? 'AND ' : 'WHERE ') + 
                     '( (t.close_datetime IS NOT NULL AND t.close_datetime <= @endDate) OR (t.close_datetime IS NULL AND t.open_datetime <= @endDate) ) ';
      queryParams.endDate = filters.dateRange.endDate;
    }
    // Example for other filters:
    // if (filters.asset_class) {
    //   whereClause += (Object.keys(queryParams).length > 0 ? 'AND ' : 'WHERE ') + 't.asset_class = @assetClass ';
    //   queryParams.assetClass = filters.asset_class;
    // }

    const tradesFromDb = db.prepare(`
      SELECT t.*, s.strategy_name
      FROM trades t
      LEFT JOIN strategies s ON t.strategy_id = s.strategy_id
      ${whereClause}
      ORDER BY COALESCE(t.close_datetime, t.open_datetime, t.created_at) ASC
    `).all(queryParams);

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
      winLossBreakEvenCounts: [{ name: 'Wins', value: 0 },{ name: 'Losses', value: 0 },{ name: 'Break Even', value: 0 }],
      rMultipleDistribution: [],
      pnlByMonth: [],
      pnlByDayOfWeek: [],
      pnlVsDurationSeries: [],
      pnlByAssetClass: [],
      pnlByExchange: [],
      pnlByStrategy: [],
      pnlByEmotion: [],
      maxDrawdownPercentage: null,
      availableStrategies: db.prepare('SELECT strategy_id, strategy_name FROM strategies ORDER BY strategy_name').all(),
      availableExchanges: db.prepare('SELECT DISTINCT exchange FROM trades WHERE exchange IS NOT NULL ORDER BY exchange').all().map(r => r.exchange),
      availableAssetClasses: db.prepare('SELECT DISTINCT asset_class FROM trades ORDER BY asset_class').all().map(r => r.asset_class),
      availableEmotions: db.prepare('SELECT emotion_id, emotion_name FROM emotions ORDER BY emotion_name').all(),
      availableTickers: db.prepare('SELECT DISTINCT instrument_ticker FROM trades ORDER BY instrument_ticker').all().map(r => r.instrument_ticker),
    };

    let sumWinningPnl = 0;
    let sumLosingPnl = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let sumRMultiples = 0;
    let countRMultiples = 0;
    const rMultipleBuckets = {"<-2R": 0, "-2R to -1R": 0, "-1R to 0R": 0, "0R to 1R": 0, "1R to 2R": 0, ">2R": 0, "N/A": 0 };

    for (const trade of tradesFromDb) {
      const transactions = db.prepare('SELECT * FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC').all(trade.trade_id);
      // CORE CHANGE: Use tradeService for P&L details
      const pnlDetails = tradeService.calculateTradePnlFifoEnhanced(trade, transactions);

      if (pnlDetails.openQuantity > 0 && pnlDetails.unrealizedGrossPnlOnOpenPortion !== null) {
        analyticsData.totalUnrealizedPnl = (analyticsData.totalUnrealizedPnl || 0) + pnlDetails.unrealizedGrossPnlOnOpenPortion;
      }
      
      if (pnlDetails.realizedNetPnl !== 0 || pnlDetails.isFullyClosed) {
        analyticsData.pnlPerTradeSeries.push({
            date: new Date(pnlDetails.relevantDate).getTime(),
            pnl: pnlDetails.realizedNetPnl,
            isFullyClosed: pnlDetails.isFullyClosed
        });
      }

      if (pnlDetails.isFullyClosed) {
        analyticsData.totalFullyClosedTrades++;
        // For fully closed trades, use the realizedNetPnl from pnlDetails, which considers fees for matched portions.
        // trade.fees_total is the sum of all transaction fees for that trade.
        analyticsData.totalRealizedNetPnl += pnlDetails.realizedNetPnl; 
        analyticsData.totalRealizedGrossPnl += pnlDetails.realizedGrossPnl;
        analyticsData.totalFeesPaidOnClosedPortions += (trade.fees_total || 0);


        if (pnlDetails.outcome === 'Win') {
          analyticsData.numberOfWinningTrades++; sumWinningPnl += pnlDetails.realizedNetPnl; currentWinStreak++; currentLossStreak = 0;
          analyticsData.longestWinStreak = Math.max(analyticsData.longestWinStreak, currentWinStreak);
        } else if (pnlDetails.outcome === 'Loss') {
          analyticsData.numberOfLosingTrades++; sumLosingPnl += pnlDetails.realizedNetPnl; currentLossStreak++; currentWinStreak = 0;
          analyticsData.longestLossStreak = Math.max(analyticsData.longestLossStreak, currentLossStreak);
        } else { 
          analyticsData.numberOfBreakEvenTrades++; currentWinStreak = 0; currentLossStreak = 0;
        }
        const outcomeIndex = analyticsData.winLossBreakEvenCounts.findIndex(c => c.name.toLowerCase() === (pnlDetails.outcome?.toLowerCase() || 'break even'));
        if (outcomeIndex > -1) {
            analyticsData.winLossBreakEvenCounts[outcomeIndex].value++;
        }


        if (pnlDetails.realizedNetPnl > (analyticsData.largestWinPnl || -Infinity)) analyticsData.largestWinPnl = pnlDetails.realizedNetPnl;
        if (pnlDetails.realizedNetPnl < (analyticsData.largestLossPnl || Infinity)) analyticsData.largestLossPnl = pnlDetails.realizedNetPnl;
        
        if (pnlDetails.rMultipleActual !== null && pnlDetails.rMultipleActual !== undefined) {
          sumRMultiples += pnlDetails.rMultipleActual; countRMultiples++;
          if (pnlDetails.rMultipleActual <= -2) rMultipleBuckets["<-2R"]++;
          else if (pnlDetails.rMultipleActual <= -1) rMultipleBuckets["-2R to -1R"]++;
          else if (pnlDetails.rMultipleActual < 0) rMultipleBuckets["-1R to 0R"]++;
          else if (pnlDetails.rMultipleActual < 1) rMultipleBuckets["0R to 1R"]++;
          else if (pnlDetails.rMultipleActual <= 2) rMultipleBuckets["1R to 2R"]++;
          else rMultipleBuckets[">2R"]++;
        } else { rMultipleBuckets["N/A"]++; }

        if (pnlDetails.durationMs !== null) {
          analyticsData.pnlVsDurationSeries.push({
            durationHours: pnlDetails.durationMs / (3600000), netPnl: pnlDetails.realizedNetPnl,
            rMultiple: pnlDetails.rMultipleActual, trade_id: pnlDetails.trade_id, instrument_ticker: trade.instrument_ticker, isFullyClosed: true,
          });
        }

        const groupDate = new Date(pnlDetails.relevantDate);
        const monthKey = `${groupDate.getFullYear()}-${String(groupDate.getMonth() + 1).padStart(2, '0')} (${groupDate.toLocaleString('default', { month: 'short' })})`;
        let monthData = analyticsData.pnlByMonth.find(m => m.period === monthKey);
        if (!monthData) { monthData = { period: monthKey, totalNetPnl: 0, tradeCount: 0, winRate: null, wins: 0, losses: 0, breakEvens: 0 }; analyticsData.pnlByMonth.push(monthData); }
        monthData.totalNetPnl += pnlDetails.realizedNetPnl; monthData.tradeCount++;
        if (pnlDetails.outcome === 'Win') monthData.wins++; else if (pnlDetails.outcome === 'Loss') monthData.losses++; else monthData.breakEvens++;
        
        // --- P&L By Day of Week ---
        const dayKey = groupDate.toLocaleString('default', { weekday: 'long' });
        let dayData = analyticsData.pnlByDayOfWeek.find(d => d.period === dayKey);
        if (!dayData) { dayData = { period: dayKey, totalNetPnl: 0, tradeCount: 0, winRate: null, wins: 0, losses: 0, breakEvens: 0 }; analyticsData.pnlByDayOfWeek.push(dayData); }
        dayData.totalNetPnl += pnlDetails.realizedNetPnl; dayData.tradeCount++;
        if (pnlDetails.outcome === 'Win') dayData.wins++; else if (pnlDetails.outcome === 'Loss') dayData.losses++; else dayData.breakEvens++;
        
        // --- P&L By Asset Class ---
        const assetClassKey = trade.asset_class || 'N/A';
        let assetClassData = analyticsData.pnlByAssetClass.find(a => a.name === assetClassKey);
        if (!assetClassData) { assetClassData = { name: assetClassKey, totalNetPnl: 0, tradeCount: 0, winRate: null, wins: 0, losses: 0, breakEvens: 0 }; analyticsData.pnlByAssetClass.push(assetClassData); }
        assetClassData.totalNetPnl += pnlDetails.realizedNetPnl; assetClassData.tradeCount++;
        if (pnlDetails.outcome === 'Win') assetClassData.wins++; else if (pnlDetails.outcome === 'Loss') assetClassData.losses++; else assetClassData.breakEvens++;

        // --- P&L By Exchange ---
        const exchangeKey = trade.exchange || 'N/A';
        let exchangeData = analyticsData.pnlByExchange.find(e => e.name === exchangeKey);
        if (!exchangeData) { exchangeData = { name: exchangeKey, totalNetPnl: 0, tradeCount: 0, winRate: null, wins: 0, losses: 0, breakEvens: 0 }; analyticsData.pnlByExchange.push(exchangeData); }
        exchangeData.totalNetPnl += pnlDetails.realizedNetPnl; exchangeData.tradeCount++;
        if (pnlDetails.outcome === 'Win') exchangeData.wins++; else if (pnlDetails.outcome === 'Loss') exchangeData.losses++; else exchangeData.breakEvens++;

        // --- P&L By Strategy ---
        const strategyName = trade.strategy_name || 'Unspecified';
        let strategyData = analyticsData.pnlByStrategy.find(s => s.name === strategyName);
        if (!strategyData) { strategyData = { name: strategyName, totalNetPnl: 0, tradeCount: 0, winRate: null, wins: 0, losses: 0, breakEvens: 0 }; analyticsData.pnlByStrategy.push(strategyData); }
        strategyData.totalNetPnl += pnlDetails.realizedNetPnl; strategyData.tradeCount++;
        if (pnlDetails.outcome === 'Win') strategyData.wins++; else if (pnlDetails.outcome === 'Loss') strategyData.losses++; else strategyData.breakEvens++;
        
        // --- P&L By Emotion (using trade_emotions) ---
        const tradeEmotions = db.prepare('SELECT e.emotion_name FROM emotions e JOIN trade_emotions te ON e.emotion_id = te.emotion_id WHERE te.trade_id = ?').all(trade.trade_id).map(e => e.emotion_name);
        tradeEmotions.forEach(emotionName => {
          let emotionGroupData = analyticsData.pnlByEmotion.find(e => e.name === emotionName);
          if (!emotionGroupData) { emotionGroupData = { name: emotionName, totalNetPnl: 0, tradeCount: 0, winRate: null, wins: 0, losses: 0, breakEvens: 0 }; analyticsData.pnlByEmotion.push(emotionGroupData); }
          emotionGroupData.totalNetPnl += pnlDetails.realizedNetPnl; emotionGroupData.tradeCount++;
          if (pnlDetails.outcome === 'Win') emotionGroupData.wins++; else if (pnlDetails.outcome === 'Loss') emotionGroupData.losses++; else emotionGroupData.breakEvens++;
        });
      }
    }

    analyticsData.rMultipleDistribution = Object.entries(rMultipleBuckets).map(([range, count]) => ({ range, count })).filter(item => item.count > 0 || item.range === "N/A");
    
    let cumulativePnlForEquity = 0;
    analyticsData.pnlPerTradeSeries.sort((a, b) => a.date - b.date).forEach(point => {
        cumulativePnlForEquity += point.pnl;
        analyticsData.equityCurve.push({ date: point.date, equity: cumulativePnlForEquity });
    });

    if (analyticsData.totalFullyClosedTrades > 0) {
      analyticsData.winRateOverall = analyticsData.numberOfWinningTrades / analyticsData.totalFullyClosedTrades;
      if (analyticsData.numberOfWinningTrades > 0) analyticsData.avgWinPnlOverall = sumWinningPnl / analyticsData.numberOfWinningTrades;
      if (analyticsData.numberOfLosingTrades > 0) analyticsData.avgLossPnlOverall = sumLosingPnl / analyticsData.numberOfLosingTrades;
      if (countRMultiples > 0) analyticsData.avgRMultiple = sumRMultiples / countRMultiples;
    }
    
    const calculateWinRateForGroup = (group) => { if (group.tradeCount > 0 && typeof group.wins === 'number') group.winRate = (group.wins / group.tradeCount) * 100; };
    [analyticsData.pnlByMonth, analyticsData.pnlByDayOfWeek, analyticsData.pnlByAssetClass, analyticsData.pnlByExchange, analyticsData.pnlByStrategy, analyticsData.pnlByEmotion].forEach(groupArray => groupArray.forEach(calculateWinRateForGroup));
    analyticsData.pnlByMonth.sort((a,b) => a.period.localeCompare(b.period)); // Sort months chronologically

    let peakEquity = 0; let maxDrawdownRatio = 0;
    if (analyticsData.equityCurve.length > 0) {
        peakEquity = Math.max(0, analyticsData.equityCurve[0].equity);
        for (const point of analyticsData.equityCurve) {
            if (point.equity > peakEquity) peakEquity = point.equity;
            const currentDrawdown = (peakEquity > 0) ? (point.equity - peakEquity) / peakEquity : 0;
            if (currentDrawdown < maxDrawdownRatio) maxDrawdownRatio = currentDrawdown;
        }
    }
    analyticsData.maxDrawdownPercentage = Math.abs(maxDrawdownRatio * 100);

    console.log('[ANALYTICS_SERVICE] Analytics data calculated successfully.');
    return analyticsData;
  } catch (error) {
    console.error('[ANALYTICS_SERVICE] Error calculating analytics data:', error);
    // Return an object that matches the error structure expected by the frontend
    return { error: (error instanceof Error ? error.message : String(error)) || 'Failed to calculate analytics data' };
  }
}

module.exports = {
  calculateAnalyticsData,
};