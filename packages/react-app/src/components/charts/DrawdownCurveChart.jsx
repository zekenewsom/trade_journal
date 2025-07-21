import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/react-app/src/components/charts/DrawdownCurveChart.tsx
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Typography, Box } from '@mui/material';
import { colors, typography, borderRadius } from '../../styles/design-tokens'; // Your design tokens
export function DrawdownCurveChart({ equityCurveData, height = '100%' }) {
    const drawdownData = useMemo(() => {
        if (!equityCurveData || equityCurveData.length === 0)
            return [];
        // Initialize peakEquity to the first equity value if available, or 0 otherwise
        let peakEquity = equityCurveData.length > 0 ? equityCurveData[0].equity : 0;
        return equityCurveData.map(point => {
            if (point.equity > peakEquity) {
                peakEquity = point.equity;
            }
            // Prevent division by zero or non-positive peak equity if not meaningful
            const drawdownPercentage = peakEquity > 0 ? ((point.equity - peakEquity) / peakEquity) * 100 : 0;
            return {
                date: point.date, // Keep original date for XAxis
                value: Math.min(0, drawdownPercentage), // Drawdown is always <= 0%
            };
        });
    }, [equityCurveData]);
    if (!drawdownData || drawdownData.length === 0) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", height: height, children: _jsx(Typography, { sx: { color: colors.textSecondary, fontSize: typography.fontSize.sm }, children: "No drawdown data available." }) }));
    }
    return (_jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(AreaChart, { data: drawdownData, margin: { top: 5, right: 5, left: -25, bottom: 5 }, children: [" ", _jsx("defs", { children: _jsxs("linearGradient", { id: "drawdownChartGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: colors.error, stopOpacity: 0.5 }), _jsx("stop", { offset: "95%", stopColor: colors.error, stopOpacity: 0.05 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: colors.chartGridLines, horizontal: true, vertical: false }), _jsx(XAxis, { dataKey: "date", tickFormatter: (unixTime) => new Date(unixTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), tick: { fill: colors.textSecondary, fontSize: typography.fontSize.xs }, axisLine: { stroke: colors.border }, tickLine: { stroke: colors.border }, padding: { left: 10, right: 10 }, interval: "preserveStartEnd" }), _jsx(YAxis, { tickFormatter: (value) => `${value.toFixed(0)}%`, tick: { fill: colors.textSecondary, fontSize: typography.fontSize.xs }, axisLine: { stroke: colors.border }, tickLine: { stroke: colors.border }, domain: ['auto', 0] }), _jsx(Tooltip, { formatter: (value) => [`${value.toFixed(2)}%`, "Drawdown"], labelFormatter: (label) => new Date(label).toLocaleDateString(), contentStyle: {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: borderRadius.md,
                        fontSize: typography.fontSize.xs,
                    }, itemStyle: { color: colors.error }, labelStyle: { color: colors.textSecondary, fontWeight: typography.fontWeight.medium } }), _jsx(Area, { type: "monotone", dataKey: "value", stroke: colors.error, strokeWidth: 1.5, fillOpacity: 1, fill: "url(#drawdownChartGradient)", name: "Drawdown" })] }) }));
}
