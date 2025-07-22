// packages/electron-app/src/database/institutionalAnalyticsService.js
const { getDb } = require('./connection');
const { formatDate } = require('date-fns');

/**
 * Institutional-Level Analytics Service
 * Provides hedge fund grade analytics and risk metrics
 */

/**
 * Calculate advanced risk metrics for institutional analysis
 * @param {Array} equityCurve - Array of {date, equity} points
 * @param {number} riskFreeRate - Annual risk-free rate (as percentage)
 * @param {Array} trades - Array of trade objects with P&L data
 * @returns {Object} Advanced risk metrics
 */
function calculateInstitutionalRiskMetrics(equityCurve, riskFreeRate = 4.5, trades = []) {
  if (!equityCurve || equityCurve.length < 2) {
    return {
      sharpeRatio: null,
      sortinoRatio: null,
      calmarRatio: null,
      informationRatio: null,
      treynorRatio: null,
      omega: null,
      gainToPainRatio: null,
      sterlingRatio: null,
      burkeRatio: null,
      ulcerIndex: null,
      skewness: null,
      kurtosis: null,
      valueAtRisk95: null,
      valueAtRisk99: null,
      conditionalVaR95: null,
      conditionalVaR99: null,
      annualizedReturn: null,
      annualizedVolatility: null,
      maxDrawdownDuration: null,
      averageDrawdown: null,
      downDeviationAnnualized: null,
      upCaptureRatio: null,
      downCaptureRatio: null,
      trackingError: null,
      alpha: null,
      beta: null
    };
  }

  // Calculate daily returns
  const dailyReturns = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const prev = equityCurve[i - 1];
    const curr = equityCurve[i];
    const EPSILON = 1e-8;
    if (Math.abs(prev.equity) > EPSILON) {
      const dailyReturn = (curr.equity - prev.equity) / prev.equity;
      dailyReturns.push(dailyReturn);
    }
  }

  if (dailyReturns.length === 0) {
    return { sharpeRatio: null, sortinoRatio: null, calmarRatio: null };
  }

  // Basic statistics
  const n = dailyReturns.length;
  const meanReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / n;
  const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  // Annualized metrics (assuming 252 trading days)
  const annualizedReturn = meanReturn * 252;
  const annualizedVolatility = stdDev * Math.sqrt(252);
  const annualizedRiskFreeRate = riskFreeRate / 100;

  // Sharpe Ratio
  const sharpeRatio = annualizedVolatility !== 0 ? 
    (annualizedReturn - annualizedRiskFreeRate) / annualizedVolatility : null;

  // Sortino Ratio (downside deviation)
  const negativeReturns = dailyReturns.filter(r => r < 0);
  const downVariance = negativeReturns.length > 0 ? 
    negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length : 0;
  const downDeviationAnnualized = Math.sqrt(downVariance) * Math.sqrt(252);
  const sortinoRatio = downDeviationAnnualized !== 0 ? 
    (annualizedReturn - annualizedRiskFreeRate) / downDeviationAnnualized : null;

  // Maximum Drawdown calculation
  let peakEquity = equityCurve[0].equity;
  let maxDrawdown = 0;
  let maxDrawdownDuration = 0;
  let currentDrawdownDuration = 0;
  const drawdowns = [];

  // Validate initial peakEquity
  if (peakEquity <= 0) {
    // If initial equity is zero or negative, skip drawdown calculation to avoid invalid results
    return {
      sharpeRatio,
      sortinoRatio,
      calmarRatio: null,
      informationRatio: null,
      treynorRatio: null,
      omega: null,
      gainToPainRatio: null,
      sterlingRatio: null,
      burkeRatio: null,
      ulcerIndex: null,
      skewness: null,
      kurtosis: null,
      valueAtRisk95: null,
      valueAtRisk99: null,
      conditionalVaR95: null,
      conditionalVaR99: null,
      annualizedReturn,
      annualizedVolatility,
      maxDrawdownDuration: 0,
      averageDrawdown: 0,
      downDeviationAnnualized,
      upCaptureRatio: null,
      downCaptureRatio: null,
      trackingError: null,
      alpha: null,
      beta: null
    };
  }

  for (let i = 1; i < equityCurve.length; i++) {
    const currentEquity = equityCurve[i].equity;
    
    if (currentEquity > peakEquity) {
      peakEquity = currentEquity;
      currentDrawdownDuration = 0;
    } else {
      currentDrawdownDuration++;
      const drawdown = (currentEquity - peakEquity) / peakEquity;
      drawdowns.push(Math.abs(drawdown));
      
      if (Math.abs(drawdown) > maxDrawdown) {
        maxDrawdown = Math.abs(drawdown);
        maxDrawdownDuration = currentDrawdownDuration;
      }
    }
  }

  // Average Drawdown
  const averageDrawdown = drawdowns.length > 0 ? 
    drawdowns.reduce((sum, dd) => sum + dd, 0) / drawdowns.length : 0;

  // Calmar Ratio
  const calmarRatio = maxDrawdown !== 0 ? annualizedReturn / maxDrawdown : null;

  // Ulcer Index (RMS of drawdowns)
  const ulcerIndex = drawdowns.length > 0 ? 
    Math.sqrt(drawdowns.reduce((sum, dd) => sum + Math.pow(dd, 2), 0) / drawdowns.length) : null;

  // Sterling Ratio
  const sterlingRatio = averageDrawdown !== 0 ? annualizedReturn / averageDrawdown : null;

  // Burke Ratio
  const burkeRatio = drawdowns.length > 0 ? 
    annualizedReturn / Math.sqrt(drawdowns.reduce((sum, dd) => sum + Math.pow(dd, 2), 0)) : null;

  // Skewness calculation
  const skewness = n > 2 ? 
    (dailyReturns.reduce((sum, r) => sum + Math.pow((r - meanReturn) / stdDev, 3), 0) / n) : null;

  // Kurtosis calculation
  const kurtosis = n > 3 ? 
    (dailyReturns.reduce((sum, r) => sum + Math.pow((r - meanReturn) / stdDev, 4), 0) / n) - 3 : null;

  // Value at Risk (VaR) - Historical simulation
  const sortedReturns = [...dailyReturns].sort((a, b) => a - b);
  const var95Index = Math.floor(0.05 * sortedReturns.length);
  const var99Index = Math.floor(0.01 * sortedReturns.length);
  const valueAtRisk95 = sortedReturns[var95Index] || null;
  const valueAtRisk99 = sortedReturns[var99Index] || null;

  // Conditional VaR (Expected Shortfall)
  const conditionalVaR95 = var95Index > 0 ? 
    sortedReturns.slice(0, var95Index + 1).reduce((sum, r) => sum + r, 0) / (var95Index + 1) : null;
  const conditionalVaR99 = var99Index > 0 ? 
    sortedReturns.slice(0, var99Index + 1).reduce((sum, r) => sum + r, 0) / (var99Index + 1) : null;

  // Omega Ratio (ratio of gains to losses)
  const gains = dailyReturns.filter(r => r > 0).reduce((sum, r) => sum + r, 0);
  const losses = Math.abs(dailyReturns.filter(r => r < 0).reduce((sum, r) => sum + r, 0));
  const omega = losses !== 0 ? gains / losses : null;

  // Gain-to-Pain Ratio
  const gainToPainRatio = losses !== 0 ? gains / losses : null;

  return {
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    informationRatio: null, // Requires benchmark data
    treynorRatio: null, // Requires beta calculation
    omega,
    gainToPainRatio,
    sterlingRatio,
    burkeRatio,
    ulcerIndex,
    skewness,
    kurtosis,
    valueAtRisk95,
    valueAtRisk99,
    conditionalVaR95,
    conditionalVaR99,
    annualizedReturn,
    annualizedVolatility,
    maxDrawdownDuration,
    averageDrawdown,
    downDeviationAnnualized,
    upCaptureRatio: null, // Requires benchmark data
    downCaptureRatio: null, // Requires benchmark data
    trackingError: null, // Requires benchmark data
    alpha: null, // Requires benchmark data
    beta: null // Requires benchmark data
  };
}

