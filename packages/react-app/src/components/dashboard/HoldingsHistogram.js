import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MetricCard } from '../ui/MetricCard';
export function HoldingsHistogram({ data }) {
    const renderTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const isPositive = Number(label) >= 0;
            return (_jsxs("div", { className: "bg-dark-600 p-2 border border-dark-400 rounded shadow-lg", children: [_jsx("p", { className: "text-xs text-gray-400", children: `R-Multiple: ${label}R` }), _jsxs("p", { className: `text-sm font-medium ${isPositive ? 'text-positive' : 'text-negative'}`, children: [payload[0].value, " trades"] })] }));
        }
        return null;
    };
    return (_jsx(MetricCard, { title: "R-Multiple Histogram (Last 100 Trades)", size: "sm", className: "col-span-3 row-span-2", children: _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: data, margin: { top: 5, right: 5, left: 5, bottom: 5 }, barGap: 0, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1A1B1D", vertical: false }), _jsx(XAxis, { dataKey: "r", axisLine: false, tickLine: false, tick: { fontSize: 10, fill: '#9ca3af' }, tickCount: data.length }), _jsx(YAxis, { axisLine: false, tickLine: false, tick: { fontSize: 10, fill: '#9ca3af' } }), _jsx(Tooltip, { content: renderTooltip }), _jsx(Bar, { dataKey: "value", barSize: 12, radius: [2, 2, 0, 0], children: data.map((entry, index) => (_jsx(Cell, { fill: Number(entry.r) >= 0 ? '#00E28A' : '#FF4D67' }, `cell-${index}`))) })] }) }) }) }));
}
