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
import Grid from '@mui/material/Grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion } from 'framer-motion';

import type { AnalyticsFilters as StoreAnalyticsFilters } from '../types';
import { useAppStore } from '../stores/appStore';
import EnhancedMetricCard from '../components/dashboard/cards/EnhancedMetricCard'; // Your new master card
import EquityCurveChart from '../components/analytics/EquityCurveChart';

import PnlVsDurationScatterPlot from '../components/analytics/PnlVsDurationScatterPlot';
import GroupedPerformanceTabs from './GroupedPerformanceTabs';


// Chart components that might be used (ensure they are styled and accept real data)
import { DrawdownCurveChart } from '../components/charts/DrawdownCurveChart'; // Generic version
import { MonthlyReturnsChart } from '../components/charts/MonthlyReturnsChart'; // Generic version (R-Multiple)



import { colors, typography, borderRadius as br } from '../styles/design-tokens'; // Your design tokens

// Local type for filters, can extend or align with store's AnalyticsFilters
interface PageAnalyticsFilters extends StoreAnalyticsFilters {
  tickers?: string[]; // Example if you want to add more specific filters here
}

const AnalyticsPage: React.FC = (): React.ReactElement => {
  const { analytics, isLoadingAnalytics, analyticsError, fetchAnalyticsData } = useAppStore();

  const [filters, setFilters] = useState<PageAnalyticsFilters>({
    dateRange: { startDate: null, endDate: null },
    assetClasses: [],
    exchanges: [],
    strategies: [],
    tickers: [],
  });

  useEffect(() => {
    // Fetch initial analytics data without specific filters or based on default view
    fetchAnalyticsData({});
  }, [fetchAnalyticsData]);

  const handleFilterChange = <K extends keyof PageAnalyticsFilters>(
    filterKey: K,
    value: PageAnalyticsFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
    setFilters((prev: PageAnalyticsFilters) => {
      const prevRange = prev.dateRange ?? { startDate: null, endDate: null };
      return {
        ...prev,
        dateRange: {
          startDate: field === 'startDate' ? (date ? date.toISOString() : null) : prevRange.startDate,
          endDate: field === 'endDate' ? (date ? date.toISOString() : null) : prevRange.endDate,
        },
      };
    });
  };


  const handleMultiSelectChange = (
    filterKey: 'assetClasses' | 'exchanges' | 'strategies' | 'tickers'
  ) => (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    handleFilterChange(
      filterKey,
      typeof value === 'string' ? value.split(',') : (value as string[])
    );
  };


  const applyFilters = () => {
    fetchAnalyticsData(filters as Record<string, unknown>);
  };

  const clearFilters = () => {
    const initialFilters: PageAnalyticsFilters = {
      dateRange: { startDate: null, endDate: null },
      assetClasses: [],
      exchanges: [],
      strategies: [],
      tickers: [],
    };
    setFilters(initialFilters);
    fetchAnalyticsData({} as Record<string, unknown>); // Fetch with no filters
  };
  
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


  const renderAnalyticsContent = () => {
    if (isLoadingAnalytics) {
      return (
        <Grid container spacing={2.5}>
          {[...Array(8)].map((_, i) => ( // Skeletons for cards and charts
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: br.md, bgcolor: alpha(colors.surfaceVariant, 0.5) }} />
            </Grid>
          ))}
          <Grid item xs={12} lg={8}>
             <Skeleton variant="rectangular" height={400} sx={{ borderRadius: br.md, bgcolor: alpha(colors.surfaceVariant, 0.5) }} />
          </Grid>
           <Grid item xs={12} lg={4}>
             <Skeleton variant="rectangular" height={400} sx={{ borderRadius: br.md, bgcolor: alpha(colors.surfaceVariant, 0.5) }} />
          </Grid>
        </Grid>
      );
    }

    if (analyticsError) {
      return <Alert severity="error" sx={{ backgroundColor: colors.surface, color: colors.error, border: `1px solid ${colors.border}` }}>Error loading analytics: {analyticsError}</Alert>;
    }

    if (!analytics) {
      return <Typography sx={{color: colors.textSecondary, textAlign: 'center', py: 5}}>No analytics data to display. Adjust filters or log some trades.</Typography>;
    }

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Grid container spacing={2.5}> {/* Main content grid */}
          {/* KPIs / TradeStatsCard - could be a series of EnhancedMetricCards or a dedicated TradeStatsCard */}
          <Grid item xs={12}>
             {/* Replace with multiple EnhancedMetricCard or keep/restyle TradeStatsCard */}
             {/* Example using EnhancedMetricCard for key stats */}
            <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <EnhancedMetricCard title="Total Net P&L" value={formatCurrency(analytics.totalRealizedNetPnl)} changeColor={analytics.totalRealizedNetPnl >= 0 ? 'success' : 'error'} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <EnhancedMetricCard title="Win Rate" value={formatPercentage(analytics.winRateOverall ? analytics.winRateOverall * 100 : 0)} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <EnhancedMetricCard title="Avg Win" value={formatCurrency(analytics.avgWinPnlOverall)} />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={3}>
                    <EnhancedMetricCard title="Avg Loss" value={formatCurrency(analytics.avgLossPnlOverall)} changeColor="error"/>
                </Grid>
                 <Grid item xs={12} sm={12} md={6} lg={3}>
                    <EnhancedMetricCard title="Avg R-Multiple" value={formatNumber(analytics.avgRMultiple)} />
                </Grid>
            </Grid>
            {/* Or use the existing TradeStatsCard if it's preferred and restyled */}
            {/* <TradeStatsCard analytics={analytics} /> */}
          </Grid>

          {/* Equity Curve & Drawdown */}
          <Grid container spacing={2.5}>
  <Grid item xs={12} lg={7} sx={{ height: {xs: 350, lg: 450} }}>
    {analytics.equityCurve && analytics.equityCurve.length > 0 ? (
      <EnhancedMetricCard title="Cumulative Equity Curve" value="" minHeight="100%">
        <Box sx={{flexGrow: 1, height: 'calc(100% - 40px)'}}>
          <EquityCurveChart equityCurve={analytics.equityCurve} />
        </Box>
      </EnhancedMetricCard>
    ) : <Paper sx={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor: colors.surface, border: `1px solid ${colors.border}`}}><Typography sx={{color: colors.textSecondary}}>No Equity Data</Typography></Paper> }
  </Grid>
  <Grid item xs={12} lg={5} sx={{ height: {xs: 300, lg: 450} }}>
    {analytics.equityCurve && analytics.equityCurve.length > 0 ? (
      <EnhancedMetricCard title="Drawdown Curve" value="" minHeight="100%">
        <Box sx={{flexGrow: 1, height: 'calc(100% - 30px)'}}>
          {/* Using the generic DrawdownCurveChart, assuming it's styled */}
          <DrawdownCurveChart data={analytics.equityCurve.map(p => ({ date: p.date.toString(), value: ((p.equity / (analytics.equityCurve.reduce((max, cp) => cp.equity > max ? cp.equity : max, 0) || 1)) -1) * 100 }))} />
        </Box>
      </EnhancedMetricCard>
    ) : <Paper sx={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor: colors.surface, border: `1px solid ${colors.border}`}}><Typography sx={{color: colors.textSecondary}}>No Drawdown Data</Typography></Paper> }
  </Grid>