/**
 * Calculate portfolio concentration metrics
 * @param {Array} trades - Array of trade objects
 * @returns {Object} Concentration metrics
 */
function calculateConcentrationMetrics(trades) {
  if (!trades || trades.length === 0) {
    return {
      herfindahlIndex: null,
      concentrationRatio: null,
      topPositionsPercent: null,
      numberOfPositions: 0,
      averagePositionSize: null,
      largestPositionPercent: null,
      diversificationRatio: null
    };
  }

  // Calculate position sizes by ticker
  const positionSizes = new Map();
  let totalValue = 0;

  trades.forEach(trade => {
    if (trade.realizedNetPnl && trade.instrument_ticker) {
      const current = positionSizes.get(trade.instrument_ticker) || 0;
      positionSizes.set(trade.instrument_ticker, current + Math.abs(trade.realizedNetPnl));
      totalValue += Math.abs(trade.realizedNetPnl);
    }
  });

  if (totalValue === 0) return { numberOfPositions: 0 };

  // Calculate concentration metrics
  const positions = Array.from(positionSizes.values());
  const numberOfPositions = positions.length;
  const weights = positions.map(pos => pos / totalValue);
  
  // Herfindahl Index (sum of squared weights)
  const herfindahlIndex = weights.reduce((sum, w) => sum + Math.pow(w, 2), 0);
  
  // Concentration Ratio (top 5 positions)
  const sortedWeights = [...weights].sort((a, b) => b - a);
  const top5Weights = sortedWeights.slice(0, Math.min(5, sortedWeights.length));
  const concentrationRatio = top5Weights.reduce((sum, w) => sum + w, 0);
  
  // Other metrics
  const largestPositionPercent = sortedWeights[0] || 0;
  const averagePositionSize = 1 / numberOfPositions;
  const diversificationRatio = numberOfPositions > 1 ? (1 - herfindahlIndex) / (1 - (1/numberOfPositions)) : null;

  return {
    herfindahlIndex,
    concentrationRatio,
    topPositionsPercent: concentrationRatio,
    numberOfPositions,
    averagePositionSize,
    largestPositionPercent,
    diversificationRatio
  };
}

