// File: zekenewsom-trade_journal/packages/react-app/src/components/dashboard/DashboardMetrics.tsx
// Modified for Stage 6 to use getAnalyticsData

import React, { useState, useEffect } from 'react';
import type { AnalyticsData } from '../../types';
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
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Header filter state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<number | ''>('');

  // Simulate re-fetch on filter change (replace with real API call as needed)
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (window.electronAPI && window.electronAPI.getAnalyticsData) {
          const filters: any = {
            ...(startDate ? { startDate: startDate.toISOString() } : {}),
            ...(endDate ? { endDate: endDate.toISOString() } : {}),
            ...(selectedStrategy ? { strategy_id: selectedStrategy } : {})
          };
          const data = await window.electronAPI.getAnalyticsData(filters);
          if (data == null) {
            throw new Error('No analytics data returned from backend.');
          }
          if ('error' in data) {
            throw new Error(data.error);
          }
          setAnalytics(data);
        } else {
          throw new Error('getAnalyticsData API not available.');
        }
      } catch (err) {
        console.error('Error fetching dashboard analytics:', err);
        setError((err as Error).message);
        setAnalytics(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, selectedStrategy]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (window.electronAPI && window.electronAPI.getAnalyticsData) {
          const data = await window.electronAPI.getAnalyticsData();
          if (data == null) {
            throw new Error('No analytics data returned from backend.');
          }
          if ('error' in data) {
            throw new Error(data.error);
          }
          setAnalytics(data);
        } else {
          throw new Error('getAnalyticsData API not available.');
        }
      } catch (err) {
        console.error('Error fetching dashboard analytics:', err);
        setError((err as Error).message);
        setAnalytics(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading metrics: {error}
      </Alert>
    );
  if (!analytics)
    return <Typography sx={{ m: 2 }}>No analytics data available for dashboard.</Typography>;

  // Main grid layout with placeholder cards for each section
  if (error) return <p style={{ color: 'red' }}>Error loading metrics: {error}</p>;
  if (!analytics)
    return <Typography sx={{ m: 2 }}>No analytics data available for dashboard.</Typography>;

  // Helpers for formatting
  const formatCurrency = (value: number | null | undefined) => value === null || value === undefined ? 'N/A' : value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#161a25', color: '#e0e0e0', minHeight: '100vh' }}>
      {/* Header Section */}
      <Paper elevation={2} sx={{ mb: 4, p: { xs: 2, md: 3 }, backgroundColor: '#1e2230', color: '#e0e0e0', borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
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
                    slotProps={{ textField: { size: 'small', sx: { width: '100%', background: '#23263a', input: { color: '#e0e0e0' } } } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{ textField: { size: 'small', sx: { width: '100%', background: '#23263a', input: { color: '#e0e0e0' } } } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <FormControl size="small" sx={{ width: '100%', background: '#23263a' }}>
                  <InputLabel id="strategy-label" sx={{ color: '#8be9fd' }}>Strategy</InputLabel>
                  <Select
                    labelId="strategy-label"
                    value={selectedStrategy}
                    label="Strategy"
                    onChange={e => setSelectedStrategy(e.target.value as number)}
                    sx={{ color: '#e0e0e0', '.MuiSelect-icon': { color: '#8be9fd' } }}
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
                <Button startIcon={<SearchIcon />} variant="outlined" color="primary" sx={{ borderColor: '#3A7BFF', color: '#8be9fd', borderRadius: 2, px: 2, minWidth: 120 }}>Search Trades</Button>
              </Grid>
              <Grid>
                <Button startIcon={<AddIcon />} variant="contained" color="primary" sx={{ background: '#3A7BFF', borderRadius: 2, px: 2, minWidth: 120 }} onClick={() => {/* Navigation to logTransactionForm should be implemented if route/callback is available */}}>Add Trade</Button>
              </Grid>
              <Grid>
                <Button startIcon={<FileDownloadIcon />} variant="outlined" sx={{ borderColor: '#3A7BFF', color: '#8be9fd', borderRadius: 2, px: 2, minWidth: 110 }}>Export</Button>
              </Grid>
              <Grid>
                <Button startIcon={<BackupIcon />} variant="outlined" sx={{ borderColor: '#3A7BFF', color: '#8be9fd', borderRadius: 2, px: 2, minWidth: 120 }}>Backup Now</Button>
              </Grid>
              <Grid>
                <IconButton sx={{ ml: 1 }}>
                  <Avatar sx={{ bgcolor: '#23263a', color: '#8be9fd', width: 36, height: 36, borderRadius: 2 }}>
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
            <InfoCard title="Current Drawdown" value={'N/A'} valueColor="#f44336" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard
              title="Max Historical Drawdown"
              value={analytics?.maxDrawdownPercentage ? `-${analytics.maxDrawdownPercentage.toFixed(2)}%` : 'N/A'}
              description={analytics?.maxDrawdownPercentage ? `${formatCurrency((analytics?.totalRealizedNetPnl || 0) * (analytics?.maxDrawdownPercentage / 100))}` : 'N/A'}
              progress={analytics?.maxDrawdownPercentage || 0}
              valueColor="#f44336"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard title="1-Day 95% VaR" value={'N/A'} />
          </Grid>
        </Grid>

        {/* Section 4: Charts */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ mb: 2, mt: 2, color: '#50fa7b' }}>CHARTS</Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, backgroundColor: '#1e2230', color: '#e0e0e0', height: '400px' }}>
            <Typography variant="subtitle2" sx={{ color: '#8be9fd', textAlign:'center', mb:1 }}>
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
              <Paper sx={{ p: 1, backgroundColor: '#1e2230', color: '#e0e0e0', height: '188px' }}>
                <Typography variant="subtitle2" sx={{ color: '#8be9fd', textAlign:'center', mb:1 }}>Drawdown Curve</Typography>
                {analytics.equityCurve && analytics.equityCurve.length > 0 ? (
                  <DashboardDrawdownChart equityCurveData={analytics?.equityCurve} />
                ) : (
                  <Typography>No drawdown data.</Typography>
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 1, backgroundColor: '#1e2230', color: '#e0e0e0', height: '188px' }}>
                <Typography variant="subtitle2" sx={{ color: '#8be9fd', textAlign:'center', mb:1 }}>R-Multiple Histogram</Typography>
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