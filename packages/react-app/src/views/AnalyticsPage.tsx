// File: zekenewsom-trade_journal/packages/react-app/src/views/AnalyticsPage.tsx
// New file for Stage 6

import React, { useState, useEffect, useCallback } from 'react';
import type { AnalyticsData, AnalyticsFilters } from '../types';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PnlVsDurationScatterPlot from '../components/analytics/PnlVsDurationScatterPlot';
import PerformanceByTimeChart from '../components/analytics/PerformanceByTimeChart';
import GroupedPerformanceTable from '../components/analytics/GroupedPerformanceTable';
import TradeStatsCard from '../components/analytics/TradeStatsCard';
import EquityCurveChart from '../components/analytics/EquityCurveChart';
import { TextField, Box, Button, Typography, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { getAnalyticsData } from '../api/analytics';

interface PnlSeriesPoint {
  date: number;
  equity: number;
}

interface PnlPerTradePoint {
  date: number;
  pnl: number;
}

interface WinLossCount {
  name: string;
  value: number;
}

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

  const COLORS_PIE = ['#4CAF50', '#f44336', '#FFBB28']; // Green for Wins, Red for Losses, Yellow for Break-even

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!analytics) {
    return null;
  }

  // Basic styling for layout
  const chartContainerStyle: React.CSSProperties = { marginBottom: '40px', padding: '20px', backgroundColor: '#333940', borderRadius: '8px'};
  const chartTitleStyle: React.CSSProperties = { color: '#61dafb', marginBottom: '15px'};

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Trading Analytics
      </Typography>

      {/* Summary Metrics */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h6" color="primary">Total Net P&L</Typography>
            <Typography variant="h4" color={analytics.totalRealizedNetPnl >= 0 ? 'success.main' : 'error.main'}>
              ${analytics.totalRealizedNetPnl.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h6" color="primary">Win Rate</Typography>
            <Typography variant="h4">
              {analytics.winRateOverall ? `${(analytics.winRateOverall * 100).toFixed(1)}%` : 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h6" color="primary">Max Drawdown</Typography>
            <Typography variant="h4" color="error.main">
              {analytics.maxDrawdownPercentage ? `${analytics.maxDrawdownPercentage.toFixed(1)}%` : 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h6" color="primary">Total Trades</Typography>
            <Typography variant="h4">
              {analytics.numberOfWinningTrades + analytics.numberOfLosingTrades + analytics.numberOfBreakEvenTrades}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Trade Statistics */}
      <TradeStatsCard analytics={analytics} />

      {/* Equity Curve & Drawdown */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <EquityCurveChart equityCurve={analytics.equityCurve} />
      </Paper>

      {/* Date Range Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Box>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null}
                onChange={handleDateChange('startDate')}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
          <Box>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null}
                onChange={handleDateChange('endDate')}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
          <Box>
            <Button variant="outlined" onClick={clearFilters} fullWidth>
              Clear Filters
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Cumulative P&L Chart */}
      {analytics.equityCurve && analytics.equityCurve.length > 0 && (
        <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>Cumulative Realized Net P&L</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.equityCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#ccc' }}/>
              <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} tick={{ fontSize: 10, fill: '#ccc' }}/>
              <Tooltip formatter={(value:number) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="equity" name="Cumulative Net P&L" stroke="#82ca9d" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* P&L Per Trade Bar Chart */}
      {analytics.pnlPerTradeSeries && analytics.pnlPerTradeSeries.length > 0 && (
         <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>Net P&L per Trade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.pnlPerTradeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555"/>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#ccc' }}/>
              <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} tick={{ fontSize: 10, fill: '#ccc' }}/>
              <Tooltip formatter={(value:number) => `$${value.toFixed(2)}`}/>
              <Legend />
              <Bar dataKey="pnl" name="Net P&L">
                {analytics.pnlPerTradeSeries.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.pnl >= 0 ? '#4CAF50' : '#f44336'} 
                    opacity={entry.isFullyClosed ? 1 : 0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Win/Loss Pie Chart */}
      {analytics.winLossBreakEvenCounts && analytics.winLossBreakEvenCounts.some(item => item.value > 0) && (
        <div style={chartContainerStyle}>
            <h3 style={chartTitleStyle}>Trade Outcomes</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={analytics.winLossBreakEvenCounts}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {analytics.winLossBreakEvenCounts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`${value} trades`, name]} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      )}
      
      {/* R-Multiple Histogram */}
      {analytics.rMultipleDistribution && analytics.rMultipleDistribution.length > 0 && (
        <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>R-Multiple Distribution</h3>
          <p>Average R-Multiple: {analytics.avgRMultiple !== null ? analytics.avgRMultiple.toFixed(2) : 'N/A'}</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.rMultipleDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555"/>
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#ccc' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#ccc' }}/>
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Number of Trades" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* P&L vs Duration Scatter Plot */}
      {analytics.pnlVsDurationSeries && analytics.pnlVsDurationSeries.length > 0 && (
        <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>P&L vs Trade Duration</h3>
          <PnlVsDurationScatterPlot data={analytics.pnlVsDurationSeries} />
        </div>
      )}

      {/* Grouped Performance Tables */}
      {analytics.pnlByAssetClass && analytics.pnlByAssetClass.length > 0 && (
        <div style={chartContainerStyle}>
          <GroupedPerformanceTable 
            title="Performance by Asset Class" 
            data={analytics.pnlByAssetClass} 
          />
        </div>
      )}

      {analytics.pnlByExchange && analytics.pnlByExchange.length > 0 && (
        <div style={chartContainerStyle}>
          <GroupedPerformanceTable 
            title="Performance by Exchange" 
            data={analytics.pnlByExchange} 
          />
        </div>
      )}

      {analytics.pnlByStrategy && analytics.pnlByStrategy.length > 0 && (
        <div style={chartContainerStyle}>
          <GroupedPerformanceTable 
            title="Performance by Strategy" 
            data={analytics.pnlByStrategy} 
          />
        </div>
      )}

      {analytics.pnlByEmotion && analytics.pnlByEmotion.length > 0 && (
        <div style={chartContainerStyle}>
          <GroupedPerformanceTable 
            title="Performance by Emotional State" 
            data={analytics.pnlByEmotion} 
          />
        </div>
      )}

      {/* Monthly Performance Chart */}
      {analytics.pnlByMonth && analytics.pnlByMonth.length > 0 && (
        <div style={chartContainerStyle}>
          <PerformanceByTimeChart
            title="Monthly Performance"
            data={analytics.pnlByMonth}
            dataKeyX="period"
            dataKeyY="totalNetPnl"
          />
        </div>
      )}

      {/* Daily Performance Chart */}
      {analytics.pnlByDayOfWeek && analytics.pnlByDayOfWeek.length > 0 && (
        <div style={chartContainerStyle}>
          <PerformanceByTimeChart
            title="Performance by Day of Week"
            data={analytics.pnlByDayOfWeek}
            dataKeyX="period"
            dataKeyY="totalNetPnl"
          />
        </div>
      )}

    </Box>
  );
};

export default AnalyticsPage;