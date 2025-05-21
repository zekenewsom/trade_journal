// File: zekenewsom-trade_journal/packages/react-app/src/views/AnalyticsPage.tsx
// New file for Stage 6

import React, { useState, useEffect } from 'react';
import { colors } from '/src/styles/design-tokens';
import type { AnalyticsData, AnalyticsFilters, TradeListView } from '../types';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import PnlVsDurationScatterPlot from '../components/analytics/PnlVsDurationScatterPlot';

import GroupedPerformanceTable from '../components/analytics/GroupedPerformanceTable';
import TradeStatsCard from '../components/analytics/TradeStatsCard';
import EquityCurveChart from '../components/analytics/EquityCurveChart';

import { getAnalyticsData } from '../api/analytics';



const AnalyticsPage: React.FC = (): React.ReactElement | null => {
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
          const sum = trades.reduce((acc: number, t: TradeListView) => {
  if (t && typeof t.unrealized_pnl === 'number') {
    return acc + t.unrealized_pnl;
  }
  return acc;
}, 0);
          setUnrealizedPnl(sum);
        }
      } catch {
        setUnrealizedPnl(null);
      }
    }
    fetchUnrealizedPnl();
  }, []);

  useEffect(() => {
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
    fetchAnalyticsData();
  }, [filters]);

  const handleDateChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
    setFilters((prev: AnalyticsFilters) => ({
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
      <div className="flex items-center justify-center min-h-[80vh] bg-surface">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-error/10 text-error border border-error rounded-md p-4">
          {error}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-on-background p-4 md:p-8">
      {/* Header Section */}
      <div className="mb-6 p-6 bg-surface rounded-2xl shadow-elevation-2 border border-card-stroke">
        <h1 className="text-3xl font-bold mb-1 text-on-surface">Trading Analytics</h1>
        <div className="text-primary">Comprehensive analysis of your trading performance</div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-variant rounded-2xl p-6 border border-card-stroke shadow-elevation-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-accent text-sm font-medium mb-1">Gross P&L</div>
            <div className="text-2xl font-bold text-on-surface">{analytics?.totalRealizedGrossPnl !== undefined ? `$${analytics.totalRealizedGrossPnl.toFixed(2)}` : 'N/A'}</div>
          </div>
        </div>
        <div className="bg-surface-variant rounded-2xl p-6 border border-card-stroke shadow-elevation-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-accent text-sm font-medium mb-1">Net P&L</div>
            <div className="text-2xl font-bold text-on-surface">{analytics?.totalRealizedNetPnl !== undefined ? `$${analytics.totalRealizedNetPnl.toFixed(2)}` : 'N/A'}</div>
          </div>
        </div>
        <div className="bg-surface-variant rounded-2xl p-6 border border-card-stroke shadow-elevation-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-accent text-sm font-medium mb-1">Unrealized P&L</div>
            <div className="text-2xl font-bold text-on-surface">{unrealizedPnl !== null && unrealizedPnl !== undefined ? `$${unrealizedPnl.toFixed(2)}` : 'N/A'}</div>
          </div>
        </div>
        <div className="bg-surface-variant rounded-2xl p-6 border border-card-stroke shadow-elevation-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-accent text-sm font-medium mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-on-surface">{analytics?.winRateOverall !== undefined && analytics?.winRateOverall !== null ? `${(analytics.winRateOverall * 100).toFixed(1)}%` : 'N/A'}</div>
          </div>
        </div>
      </div>
      {/* Trade Statistics Card */}
      <div className="mb-8">
        <TradeStatsCard analytics={analytics} />
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-surface-variant rounded-2xl p-6 border border-card-stroke shadow-elevation-1 mb-8">
        <div className="flex flex-col">
          <label htmlFor="start-date" className="text-sm font-medium text-on-surface mb-1">Start Date</label>
          <input
            id="start-date"
            type="date"
            className="bg-background text-on-background border border-card-stroke rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={filters.dateRange?.startDate ? filters.dateRange.startDate.slice(0, 10) : ''}
            onChange={e => handleDateChange('startDate')(e.target.value ? new Date(e.target.value) : null)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="end-date" className="text-sm font-medium text-on-surface mb-1">End Date</label>
          <input
            id="end-date"
            type="date"
            className="bg-background text-on-background border border-card-stroke rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={filters.dateRange?.endDate ? filters.dateRange.endDate.slice(0, 10) : ''}
            onChange={e => handleDateChange('endDate')(e.target.value ? new Date(e.target.value) : null)}
          />
        </div>
        <button
          type="button"
          onClick={clearFilters}
          className="ml-0 md:ml-4 mt-2 md:mt-6 px-6 py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
        >
          Reset Filters
        </button>
      </div>
      {/* Performance Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {analytics.pnlByAssetClass && analytics.pnlByAssetClass.length > 0 && (
          <div className="bg-surface-variant rounded-2xl p-6 border border-card-stroke shadow-elevation-1">
            <GroupedPerformanceTable
              title="Performance by Asset Class"
              data={analytics.pnlByAssetClass}
            />
          </div>
        )}
        {analytics.pnlByExchange && analytics.pnlByExchange.length > 0 && (
          <div className="bg-surface-variant rounded-2xl p-6 border border-card-stroke shadow-elevation-1">
            <GroupedPerformanceTable
              title="Performance by Exchange"
              data={analytics.pnlByExchange}
            />
          </div>
        )}
        {analytics.pnlByStrategy && analytics.pnlByStrategy.length > 0 && (
          <div className="bg-surface-variant rounded-2xl p-6 border border-card-stroke shadow-elevation-1">
            <GroupedPerformanceTable
              title="Performance by Strategy"
              data={analytics.pnlByStrategy}
            />
          </div>
        )}
        {analytics.pnlByEmotion && analytics.pnlByEmotion.length > 0 && (
          <div className="bg-surface-variant rounded-2xl p-6 border border-card-stroke shadow-elevation-1">
            <GroupedPerformanceTable
              title="Performance by Emotional State"
              data={analytics.pnlByEmotion}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;