// File: zekenewsom-trade_journal/packages/react-app/src/views/AnalyticsPage.tsx
// New file for Stage 6

import React, { useState, useEffect } from 'react';
import { colors } from '/src/styles/design-tokens';
import { Box, Button, MenuItem, Select, FormControl, InputLabel, OutlinedInput, Chip, TextField, CircularProgress, Alert } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import type { AnalyticsData } from '../types';
import { useAppStore } from '../stores/appStore';
// Extend AnalyticsFilters locally to support tickers
interface AnalyticsFilters {
  dateRange?: {
    startDate: string | null;
    endDate: string | null;
  };
  assetClasses?: string[];
  exchanges?: string[];
  strategies?: number[];
  tickers?: string[];
} 
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import KeyMetricCard from '../components/dashboard/cards/KeyMetricCard';
import EquityCurveChart from '../components/analytics/EquityCurveChart';
import { DrawdownCurveChart } from '../components/charts/DrawdownCurveChart';
import { MonthlyReturnsChart } from '../components/charts/MonthlyReturnsChart';
import PnlVsDurationScatterPlot from '../components/analytics/PnlVsDurationScatterPlot';
import TradeStatsCard from '../components/analytics/TradeStatsCard';
import { Typography } from '@mui/material';
// import { RiskScatterChart } from '../components/charts/RiskScatterChart'; // Uncomment if data available
import PerformanceByTimeChart from '../components/analytics/PerformanceByTimeChart';
import GroupedPerformanceTabs from './GroupedPerformanceTabs';
import { Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { RiskScatterChart } from '../components/charts/RiskScatterChart';
import { DailyHeatmapCalendar } from '../components/charts/DailyHeatmapCalendar';
// MonthlyReturnsChart already imported above as a named import, remove duplicate.



const AnalyticsPage: React.FC = (): React.ReactElement | null => {
  const { analytics, isLoadingAnalytics, analyticsError, fetchAnalyticsData } = useAppStore();
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      startDate: null,
      endDate: null
    }
  });

  useEffect(() => {
    fetchAnalyticsData(filters as Record<string, unknown>);
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

  // Main Render
  return (
    <Box sx={{ width: '100%', maxWidth: 1440, mx: 'auto', p: { xs: 1, md: 3 } }}>
      {/* Filters Section - MUI DatePickers and Selects */}
      <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: 'var(--color-surface)', boxShadow: 1 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* Date Range Filters */}
            <DatePicker
              label="Start Date"
              value={filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null}
              onChange={handleDateChange('startDate')}
              slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
            />
            <DatePicker
              label="End Date"
              value={filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null}
              onChange={handleDateChange('endDate')}
              slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
            />
            {/* Strategy Filter */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="strategy-filter-label">Strategy</InputLabel>
              <Select
                labelId="strategy-filter-label"
                multiple
                value={filters.strategies || []}
                onChange={e => setFilters(f => ({ ...f, strategies: e.target.value as number[] }))}
                input={<OutlinedInput label="Strategy" />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as number[]).map(val => {
                      const name = analytics?.availableStrategies?.find(s => s.strategy_id === val)?.strategy_name || val;
                      return <Chip key={val} label={name} size="small" />;
                    })}
                  </Box>
                )}
              >
                {analytics?.availableStrategies?.map(strategy => (
                  <MenuItem key={strategy.strategy_id} value={strategy.strategy_id}>
                    {strategy.strategy_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Asset Class Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="asset-class-filter-label">Asset Class</InputLabel>
              <Select
                labelId="asset-class-filter-label"
                multiple
                value={filters.assetClasses || []}
                onChange={e => setFilters(f => ({ ...f, assetClasses: e.target.value as string[] }))}
                input={<OutlinedInput label="Asset Class" />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map(val => <Chip key={val} label={val} size="small" />)}
                  </Box>
                )}
              >
                {analytics?.availableAssetClasses?.map(assetClass => (
                  <MenuItem key={assetClass} value={assetClass}>
                    {assetClass}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Exchange Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="exchange-filter-label">Exchange</InputLabel>
              <Select
                labelId="exchange-filter-label"
                multiple
                value={filters.exchanges || []}
                onChange={e => setFilters(f => ({ ...f, exchanges: e.target.value as string[] }))}
                input={<OutlinedInput label="Exchange" />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map(val => <Chip key={val} label={val} size="small" />)}
                  </Box>
                )}
              >
                {analytics?.availableExchanges?.map(exchange => (
                  <MenuItem key={exchange} value={exchange}>
                    {exchange}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Ticker Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="ticker-filter-label">Ticker</InputLabel>
              <Select
                labelId="ticker-filter-label"
                multiple
                value={filters.tickers || []}
                onChange={e => setFilters(f => ({ ...f, tickers: e.target.value as string[] }))}
                input={<OutlinedInput label="Ticker" />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map(val => <Chip key={val} label={val} size="small" />)}
                  </Box>
                )}
              >
                {analytics?.availableTickers?.map(ticker => (
                  <MenuItem key={ticker} value={ticker}>
                    {ticker}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Apply Filters Button */}
            <Button
              variant="contained"
              color="primary"
              sx={{ ml: 2, alignSelf: 'center', height: 40 }}
              onClick={() => fetchAnalyticsData(filters as Record<string, unknown>)}
              disabled={isLoadingAnalytics}
            >
              {isLoadingAnalytics ? <CircularProgress size={20} /> : 'Apply Filters'}
            </Button>
            {/* Clear Filters Button */}
            <Button
              variant="outlined"
              color="secondary"
              sx={{ ml: 1, alignSelf: 'center', height: 40 }}
              onClick={clearFilters}
              disabled={isLoadingAnalytics}
            >
              Clear Filters
            </Button>
          </Box>
        </LocalizationProvider>
        {/* Error State */}
        {analyticsError && (
          <Alert severity="error" sx={{ mt: 2 }}>{analyticsError}</Alert>
        )}
      </Box>
      {/* Loading State */}
      {isLoadingAnalytics && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      )}

      {/* KPIs Section */}
import TradeStatsCard from '../components/analytics/TradeStatsCard';

      <Box sx={{ mb: 4 }}>
        {/* Consolidated Stats Card */}
        {analytics && <Box sx={{ mb: 2 }}><TradeStatsCard analytics={analytics} /></Box>}
        {/* Individual Metric Cards */}
        <Box className="grid grid-cols-12 gap-4">
          <KeyMetricCard
            title="Net P&L"
            value={analytics?.totalRealizedNetPnl != null ? analytics.totalRealizedNetPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '--'}
            change={''}
            trendData={analytics?.equityCurve ? analytics.equityCurve.map(pt => ({ value: pt.equity })) : undefined}
          />
          <KeyMetricCard
            title="Win Rate"
            value={analytics?.winRateOverall != null ? `${analytics.winRateOverall.toFixed(1)}%` : '--'}
            change={''}
            trendData={undefined}
          />
          <KeyMetricCard
            title="Max Drawdown %"
            value={analytics?.maxDrawdownPercentage != null ? `${analytics.maxDrawdownPercentage.toFixed(2)}%` : '--'}
            change={''}
            trendData={undefined}
          />
          <KeyMetricCard
            title="Profit Factor"
            value={analytics?.totalRealizedGrossPnl && analytics?.totalFeesPaidOnClosedPortions
              ? ((analytics.totalRealizedGrossPnl - analytics.totalFeesPaidOnClosedPortions) / Math.abs(analytics.totalFeesPaidOnClosedPortions)).toFixed(2)
              : '--'}
            change={''}
            trendData={undefined}
          />
          <KeyMetricCard
            title="Avg R-Multiple"
            value={analytics?.avgRMultiple != null ? analytics.avgRMultiple.toFixed(2) : '--'}
            change={''}
            trendData={undefined}
          />
        </Box>
      </Box>

      {/* Main Charts & Visualizations */}
      <Box className="grid grid-cols-12 gap-4">
        {/* Equity Curve */}
        <Box className="col-span-12 lg:col-span-8">
          {isLoadingAnalytics ? (
            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3, bgcolor: 'var(--color-surface)' }} />
          ) : analytics?.equityCurve && analytics.equityCurve.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <EquityCurveChart equityCurve={analytics.equityCurve} />
            </motion.div>
          ) : (
            <Box className="flex items-center justify-center h-full min-h-[200px] bg-surface rounded-2xl">
              <span className="text-on-surface-variant">No equity curve data available.</span>
            </Box>
          )}
        </Box>
        {/* Drawdown Curve */}
        <Box className="col-span-12 lg:col-span-4">
          {isLoadingAnalytics ? (
            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3, bgcolor: 'var(--color-surface)' }} />
          ) : analytics?.equityCurve && analytics.equityCurve.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <DrawdownCurveChart data={analytics.equityCurve.map(pt => ({ date: String(pt.date), value: pt.equity }))} />
            </motion.div>
          ) : (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
              <Typography variant="body2" color="text.secondary">No drawdown data available.</Typography>
            </Box>
          )}
        </Box>
        {/* Monthly Returns Histogram */}
        <Box className="col-span-12 md:col-span-6">
          {isLoadingAnalytics ? (
            <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 3, bgcolor: 'var(--color-surface)' }} />
          ) : analytics?.pnlByMonth && analytics.pnlByMonth.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
              <MonthlyReturnsChart data={analytics.pnlByMonth.map(pt => ({ value: pt.totalNetPnl, count: pt.tradeCount }))} />
            </motion.div>
          ) : (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
              <Typography variant="body2" color="text.secondary">No monthly returns data available.</Typography>
            </Box>
          )}
        </Box>
        {/* PnL vs Duration Scatter Plot */}
        <Box className="col-span-12 md:col-span-6">
          {isLoadingAnalytics ? (
            <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 3, bgcolor: 'var(--color-surface)' }} />
          ) : analytics?.pnlVsDurationSeries && analytics.pnlVsDurationSeries.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
              <PnlVsDurationScatterPlot data={analytics.pnlVsDurationSeries} />
            </motion.div>
          ) : (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
              <Typography variant="body2" color="text.secondary">No PnL vs Duration data available.</Typography>
            </Box>
          )}
        </Box>
        {/* Risk Scatter Chart */}
        <Box className="col-span-12 md:col-span-6">
          {isLoadingAnalytics ? (
            <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 3, bgcolor: 'var(--color-surface)' }} />
          ) : (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
              <RiskScatterChart />
            </motion.div>
          )}
        </Box>
        {/* Performance By Month Chart */}
        <Box className="col-span-12 md:col-span-6">
          {isLoadingAnalytics ? (
            <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 3, bgcolor: 'var(--color-surface)' }} />
          ) : analytics?.pnlByMonth && analytics.pnlByMonth.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
              <PerformanceByTimeChart
                title="P&L by Month"
                data={analytics.pnlByMonth}
                dataKeyX="period"
                dataKeyY="totalNetPnl"
              />
            </motion.div>
          ) : (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
              <Typography variant="body2" color="text.secondary">No P&L by Month data available.</Typography>
            </Box>
          )}
        </Box>
        {/* Performance By Day of Week Chart */}
        <Box className="col-span-12 md:col-span-6">
          {isLoadingAnalytics ? (
            <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 3, bgcolor: 'var(--color-surface)' }} />
          ) : analytics?.pnlByDayOfWeek && analytics.pnlByDayOfWeek.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }}>
              <PerformanceByTimeChart
                title="P&L by Day of Week"
                data={analytics.pnlByDayOfWeek}
                dataKeyX="period"
                dataKeyY="totalNetPnl"
              />
            </motion.div>
          ) : (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
              <Typography variant="body2" color="text.secondary">No P&L by Day of Week data available.</Typography>
            </Box>
          )}
        </Box>
        {/* Daily Heatmap Calendar */}
        <Box className="col-span-12">
          {isLoadingAnalytics ? (
            <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3, bgcolor: 'var(--color-surface)' }} />
          ) : (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.7 }}>
              <DailyHeatmapCalendar />
            </motion.div>
          )}
        </Box>
      </Box>

      {/* Grouped Performance Tables Section (Tabs) */}
      <Box sx={{ mt: 6 }}>
        <GroupedPerformanceTabs analytics={analytics} />
      </Box>
    </Box>
  );
}

export default AnalyticsPage;