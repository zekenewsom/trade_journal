import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Typography, Paper, Grid, Tooltip, Alert } from '@mui/material';
import { Info as InfoIcon, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { colors } from '../../styles/design-tokens';
import riskMetricsConfig from './riskMetricsConfig';
const RiskMetricCard = ({ title, value, description, benchmark, interpretation, format = 'number', precision = 2 }) => {
    const formatValue = (val) => {
        if (val === null || val === undefined || isNaN(val))
            return 'N/A';
        switch (format) {
            case 'percentage':
                return `${(val * 100).toFixed(precision)}%`;
            case 'ratio':
                return `${val.toFixed(precision)}`;
            default:
                return val.toFixed(precision);
        }
    };
    const getPerformanceColor = (val) => {
        if (val === null || val === undefined || isNaN(val))
            return colors.textSecondary;
        if (val >= interpretation.excellent)
            return colors.success;
        if (val >= interpretation.good)
            return '#4CAF50';
        if (val >= interpretation.fair)
            return '#FF9800';
        return colors.error;
    };
    const getPerformanceLabel = (val) => {
        if (val === null || val === undefined || isNaN(val))
            return 'N/A';
        if (val >= interpretation.excellent)
            return 'Excellent';
        if (val >= interpretation.good)
            return 'Good';
        if (val >= interpretation.fair)
            return 'Fair';
        return 'Poor';
    };
    return (_jsxs(Paper, { elevation: 1, sx: {
            p: 2,
            height: '100%',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                boxShadow: `0 4px 12px ${colors.primary}20`,
                transform: 'translateY(-2px)'
            }
        }, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Typography, { variant: "h6", sx: { color: colors.textPrimary, fontWeight: 600 }, children: title }), _jsx(Tooltip, { title: description, placement: "top", children: _jsx(InfoIcon, { sx: { color: colors.textSecondary, fontSize: 18 } }) })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "h4", sx: {
                            color: getPerformanceColor(value),
                            fontWeight: 'bold',
                            mb: 0.5
                        }, children: formatValue(value) }), _jsx(Typography, { variant: "caption", sx: {
                            color: getPerformanceColor(value),
                            backgroundColor: `${getPerformanceColor(value)}15`,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 600
                        }, children: getPerformanceLabel(value) })] }), benchmark && (_jsx(Box, { sx: { mb: 1 }, children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsxs(Typography, { variant: "body2", sx: { color: colors.textSecondary }, children: [benchmark.label, ":"] }), _jsx(Typography, { variant: "body2", sx: { color: colors.textPrimary, fontWeight: 600 }, children: formatValue(benchmark.value) }), benchmark.comparison === 'higher' && (_jsx(TrendingUpIcon, { sx: { color: colors.success, fontSize: 16 } })), benchmark.comparison === 'lower' && (_jsx(TrendingDownIcon, { sx: { color: colors.error, fontSize: 16 } }))] }) })), _jsx(Typography, { variant: "body2", sx: { color: colors.textSecondary, fontSize: 12 }, children: description })] }));
};
const InstitutionalRiskMetrics = ({ analytics }) => {
    if (!analytics) {
        return (_jsx(Alert, { severity: "info", sx: { mb: 2 }, children: "No analytics data available for risk metrics calculation." }));
    }
    const riskMetrics = riskMetricsConfig.map(config => {
        // Inject dynamic values and computed comparisons
        let value = analytics[config.title.replace(/\s+/g, '').charAt(0).toLowerCase() + config.title.replace(/\s+/g, '').slice(1)];
        // Fallback for known mismatches
        if (config.title === 'Omega Ratio') value = analytics.omega;
        if (config.title === 'Ulcer Index') value = analytics.ulcerIndex;
        if (config.title === 'Sharpe Ratio') value = analytics.sharpeRatio;
        if (config.title === 'Sortino Ratio') value = analytics.sortinoRatio;
        if (config.title === 'Calmar Ratio') value = analytics.calmarRatio;
        if (config.title === 'Skewness') value = analytics.skewness;
        let benchmark = config.benchmark;
        if (benchmark) {
            benchmark = {
                ...benchmark,
                comparison: value !== undefined && value !== null && benchmark.value !== undefined
                    ? (config.title === 'Ulcer Index' ? (value < benchmark.value ? 'higher' : 'lower') : (value > benchmark.value ? 'higher' : 'lower'))
                    : undefined
            };
        }
        return {
            ...config,
            value,
            benchmark
        };
    });
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, children: [_jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { variant: "h5", sx: { color: colors.textPrimary, fontWeight: 'bold', mb: 1 }, children: "Institutional Risk Metrics" }), _jsx(Typography, { variant: "body2", sx: { color: colors.textSecondary }, children: "Comprehensive risk-adjusted performance analysis using hedge fund industry standards" })] }), _jsx(Grid, { container: true, spacing: 3, children: riskMetrics.map((metric, index) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 3, children: _jsx(RiskMetricCard, { ...metric }) }, index))) })] }));
};
export default InstitutionalRiskMetrics;
