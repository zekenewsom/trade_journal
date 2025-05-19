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
      <div className="flex items-center justify-center min-h-[80vh]">
        <CircularProgress className="text-primary-action" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-pure-dark text-white p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Trading Analytics</h1>
        <p className="text-gray-400">Comprehensive analysis of your trading performance</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card-stroke rounded-lg p-6 border border-gray-800">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Net P&L</h3>
          <p className={`text-2xl font-bold ${analytics.totalRealizedNetPnl >= 0 ? 'text-positive' : 'text-negative'}`}>
            ${analytics.totalRealizedNetPnl.toFixed(2)}
          </p>
        </div>
        <div className="bg-card-stroke rounded-lg p-6 border border-gray-800">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Win Rate</h3>
          <p className="text-2xl font-bold text-white">
            {analytics.winRateOverall ? `${(analytics.winRateOverall * 100).toFixed(1)}%` : 'N/A'}
          </p>
        </div>
        <div className="bg-card-stroke rounded-lg p-6 border border-gray-800">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Max Drawdown</h3>
          <p className="text-2xl font-bold text-negative">
            {analytics.maxDrawdownPercentage ? `${analytics.maxDrawdownPercentage.toFixed(1)}%` : 'N/A'}
          </p>
        </div>
        <div className="bg-card-stroke rounded-lg p-6 border border-gray-800">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Trades</h3>
          <p className="text-2xl font-bold text-white">
            {analytics.numberOfWinningTrades + analytics.numberOfLosingTrades + analytics.numberOfBreakEvenTrades}
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-card-stroke rounded-lg p-6 border border-gray-800 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null}
                onChange={handleDateChange('startDate')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    className: "bg-gray-900"
                  }
                }}
              />
            </LocalizationProvider>
          </div>
          <div>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null}
                onChange={handleDateChange('endDate')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    className: "bg-gray-900"
                  }
                }}
              />
            </LocalizationProvider>
          </div>
          <div>
            <Button 
              variant="outlined" 
              onClick={clearFilters} 
              fullWidth
              className="border-primary-action text-primary-action hover:bg-primary-action hover:text-white"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Equity Curve Chart */}
        <div className="bg-card-stroke rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-white">Equity Curve</h3>
          <div className="h-[400px]">
            <EquityCurveChart equityCurve={analytics.equityCurve} />
          </div>
        </div>

        {/* P&L Per Trade Chart */}
        <div className="bg-card-stroke rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-white">P&L Distribution</h3>
          <div className="h-[400px]">
            {analytics.pnlPerTradeSeries && analytics.pnlPerTradeSeries.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.pnlPerTradeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2B2D" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip 
                    formatter={(value:number) => [`$${value.toFixed(2)}`, 'P&L']}
                    contentStyle={{ backgroundColor: '#1A1B1D', border: '1px solid #2A2B2D' }}
                  />
                  <Bar dataKey="pnl" name="P&L">
                    {analytics.pnlPerTradeSeries.map((entry, index) => (
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
          </div>
        </div>
      </div>

      {/* Trade Statistics */}
      <div className="bg-card-stroke rounded-lg p-6 border border-gray-800 mb-8">
        <TradeStatsCard analytics={analytics} />
      </div>

      {/* Win/Loss Distribution */}
      <div className="bg-card-stroke rounded-lg p-6 border border-gray-800 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-white">Trade Outcomes</h3>
        <div className="h-[400px]">
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
        </div>
      </div>

      {/* R-Multiple Distribution */}
      {analytics.rMultipleDistribution && analytics.rMultipleDistribution.length > 0 && (
        <div className="bg-card-stroke rounded-lg p-6 border border-gray-800 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-white">R-Multiple Distribution</h3>
          <p className="text-gray-400 mb-4">Average R-Multiple: {analytics.avgRMultiple !== null ? analytics.avgRMultiple.toFixed(2) : 'N/A'}</p>
          <div className="h-[400px]">
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
          </div>
        </div>
      )}

      {/* P&L vs Duration Scatter Plot */}
      {analytics.pnlVsDurationSeries && analytics.pnlVsDurationSeries.length > 0 && (
        <div className="bg-card-stroke rounded-lg p-6 border border-gray-800 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-white">P&L vs Trade Duration</h3>
          <div className="h-[400px]">
            <PnlVsDurationScatterPlot data={analytics.pnlVsDurationSeries} />
          </div>
        </div>
      )}

      {/* Performance Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Performance by Asset Class */}
        {analytics.pnlByAssetClass && analytics.pnlByAssetClass.length > 0 && (
          <div className="bg-card-stroke rounded-lg p-6 border border-gray-800">
            <GroupedPerformanceTable 
              title="Performance by Asset Class" 
              data={analytics.pnlByAssetClass} 
            />
          </div>
        )}

        {/* Performance by Exchange */}
        {analytics.pnlByExchange && analytics.pnlByExchange.length > 0 && (
          <div className="bg-card-stroke rounded-lg p-6 border border-gray-800">
            <GroupedPerformanceTable 
              title="Performance by Exchange" 
              data={analytics.pnlByExchange} 
            />
          </div>
        )}

        {/* Performance by Strategy */}
        {analytics.pnlByStrategy && analytics.pnlByStrategy.length > 0 && (
          <div className="bg-card-stroke rounded-lg p-6 border border-gray-800">
            <GroupedPerformanceTable 
              title="Performance by Strategy" 
              data={analytics.pnlByStrategy} 
            />
          </div>
        )}

        {/* Performance by Emotional State */}
        {analytics.pnlByEmotion && analytics.pnlByEmotion.length > 0 && (
          <div className="bg-card-stroke rounded-lg p-6 border border-gray-800">
            <GroupedPerformanceTable 
              title="Performance by Emotional State" 
              data={analytics.pnlByEmotion} 
            />
          </div>
        )}
      </div>

      {/* Time-based Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Performance */}
        {analytics.pnlByMonth && analytics.pnlByMonth.length > 0 && (
          <div className="bg-card-stroke rounded-lg p-6 border border-gray-800">
            <PerformanceByTimeChart
              title="Monthly Performance"
              data={analytics.pnlByMonth}
              dataKeyX="period"
              dataKeyY="totalNetPnl"
            />
          </div>
        )}

        {/* Daily Performance */}
        {analytics.pnlByDayOfWeek && analytics.pnlByDayOfWeek.length > 0 && (
          <div className="bg-card-stroke rounded-lg p-6 border border-gray-800">
            <PerformanceByTimeChart
              title="Performance by Day of Week"
              data={analytics.pnlByDayOfWeek}
              dataKeyX="period"
              dataKeyY="totalNetPnl"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;