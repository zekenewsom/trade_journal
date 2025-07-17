import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/react-app/src/views/AnalyticsPage.tsx
import { useState, useEffect } from 'react';
import { Box, Button, MenuItem, Select, FormControl, InputLabel, OutlinedInput, Alert, Typography, Paper, Skeleton, alpha, } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import EnhancedMetricCard from '../components/dashboard/cards/EnhancedMetricCard';
import EquityCurveChart from '../components/analytics/EquityCurveChart';
import PnlVsDurationScatterPlot from '../components/analytics/PnlVsDurationScatterPlot';
import GroupedPerformanceTabs from './GroupedPerformanceTabs';
import { MonthlyReturnsChart } from '../components/charts/MonthlyReturnsChart';
import InstitutionalRiskMetrics from '../components/analytics/InstitutionalRiskMetrics';
import PortfolioConcentrationAnalysis from '../components/analytics/PortfolioConcentrationAnalysis';
import VaRStressTestingAnalysis from '../components/analytics/VaRStressTestingAnalysis';
import { colors, borderRadius as br } from '../styles/design-tokens';
const AnalyticsPage = () => {
    const { analytics, isLoadingAnalytics, analyticsError, fetchAnalyticsData } = useAppStore();
    const [filters, setFilters] = useState({
        dateRange: { startDate: null, endDate: null },
        assetClasses: [],
        exchanges: [],
        strategies: [],
        tickers: []
    });
    // Formatting functions
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
    // Fetch analytics data
    useEffect(() => {
        fetchAnalyticsData(filters);
    }, [fetchAnalyticsData, filters]);
    // Handle filter changes
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };
    const handleDateRangeChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            dateRange: {
                ...prev.dateRange,
                [field]: value ? value.toISOString().split('T')[0] : null
            }
        }));
    };
    const handleArrayFilterChange = (filterType) => (event) => {
        const value = event.target.value;
        setFilters(prev => ({
            ...prev,
            [filterType]: typeof value === 'string' ? value.split(',') : value
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
        return (_jsxs(Box, { sx: { p: 3 }, children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [...Array(8)].map((_, i) => (_jsx(Skeleton, { variant: "rectangular", height: 150, sx: { borderRadius: br.md, bgcolor: alpha(colors.surfaceVariant, 0.5) } }, i))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(Skeleton, { variant: "rectangular", height: 400, sx: { borderRadius: br.md, bgcolor: alpha(colors.surfaceVariant, 0.5) } }), _jsx(Skeleton, { variant: "rectangular", height: 400, sx: { borderRadius: br.md, bgcolor: alpha(colors.surfaceVariant, 0.5) } })] })] }));
    }
    // Render error state
    if (analyticsError) {
        return (_jsxs(Alert, { severity: "error", sx: {
                backgroundColor: colors.surface,
                color: colors.error,
                border: `1px solid ${colors.border}`,
                m: 3
            }, children: ["Error loading analytics: ", analyticsError] }));
    }
    // Render no data state
    if (!analytics) {
        return (_jsx(Box, { sx: { p: 3 }, children: _jsx(Typography, { sx: { color: colors.textSecondary, textAlign: 'center', py: 5 }, children: "No analytics data to display. Adjust filters or log some trades." }) }));
    }
    return (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5 }, children: _jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Paper, { elevation: 1, sx: { p: 3, mb: 4, backgroundColor: colors.surface }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 3, color: colors.textPrimary }, children: "Filters & Date Range" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4", children: [_jsxs(LocalizationProvider, { dateAdapter: AdapterDateFns, children: [_jsx(DatePicker, { label: "Start Date", value: filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null, onChange: (date) => handleDateRangeChange('startDate', date), slotProps: { textField: { size: 'small' } } }), _jsx(DatePicker, { label: "End Date", value: filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null, onChange: (date) => handleDateRangeChange('endDate', date), slotProps: { textField: { size: 'small' } } })] }), _jsxs(FormControl, { size: "small", children: [_jsx(InputLabel, { children: "Asset Classes" }), _jsx(Select, { multiple: true, value: filters.assetClasses || [], onChange: handleArrayFilterChange('assetClasses'), input: _jsx(OutlinedInput, { label: "Asset Classes" }), children: analytics.availableAssetClasses?.map(assetClass => (_jsx(MenuItem, { value: assetClass, children: assetClass }, assetClass))) })] }), _jsxs(FormControl, { size: "small", children: [_jsx(InputLabel, { children: "Exchanges" }), _jsx(Select, { multiple: true, value: filters.exchanges || [], onChange: handleArrayFilterChange('exchanges'), input: _jsx(OutlinedInput, { label: "Exchanges" }), children: analytics.availableExchanges?.map(exchange => (_jsx(MenuItem, { value: exchange, children: exchange }, exchange))) })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "contained", onClick: () => fetchAnalyticsData(filters), size: "small", children: "Apply Filters" }), _jsx(Button, { variant: "outlined", onClick: resetFilters, size: "small", children: "Reset" })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(EnhancedMetricCard, { title: "Total Net P&L", value: formatCurrency(analytics.totalRealizedNetPnl), changeColor: analytics.totalRealizedNetPnl && analytics.totalRealizedNetPnl >= 0 ? 'success' : 'error' }), _jsx(EnhancedMetricCard, { title: "Win Rate", value: formatPercentage(analytics.winRateOverall), changeText: `${analytics.numberOfWinningTrades}W / ${analytics.numberOfLosingTrades}L` }), _jsx(EnhancedMetricCard, { title: "Total Trades", value: analytics.totalFullyClosedTrades?.toString() || '0', changeText: "Closed positions" }), _jsx(EnhancedMetricCard, { title: "Avg R-Multiple", value: formatNumber(analytics.avgRMultiple), changeColor: analytics.avgRMultiple && analytics.avgRMultiple > 1 ? 'success' : 'neutral' })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [_jsxs(Paper, { elevation: 1, sx: { p: 2, height: 400, display: 'flex', flexDirection: 'column' }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Equity Curve" }), _jsx(Box, { sx: { flexGrow: 1 }, children: analytics.equityCurve && analytics.equityCurve.length > 0 ? (_jsx(EquityCurveChart, { equityCurve: analytics.equityCurve })) : (_jsx(Typography, { variant: "body2", sx: { textAlign: 'center', color: 'text.secondary', mt: 2 }, children: "No equity curve data available" })) })] }), _jsxs(Paper, { elevation: 1, sx: { p: 2, height: 400, display: 'flex', flexDirection: 'column' }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "P&L vs Duration" }), _jsx(Box, { sx: { flexGrow: 1 }, children: analytics.pnlVsDurationSeries && analytics.pnlVsDurationSeries.length > 0 ? (_jsx(PnlVsDurationScatterPlot, { data: analytics.pnlVsDurationSeries })) : (_jsx(Typography, { variant: "body2", sx: { textAlign: 'center', color: 'text.secondary', mt: 2 }, children: "No P&L vs Duration data available" })) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [_jsxs(Paper, { elevation: 1, sx: { p: 2, height: 400, display: 'flex', flexDirection: 'column' }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Monthly Returns" }), _jsx(Box, { sx: { flexGrow: 1 }, children: analytics.pnlByMonth && analytics.pnlByMonth.length > 0 ? (_jsx(MonthlyReturnsChart, { data: analytics.pnlByMonth })) : (_jsx(Typography, { variant: "body2", sx: { textAlign: 'center', color: 'text.secondary', mt: 2 }, children: "No monthly returns data available" })) })] }), _jsxs(Paper, { elevation: 1, sx: { p: 2, height: 400, display: 'flex', flexDirection: 'column' }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "R-Multiple Distribution" }), _jsx(Box, { sx: { flexGrow: 1 }, children: analytics.rMultipleDistribution && analytics.rMultipleDistribution.length > 0 ? (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx("div", { className: "text-center", children: analytics.rMultipleDistribution.map((item, index) => (_jsxs("div", { className: "mb-2", children: [_jsx("div", { className: "text-lg font-semibold", children: item.range }), _jsxs("div", { className: "text-sm text-gray-500", children: [item.count, " trades"] })] }, index))) }) })) : (_jsx(Typography, { variant: "body2", sx: { textAlign: 'center', color: 'text.secondary', mt: 2 }, children: "No R-Multiple distribution data available" })) })] })] }), _jsxs(Paper, { elevation: 1, sx: { p: 2, mb: 4 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Performance by Category" }), _jsx(GroupedPerformanceTabs, { analytics: analytics })] }), _jsx(Box, { sx: { mb: 4 }, children: _jsx(InstitutionalRiskMetrics, { analytics: analytics }) }), _jsx(Box, { sx: { mb: 4 }, children: _jsx(PortfolioConcentrationAnalysis, { analytics: analytics }) }), _jsx(Box, { sx: { mb: 4 }, children: _jsx(VaRStressTestingAnalysis, { analytics: analytics }) })] }) }));
};
export default AnalyticsPage;
