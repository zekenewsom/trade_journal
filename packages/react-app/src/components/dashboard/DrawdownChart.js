import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Legend import not present, nothing to remove.
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
export function DrawdownChart({ data }) {
    const theme = useTheme();
    const renderTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (_jsxs("div", { className: "p-2 rounded shadow-lg bg-white border border-gray-200", children: [_jsx("p", { className: "text-xs text-secondary", children: format(new Date(label), 'MMM d, yyyy') }), _jsxs("p", { className: "text-sm font-medium text-primary", children: [payload[0].value, "%"] })] }));
        }
        return null;
    };
    return (_jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: data, margin: { top: 5, right: 5, left: 5, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: theme.palette.divider }), _jsx(XAxis, { dataKey: "date", axisLine: false, tickLine: false, tickFormatter: (value) => format(new Date(value), 'MMM'), tick: { fontSize: 10, fill: 'var(--color-on-surface-variant)' } }), _jsx(YAxis, { tickFormatter: (value) => `${value}%`, tick: { fontSize: 10, fill: 'var(--color-on-surface-variant)' }, domain: ['auto', 0] }), _jsx(Tooltip, { content: renderTooltip }), _jsx("defs", { children: _jsxs("linearGradient", { id: "drawdownGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: theme.palette.error.main, stopOpacity: 0.1 }), _jsx("stop", { offset: "95%", stopColor: theme.palette.error.main, stopOpacity: 0.01 })] }) }), _jsx(Area, { type: "monotone", dataKey: "value", stroke: theme.palette.error.main, strokeWidth: 2, fill: "url(#drawdownGradient)" })] }) }) }));
}
