// packages/react-app/src/views/AnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Skeleton,
  alpha,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion } from 'framer-motion';

import type { AnalyticsFilters as StoreAnalyticsFilters } from '../types';
import { useAppStore } from '../stores/appStore';
import EnhancedMetricCard from '../components/dashboard/cards/EnhancedMetricCard';
import EquityCurveChart from '../components/analytics/EquityCurveChart';
import PnlVsDurationScatterPlot from '../components/analytics/PnlVsDurationScatterPlot';
import GroupedPerformanceTabs from './GroupedPerformanceTabs';
import { DrawdownCurveChart } from '../components/charts/DrawdownCurveChart';
import { MonthlyReturnsChart } from '../components/charts/MonthlyReturnsChart';
import InstitutionalRiskMetrics from '../components/analytics/InstitutionalRiskMetrics';
import PortfolioConcentrationAnalysis from '../components/analytics/PortfolioConcentrationAnalysis';
import VaRStressTestingAnalysis from '../components/analytics/VaRStressTestingAnalysis';

import { colors, typography, borderRadius as br } from '../styles/design-tokens';

// Local type for filters
interface PageAnalyticsFilters extends StoreAnalyticsFilters {
  tickers?: string[];
}

const AnalyticsPage: React.FC = (): React.ReactElement => {
  const { analytics, isLoadingAnalytics, analyticsError, fetchAnalyticsData } = useAppStore();

  const [filters, setFilters] = useState<PageAnalyticsFilters>({
    dateRange: { startDate: null, endDate: null },
    assetClasses: [],
    exchanges: [],
    strategies: [],
    tickers: []
  });

  // Formatting functions
  const formatCurrency = (value: number | null | undefined, showSign = false): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    const sign = value > 0 && showSign ? '+' : '';
    return `${sign}${value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
  };

  const formatPercentage = (value: number | null | undefined, decimals = 1): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return `${value.toFixed(decimals)}%`;
  };

  const formatNumber = (value: number | null | undefined, decimals = 2): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return value.toFixed(decimals);
  };

  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData(filters);
  }, [fetchAnalyticsData, filters]);

  // Handle filter changes
  const handleFilterChange = <K extends keyof PageAnalyticsFilters>(filterType: K, value: PageAnalyticsFilters[K]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        startDate: field === 'startDate' ? (value ? value.toISOString().split('T')[0] : null) : prev.dateRange?.startDate ?? null,
        endDate: field === 'endDate' ? (value ? value.toISOString().split('T')[0] : null) : prev.dateRange?.endDate ?? null
      }
    }));
  };

  const handleArrayFilterChange = <K extends keyof PageAnalyticsFilters>(filterType: K) => (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      [filterType]: typeof value === 'string' ? (value.split(',') as PageAnalyticsFilters[K]) : (value as PageAnalyticsFilters[K])
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: { startDate: null, endDate: null },
      assetClasses: [],
      exchanges: [],
      strategies: [],
      tickers: []
    });
  };

  // Render loading state
  if (isLoadingAnalytics) {
    return (
      <Box sx={{ p: 3 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={150}
              sx={{ borderRadius: br.md, bgcolor: alpha(colors.surfaceVariant, 0.5) }}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton
            variant="rectangular"
            height={400}
            sx={{ borderRadius: br.md, bgcolor: alpha(colors.surfaceVariant, 0.5) }}
          />
          <Skeleton
            variant="rectangular"
            height={400}
            sx={{ borderRadius: br.md, bgcolor: alpha(colors.surfaceVariant, 0.5) }}
          />
        </div>
      </Box>
    );
  }

  // Render error state
  if (analyticsError) {
    return (
      <Alert
        severity="error"
        sx={{
          backgroundColor: colors.surface,
          color: colors.error,
          border: `1px solid ${colors.border}`,
          m: 3
        }}
      >
        Error loading analytics: {analyticsError}
      </Alert>
    );
  }

  // Render no data state
  if (!analytics) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ color: colors.textSecondary, textAlign: 'center', py: 5 }}>
          No analytics data to display. Adjust filters or log some trades.
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box sx={{ p: 3 }}>
        {/* Filters Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 4, backgroundColor: colors.surface }}>
          <Typography variant="h6" sx={{ mb: 3, color: colors.textPrimary }}>
            Filters & Date Range
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null}
                onChange={(date) => handleDateRangeChange('startDate', date)}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null}
                onChange={(date) => handleDateRangeChange('endDate', date)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </LocalizationProvider>

            <FormControl size="small">
              <InputLabel>Asset Classes</InputLabel>
              <Select
                multiple
                value={filters.assetClasses || []}
                onChange={handleArrayFilterChange('assetClasses')}
                input={<OutlinedInput label="Asset Classes" />}
              >
                {analytics.availableAssetClasses?.map(assetClass => (
                  <MenuItem key={assetClass} value={assetClass}>
                    {assetClass}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Exchanges</InputLabel>
              <Select
                multiple
                value={filters.exchanges || []}
                onChange={handleArrayFilterChange('exchanges')}
                input={<OutlinedInput label="Exchanges" />}
              >
                {analytics.availableExchanges?.map(exchange => (
                  <MenuItem key={exchange} value={exchange}>
                    {exchange}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outlined"
              onClick={resetFilters}
              size="small"
            >
              Reset
            </Button>
          </div>
        </Paper>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <EnhancedMetricCard
            title="Total Net P&L"
            value={formatCurrency(analytics.totalRealizedNetPnl)}
            changeColor={analytics.totalRealizedNetPnl && analytics.totalRealizedNetPnl >= 0 ? 'success' : 'error'}
          />
          <EnhancedMetricCard
            title="Win Rate"
            value={formatPercentage(analytics.winRateOverall)}
            changeText={`${analytics.numberOfWinningTrades}W / ${analytics.numberOfLosingTrades}L`}
          />
          <EnhancedMetricCard
            title="Total Trades"
            value={analytics.totalFullyClosedTrades?.toString() || '0'}
            changeText="Closed positions"
          />
          <EnhancedMetricCard
            title="Avg R-Multiple"
            value={formatNumber(analytics.avgRMultiple)}
            changeColor={analytics.avgRMultiple && analytics.avgRMultiple > 1 ? 'success' : 'neutral'}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Paper elevation={1} sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Equity Curve
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              {analytics.equityCurve && analytics.equityCurve.length > 0 ? (
                <EquityCurveChart equityCurve={analytics.equityCurve} />
              ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                  No equity curve data available
                </Typography>
              )}
            </Box>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              P&L vs Duration
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              {analytics.pnlVsDurationSeries && analytics.pnlVsDurationSeries.length > 0 ? (
                <PnlVsDurationScatterPlot data={analytics.pnlVsDurationSeries} />
              ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                  No P&L vs Duration data available
                </Typography>
              )}
            </Box>
          </Paper>
        </div>

        {/* Monthly Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Paper elevation={1} sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Monthly Returns
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              {analytics.pnlByMonth && analytics.pnlByMonth.length > 0 ? (
                <MonthlyReturnsChart data={analytics.pnlByMonth} />
              ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                  No monthly returns data available
                </Typography>
              )}
            </Box>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              R-Multiple Distribution
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              {analytics.rMultipleDistribution && analytics.rMultipleDistribution.length > 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    {analytics.rMultipleDistribution.map((item, index) => (
                      <div key={index} className="mb-2">
                        <div className="text-lg font-semibold">{item.range}</div>
                        <div className="text-sm text-gray-500">{item.count} trades</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                  No R-Multiple distribution data available
                </Typography>
              )}
            </Box>
          </Paper>
        </div>

        {/* Grouped Performance */}
        <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Performance by Category
          </Typography>
          <GroupedPerformanceTabs analytics={analytics} />
        </Paper>

        {/* Institutional-Level Risk Metrics */}
        <Box sx={{ mb: 4 }}>
          <InstitutionalRiskMetrics analytics={analytics} />
        </Box>

        {/* Portfolio Concentration Analysis */}
        <Box sx={{ mb: 4 }}>
          <PortfolioConcentrationAnalysis analytics={analytics} />
        </Box>

        {/* Value at Risk & Stress Testing */}
        <Box sx={{ mb: 4 }}>
          <VaRStressTestingAnalysis analytics={analytics} />
        </Box>
      </Box>
    </motion.div>
  );
};

export default AnalyticsPage;