/**
 * Calculate sector/industry performance attribution
 * @param {Array} trades - Array of trade objects
 * @returns {Object} Attribution metrics
 */
function calculateAttributionAnalysis(trades) {
  if (!trades || trades.length === 0) {
    return {
      sectorBreakdown: [],
      industryBreakdown: [],
      marketCapBreakdown: [],
      geographicBreakdown: []
    };
  }

  // This would typically require external data for sector/industry classification
  // For now, we'll group by asset class and exchange as proxies
  const assetClassBreakdown = new Map();
  const exchangeBreakdown = new Map();
  
  trades.forEach(trade => {
    if (trade.realizedNetPnl) {
      // Asset class breakdown
      if (trade.asset_class) {
        const current = assetClassBreakdown.get(trade.asset_class) || { pnl: 0, count: 0 };
        assetClassBreakdown.set(trade.asset_class, {
          pnl: current.pnl + trade.realizedNetPnl,
          count: current.count + 1
        });
      }
      
      // Exchange breakdown (proxy for geographic)
      if (trade.exchange) {
        const current = exchangeBreakdown.get(trade.exchange) || { pnl: 0, count: 0 };
        exchangeBreakdown.set(trade.exchange, {
          pnl: current.pnl + trade.realizedNetPnl,
          count: current.count + 1
        });
      }
    }
  });

  return {
    sectorBreakdown: Array.from(assetClassBreakdown.entries()).map(([name, data]) => ({
      name,
      pnl: data.pnl,
      tradeCount: data.count,
      avgPnl: data.count > 0 ? data.pnl / data.count : 0
    })),
    industryBreakdown: [], // Requires external data
    marketCapBreakdown: [], // Requires external data
    geographicBreakdown: Array.from(exchangeBreakdown.entries()).map(([name, data]) => ({
      name,
      pnl: data.pnl,
      tradeCount: data.count,
      avgPnl: data.count > 0 ? data.pnl / data.count : 0
    }))
  };
}

