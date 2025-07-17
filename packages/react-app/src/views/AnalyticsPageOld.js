import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/react-app/src/views/AnalyticsPage.tsx
import { useState, useEffect } from 'react';
import { Box, Button, MenuItem, Select, FormControl, InputLabel, OutlinedInput, CircularProgress, Alert, Typography, Paper, Skeleton, alpha, } from '@mui/material';
// Grid replaced with CSS Grid layout
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import EnhancedMetricCard from '../components/dashboard/cards/EnhancedMetricCard'; // Your new master card
import EquityCurveChart from '../components/analytics/EquityCurveChart';
import PnlVsDurationScatterPlot from '../components/analytics/PnlVsDurationScatterPlot';
import GroupedPerformanceTabs from './GroupedPerformanceTabs';
// Chart components that might be used (ensure they are styled and accept real data)
import { DrawdownCurveChart } from '../components/charts/DrawdownCurveChart'; // Generic version
import { MonthlyReturnsChart } from '../components/charts/MonthlyReturnsChart'; // Generic version (R-Multiple)
import { colors, typography, borderRadius as br } from '../styles/design-tokens'; // Your design tokens
const AnalyticsPage = () => {
    const { analytics, isLoadingAnalytics, analyticsError, fetchAnalyticsData } = useAppStore();
    const [filters, setFilters] = useState({
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
    const handleFilterChange = (filterKey, value) => {
        setFilters(prev => ({ ...prev, [filterKey]: value }));
    };
    const handleDateChange = (field) => (date) => {
        setFilters((prev) => {
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
    const handleMultiSelectChange = (filterKey) => (event) => {
        const { target: { value }, } = event;
        handleFilterChange(filterKey, typeof value === 'string' ? value.split(',') : value);
    };
    const applyFilters = () => {
        fetchAnalyticsData(filters);
    };
    const clearFilters = () => {
        const initialFilters = {
            dateRange: { startDate: null, endDate: null },
            assetClasses: [],
            exchanges: [],
            strategies: [],
            tickers: [],
        };
        setFilters(initialFilters);
        fetchAnalyticsData({}); // Fetch with no filters
    };
    const formatCurrency = (value, showSign = false) => {
        if (value === null || value === undefined || isNaN(value))
            return 'N/A';
        const sign = value > 0 && showSign ? '+' : '';
        return `${sign}${value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
    };
    const formatPercentage = (value, decimals = 1) => {
        if (value === null || value === undefined || isNaN(value))
            return 'N/A';
        return `${value.toFixed(decimals)}%`;
    };
    const formatNumber = (value, decimals = 2) => {
        if (value === null || value === undefined || isNaN(value))
            return 'N/A';
        return value.toFixed(decimals);
    };
    const renderAnalyticsContent = () => {
        if (isLoadingAnalytics) {
            return (_jsxs(Grid, { container: true, spacing: 2.5, children: [[...Array(8)].map((_, i) => ( // Skeletons for cards and charts
                    _jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 3, children: _jsx(Skeleton, { variant: "rectangular", height: 150, sx: { borderRadius: br.md, bgcolor: alpha(colors.surfaceVariant, 0.5) } }) }, i))), _jsx(Grid, { item: true, xs: 12, lg: 8, children: _jsx(Skeleton, { variant: "rectangular", height: 400, sx: { borderRadius: br.md, bgcolor: alpha(colors.surfaceVariant, 0.5) } }) }), _jsx(Grid, { item: true, xs: 12, lg: 4, children: _jsx(Skeleton, { variant: "rectangular", height: 400, sx: { borderRadius: br.md, bgcolor: alpha(colors.surfaceVariant, 0.5) } }) })] }));
        }
        if (analyticsError) {
            return _jsxs(Alert, { severity: "error", sx: { backgroundColor: colors.surface, color: colors.error, border: `1px solid ${colors.border}` }, children: ["Error loading analytics: ", analyticsError] });
        }
        if (!analytics) {
            return _jsx(Typography, { sx: { color: colors.textSecondary, textAlign: 'center', py: 5 }, children: "No analytics data to display. Adjust filters or log some trades." });
        }
        return (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5 }, children: _jsxs(Grid, { container: true, spacing: 2.5, children: [" ", _jsx(Grid, { item: true, xs: 12, children: _jsxs(Grid, { container: true, spacing: 2.5, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 3, children: _jsx(EnhancedMetricCard, { title: "Total Net P&L", value: formatCurrency(analytics.totalRealizedNetPnl), changeColor: analytics.totalRealizedNetPnl >= 0 ? 'success' : 'error' }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 3, children: _jsx(EnhancedMetricCard, { title: "Win Rate", value: formatPercentage(analytics.winRateOverall ? analytics.winRateOverall * 100 : 0) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 3, children: _jsx(EnhancedMetricCard, { title: "Avg Win", value: formatCurrency(analytics.avgWinPnlOverall) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 6, lg: 3, children: _jsx(EnhancedMetricCard, { title: "Avg Loss", value: formatCurrency(analytics.avgLossPnlOverall), changeColor: "error" }) }), _jsx(Grid, { item: true, xs: 12, sm: 12, md: 6, lg: 3, children: _jsx(EnhancedMetricCard, { title: "Avg R-Multiple", value: formatNumber(analytics.avgRMultiple) }) })] }) }), _jsxs(Grid, { container: true, spacing: 2.5, children: [_jsx(Grid, { item: true, xs: 12, lg: 7, sx: { height: { xs: 350, lg: 450 } }, children: analytics.equityCurve && analytics.equityCurve.length > 0 ? (_jsx(EnhancedMetricCard, { title: "Cumulative Equity Curve", value: "", minHeight: "100%", children: _jsx(Box, { sx: { flexGrow: 1, height: 'calc(100% - 40px)' }, children: _jsx(EquityCurveChart, { equityCurve: analytics.equityCurve }) }) })) : _jsx(Paper, { sx: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, border: `1px solid ${colors.border}` }, children: _jsx(Typography, { sx: { color: colors.textSecondary }, children: "No Equity Data" }) }) }), _jsx(Grid, { item: true, xs: 12, lg: 5, sx: { height: { xs: 300, lg: 450 } }, children: analytics.equityCurve && analytics.equityCurve.length > 0 ? (_jsx(EnhancedMetricCard, { title: "Drawdown Curve", value: "", minHeight: "100%", children: _jsx(Box, { sx: { flexGrow: 1, height: 'calc(100% - 30px)' }, children: _jsx(DrawdownCurveChart, { data: analytics.equityCurve.map(p => ({ date: p.date.toString(), value: ((p.equity / (analytics.equityCurve.reduce((max, cp) => cp.equity > max ? cp.equity : max, 0) || 1)) - 1) * 100 })) }) }) })) : _jsx(Paper, { sx: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, border: `1px solid ${colors.border}` }, children: _jsx(Typography, { sx: { color: colors.textSecondary }, children: "No Drawdown Data" }) }) })] }), _jsx(Grid, { item: true, xs: 12, sx: { height: 450 }, children: analytics.pnlVsDurationSeries && analytics.pnlVsDurationSeries.length > 0 ? (_jsx(EnhancedMetricCard, { title: "Net P&L vs Trade Duration", value: "", minHeight: "100%", children: _jsx(Box, { sx: { flexGrow: 1, height: 'calc(100%)' }, children: _jsx(PnlVsDurationScatterPlot, { data: analytics.pnlVsDurationSeries }) }) })) : _jsx(Paper, { sx: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, border: `1px solid ${colors.border}` }, children: _jsx(Typography, { sx: { color: colors.textSecondary }, children: "No P&L vs Duration Data" }) }) }), _jsx(Grid, { item: true, xs: 12, sx: { height: 450 }, children: analytics.rMultipleDistribution && analytics.rMultipleDistribution.length > 0 ? (_jsx(EnhancedMetricCard, { title: "R-Multiple Distribution", value: "", minHeight: "100%", children: _jsx(Box, { sx: { flexGrow: 1, height: 'calc(100%)' }, children: _jsx(MonthlyReturnsChart, { data: analytics.rMultipleDistribution.map(d => ({ value: parseFloat(d.range.replace('R', '')), count: d.count, range: d.range })) }) }) })) : _jsx(Paper, { sx: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, border: `1px solid ${colors.border}` }, children: _jsx(Typography, { sx: { color: colors.textSecondary }, children: "No R-Multiple Data" }) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(GroupedPerformanceTabs, { analytics: analytics }) })] }) }));
    };
    return (_jsxs(Box, { sx: { width: '100%', p: { xs: 1, sm: 2, md: 2.5 } }, children: [" ", _jsx(Typography, { variant: "h4", component: "h1", sx: { mb: 3, color: colors.textPrimary, fontWeight: typography.fontWeight.bold }, children: "Performance Analytics" }), _jsx(Paper, { sx: { mb: 3, p: 2, borderRadius: br.md, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }, children: _jsx(LocalizationProvider, { dateAdapter: AdapterDateFns, children: _jsxs(Grid, { container: true, spacing: 2, alignItems: "center", children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(DatePicker, { label: "Start Date", value: filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null, onChange: handleDateChange('startDate'), slotProps: { textField: { size: "small", fullWidth: true } } }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(DatePicker, { label: "End Date", value: filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null, onChange: handleDateChange('endDate'), slotProps: { textField: { size: "small", fullWidth: true } } }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, lg: 2, children: _jsxs(FormControl, { size: "small", fullWidth: true, children: [_jsx(InputLabel, { children: "Strategy" }), _jsx(Select, { multiple: true, value: filters.strategies || [], onChange: handleMultiSelectChange('strategies'), input: _jsx(OutlinedInput, { label: "Strategy" }), renderValue: (selected) => selected.map(val => analytics?.availableStrategies?.find(s => s.strategy_id === val)?.strategy_name || val).join(', '), children: analytics?.availableStrategies?.map(s => _jsx(MenuItem, { value: s.strategy_id, children: s.strategy_name }, s.strategy_id)) })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Button, { variant: "contained", onClick: applyFilters, disabled: isLoadingAnalytics, sx: { backgroundColor: colors.primary, '&:hover': { backgroundColor: alpha(colors.primary, 0.85) } }, children: isLoadingAnalytics ? _jsx(CircularProgress, { size: 24, color: "inherit" }) : "Apply Filters" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Button, { variant: "outlined", onClick: clearFilters, disabled: isLoadingAnalytics, sx: { borderColor: colors.border, color: colors.textSecondary }, children: "Clear Filters" }) })] }) }) }), renderAnalyticsContent()] }));
};
export default AnalyticsPage;
