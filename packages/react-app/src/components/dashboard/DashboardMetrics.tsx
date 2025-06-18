// packages/react-app/src/components/dashboard/DashboardMetrics.tsx
import React, { useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import { typography } from '../../styles/design-tokens';
// Import your new card
import EnhancedMetricCard from './cards/EnhancedMetricCard';
// Import necessary charts
import EquityCurveChart from '../analytics/EquityCurveChart';
import { DrawdownChart } from './DrawdownChart';
import { CumulativeEquityChart } from './CumulativeEquityChart';
import DashboardRMultipleHistogram from './charts/DashboardRMultipleHistogram';
import PnlHeatmapCalendar from './charts/PnlHeatmapCalendar';
// Placeholders or components to be implemented/connected to real data:
// import ReturnVsRiskScatterPlot from './charts/ReturnVsRiskScatterPlot'; // Assuming you'll create/use this
// import PnlHeatmapCalendar from './charts/PnlHeatmapCalendar'; // Assuming you'll create/use this

// Icons (example, choose as needed)

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
  let sharpeRatio = 0;
  let sortinoRatio = 0;
  if (analytics && analytics.equityCurve && analytics.equityCurve.length > 1) {
    // Calculate daily returns
    const returns: number[] = [];
    for (let i = 1; i < analytics.equityCurve.length; i++) {
      const prev = analytics.equityCurve[i - 1].equity;
      const curr = analytics.equityCurve[i].equity;
      if (prev !== 0) {
        returns.push((curr - prev) / prev);
      }
    }
    if (returns.length > 0) {
      const avgDailyReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const stdDailyReturn = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - avgDailyReturn, 2), 0) / returns.length);
      // Annualize: multiply excess daily return by 252, std by sqrt(252)
      const annualizedReturn = avgDailyReturn * 252;
      const annualizedStd = stdDailyReturn * Math.sqrt(252);
      const rf = (riskFreeRate ?? 0) / 100;
      sharpeRatio = annualizedStd !== 0 ? (annualizedReturn - rf) / annualizedStd : 0;

      // --- Sortino Ratio Calculation ---
      // 1. MAR: use risk-free rate (annualized, divided by 252 for daily)
      const mar = rf / 252;
      // 2. Downside deviation: only count returns below MAR
      const downsideDiffs = returns.map(r => r < mar ? Math.pow(r - mar, 2) : 0);
      const downsideDeviation = Math.sqrt(downsideDiffs.reduce((a, b) => a + b, 0) / returns.length) * Math.sqrt(252); // annualized
      // 3. Sortino Ratio = (annualizedReturn - rf) / downsideDeviation
      sortinoRatio = downsideDeviation !== 0 ? (annualizedReturn - rf) / downsideDeviation : 0;
    }
  }

  // This effect will run when filters from TopBar (if managed in Zustand) change
  useEffect(() => {
    // Assuming currentViewParams might hold filter values passed from TopBar via Zustand
    // For now, we fetch with default filters or any passed via currentViewParams
    fetchAnalyticsData(currentViewParams as Record<string, unknown> || {});
  }, [fetchAnalyticsData, currentViewParams]);

  // Helper to create mini trend data from equity curve for Net Account Balance
  const getMiniTrendData = (equityCurve: { date: number; equity: number }[] | undefined) => {
    if (!equityCurve || equityCurve.length === 0) return undefined;
    // Take last N points for the trend, e.g., last 30
    const lastN = equityCurve.slice(-30);
    return lastN.map(p => ({ value: p.equity }));
  };

  const netAccountBalance = analytics?.totalRealizedNetPnl ?? 0; // Assuming this is the base for change calculation
  const lastEquityPoint = analytics?.equityCurve && analytics.equityCurve.length > 0 ? analytics.equityCurve[analytics.equityCurve.length - 1].equity : netAccountBalance;
  const secondLastEquityPoint = analytics?.equityCurve && analytics.equityCurve.length > 1 ? analytics.equityCurve[analytics.equityCurve.length - 2].equity : netAccountBalance;
  const pnlChangeValue = lastEquityPoint - secondLastEquityPoint;
  const pnlChangePercent = secondLastEquityPoint !== 0 ? (pnlChangeValue / Math.abs(secondLastEquityPoint)) * 100 : 0;

  if (isLoadingAnalytics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (analyticsError) {
    return (
      <Alert severity="error" sx={{ m: 2, backgroundColor: colors.surface, color: colors.error, border: `1px solid ${colors.border}` }}>
        Error loading dashboard metrics: {analyticsError}
      </Alert>
    );
  }

  if (!analytics) {
    return <Typography sx={{ m: 2, color: colors.textSecondary }}>No analytics data available for the dashboard.</Typography>;
  }

  // --- Start of the new Grid Layout ---
  return (
    <Box className="flex-grow"> {/* Removed p-6, min-h-screen from here, AppShell handles padding */}
      {/* Filter section is now part of TopBar.tsx */}

      <Grid container spacing={2.5}> {/* Use spacing from your design tokens, e.g., 2.5 * 8px = 20px */}
        {/* Row 1: Key Account Metrics */}
        <Grid item xs={12} md={6} lg={4}>
          <EnhancedMetricCard
            title="Net Account Balance"
            value={formatCurrency(analytics.equityCurve.length > 0 ? analytics.equityCurve[analytics.equityCurve.length - 1].equity : analytics.totalRealizedNetPnl)}
            changeText={`${pnlChangeValue >= 0 ? '+' : ''}${formatCurrency(pnlChangeValue)} (${formatPercentage(pnlChangePercent)})`}
            changeColor={pnlChangeValue >= 0 ? 'success' : 'error'}
            trendData={getMiniTrendData(analytics.equityCurve)}
            trendColor={pnlChangeValue >= 0 ? colors.success : colors.error}
            minHeight="160px" // Example min height
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
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
        const realizedChange = (analytics.totalRealizedNetPnl ?? 0) - (analytics.prevTotalRealizedNetPnl ?? 0);
        unrealizedChange = (analytics.totalUnrealizedPnl ?? 0) - (analytics.prevTotalUnrealizedPnl ?? 0);
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
    changeColor={(() => {
      let unrealizedChange = 0;
      if (
        analytics.equityCurve &&
        analytics.equityCurve.length > 1 &&
        typeof analytics.totalUnrealizedPnl === 'number'
      ) {
        unrealizedChange = (analytics.totalUnrealizedPnl ?? 0) - (analytics.prevTotalUnrealizedPnl ?? 0);
      }
      return unrealizedChange >= 0 ? 'success' : 'error';
    })()}
    descriptionText="Auto-refresh: 60s"
    minHeight="160px"
  />
</Grid>
        <Grid item xs={12} md={12} lg={4}>
  <EnhancedMetricCard
    title="Available Buying Power"
    value={formatCurrency(totalBuyingPower)}
    descriptionText={totalBuyingPower === 0 ? 'No funds available' : ''}
    progressValue={0}
    progressBarMinLabel=""
    progressBarMaxLabel=""
    progressColor="primary"
    minHeight="160px"
  />
</Grid>

        {/* Row 2: Risk & Return Quality */}
        
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <EnhancedMetricCard
            title="Sharpe Ratio"
            value={formatNumber(sharpeRatio)}
            descriptionText={
              sharpeRatio > 3 ? 'Excellent' : sharpeRatio > 2 ? 'Very Good' : sharpeRatio > 1 ? 'Good' : 'Suboptimal'
            }
            progressValue={Math.max(0, Math.min(100, Math.round((sharpeRatio / 3) * 100)))}
            progressBarMinLabel="Poor"
            progressBarMaxLabel="Excellent"
            progressColor="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <EnhancedMetricCard
            title="Sortino Ratio"
            value={formatNumber(sortinoRatio)}
            descriptionText={
              sortinoRatio > 3 ? 'Excellent' : sortinoRatio > 2 ? 'Very Good' : sortinoRatio > 1 ? 'Good' : sortinoRatio > 0 ? 'Suboptimal' : 'Negative'
            }
            progressValue={Math.max(0, Math.min(100, Math.round((sortinoRatio / 3) * 100)))}
            progressBarMinLabel="Poor"
            progressBarMaxLabel="Excellent"
            progressColor={sortinoRatio > 1 ? 'success' : sortinoRatio > 0 ? 'warning' : 'error'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <EnhancedMetricCard
            title="Profit Factor"
            value={(() => {
              const grossProfit = analytics.totalRealizedGrossPnl && analytics.totalRealizedGrossPnl > 0 ? analytics.totalRealizedGrossPnl : 0;
              const grossLoss = analytics.numberOfLosingTrades > 0 && analytics.avgLossPnlOverall !== null ? Math.abs(analytics.numberOfLosingTrades * analytics.avgLossPnlOverall) : 0;
              if (grossProfit > 0 && grossLoss > 0) {
                return formatNumber(grossProfit / grossLoss);
              } else {
                return "N/A";
              }
            })()}
            descriptionText={(() => {
              const grossProfit = analytics.totalRealizedGrossPnl && analytics.totalRealizedGrossPnl > 0 ? analytics.totalRealizedGrossPnl : 0;
              const grossLoss = analytics.numberOfLosingTrades > 0 && analytics.avgLossPnlOverall !== null ? Math.abs(analytics.numberOfLosingTrades * analytics.avgLossPnlOverall) : 0;
              if (grossProfit > 0 && grossLoss > 0) {
                const pf = grossProfit / grossLoss;
                if (pf > 1.5) return "Very Profitable";
                if (pf > 1) return "Profitable";
                if (pf === 1) return "Breakeven";
                return "Losing";
              } else {
                return "N/A";
              }
            })()}
            progressValue={(() => {
              const grossProfit = analytics.totalRealizedGrossPnl && analytics.totalRealizedGrossPnl > 0 ? analytics.totalRealizedGrossPnl : 0;
              const grossLoss = analytics.numberOfLosingTrades > 0 && analytics.avgLossPnlOverall !== null ? Math.abs(analytics.numberOfLosingTrades * analytics.avgLossPnlOverall) : 0;
              if (grossProfit > 0 && grossLoss > 0) {
                const pf = grossProfit / grossLoss;
                return Math.max(0, Math.min(100, Math.round((pf / 2) * 100)));
              } else {
                return 0;
              }
            })()}
            progressBarMinLabel="Losing"
            progressBarMaxLabel="Excellent"
            progressColor={(() => {
              const grossProfit = analytics.totalRealizedGrossPnl && analytics.totalRealizedGrossPnl > 0 ? analytics.totalRealizedGrossPnl : 0;
              const grossLoss = analytics.numberOfLosingTrades > 0 && analytics.avgLossPnlOverall !== null ? Math.abs(analytics.numberOfLosingTrades * analytics.avgLossPnlOverall) : 0;
              if (grossProfit > 0 && grossLoss > 0) {
                const pf = grossProfit / grossLoss;
                if (pf > 1.5) return "success";
                if (pf > 1) return "warning";
                return "error";
              } else {
                return "warning";
              }
            })()}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <EnhancedMetricCard
            title="Hit Rate (%)"
            value={formatPercentage(analytics.winRateOverall ? analytics.winRateOverall * 100 : 0)}
            descriptionText={analytics.winRateOverall && analytics.winRateOverall * 100 >= 60 ? "Good" : "Moderate"}
            progressValue={analytics.winRateOverall ? analytics.winRateOverall * 100 : 0}
            progressBarMinLabel="Low"
            progressBarMaxLabel="High"
            progressColor={analytics.winRateOverall && analytics.winRateOverall * 100 >= 60 ? "success" : "warning"}
          />
        </Grid>

        {/* Row 3: Expectancy & Other Risk Metrics */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <EnhancedMetricCard title="Expectancy $/Trade" value={analytics.avgWinPnlOverall && analytics.winRateOverall && analytics.avgLossPnlOverall ? formatCurrency((analytics.avgWinPnlOverall * analytics.winRateOverall) - (Math.abs(analytics.avgLossPnlOverall) * (1 - analytics.winRateOverall))) : "N/A"} descriptionText="Strong" />
        </Grid>
                <Grid item xs={12} sm={6} md={6} lg={3}>
          <EnhancedMetricCard title="Max Historical Drawdown" value={formatPercentage(analytics.maxDrawdownPercentage ? -analytics.maxDrawdownPercentage : 0)} descriptionText={formatCurrency(analytics.maxDrawdownPercentage && analytics.totalRealizedNetPnl ? -(analytics.totalRealizedNetPnl * (analytics.maxDrawdownPercentage/100)) : 0)} changeColor="error" />
        </Grid>
        
        {/* Row 4: Charts Title */}
        

        {/* Row 5: Main Charts */}
        <Grid item xs={12} lg={12}>
            <Grid container spacing={2.5}>
                <Grid item xs={12} sx={{height: {xs: 220, lg: 'calc(50% - 20px)'}}}>
                     {analytics.equityCurve && analytics.equityCurve.length > 0 ? (
  <>
    <Grid container spacing={2.5}>
  <Grid item xs={12} md={4} sx={{ minWidth: 400 }}>
    <EnhancedMetricCard title="EQUITY CURVE" value="" minHeight="100%">
      <Box sx={{flexGrow: 1, height: 'calc(100% - 30px)'}}>
        <CumulativeEquityChart data={analytics.equityCurve ? analytics.equityCurve.map(pt => ({ date: new Date(pt.date).toISOString(), value: pt.equity })) : []} />
      </Box>
    </EnhancedMetricCard>
  </Grid>
  <Grid item xs={12} md={4} sx={{ minWidth: 400 }}>
    <EnhancedMetricCard title="Drawdown Curve" value="" minHeight="100%">
      <Box sx={{flexGrow: 1, height: 'calc(100% - 30px)'}}>
        <DrawdownChart data={(() => {
          if (!analytics.equityCurve || analytics.equityCurve.length === 0) return [];
          let peak = -Infinity;
          return analytics.equityCurve.map(pt => {
            if (pt.equity > peak) peak = pt.equity;
            const drawdown = peak > 0 ? ((pt.equity - peak) / peak) * 100 : 0;
            return { date: new Date(pt.date).toISOString(), value: drawdown };
          });
        })()} />
      </Box>
    </EnhancedMetricCard>
  </Grid>
  <Grid item xs={12} md={4} sx={{ minWidth: 400 }}>
    <EnhancedMetricCard title="CUMULATIVE EQUITY CURVE" value="" minHeight="100%">
      <Box sx={{flexGrow: 1, height: 'calc(100% - 30px)'}}>
        <EquityCurveChart equityCurve={analytics.equityCurve} />
      </Box>
    </EnhancedMetricCard>
  </Grid>
</Grid>
  </>

                    ) : <Paper sx={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor: colors.surface, border: `1px solid ${colors.border}`}}><Typography sx={{color: colors.textSecondary}}>No Drawdown Data</Typography></Paper>}
                </Grid>

                
                
            </Grid>
        </Grid>

        {/* Row 6: Bottom Charts */}
        <Grid item xs={12} md={5} sx={{height: 350}}>
             <EnhancedMetricCard title="Heatmap Calendar" value="" minHeight="100%">
  {analytics.dailyPnlForHeatmap && analytics.dailyPnlForHeatmap.length > 0 ? (
    <PnlHeatmapCalendar data={analytics.dailyPnlForHeatmap} />
  ) : (
    <Box sx={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <Typography sx={{color: colors.textSecondary}}>No 30-Day P&L Data</Typography>
    </Box>
  )}
</EnhancedMetricCard>
        </Grid>

      </Grid>
    </Box>
  );
};


export default DashboardMetrics;