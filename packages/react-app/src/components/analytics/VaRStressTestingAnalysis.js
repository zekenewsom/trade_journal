import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/react-app/src/components/analytics/VaRStressTestingAnalysis.tsx
import { useMemo } from 'react';
import { Box, Typography, Paper, Grid, Alert, Chip, LinearProgress } from '@mui/material';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';
import { Warning as WarningIcon, TrendingDown as TrendingDownIcon, Security as SecurityIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { colors } from '../../styles/design-tokens';
const VaRMetric = ({ title, value, confidence, description, severity }) => {
    const formatValue = (val) => {
        if (val === null || val === undefined || isNaN(val))
            return 'N/A';
        return `${(val * 100).toFixed(2)}%`;
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'low': return colors.success;
            case 'medium': return '#FF9800';
            case 'high': return '#FF5722';
            case 'critical': return colors.error;
            default: return colors.textSecondary;
        }
    };
    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'low': return _jsx(SecurityIcon, { sx: { color: colors.success } });
            case 'medium': return _jsx(WarningIcon, { sx: { color: '#FF9800' } });
            case 'high': return _jsx(TrendingDownIcon, { sx: { color: '#FF5722' } });
            case 'critical': return _jsx(WarningIcon, { sx: { color: colors.error } });
            default: return null;
        }
    };
    return (_jsxs(Paper, { elevation: 1, sx: {
            p: 2,
            height: '100%',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderLeft: `4px solid ${getSeverityColor(severity)}`
        }, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Typography, { variant: "h6", sx: { color: colors.textPrimary }, children: title }), getSeverityIcon(severity)] }), _jsx(Typography, { variant: "h4", sx: {
                    color: getSeverityColor(severity),
                    fontWeight: 'bold',
                    mb: 1
                }, children: formatValue(value) }), _jsx(Chip, { label: `${confidence} Confidence`, size: "small", sx: {
                    backgroundColor: `${getSeverityColor(severity)}15`,
                    color: getSeverityColor(severity),
                    fontWeight: 600,
                    mb: 1
                } }), _jsx(Typography, { variant: "body2", sx: { color: colors.textSecondary, fontSize: 12 }, children: description })] }));
};
const VaRStressTestingAnalysis = ({ analytics }) => {
    if (!analytics) {
        return (_jsx(Alert, { severity: "info", sx: { mb: 2 }, children: "No analytics data available for VaR and stress testing analysis." }));
    }
    // Generate stress test scenarios
    const stressTestScenarios = useMemo(() => {
        const scenarios = [
            {
                name: 'Market Crash (-20%)',
                impact: (analytics.totalRealizedNetPnl || 0) * -0.20,
                probability: 0.05,
                description: 'Severe market downturn scenario'
            },
            {
                name: 'Moderate Correction (-10%)',
                impact: (analytics.totalRealizedNetPnl || 0) * -0.10,
                probability: 0.15,
                description: 'Typical market correction'
            },
            {
                name: 'Volatility Spike',
                impact: (analytics.totalRealizedNetPnl || 0) * -0.05,
                probability: 0.25,
                description: 'Increased market volatility'
            },
            {
                name: 'Black Swan Event',
                impact: (analytics.totalRealizedNetPnl || 0) * -0.35,
                probability: 0.01,
                description: 'Extremely rare but severe event'
            },
            {
                name: 'Sector Rotation',
                impact: (analytics.totalRealizedNetPnl || 0) * -0.08,
                probability: 0.30,
                description: 'Unfavorable sector rotation'
            }
        ];
        return scenarios.map(scenario => ({
            ...scenario,
            riskAdjustedImpact: scenario.impact * scenario.probability
        }));
    }, [analytics.totalRealizedNetPnl]);
    // Calculate drawdown distribution
    const drawdownDistribution = useMemo(() => {
        if (!analytics.equityCurve || analytics.equityCurve.length < 2)
            return [];
        const drawdowns = [];
        let peak = analytics.equityCurve[0].equity;
        for (let i = 1; i < analytics.equityCurve.length; i++) {
            const current = analytics.equityCurve[i].equity;
            if (current > peak) {
                peak = current;
            }
            const drawdown = peak > 0 ? (current - peak) / peak : 0;
            drawdowns.push(drawdown);
        }
        // Create histogram bins
        const bins = [];
        for (let i = 0; i >= -0.5; i -= 0.05) {
            const binStart = i;
            const binEnd = i - 0.05;
            const count = drawdowns.filter(dd => dd <= binStart && dd > binEnd).length;
            bins.push({
                range: `${(binStart * 100).toFixed(1)}% to ${(binEnd * 100).toFixed(1)}%`,
                count,
                binStart: binStart * 100
            });
        }
        return bins.filter(bin => bin.count > 0);
    }, [analytics.equityCurve]);
    const varMetrics = [
        {
            title: 'Value at Risk (95%)',
            value: analytics.valueAtRisk95,
            confidence: '95%',
            description: 'Maximum expected loss on 95% of trading days',
            severity: (analytics.valueAtRisk95 && analytics.valueAtRisk95 < -0.05) ? 'high' : 'medium'
        },
        {
            title: 'Value at Risk (99%)',
            value: analytics.valueAtRisk99,
            confidence: '99%',
            description: 'Maximum expected loss on 99% of trading days',
            severity: (analytics.valueAtRisk99 && analytics.valueAtRisk99 < -0.08) ? 'critical' : 'high'
        },
        {
            title: 'Conditional VaR (95%)',
            value: analytics.conditionalVaR95,
            confidence: '95%',
            description: 'Expected loss when VaR threshold is exceeded',
            severity: (analytics.conditionalVaR95 && analytics.conditionalVaR95 < -0.07) ? 'high' : 'medium'
        },
        {
            title: 'Conditional VaR (99%)',
            value: analytics.conditionalVaR99,
            confidence: '99%',
            description: 'Expected loss in worst-case scenarios',
            severity: (analytics.conditionalVaR99 && analytics.conditionalVaR99 < -0.12) ? 'critical' : 'high'
        }
    ];
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, children: [_jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { variant: "h5", sx: { color: colors.textPrimary, fontWeight: 'bold', mb: 1 }, children: "Value at Risk & Stress Testing" }), _jsx(Typography, { variant: "body2", sx: { color: colors.textSecondary }, children: "Risk measurement and scenario analysis for portfolio protection" })] }), _jsx(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: varMetrics.map((metric, index) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(VaRMetric, { ...metric }) }, index))) }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Paper, { elevation: 1, sx: { p: 2, height: 400 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: colors.textPrimary }, children: "Stress Test Scenarios" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: stressTestScenarios, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: colors.border }), _jsx(XAxis, { dataKey: "name", tick: { fontSize: 10, fill: colors.textSecondary }, angle: -45, textAnchor: "end", height: 80 }), _jsx(YAxis, { tick: { fontSize: 10, fill: colors.textSecondary }, tickFormatter: (value) => `$${value.toLocaleString()}` }), _jsx(Tooltip, { formatter: (value) => [`$${value.toLocaleString()}`, 'Impact'], labelStyle: { color: colors.textPrimary } }), _jsx(Bar, { dataKey: "impact", fill: colors.error, radius: [4, 4, 0, 0] }), _jsx(ReferenceLine, { y: 0, stroke: colors.textSecondary, strokeDasharray: "3 3" })] }) })] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Paper, { elevation: 1, sx: { p: 2, height: 400 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: colors.textPrimary }, children: "Drawdown Distribution" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: drawdownDistribution, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: colors.border }), _jsx(XAxis, { dataKey: "range", tick: { fontSize: 10, fill: colors.textSecondary }, angle: -45, textAnchor: "end", height: 80 }), _jsx(YAxis, { tick: { fontSize: 10, fill: colors.textSecondary }, label: { value: 'Frequency', angle: -90, position: 'insideLeft' } }), _jsx(Tooltip, { formatter: (value) => [value, 'Occurrences'], labelStyle: { color: colors.textPrimary } }), _jsx(Bar, { dataKey: "count", fill: colors.warning, radius: [4, 4, 0, 0] })] }) })] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Paper, { elevation: 1, sx: { p: 2, height: 400 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: colors.textPrimary }, children: "Risk-Adjusted Scenario Impact" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: stressTestScenarios, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: colors.border }), _jsx(XAxis, { dataKey: "name", tick: { fontSize: 10, fill: colors.textSecondary }, angle: -45, textAnchor: "end", height: 80 }), _jsx(YAxis, { tick: { fontSize: 10, fill: colors.textSecondary }, tickFormatter: (value) => `$${value.toLocaleString()}` }), _jsx(Tooltip, { formatter: (value) => [`$${value.toLocaleString()}`, 'Risk-Adjusted Impact'], labelStyle: { color: colors.textPrimary } }), _jsx(Bar, { dataKey: "riskAdjustedImpact", fill: colors.secondary, radius: [4, 4, 0, 0] })] }) })] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Paper, { elevation: 1, sx: { p: 2, height: 400 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: colors.textPrimary }, children: "Risk Summary" }), _jsxs(Box, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "subtitle1", sx: { color: colors.textPrimary, mb: 2 }, children: "Portfolio Risk Assessment" }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { variant: "body2", sx: { color: colors.textSecondary, mb: 1 }, children: "Maximum Drawdown Risk" }), _jsx(LinearProgress, { variant: "determinate", value: Math.min((analytics.maxDrawdownPercentage || 0) * 2, 100), sx: {
                                                        height: 8,
                                                        borderRadius: 4,
                                                        backgroundColor: `${colors.error}20`,
                                                        '& .MuiLinearProgress-bar': { backgroundColor: colors.error }
                                                    } }), _jsxs(Typography, { variant: "caption", sx: { color: colors.textSecondary }, children: [(analytics.maxDrawdownPercentage || 0).toFixed(1), "% maximum observed"] })] }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { variant: "body2", sx: { color: colors.textSecondary, mb: 1 }, children: "Volatility Risk" }), _jsx(LinearProgress, { variant: "determinate", value: Math.min((analytics.annualizedVolatility || 0) * 500, 100), sx: {
                                                        height: 8,
                                                        borderRadius: 4,
                                                        backgroundColor: `${colors.warning}20`,
                                                        '& .MuiLinearProgress-bar': { backgroundColor: colors.warning }
                                                    } }), _jsxs(Typography, { variant: "caption", sx: { color: colors.textSecondary }, children: [((analytics.annualizedVolatility || 0) * 100).toFixed(1), "% annualized volatility"] })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "body2", sx: { color: colors.textSecondary, mb: 1 }, children: "Tail Risk (VaR 99%)" }), _jsx(LinearProgress, { variant: "determinate", value: Math.min(Math.abs((analytics.valueAtRisk99 || 0)) * 1000, 100), sx: {
                                                        height: 8,
                                                        borderRadius: 4,
                                                        backgroundColor: `${colors.primary}20`,
                                                        '& .MuiLinearProgress-bar': { backgroundColor: colors.primary }
                                                    } }), _jsxs(Typography, { variant: "caption", sx: { color: colors.textSecondary }, children: [((analytics.valueAtRisk99 || 0) * 100).toFixed(2), "% worst-case daily loss"] })] }), _jsx(Alert, { severity: "info", sx: { mt: 2 }, children: _jsx(Typography, { variant: "body2", children: "Risk metrics are based on historical data. Actual future losses may exceed these estimates." }) })] })] }) })] })] }));
};
export default VaRStressTestingAnalysis;
