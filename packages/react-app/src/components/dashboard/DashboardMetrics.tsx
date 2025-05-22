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
import DashboardDrawdownChart from './charts/DashboardDrawdownChart';
import DashboardRMultipleHistogram from './charts/DashboardRMultipleHistogram';
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
  const { analytics, isLoadingAnalytics, analyticsError, fetchAnalyticsData, currentViewParams } = useAppStore();

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
            // Assuming unrealized P&L might have its own change logic if tracked daily
            // changeText="+ $1,234.56 (+1.5%)" 
            // changeColor="success"
            descriptionText="Auto-refresh: 60s" // Placeholder
            minHeight="160px"
          />
        </Grid>
        <Grid item xs={12} md={12} lg={4}>
          <EnhancedMetricCard
            title="Available Buying Power"
            value={"N/A"} // Placeholder - data not in current AnalyticsData
            descriptionText="34% used" // Placeholder
            progressValue={34} // Placeholder
            progressBarMinLabel=""
            progressBarMaxLabel=""
            progressColor="primary"
            minHeight="160px"
          />
        </Grid>

        {/* Row 2: Risk & Return Quality */}
        
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <EnhancedMetricCard
            title="Sharpe Ratio (YTD)"
            value={formatNumber(2.37)} // Placeholder
            descriptionText="Good"
            progressValue={75} // (2.37 / 3 * 100) example mapping
            progressBarMinLabel="Poor"
            progressBarMaxLabel="Excellent"
            progressColor="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <EnhancedMetricCard
            title="Sortino Ratio"
            value={formatNumber(3.14)} // Placeholder
            descriptionText="Excellent"
            progressValue={90} // (3.14 / 3.5 * 100) example mapping
            progressBarMinLabel="Poor"
            progressBarMaxLabel="Excellent"
            progressColor="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <EnhancedMetricCard
            title="Profit Factor"
            value={analytics.totalRealizedGrossPnl && analytics.numberOfLosingTrades > 0 && analytics.avgLossPnlOverall !== null ? formatNumber(Math.abs(analytics.totalRealizedGrossPnl) / Math.abs(analytics.numberOfLosingTrades * analytics.avgLossPnlOverall)) : "N/A" }
            descriptionText="Good"
            progressValue={70} // Example
            progressBarMinLabel="Poor"
            progressBarMaxLabel="Excellent"
            progressColor="success"
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
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <EnhancedMetricCard title="Ulcer Index" value="N/A" descriptionText="Moderate" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <EnhancedMetricCard title="Current Drawdown" value={"N/A"} descriptionText="0%" changeColor="error" />
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <EnhancedMetricCard title="Max Historical Drawdown" value={formatPercentage(analytics.maxDrawdownPercentage ? -analytics.maxDrawdownPercentage : 0)} descriptionText={formatCurrency(analytics.maxDrawdownPercentage && analytics.totalRealizedNetPnl ? -(analytics.totalRealizedNetPnl * (analytics.maxDrawdownPercentage/100)) : 0)} changeColor="error" />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={3}>
          <EnhancedMetricCard title="1-Day 95% VaR" value={"N/A"} descriptionText="2.00% of equity" />
        </Grid>

        {/* Row 4: Charts Title */}
        

        {/* Row 5: Main Charts */}
        <Grid item xs={12} lg={12}>
            <Grid container spacing={2.5}>
                <Grid item xs={12} sx={{height: {xs: 220, lg: 'calc(50% - 20px)'}}}>
                     {analytics.equityCurve && analytics.equityCurve.length > 0 ? (
                        <EnhancedMetricCard title="Drawdown Curve" value="" minHeight="100%">
                             <Box sx={{flexGrow: 1, height: 'calc(100% - 30px)'}}>
                                <DashboardDrawdownChart equityCurveData={analytics.equityCurve} />
                             </Box>
                        </EnhancedMetricCard>
                    ) : <Paper sx={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor: colors.surface, border: `1px solid ${colors.border}`}}><Typography sx={{color: colors.textSecondary}}>No Drawdown Data</Typography></Paper>}
                </Grid>

                <Grid item xs={12} sx={{height: {xs: 350, md: 500, lg: 600}}}>
                    {analytics.equityCurve && analytics.equityCurve.length > 0 ? (
                        <EnhancedMetricCard title="CUMULATIVE EQUITY CURVE" value="" minHeight="100%">
                            <Box sx={{flexGrow: 1, width: '400px', height: { xs: 350, sm: 400, md: 500, lg: 600 }}}>
                                <EquityCurveChart equityCurve={analytics.equityCurve} />
                            </Box>
                        </EnhancedMetricCard>
                    ) : <Paper sx={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor: colors.surface, border: `1px solid ${colors.border}`}}><Typography sx={{color: colors.textSecondary}}>No Equity Data</Typography></Paper> }
                </Grid>

                <Grid item xs={12} sx={{height: {xs: 220, lg: 'calc(50% - 20px)'}}}>
                     {analytics.rMultipleDistribution && analytics.rMultipleDistribution.length > 0 ? (
                        <EnhancedMetricCard title="R-Multiple Histogram (Last 100 Trades)" value="" minHeight="100%">
                            <Box sx={{flexGrow: 1, height: 'calc(100% - 30px)'}}>
                                <DashboardRMultipleHistogram data={analytics.rMultipleDistribution} />
                            </Box>
                        </EnhancedMetricCard>
                    ) : <Paper sx={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor: colors.surface, border: `1px solid ${colors.border}`}}><Typography sx={{color: colors.textSecondary}}>No R-Multiple Data</Typography></Paper>}
                </Grid>
            </Grid>
        </Grid>

        {/* Row 6: Bottom Charts */}
        <Grid item xs={12} md={7} sx={{height: 350}}>
            <EnhancedMetricCard title="Return vs Risk Scatter" value="" minHeight="100%">
                 {/* <ReturnVsRiskScatterPlot data={analytics.pnlVsDurationSeries} /> Adjust data source as needed */}
                 <Box sx={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                   <Typography sx={{color: colors.textSecondary}}>Return vs Risk Scatter (Coming Soon)</Typography>
                 </Box>
            </EnhancedMetricCard>
        </Grid>
        <Grid item xs={12} md={5} sx={{height: 350}}>
             <EnhancedMetricCard title="30-Day P&L Heatmap Calendar" value="" minHeight="100%">
                {/* <PnlHeatmapCalendar data={...} /> */}
                <Box sx={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <Typography sx={{color: colors.textSecondary}}>30-Day P&L Heatmap (Coming Soon)</Typography>
                </Box>
            </EnhancedMetricCard>
        </Grid>

      </Grid>
    </Box>
  );
};


export default DashboardMetrics;