/**
 * Calculate rolling window metrics
 * @param {Array} equityCurve - Array of {date, equity} points
 * @param {number} windowSize - Rolling window size in days
 * @returns {Object} Rolling metrics
 */
function calculateRollingMetrics(equityCurve, windowSize = 30) {
  if (!equityCurve || equityCurve.length < windowSize) {
    return {
      rollingSharpe: [],
      rollingVolatility: [],
      rollingDrawdown: [],
      rollingWinRate: []
    };
  }

  const rollingMetrics = {
    rollingSharpe: [],
    rollingVolatility: [],
    rollingDrawdown: [],
    rollingWinRate: []
  };

  // Calculate rolling metrics
  for (let i = windowSize; i < equityCurve.length; i++) {
    const windowData = equityCurve.slice(i - windowSize, i);
    
    // Calculate returns for window
    const returns = [];
    for (let j = 1; j < windowData.length; j++) {
      const prev = windowData[j - 1];
      const curr = windowData[j];
      if (prev.equity !== 0) {
        returns.push((curr.equity - prev.equity) / prev.equity);
      }
    }
    
    if (returns.length > 0) {
      const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
      const volatility = Math.sqrt(variance);
      
      // Annualized metrics
      const annualizedReturn = meanReturn * 252;
      const annualizedVolatility = volatility * Math.sqrt(252);
      const sharpe = annualizedVolatility !== 0 ? annualizedReturn / annualizedVolatility : null;
      
      rollingMetrics.rollingSharpe.push({
        date: equityCurve[i].date,
        value: sharpe
      });
      
      rollingMetrics.rollingVolatility.push({
        date: equityCurve[i].date,
        value: annualizedVolatility
      });
    }

    // Calculate rolling max drawdown for this window
    let peak = windowData[0].equity;
    let maxDrawdown = 0;
    for (let j = 1; j < windowData.length; j++) {
      if (windowData[j].equity > peak) peak = windowData[j].equity;
      const drawdown = (peak > 0) ? (windowData[j].equity - peak) / peak : 0;
      if (drawdown < maxDrawdown) maxDrawdown = drawdown;
    }
    rollingMetrics.rollingDrawdown.push({
      date: equityCurve[i].date,
      value: Math.abs(maxDrawdown)
    });

    // Calculate rolling win rate for this window
    const numWins = returns.filter(r => r > 0).length;
    const winRate = returns.length > 0 ? numWins / returns.length : null;
    rollingMetrics.rollingWinRate.push({
      date: equityCurve[i].date,
      value: winRate
    });
  }

  return rollingMetrics;
}

/**
 * Calculate performance attribution vs benchmark
 * @param {Array} portfolioReturns - Portfolio daily returns
 * @param {Array} benchmarkReturns - Benchmark daily returns (if available)
 * @returns {Object} Attribution metrics
 */
function calculateBenchmarkAttribution(portfolioReturns, benchmarkReturns = null) {
  if (!portfolioReturns || portfolioReturns.length === 0 || !benchmarkReturns) {
    return {
      alpha: null,
      beta: null,
      informationRatio: null,
      trackingError: null,
      upCaptureRatio: null,
      downCaptureRatio: null,
      correlation: null
    };
  }

  // This would require actual benchmark data
  // For now, return null values as placeholders
  return {
    alpha: null,
    beta: null,
    informationRatio: null,
    trackingError: null,
    upCaptureRatio: null,
    downCaptureRatio: null,
    correlation: null
  };
}

/**
 * Enhanced analytics with institutional-level metrics
 * @param {Object} basicAnalytics - Basic analytics from existing service
 * @param {number} riskFreeRate - Risk-free rate
 * @returns {Object} Enhanced analytics with institutional metrics
 */
