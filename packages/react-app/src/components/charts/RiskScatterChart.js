import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import { Cell } from 'recharts';
import { formatCurrency } from '../dashboard/DashboardMetrics';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ZAxis } from 'recharts';
import { Typography } from '@mui/material';
import { colors, typography, borderRadius as br } from '../../styles/design-tokens';
export function RiskScatterChart({ data, height = '100%' }) {
    if (!data || data.length === 0) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", height: height, children: _jsx(Typography, { sx: { color: colors.textSecondary, fontSize: typography.fontSize.sm }, children: "No Return vs Risk data." }) }));
    }
    return (_jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(ScatterChart, { margin: { top: 20, right: 30, bottom: 20, left: 0 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: colors.chartGridLines }), _jsx(XAxis, { type: "number", dataKey: "risk", name: "Risk (e.g., $ Stop)" // Clarify what "Risk" represents
                    , tick: { fill: colors.textSecondary, fontSize: typography.fontSize.xs }, axisLine: { stroke: colors.border }, tickLine: { stroke: colors.border }, label: { value: 'Lower / Higher Risk', position: 'insideBottom', offset: -10, fill: colors.textSecondary, fontSize: typography.fontSize.xs }, domain: ['auto', 'auto'] }), _jsx(YAxis, { type: "number", dataKey: "returnPercent", name: "Return (%)", unit: "%", tick: { fill: colors.textSecondary, fontSize: typography.fontSize.xs }, axisLine: { stroke: colors.border }, tickLine: { stroke: colors.border }, label: { value: 'Lower / Higher Return', angle: -90, position: 'insideLeft', offset: 10, fill: colors.textSecondary, fontSize: typography.fontSize.xs }, domain: ['auto', 'auto'] }), data.some((d) => d.tradeVolume !== undefined) && _jsx(ZAxis, { type: "number", dataKey: "tradeVolume", range: [40, 300], name: "Trade Volume" }), _jsx(Tooltip, { cursor: { strokeDasharray: '3 3' }, contentStyle: {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: br.md,
                        fontSize: typography.fontSize.xs,
                    }, itemStyle: { color: colors.textSecondary }, labelStyle: { color: colors.onSurface, fontWeight: typography.fontWeight.medium }, formatter: (value, name, entry) => {
                        if (name === "Return (%)")
                            return [`${value.toFixed(2)}%`, name];
                        if (name === "Risk (e.g., $ Stop)")
                            return [value.toFixed(2), name];
                        if (name === "Trade Volume" && entry.payload?.tradeVolume)
                            return [formatCurrency(entry.payload.tradeVolume), name];
                        return [value, name];
                    }, labelFormatter: (label, payloadArray) => payloadArray?.[0]?.payload.ticker || '' }), _jsx(Scatter, { name: "Trades", data: data, fillOpacity: 0.7, children: data.map((entry, index) => (_jsx(Cell, { fill: entry.returnPercent >= 0 ? colors.chartPositive : colors.chartNegative }, `cell-${index}`))) })] }) }));
}
