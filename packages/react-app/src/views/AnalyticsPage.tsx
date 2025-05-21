// File: zekenewsom-trade_journal/packages/react-app/src/views/AnalyticsPage.tsx
// New file for Stage 6

import React, { useState, useEffect } from 'react';
import type { AnalyticsData, AnalyticsFilters } from '../types';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PnlVsDurationScatterPlot from '../components/analytics/PnlVsDurationScatterPlot';
import PerformanceByTimeChart from '../components/analytics/PerformanceByTimeChart';
import GroupedPerformanceTable from '../components/analytics/GroupedPerformanceTable';
import TradeStatsCard from '../components/analytics/TradeStatsCard';
import EquityCurveChart from '../components/analytics/EquityCurveChart';
import Grid from '@mui/material/Grid';
import { Box, Button, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getAnalyticsData } from '../api/analytics';



const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      startDate: null,
      endDate: null
    }
  });
  const [unrealizedPnl, setUnrealizedPnl] = useState<number | null>(null);

  // Fetch Unrealized P&L from all trades
  useEffect(() => {
    async function fetchUnrealizedPnl() {
      try {
        if (window.electronAPI?.getTrades) {
          const trades = await window.electronAPI.getTrades();
          const sum = trades.reduce((acc: number, t: any) => acc + (typeof t.unrealized_pnl === 'number' ? t.unrealized_pnl : 0), 0);
          setUnrealizedPnl(sum);
        }
      } catch (err) {
        setUnrealizedPnl(null);
      }
    }
    fetchUnrealizedPnl();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnalyticsData(filters);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [filters]);

  const handleDateChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        startDate: field === 'startDate' ? (date ? date.toISOString() : null) : prev.dateRange?.startDate ?? null,
        endDate: field === 'endDate' ? (date ? date.toISOString() : null) : prev.dateRange?.endDate ?? null
      }
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: {
        startDate: null,
        endDate: null
      }
    });
  };

  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <CircularProgress className="text-primary-action" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#181a27', color: '#e0e0e0', p: { xs: 2, md: 4 } }}>
      {/* Header Section */}
      <Paper elevation={2} sx={{ mb: 4, p: { xs: 2, md: 3 }, backgroundColor: '#1e2230', color: '#e0e0e0', borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>Trading Analytics</Typography>
        <Typography sx={{ color: '#8be9fd' }}>Comprehensive analysis of your trading performance</Typography>
      </Paper>

      {/* Key Metrics Grid */}
      <Grid container spacing={3} alignItems="stretch" sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }}>
            <Typography sx={{ color: '#8be9fd', fontSize: 14, fontWeight: 500, mb: 1 }}>Total Net P&L</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 'bold', color: analytics.totalRealizedNetPnl >= 0 ? '#4CAF50' : '#f44336' }}>
              {analytics && analytics.totalRealizedNetPnl !== undefined ? `$${analytics.totalRealizedNetPnl.toFixed(2)}` : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        {/* Unrealized P&L Card */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }}>
            <Typography sx={{ color: '#8be9fd', fontSize: 14, fontWeight: 500, mb: 1 }}>Unrealized P&L</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 'bold', color: (unrealizedPnl ?? 0) >= 0 ? '#4CAF50' : '#f44336' }}>
              {unrealizedPnl !== null && unrealizedPnl !== undefined ? `$${unrealizedPnl.toFixed(2)}` : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }}>
            <Typography sx={{ color: '#8be9fd', fontSize: 14, fontWeight: 500, mb: 1 }}>Win Rate</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 'bold', color: '#e0e0e0' }}>
              {analytics && analytics.winRateOverall !== undefined && analytics.winRateOverall !== null ? `${(analytics.winRateOverall * 100).toFixed(1)}%` : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }}>
            <Typography sx={{ color: '#8be9fd', fontSize: 14, fontWeight: 500, mb: 1 }}>Max Drawdown</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 'bold', color: '#f44336' }}>
              {analytics && analytics.maxDrawdownPercentage !== undefined && analytics.maxDrawdownPercentage !== null ? `${analytics.maxDrawdownPercentage.toFixed(1)}%` : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }}>
            <Typography sx={{ color: '#8be9fd', fontSize: 14, fontWeight: 500, mb: 1 }}>Total Trades</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 'bold', color: '#e0e0e0' }}>
              {analytics ? analytics.numberOfWinningTrades + analytics.numberOfLosingTrades + analytics.numberOfBreakEvenTrades : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Date Range Filter */}
      <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" wrap="wrap">
          <Grid item xs={12} sm={6} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange && filters.dateRange.startDate ? new Date(filters.dateRange.startDate) : null}
                onChange={handleDateChange('startDate')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { background: '#23263a', input: { color: '#e0e0e0' } }
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={filters.dateRange && filters.dateRange.endDate ? new Date(filters.dateRange.endDate) : null}
                onChange={handleDateChange('endDate')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { background: '#23263a', input: { color: '#e0e0e0' } }
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Button 
              variant="outlined" 
              onClick={clearFilters} 
              fullWidth
              sx={{ borderColor: '#3A7BFF', color: '#8be9fd', borderRadius: 2, px: 2, minWidth: 120, '&:hover': { backgroundColor: '#3A7BFF', color: '#fff' } }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts Grid */}
      <Grid container spacing={3} alignItems="stretch" sx={{ mb: 4 }}>
        {/* Equity Curve Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#e0e0e0' }}>Equity Curve</Typography>
            <Box sx={{ height: 400 }}>
              <EquityCurveChart equityCurve={analytics.equityCurve} />
            </Box>
          </Paper>
        </Grid>
        {/* P&L Per Trade Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#e0e0e0' }}>P&L Distribution</Typography>
            <Box sx={{ height: 400 }}>
              {analytics.pnlPerTradeSeries && analytics.pnlPerTradeSeries.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.pnlPerTradeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2B2D" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <YAxis tickFormatter={(value: number) => `$${value.toFixed(0)}`} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
                      contentStyle={{ backgroundColor: '#1A1B1D', border: '1px solid #2A2B2D' }}
                    />
                    <Bar dataKey="pnl" name="P&L">
                      {analytics.pnlPerTradeSeries.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.pnl >= 0 ? '#00E28A' : '#FF4D67'} 
                          opacity={entry.isFullyClosed ? 1 : 0.5}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Trade Statistics */}
      <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1, mb: 4 }}>
        <TradeStatsCard analytics={analytics} />
      </Paper>

      {/* Win/Loss Distribution */}
      <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#e0e0e0' }}>Trade Outcomes</Typography>
        <Box sx={{ height: 400 }}>
          {analytics.winLossBreakEvenCounts && analytics.winLossBreakEvenCounts.some(item => item.value > 0) && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.winLossBreakEvenCounts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.winLossBreakEvenCounts.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Wins' ? '#00E28A' : entry.name === 'Losses' ? '#FF4D67' : '#FFBB28'} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value:number) => [value, 'Trades']}
                  contentStyle={{ backgroundColor: '#1A1B1D', border: '1px solid #2A2B2D' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Paper>

      {/* R-Multiple Distribution */}
      {analytics.rMultipleDistribution && analytics.rMultipleDistribution.length > 0 && (
        <Paper sx={{ backgroundColor: '#23263a', borderRadius: 3, p: 3, mb: 4, border: '1px solid #23263a' }}>
          <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 600, mb: 2, color: '#e0e0e0' }}>R-Multiple Distribution</Typography>
          <Typography sx={{ color: '#8be9fd', mb: 2 }}>Average R-Multiple: {analytics.avgRMultiple !== null ? analytics.avgRMultiple.toFixed(2) : 'N/A'}</Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.rMultipleDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2B2D" />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1B1D', border: '1px solid #2A2B2D' }}
                />
                <Bar dataKey="count" name="Number of Trades" fill="#3A7BFF" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      {/* P&L vs Duration Scatter Plot */}
      {analytics.pnlVsDurationSeries && analytics.pnlVsDurationSeries.length > 0 && (
        <Paper sx={{ backgroundColor: '#23263a', borderRadius: 3, p: 3, mb: 4, border: '1px solid #23263a' }}>
          <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 600, mb: 2, color: '#e0e0e0' }}>P&L vs Trade Duration</Typography>
          <Box sx={{ height: 400 }}>
            <PnlVsDurationScatterPlot data={analytics.pnlVsDurationSeries} />
          </Box>
        </Paper>
      )}

      {/* Performance Tables Grid */}
      <Grid container spacing={3} alignItems="stretch" sx={{ mb: 4 }}>
        {analytics.pnlByAssetClass && analytics.pnlByAssetClass.length > 0 && (
          <Grid item={true} xs={12} md={4} lg={4}>
            <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }}>
              <GroupedPerformanceTable
                title="Performance by Asset Class"
                data={analytics.pnlByAssetClass}
              />
            </Paper>
          </Grid>
        )}
        {analytics.pnlByExchange && analytics.pnlByExchange.length > 0 && (
          <Grid item={true} xs={12} md={4} lg={4}>
            <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }}>
              <GroupedPerformanceTable
                title="Performance by Exchange"
                data={analytics.pnlByExchange}
              />
            </Paper>
          </Grid>
        )}
        {analytics.pnlByStrategy && analytics.pnlByStrategy.length > 0 && (
          <Grid item={true} xs={12} md={4} lg={4}>
            <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }}>
              <GroupedPerformanceTable
                title="Performance by Strategy"
                data={analytics.pnlByStrategy}
              />
            </Paper>
          </Grid>
        )}
        {analytics.pnlByEmotion && analytics.pnlByEmotion.length > 0 && (
          <Grid item={true} xs={12} md={4} lg={4}>
            <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }}>
              <GroupedPerformanceTable
                title="Performance by Emotional State"
                data={analytics.pnlByEmotion}
              />
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Time-based Performance Charts */}
      <Grid container={true} spacing={3} alignItems="stretch">
        {analytics.pnlByMonth && analytics.pnlByMonth.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }}>
              <PerformanceByTimeChart
                title="Monthly Performance"
                data={analytics.pnlByMonth}
                dataKeyX="period"
                dataKeyY="totalNetPnl"
              />
            </Paper>
          </Grid>
        )}
        {analytics.pnlByDayOfWeek && analytics.pnlByDayOfWeek.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }}>
              <PerformanceByTimeChart
                title="Performance by Day of Week"
                data={analytics.pnlByDayOfWeek}
                dataKeyX="period"
                dataKeyY="totalNetPnl"
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;