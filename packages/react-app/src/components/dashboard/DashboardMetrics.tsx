// packages/react-app/src/components/dashboard/DashboardMetrics.tsx
import React, { useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
// Import your new card
import EnhancedMetricCard from './cards/EnhancedMetricCard';
// Import necessary charts
import EquityCurveChart from '../analytics/EquityCurveChart';
import { DrawdownChart } from './DrawdownChart';
import { CumulativeEquityChart } from './CumulativeEquityChart';
import PnlHeatmapCalendar from './charts/PnlHeatmapCalendar';

import { colors } from '../../styles/design-tokens';

export const formatCurrency = (value: number | null | undefined, showSign = false): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const sign = value > 0 && showSign ? '+' : '';
  return `${sign}${value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
};

export const formatPercentage = (value: number | null | undefined, decimals = 1): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number | null | undefined, decimals = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return value.toFixed(decimals);
};

const DashboardMetrics: React.FC = () => {
  const totalBuyingPower = useAppStore(s => s.getTotalBuyingPower());
  const riskFreeRate = useAppStore(s => s.riskFreeRate);
  const analytics = useAppStore(s => s.analytics);
  const isLoadingAnalytics = useAppStore(s => s.isLoadingAnalytics);
  const analyticsError = useAppStore(s => s.analyticsError);
  const fetchAnalyticsData = useAppStore(s => s.fetchAnalyticsData);
  const currentViewParams = useAppStore(s => s.currentViewParams);

  // Calculate Sharpe Ratio (annualized)
  const sharpeRatio = React.useMemo(() => {
    if (!analytics || !analytics.totalRealizedNetPnl || !analytics.totalFullyClosedTrades) return null;
    
    const avgReturn = analytics.totalRealizedNetPnl / analytics.totalFullyClosedTrades;
    const riskFreeReturn = riskFreeRate / 100;
    
    // Simple approximation for volatility using equity curve
    if (!analytics.equityCurve || analytics.equityCurve.length < 2) return null;
    
    const returns = analytics.equityCurve.slice(1).map((point, i) => {
      const prevPoint = analytics.equityCurve[i];
      return prevPoint.equity !== 0 ? (point.equity - prevPoint.equity) / prevPoint.equity : 0;
    });
    
    const avgDailyReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgDailyReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);
    
    return volatility !== 0 ? (avgReturn - riskFreeReturn) / volatility : null;
  }, [analytics, riskFreeRate]);

  // Calculate Sortino Ratio
  const sortinoRatio = React.useMemo(() => {
    if (!analytics || !analytics.totalRealizedNetPnl || !analytics.totalFullyClosedTrades) return null;
    
    const avgReturn = analytics.totalRealizedNetPnl / analytics.totalFullyClosedTrades;
    const riskFreeReturn = riskFreeRate / 100;
    
    if (!analytics.equityCurve || analytics.equityCurve.length < 2) return null;
    
    const returns = analytics.equityCurve.slice(1).map((point, i) => {
      const prevPoint = analytics.equityCurve[i];
      return prevPoint.equity !== 0 ? (point.equity - prevPoint.equity) / prevPoint.equity : 0;
    });
    
    const downside = returns.filter(ret => ret < 0);
    if (downside.length === 0) return null;
    
    const downsideVariance = downside.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) / downside.length;
    const downsideDeviation = Math.sqrt(downsideVariance);
    
    return downsideDeviation !== 0 ? (avgReturn - riskFreeReturn) / downsideDeviation : null;
  }, [analytics, riskFreeRate]);

  // Calculate P&L change
  const { pnlChangeValue, pnlChangePercent } = React.useMemo(() => {
    if (!analytics || !analytics.equityCurve || analytics.equityCurve.length < 2) {
      return { pnlChangeValue: 0, pnlChangePercent: 0 };
    }
    
    const latest = analytics.equityCurve[analytics.equityCurve.length - 1];
    const previous = analytics.equityCurve[analytics.equityCurve.length - 2];
    
    const changeValue = latest.equity - previous.equity;
    const changePercent = previous.equity !== 0 ? (changeValue / Math.abs(previous.equity)) * 100 : 0;
    
    return { pnlChangeValue: changeValue, pnlChangePercent: changePercent };
  }, [analytics]);

  // Generate mini trend data for sparklines
  const getMiniTrendData = (equityCurve: any[]) => {
    if (!equityCurve || equityCurve.length < 2) return [];
    return equityCurve.slice(-10).map(point => point.equity);
  };

  // Fetch analytics data on mount
  useEffect(() => {
    if (!analytics) {
      fetchAnalyticsData();
    }
  }, [analytics, fetchAnalyticsData]);

  // Navigate timestamp change should trigger refetch
  useEffect(() => {
    if (currentViewParams?.navTimestamp) {
      fetchAnalyticsData();
    }
  }, [currentViewParams?.navTimestamp, fetchAnalyticsData]);

  // Loading state
  if (isLoadingAnalytics) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (analyticsError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading analytics: {analyticsError}
      </Alert>
    );
  }

  // No data state
  if (!analytics) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No analytics data available. Add some trades to see your dashboard.
      </Alert>
    );
  }

  return (
    <div className="flex-grow">
      {/* Row 1: Key Account Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1">
          <EnhancedMetricCard
            title="Net Account Balance"
            value={formatCurrency(analytics.equityCurve.length > 0 ? analytics.equityCurve[analytics.equityCurve.length - 1].equity : analytics.totalRealizedNetPnl)}
            changeText={`${pnlChangeValue >= 0 ? '+' : ''}${formatCurrency(pnlChangeValue)} (${formatPercentage(pnlChangePercent)})`}
            changeColor={pnlChangeValue >= 0 ? 'success' : 'error'}
            trendData={getMiniTrendData(analytics.equityCurve)}
            trendColor={pnlChangeValue >= 0 ? colors.success : colors.error}
            minHeight="160px"
          />
        </div>
        
        <div className="col-span-1">
          <EnhancedMetricCard
            title="Unrealized P&L"
            value={formatCurrency(analytics.totalUnrealizedPnl)}
            changeText={(() => {
              // Calculate unrealized P&L change
              let unrealizedChange = 0;
              let unrealizedChangePercent = 0;
              if (
                analytics.equityCurve &&
                analytics.equityCurve.length > 1 &&
                typeof analytics.totalUnrealizedPnl === 'number'
              ) {
                // Estimate previous unrealized P&L by difference in net equity change vs realized P&L change
                const last = analytics.equityCurve[analytics.equityCurve.length - 1];
                const prev = analytics.equityCurve[analytics.equityCurve.length - 2];
                const realizedChange = analytics.totalRealizedNetPnl ?? 0;
                unrealizedChange = analytics.totalUnrealizedPnl ?? 0;
                // Fallback: estimate unrealizedChange as equity change - realizedChange
                if (isNaN(unrealizedChange)) {
                  unrealizedChange = (last.equity - prev.equity) - realizedChange;
                }
                unrealizedChangePercent = prev.equity !== 0 ? (unrealizedChange / Math.abs(prev.equity)) * 100 : 0;
              }
              const showValue = !isNaN(unrealizedChange) && !isNaN(unrealizedChangePercent);
              return showValue
                ? `${unrealizedChange >= 0 ? '+' : ''}${formatPercentage(unrealizedChangePercent)}`
                : 'N/A';
            })()}
            changeColor={analytics.totalUnrealizedPnl !== null && analytics.totalUnrealizedPnl >= 0 ? 'success' : 'error'}
            minHeight="160px"
          />
        </div>
        
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <EnhancedMetricCard
            title="Total Buying Power"
            value={formatCurrency(totalBuyingPower)}
            changeText="Account Balance"
            changeColor="neutral"
            minHeight="160px"
          />
        </div>
      </div>

      {/* Row 2: Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="col-span-1">
          <EnhancedMetricCard
            title="Total Realized P&L"
            value={formatCurrency(analytics.totalRealizedNetPnl)}
            changeText={`${analytics.totalFullyClosedTrades} closed trades`}
            changeColor={analytics.totalRealizedNetPnl !== null && analytics.totalRealizedNetPnl >= 0 ? 'success' : 'error'}
            minHeight="140px"
          />
        </div>
        
        <div className="col-span-1">
          <EnhancedMetricCard
            title="Win Rate"
            value={formatPercentage(analytics.winRateOverall)}
            changeText={`${analytics.numberOfWinningTrades}W / ${analytics.numberOfLosingTrades}L`}
            changeColor={analytics.winRateOverall !== null && analytics.winRateOverall >= 50 ? 'success' : 'error'}
            minHeight="140px"
          />
        </div>
        
        <div className="col-span-1">
          <EnhancedMetricCard
            title="Avg Win"
            value={formatCurrency(analytics.avgWinPnlOverall)}
            changeText="Per winning trade"
            changeColor="success"
            minHeight="140px"
          />
        </div>
        
        <div className="col-span-1">
          <EnhancedMetricCard
            title="Avg Loss"
            value={formatCurrency(analytics.avgLossPnlOverall)}
            changeText="Per losing trade"
            changeColor="error"
            minHeight="140px"
          />
        </div>
      </div>

      {/* Row 3: Risk Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="col-span-1">
          <EnhancedMetricCard
            title="Sharpe Ratio"
            value={formatNumber(analytics.sharpeRatio)}
            changeText="Risk-adjusted return"
            changeColor={analytics.sharpeRatio !== null && analytics.sharpeRatio > 1 ? 'success' : analytics.sharpeRatio !== null && analytics.sharpeRatio > 0 ? 'neutral' : 'error'}
            minHeight="140px"
          />
        </div>
        
        <div className="col-span-1">
          <EnhancedMetricCard
            title="Sortino Ratio"
            value={formatNumber(analytics.sortinoRatio)}
            changeText="Downside risk"
            changeColor={analytics.sortinoRatio !== null && analytics.sortinoRatio > 1 ? 'success' : analytics.sortinoRatio !== null && analytics.sortinoRatio > 0 ? 'neutral' : 'error'}
            minHeight="140px"
          />
        </div>
        
        <div className="col-span-1">
          <EnhancedMetricCard
            title="Max Drawdown"
            value={formatPercentage(analytics.maxDrawdownPercentage)}
            changeText="Peak to trough"
            changeColor="error"
            minHeight="140px"
          />
        </div>
        
        <div className="col-span-1">
          <EnhancedMetricCard
            title="Calmar Ratio"
            value={formatNumber(analytics.calmarRatio)}
            changeText="Return/max drawdown"
            changeColor={analytics.calmarRatio !== null && analytics.calmarRatio > 0.5 ? 'success' : analytics.calmarRatio !== null && analytics.calmarRatio > 0 ? 'neutral' : 'error'}
            minHeight="140px"
          />
        </div>
      </div>

      {/* Row 4: Advanced Risk Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="col-span-1">
          <EnhancedMetricCard
            title="Value at Risk (95%)"
            value={analytics.valueAtRisk95 ? `${(analytics.valueAtRisk95 * 100).toFixed(2)}%` : 'N/A'}
            changeText="Daily loss threshold"
            changeColor="error"
            minHeight="140px"
          />
        </div>
        
        <div className="col-span-1">
          <EnhancedMetricCard
            title="Omega Ratio"
            value={formatNumber(analytics.omega)}
            changeText="Gains vs losses"
            changeColor={analytics.omega !== null && analytics.omega > 1.5 ? 'success' : analytics.omega !== null && analytics.omega > 1 ? 'neutral' : 'error'}
            minHeight="140px"
          />
        </div>
        
        <div className="col-span-1">
          <EnhancedMetricCard
            title="Annualized Return"
            value={analytics.annualizedReturn ? `${(analytics.annualizedReturn * 100).toFixed(1)}%` : 'N/A'}
            changeText="Yearly performance"
            changeColor={analytics.annualizedReturn !== null && analytics.annualizedReturn > 0.15 ? 'success' : analytics.annualizedReturn !== null && analytics.annualizedReturn > 0 ? 'neutral' : 'error'}
            minHeight="140px"
          />
        </div>
        
        <div className="col-span-1">
          <EnhancedMetricCard
            title="Volatility"
            value={analytics.annualizedVolatility ? `${(analytics.annualizedVolatility * 100).toFixed(1)}%` : 'N/A'}
            changeText="Annual volatility"
            changeColor={analytics.annualizedVolatility !== null && analytics.annualizedVolatility < 0.15 ? 'success' : analytics.annualizedVolatility !== null && analytics.annualizedVolatility < 0.25 ? 'neutral' : 'error'}
            minHeight="140px"
          />
        </div>
      </div>

      {/* Row 5: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="col-span-1">
          <Paper elevation={1} sx={{ p: 2, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Equity Curve</Typography>
            <Box sx={{ flexGrow: 1 }}>
              {analytics.equityCurve && analytics.equityCurve.length > 0 ? (
                <EquityCurveChart equityCurve={analytics.equityCurve} />
              ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                  No equity data available
                </Typography>
              )}
            </Box>
          </Paper>
        </div>
        
        <div className="col-span-1">
          <Paper elevation={1} sx={{ p: 2, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Drawdown</Typography>
            <Box sx={{ flexGrow: 1 }}>
              {analytics.equityCurve && analytics.equityCurve.length > 0 ? (
                <DrawdownChart data={analytics.equityCurve.map(point => ({
                  date: new Date(point.date).toISOString().split('T')[0],
                  value: point.equity
                }))} />
              ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                  No drawdown data available
                </Typography>
              )}
            </Box>
          </Paper>
        </div>
      </div>

      {/* Row 6: Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <Paper elevation={1} sx={{ p: 2, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Cumulative Equity</Typography>
            <Box sx={{ flexGrow: 1 }}>
              {analytics.equityCurve && analytics.equityCurve.length > 0 ? (
                <CumulativeEquityChart data={analytics.equityCurve.map(point => ({
                  date: new Date(point.date).toISOString().split('T')[0],
                  value: point.equity
                }))} />
              ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                  No cumulative equity data available
                </Typography>
              )}
            </Box>
          </Paper>
        </div>
        
        <div className="col-span-1">
          <Paper elevation={1} sx={{ p: 2, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>P&L Heatmap</Typography>
            <Box sx={{ flexGrow: 1 }}>
              {analytics.dailyPnlForHeatmap && analytics.dailyPnlForHeatmap.length > 0 ? (
                <PnlHeatmapCalendar data={analytics.dailyPnlForHeatmap} />
              ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                  No P&L heatmap data available
                </Typography>
              )}
            </Box>
          </Paper>
        </div>
        
        <div className="col-span-1">
          <Paper elevation={1} sx={{ p: 2, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Win/Loss Distribution</Typography>
            <Box sx={{ flexGrow: 1 }}>
              {analytics.winLossBreakEvenCounts && analytics.winLossBreakEvenCounts.length > 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500 mb-2">
                      {analytics.numberOfWinningTrades}
                    </div>
                    <div className="text-sm text-gray-500 mb-4">Wins</div>
                    <div className="text-2xl font-bold text-red-500 mb-2">
                      {analytics.numberOfLosingTrades}
                    </div>
                    <div className="text-sm text-gray-500 mb-4">Losses</div>
                    <div className="text-2xl font-bold text-gray-500 mb-2">
                      {analytics.numberOfBreakEvenTrades}
                    </div>
                    <div className="text-sm text-gray-500">Break Even</div>
                  </div>
                </div>
              ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                  No distribution data available
                </Typography>
              )}
            </Box>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;