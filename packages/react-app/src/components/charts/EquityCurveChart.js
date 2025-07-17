import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { colors } from '/src/styles/design-tokens';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
export function EquityCurveChart({ data } = {}) {
    // Mock data if not provided
    const mockData = data || [
        { date: 'Jan 1', value: 1000000 },
        { date: 'Jan 15', value: 1050000 },
        { date: 'Feb 1', value: 1080000 },
        { date: 'Feb 15', value: 1040000 },
        { date: 'Mar 1', value: 1100000 },
        { date: 'Mar 15', value: 1150000 },
        { date: 'Apr 1', value: 1180000 },
        { date: 'Apr 15', value: 1200000 },
        { date: 'May 1', value: 1247862 }
    ];
    return (_jsx("div", { className: "h-[300px] w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: mockData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "equityGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: colors.accent, stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: colors.accent, stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: colors.cardStroke }), _jsx(XAxis, { dataKey: "date", tick: { fill: colors.textSecondary, fontSize: 12 }, axisLine: { stroke: colors.cardStroke }, tickLine: false }), _jsx(YAxis, { tick: { fill: colors.textSecondary, fontSize: 12 }, axisLine: { stroke: colors.cardStroke }, tickLine: false, tickFormatter: (value) => `$${(value / 1000).toFixed(0)}k` }), _jsx(Tooltip, { contentStyle: { backgroundColor: colors.surface, borderColor: colors.cardStroke }, itemStyle: { color: colors.onSurface }, formatter: (value) => [`$${value.toLocaleString()}`, 'Balance'], labelFormatter: (label) => `Date: ${label}` }), _jsx(Line, { type: "monotone", dataKey: "value", stroke: colors.accent, strokeWidth: 2, dot: false, activeDot: { r: 6, stroke: colors.accent, strokeWidth: 2, fill: colors.surface }, fillOpacity: 1, fill: "url(#equityGradient)" })] }) }) }));
}
