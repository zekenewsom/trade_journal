// File: zekenewsom-trade_journal/packages/react-app/src/components/dashboard/DashboardMetrics.tsx
// Modified for Stage 6 to use getAnalyticsData

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Box, Grid, Typography, CircularProgress, Alert, Paper, Button, Select, MenuItem, InputLabel, FormControl, Avatar, IconButton } from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import BackupIcon from '@mui/icons-material/Backup';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PersonIcon from '@mui/icons-material/Person';
import KeyMetricCard from './cards/KeyMetricCard';
import InfoCard from './cards/InfoCard';
import EquityCurveChart from '../analytics/EquityCurveChart';
import DashboardDrawdownChart from './charts/DashboardDrawdownChart';
import DashboardRMultipleHistogram from './charts/DashboardRMultipleHistogram';
import ReturnVsRiskScatterPlot from './charts/ReturnVsRiskScatterPlot';
import PnlHeatmapCalendar from './charts/PnlHeatmapCalendar';
// import icons as desired from '@mui/icons-material' for InfoCard

const DashboardMetrics: React.FC = () => {
  const { analytics, isLoadingAnalytics, analyticsError, fetchAnalyticsData } = useAppStore();
  // Header filter state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<number | ''>('');

  useEffect(() => {
    fetchAnalyticsData({
      ...(startDate ? { startDate: startDate.toISOString() } : {}),
      ...(endDate ? { endDate: endDate.toISOString() } : {}),
      ...(selectedStrategy ? { strategy_id: selectedStrategy } : {})
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, selectedStrategy]);

  if (isLoadingAnalytics)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh" className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  if (analyticsError)
    return (
      <Alert severity="error" className="m-2" sx={{ borderColor: 'error.main', color: 'error.main' }}>
        Error loading metrics: {analyticsError}
      </Alert>
    );
  if (!analytics)
    return <Typography className="m-2">No analytics data available for dashboard.</Typography>;

  // Helpers for formatting
  const formatCurrency = (value: number | null | undefined) => value === null || value === undefined ? 'N/A' : value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <Box className="flex-grow p-6 min-h-screen" sx={theme => ({ backgroundColor: theme.palette.background.default, color: theme.palette.text.primary })}>
      {/* Header Section */}
      <Paper elevation={2} className="mb-8 p-4 md:p-6 overflow-hidden" sx={theme => ({ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, borderRadius: theme.shape.borderRadius * 2, boxShadow: theme.shadows[2] })}>
        <Grid container columns={12} spacing={2} alignItems="center" justifyContent="space-between" wrap="wrap">
          {/* Filters Section */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Grid container columns={12} spacing={2} alignItems="center" wrap="wrap">
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{ textField: { size: 'small', sx: theme => ({ width: '100%', background: theme.palette.background.paper, input: { color: theme.palette.text.primary } }) } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{ textField: { size: 'small', sx: theme => ({ width: '100%', background: theme.palette.background.paper, input: { color: theme.palette.text.primary } }) } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <FormControl size="small" sx={theme => ({ width: '100%', background: theme.palette.background.paper })}>
                  <InputLabel id="strategy-label" sx={theme => ({ color: theme.palette.text.primary })}>Strategy</InputLabel>
                  <Select
                    labelId="strategy-label"
                    value={selectedStrategy}
                    label="Strategy"
                    onChange={e => setSelectedStrategy(e.target.value as number)}
                    sx={theme => ({ color: theme.palette.text.primary, '.MuiSelect-icon': { color: theme.palette.secondary.main } })}
                  >
                    <MenuItem value="">All Strategies</MenuItem>
                    {analytics?.availableStrategies?.map((s) => (
                      <MenuItem key={s.strategy_id} value={s.strategy_id}>{s.strategy_name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
          {/* Actions Section */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Grid container spacing={1} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} wrap="wrap">
              <Grid>
                <Button startIcon={<SearchIcon />} variant="outlined" color="primary" sx={theme => ({ borderColor: theme.palette.primary.main, color: theme.palette.secondary.main, borderRadius: theme.shape.borderRadius, px: 2, minWidth: 120 })}>Search Trades</Button>
              </Grid>
              <Grid>
                <Button startIcon={<AddIcon />} variant="contained" color="primary" sx={theme => ({ background: theme.palette.primary.main, borderRadius: theme.shape.borderRadius, px: 2, minWidth: 120 })} onClick={() => {/* Navigation to logTransactionForm should be implemented if route/callback is available */}}>Add Trade</Button>
              </Grid>
              <Grid>
                <Button startIcon={<FileDownloadIcon />} variant="outlined" sx={theme => ({ borderColor: theme.palette.primary.main, color: theme.palette.secondary.main, borderRadius: theme.shape.borderRadius, px: 2, minWidth: 110 })}>Export</Button>
              </Grid>
              <Grid>
                <Button startIcon={<BackupIcon />} variant="outlined" sx={theme => ({ borderColor: theme.palette.primary.main, color: theme.palette.secondary.main, borderRadius: theme.shape.borderRadius, px: 2, minWidth: 120 })}>Backup Now</Button>
              </Grid>
              <Grid>
                <IconButton sx={{ ml: 1 }}>
                  <Avatar sx={theme => ({ bgcolor: theme.palette.background.paper, color: theme.palette.secondary.main, width: 36, height: 36, borderRadius: theme.shape.borderRadius })}>
                    <PersonIcon />
                  </Avatar>
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <Grid container columns={12} spacing={3} alignItems="stretch">
        {/* Section 1: Key Account Metrics (Net Balance, Unrealized P&L, Buying Power) */}
        <Grid container columns={12} spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, md: 4 }}>
            <KeyMetricCard
              title="Net Account Balance"
              value={formatCurrency(analytics?.totalRealizedNetPnl)}
              // trendData={[{value: 10}, {value: 15}, {value: 13}, {value: 17}]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <KeyMetricCard
              title="Unrealized P&L"
              value={formatCurrency(analytics?.totalUnrealizedPnl)}
              change="Auto-refresh 60s"
              // trendData={[{value: 5}, {value: 8}, {value: 6}, {value: 9}]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <KeyMetricCard
              title="Available Buying Power"
              value={'N/A'}
              change={'N/A'}
            />
          </Grid>
        </Grid>

        {/* Section 2: Risk & Return Quality */}
        <Grid container columns={12} spacing={3} alignItems="stretch" sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard title="Sharpe Ratio" value={"2.37"} description="Good" progress={75} progressColor="success" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard title="Sortino Ratio" value={"3.14"} description="Excellent" progress={90} progressColor="success" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard title="Profit Factor" value={"2.12"} description="Good" progress={70} progressColor="success" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard
              title="Hit Rate (%)"
              value={analytics?.winRateOverall !== undefined && analytics?.winRateOverall !== null ? `${(analytics.winRateOverall * 100).toFixed(1)}%` : 'N/A'}
              description={analytics?.winRateOverall && analytics?.winRateOverall > 0.5 ? "Moderate" : "Needs Improvement"}
              progress={analytics?.winRateOverall ? analytics.winRateOverall * 100 : 0}
              progressColor={analytics?.winRateOverall && analytics?.winRateOverall > 0.5 ? 'info' : 'warning'}
            />
          </Grid>
        </Grid>

        {/* Section 3: Experience & Other Metrics */}
        <Grid container columns={12} spacing={3} alignItems="stretch" sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard title="Experience / Trade" value={'N/A'} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard title="Ulcer Index" value={'N/A'} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard title="Current Drawdown" value={'N/A'} valueColor="error" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard
              title="Max Historical Drawdown"
              value={analytics?.maxDrawdownPercentage ? `-${analytics.maxDrawdownPercentage.toFixed(2)}%` : 'N/A'}
              description={analytics?.maxDrawdownPercentage ? `${formatCurrency((analytics?.totalRealizedNetPnl || 0) * (analytics?.maxDrawdownPercentage / 100))}` : 'N/A'}
              progress={analytics?.maxDrawdownPercentage || 0}
              valueColor="error"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard title="1-Day 95% VaR" value={'N/A'} />
          </Grid>
        </Grid>

        {/* Section 4: Charts */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" className="mb-2 mt-2" sx={theme => ({ color: theme.palette.success.main })}>CHARTS</Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper className="h-[400px]" sx={theme => ({ p: 2, backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, borderRadius: theme.shape.borderRadius })}>
            <Typography variant="subtitle2" className="text-center mb-1" sx={theme => ({ color: theme.palette.secondary.main })}>
              Cumulative Equity Curve
            </Typography>
            {analytics.equityCurve && analytics.equityCurve.length > 0 ? (
              <EquityCurveChart equityCurve={analytics?.equityCurve} />
            ) : (
              <Typography>No equity curve data.</Typography>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Grid container direction="column" spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Paper className="h-[188px]" sx={theme => ({ p: 1, backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary })}>
                <Typography variant="subtitle2" className="text-center mb-1" sx={theme => ({ color: theme.palette.secondary.main })}>Drawdown Curve</Typography>
                {analytics.equityCurve && analytics.equityCurve.length > 0 ? (
                  <DashboardDrawdownChart equityCurveData={analytics?.equityCurve} />
                ) : (
                  <Typography>No drawdown data.</Typography>
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Paper className="h-[188px]" sx={theme => ({ p: 1, backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary })}>
                <Typography variant="subtitle2" className="text-center mb-1" sx={theme => ({ color: theme.palette.secondary.main })}>R-Multiple Histogram</Typography>
                {analytics?.rMultipleDistribution && analytics?.rMultipleDistribution.length > 0 ? (
                  <DashboardRMultipleHistogram data={analytics?.rMultipleDistribution} />
                ) : (
                  <Typography>No R-Multiple data.</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Section 5: More Charts (Bottom row) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ReturnVsRiskScatterPlot />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PnlHeatmapCalendar />
        </Grid>
      </Grid>
    </Box>
  );

};

export default DashboardMetrics;