function enhanceAnalyticsWithInstitutional(basicAnalytics, riskFreeRate = 4.5) {
  if (!basicAnalytics || !basicAnalytics.equityCurve) {
    return basicAnalytics;
  }

  // Calculate institutional risk metrics
  const riskMetrics = calculateInstitutionalRiskMetrics(
    basicAnalytics.equityCurve,
    riskFreeRate,
    basicAnalytics.pnlPerTradeSeries
  );

  // Calculate concentration metrics
  const concentrationMetrics = calculateConcentrationMetrics(
    basicAnalytics.pnlPerTradeSeries
  );

  // Calculate attribution analysis
  const attributionAnalysis = calculateAttributionAnalysis(
    basicAnalytics.pnlPerTradeSeries
  );

  // Calculate rolling metrics
  const rollingMetrics = calculateRollingMetrics(basicAnalytics.equityCurve);

  // Calculate benchmark attribution (placeholder)
  const benchmarkAttribution = calculateBenchmarkAttribution([]);

  return {
    ...basicAnalytics,
    // Advanced Risk Metrics
    sharpeRatio: riskMetrics.sharpeRatio,
    sortinoRatio: riskMetrics.sortinoRatio,
    calmarRatio: riskMetrics.calmarRatio,
    informationRatio: riskMetrics.informationRatio,
    treynorRatio: riskMetrics.treynorRatio,
    omega: riskMetrics.omega,
    gainToPainRatio: riskMetrics.gainToPainRatio,
    sterlingRatio: riskMetrics.sterlingRatio,
    burkeRatio: riskMetrics.burkeRatio,
    ulcerIndex: riskMetrics.ulcerIndex,
    skewness: riskMetrics.skewness,
    kurtosis: riskMetrics.kurtosis,
    valueAtRisk95: riskMetrics.valueAtRisk95,
    valueAtRisk99: riskMetrics.valueAtRisk99,
    conditionalVaR95: riskMetrics.conditionalVaR95,
    conditionalVaR99: riskMetrics.conditionalVaR99,
    annualizedReturn: riskMetrics.annualizedReturn,
    annualizedVolatility: riskMetrics.annualizedVolatility,
    maxDrawdownDuration: riskMetrics.maxDrawdownDuration,
    averageDrawdown: riskMetrics.averageDrawdown,
    downDeviationAnnualized: riskMetrics.downDeviationAnnualized,
    
    // Concentration Metrics
    herfindahlIndex: concentrationMetrics.herfindahlIndex,
    concentrationRatio: concentrationMetrics.concentrationRatio,
    numberOfPositions: concentrationMetrics.numberOfPositions,
    averagePositionSize: concentrationMetrics.averagePositionSize,
    largestPositionPercent: concentrationMetrics.largestPositionPercent,
    diversificationRatio: concentrationMetrics.diversificationRatio,
    
    // Attribution Analysis
    sectorBreakdown: attributionAnalysis.sectorBreakdown,
    industryBreakdown: attributionAnalysis.industryBreakdown,
    marketCapBreakdown: attributionAnalysis.marketCapBreakdown,
    geographicBreakdown: attributionAnalysis.geographicBreakdown,
    
    // Rolling Metrics
    rollingSharpe: rollingMetrics.rollingSharpe,
    rollingVolatility: rollingMetrics.rollingVolatility,
    rollingDrawdown: rollingMetrics.rollingDrawdown,
    
    // Benchmark Attribution
    alpha: benchmarkAttribution.alpha,
    beta: benchmarkAttribution.beta,
    trackingError: benchmarkAttribution.trackingError,
    upCaptureRatio: benchmarkAttribution.upCaptureRatio,
    downCaptureRatio: benchmarkAttribution.downCaptureRatio,
    correlation: benchmarkAttribution.correlation
  };
}

module.exports = {
  calculateInstitutionalRiskMetrics,
  calculateConcentrationMetrics,
  calculateAttributionAnalysis,
  calculateRollingMetrics,
  calculateBenchmarkAttribution,
  enhanceAnalyticsWithInstitutional
};