</Grid>

{/* P&L vs Duration & R-Multiple Histogram */}
<Grid item xs={12} sx={{ height: 450 }}>
  {analytics.pnlVsDurationSeries && analytics.pnlVsDurationSeries.length > 0 ? (
    <EnhancedMetricCard title="Net P&L vs Trade Duration" value="" minHeight="100%">
      <Box sx={{flexGrow: 1, height: 'calc(100%)'}}>
        <PnlVsDurationScatterPlot data={analytics.pnlVsDurationSeries} />
      </Box>
    </EnhancedMetricCard>
  ) : <Paper sx={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor: colors.surface, border: `1px solid ${colors.border}`}}><Typography sx={{color: colors.textSecondary}}>No P&L vs Duration Data</Typography></Paper> }
</Grid>
<Grid item xs={12} sx={{ height: 450 }}>
  {analytics.rMultipleDistribution && analytics.rMultipleDistribution.length > 0 ? (
    <EnhancedMetricCard title="R-Multiple Distribution" value="" minHeight="100%">
      <Box sx={{flexGrow: 1, height: 'calc(100%)'}}>
        {/* Using the generic MonthlyReturnsChart for R-Multiples, assuming styled */}
        <MonthlyReturnsChart data={analytics.rMultipleDistribution.map(d => ({ value: parseFloat(d.range.replace('R','')), count: d.count, range: d.range }))} />
      </Box>
    </EnhancedMetricCard>
  ) : <Paper sx={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor: colors.surface, border: `1px solid ${colors.border}`}}><Typography sx={{color: colors.textSecondary}}>No R-Multiple Data</Typography></Paper> }
</Grid>


          {/* Grouped Performance Tables */}
          <Grid item xs={12}>
            <GroupedPerformanceTabs analytics={analytics} />
          </Grid>
        </Grid>
      </motion.div>
    );
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 2.5 } }}> {/* Consistent page padding */}
      <Typography variant="h4" component="h1" sx={{ mb: 3, color: colors.textPrimary, fontWeight: typography.fontWeight.bold }}>
        Performance Analytics
      </Typography>

      {/* Filters Section */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: br.md, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null}
                onChange={handleDateChange('startDate')}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="End Date"
                value={filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null}
                onChange={handleDateChange('endDate')}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Strategy</InputLabel>
                <Select
                  multiple
                  value={filters.strategies || []}
                  onChange={handleMultiSelectChange('strategies') as Record<string, unknown>}
                  input={<OutlinedInput label="Strategy" />}
                  renderValue={(selected) => (selected as number[]).map(val => analytics?.availableStrategies?.find(s => s.strategy_id === val)?.strategy_name || val).join(', ')}
                >
                  {analytics?.availableStrategies?.map(s => <MenuItem key={s.strategy_id} value={s.strategy_id}>{s.strategy_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {/* Add more filters (Asset Class, Exchange, Ticker) similarly if needed */}
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="contained" onClick={applyFilters} disabled={isLoadingAnalytics} sx={{backgroundColor: colors.primary, '&:hover': {backgroundColor: alpha(colors.primary, 0.85)}}}>
                {isLoadingAnalytics ? <CircularProgress size={24} color="inherit"/> : "Apply Filters"}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="outlined" onClick={clearFilters} disabled={isLoadingAnalytics} sx={{borderColor: colors.border, color: colors.textSecondary}}>
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Paper>

      {renderAnalyticsContent()}
    </Box>
  );
};

export default AnalyticsPage;