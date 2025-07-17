import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Typography, Paper, Grid, Alert, Chip } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { colors } from '../../styles/design-tokens';
const ConcentrationMetric = ({ title, value, format, description, benchmark, interpretation }) => {
    const formatValue = (val) => {
        if (val === null || val === undefined || isNaN(val))
            return 'N/A';
        switch (format) {
            case 'percentage':
                return `${(val * 100).toFixed(1)}%`;
            case 'ratio':
                return val.toFixed(2);
            default:
                return val.toFixed(0);
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
            border: `1px solid ${colors.border}`
        }, children: [_jsx(Typography, { variant: "h6", sx: { color: colors.textPrimary, mb: 1 }, children: title }), _jsx(Typography, { variant: "h4", sx: {
                    color: getPerformanceColor(value),
                    fontWeight: 'bold',
                    mb: 1
                }, children: formatValue(value) }), _jsx(Chip, { label: getPerformanceLabel(value), size: "small", sx: {
                    backgroundColor: `${getPerformanceColor(value)}15`,
                    color: getPerformanceColor(value),
                    fontWeight: 600,
                    mb: 1
                } }), benchmark && (_jsxs(Typography, { variant: "body2", sx: { color: colors.textSecondary, mb: 1 }, children: [benchmark.label, ": ", formatValue(benchmark.value)] })), _jsx(Typography, { variant: "body2", sx: { color: colors.textSecondary, fontSize: 12 }, children: description })] }));
};
const PortfolioConcentrationAnalysis = ({ analytics }) => {
    if (!analytics) {
        return (_jsx(Alert, { severity: "info", sx: { mb: 2 }, children: "No analytics data available for concentration analysis." }));
    }
    // Prepare data for concentration visualization
    const assetData = analytics.pnlByAsset?.slice(0, 10).map((asset, index) => ({
        name: asset.name,
        value: Math.abs(asset.totalNetPnl),
        percentage: 0, // Will be calculated
        color: `hsl(${(index * 360) / 10}, 70%, 60%)`
    })) || [];
    const totalValue = assetData.reduce((sum, item) => sum + item.value, 0);
    assetData.forEach(item => {
        item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
    });
    const concentrationMetrics = [
        {
            title: 'Number of Positions',
            value: analytics.numberOfPositions,
            format: 'number',
            description: 'Total number of unique positions held',
            benchmark: {
                value: 20,
                label: 'Typical Portfolio',
                comparison: 'higher'
            },
            interpretation: {
                excellent: 15,
                good: 10,
                fair: 5,
                poor: 0
            }
        },
        {
            title: 'Herfindahl Index',
            value: analytics.herfindahlIndex,
            format: 'ratio',
            description: 'Concentration measure. Lower values indicate better diversification',
            benchmark: {
                value: 0.2,
                label: 'Well Diversified',
                comparison: 'lower'
            },
            interpretation: {
                excellent: 0.1,
                good: 0.2,
                fair: 0.4,
                poor: 1.0
            }
        },
        {
            title: 'Top 5 Concentration',
            value: analytics.concentrationRatio,
            format: 'percentage',
            description: 'Percentage of portfolio in top 5 positions',
            benchmark: {
                value: 0.5,
                label: 'Moderate Risk',
                comparison: 'lower'
            },
            interpretation: {
                excellent: 0.3,
                good: 0.5,
                fair: 0.7,
                poor: 1.0
            }
        },
        {
            title: 'Largest Position',
            value: analytics.largestPositionPercent,
            format: 'percentage',
            description: 'Percentage of portfolio in largest single position',
            benchmark: {
                value: 0.1,
                label: 'Risk Limit',
                comparison: 'lower'
            },
            interpretation: {
                excellent: 0.05,
                good: 0.1,
                fair: 0.2,
                poor: 0.5
            }
        },
        {
            title: 'Diversification Ratio',
            value: analytics.diversificationRatio,
            format: 'ratio',
            description: 'Measure of portfolio diversification effectiveness',
            benchmark: {
                value: 0.8,
                label: 'Well Diversified',
                comparison: 'higher'
            },
            interpretation: {
                excellent: 0.9,
                good: 0.7,
                fair: 0.5,
                poor: 0.2
            }
        }
    ];
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, children: [_jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { variant: "h5", sx: { color: colors.textPrimary, fontWeight: 'bold', mb: 1 }, children: "Portfolio Concentration Analysis" }), _jsx(Typography, { variant: "body2", sx: { color: colors.textSecondary }, children: "Risk assessment through position sizing and diversification metrics" })] }), _jsx(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: concentrationMetrics.map((metric, index) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 2.4, children: _jsx(ConcentrationMetric, { ...metric }) }, index))) }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Paper, { elevation: 1, sx: { p: 2, height: 400 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: colors.textPrimary }, children: "Top 10 Positions by P&L" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: assetData, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: assetData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => [`$${value.toLocaleString()}`, 'P&L'] })] }) })] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Paper, { elevation: 1, sx: { p: 2, height: 400 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: colors.textPrimary }, children: "Position Concentration" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: assetData.slice(0, 8), children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: colors.border }), _jsx(XAxis, { dataKey: "name", tick: { fontSize: 10, fill: colors.textSecondary }, angle: -45, textAnchor: "end", height: 80 }), _jsx(YAxis, { tick: { fontSize: 10, fill: colors.textSecondary }, tickFormatter: (value) => `${value.toFixed(1)}%` }), _jsx(Tooltip, { formatter: (value) => [`${value.toFixed(1)}%`, 'Portfolio %'], labelStyle: { color: colors.textPrimary } }), _jsx(Bar, { dataKey: "percentage", fill: colors.primary, radius: [4, 4, 0, 0] })] }) })] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Paper, { elevation: 1, sx: { p: 2, height: 400 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: colors.textPrimary }, children: "Asset Class Breakdown" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: analytics.pnlByAssetClass || [], children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: colors.border }), _jsx(XAxis, { dataKey: "name", tick: { fontSize: 10, fill: colors.textSecondary } }), _jsx(YAxis, { tick: { fontSize: 10, fill: colors.textSecondary }, tickFormatter: (value) => `$${value.toLocaleString()}` }), _jsx(Tooltip, { formatter: (value) => [`$${value.toLocaleString()}`, 'Net P&L'], labelStyle: { color: colors.textPrimary } }), _jsx(Bar, { dataKey: "totalNetPnl", fill: colors.accent, radius: [4, 4, 0, 0] })] }) })] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Paper, { elevation: 1, sx: { p: 2, height: 400 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: colors.textPrimary }, children: "Exchange Breakdown" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: analytics.pnlByExchange || [], children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: colors.border }), _jsx(XAxis, { dataKey: "name", tick: { fontSize: 10, fill: colors.textSecondary } }), _jsx(YAxis, { tick: { fontSize: 10, fill: colors.textSecondary }, tickFormatter: (value) => `$${value.toLocaleString()}` }), _jsx(Tooltip, { formatter: (value) => [`$${value.toLocaleString()}`, 'Net P&L'], labelStyle: { color: colors.textPrimary } }), _jsx(Bar, { dataKey: "totalNetPnl", fill: colors.secondary, radius: [4, 4, 0, 0] })] }) })] }) })] })] }));
};
export default PortfolioConcentrationAnalysis;
