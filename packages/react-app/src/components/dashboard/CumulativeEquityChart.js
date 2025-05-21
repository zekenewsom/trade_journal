import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MetricCard } from '../ui/MetricCard';
import { format } from 'date-fns';
export function CumulativeEquityChart({ data }) {
    const renderTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (_jsxs("div", { className: "bg-dark-600 p-2 border border-dark-400 rounded shadow-lg", children: [_jsx("p", { className: "text-xs text-gray-400", children: format(new Date(label), 'MMM d, yyyy') }), _jsxs("p", { className: "text-sm font-medium", children: ["$", payload[0].value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")] })] }));
        }
        return null;
    };
    return (_jsx(MetricCard, { title: "Cumulative Equity Curve", size: "lg", className: "col-span-6 row-span-2", children: _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: data, margin: { top: 5, right: 5, left: 5, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1A1B1D" }), _jsx(XAxis, { dataKey: "date", axisLine: false, tickLine: false, tickFormatter: (value) => format(new Date(value), 'MMM'), tick: { fontSize: 10, fill: '#9ca3af' } }), _jsx(YAxis, { axisLine: false, tickLine: false, tickFormatter: (value) => `$${(value / 1000).toFixed(0)}k`, tick: { fontSize: 10, fill: '#9ca3af' } }), _jsx(Tooltip, { content: renderTooltip }), _jsx(Line, { type: "monotone", dataKey: "value", stroke: "#3A7BFF", strokeWidth: 2, activeDot: { r: 6, fill: '#3A7BFF', stroke: '#131417', strokeWidth: 2 }, dot: false })] }) }) }) }));
}
