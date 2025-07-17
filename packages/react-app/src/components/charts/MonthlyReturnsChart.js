import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Typography, Box } from '@mui/material';
import { colors, typography, borderRadius as br } from '../../styles/design-tokens';
export function MonthlyReturnsChart({ data, height = '100%' }) {
    if (!data || data.length === 0) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", height: height, children: _jsx(Typography, { sx: { color: colors.textSecondary, fontSize: typography.fontSize.sm }, children: "No R-Multiple data available." }) }));
    }
    const getColor = (totalNetPnl) => {
        if (totalNetPnl < 0)
            return colors.chartNegative;
        if (totalNetPnl === 0)
            return colors.chartNeutral;
        return colors.chartPositive;
    };
    return (_jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(BarChart, { data: data, margin: { top: 5, right: 5, left: -20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: colors.chartGridLines, vertical: false }), _jsx(XAxis, { dataKey: "period", tick: { fill: colors.textSecondary, fontSize: typography.fontSize.xs }, axisLine: { stroke: colors.border }, tickLine: false, interval: 0 }), _jsx(YAxis, { allowDecimals: true, tick: { fill: colors.textSecondary, fontSize: typography.fontSize.xs }, axisLine: { stroke: colors.border }, tickLine: { stroke: colors.border } }), _jsx(Tooltip, { formatter: (value) => [`$${value.toFixed(2)}`, 'Net P&L'], labelFormatter: (label) => `Period: ${label}`, contentStyle: {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: br.md,
                        fontSize: typography.fontSize.xs,
                    }, itemStyle: { color: colors.textSecondary }, labelStyle: { color: colors.onSurface, fontWeight: typography.fontWeight.medium } }), _jsx(Bar, { dataKey: "totalNetPnl", name: "Net P&L", barSize: 20, children: data.map((entry, index) => (_jsx(Cell, { fill: getColor(entry.totalNetPnl), radius: [parseInt(br.sm), parseInt(br.sm), 0, 0] }, `cell-${index}`))) })] }) }));
}
