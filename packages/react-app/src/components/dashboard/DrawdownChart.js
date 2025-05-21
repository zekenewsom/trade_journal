import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MetricCard } from '../ui/MetricCard';
import { format } from 'date-fns';
export function DrawdownChart({ data }) {
    const renderTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (_jsxs("div", { className: "bg-dark-600 p-2 border border-dark-400 rounded shadow-lg", children: [_jsx("p", { className: "text-xs text-gray-400", children: format(new Date(label), 'MMM d, yyyy') }), _jsxs("p", { className: "text-sm font-medium text-negative", children: [payload[0].value, "%"] })] }));
        }
        return null;
    };
    return (_jsx(MetricCard, { title: "Drawdown Curve", size: "sm", className: "col-span-3 row-span-2", children: _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: data, margin: { top: 5, right: 5, left: 5, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1A1B1D" }), _jsx(XAxis, { dataKey: "date", axisLine: false, tickLine: false, tickFormatter: (value) => format(new Date(value), 'MMM'), tick: { fontSize: 10, fill: '#9ca3af' } }), _jsx(YAxis, { axisLine: false, tickLine: false, tickFormatter: (value) => `${value}%`, tick: { fontSize: 10, fill: '#9ca3af' }, domain: ['dataMin', 0] }), _jsx(Tooltip, { content: renderTooltip }), _jsx("defs", { children: _jsxs("linearGradient", { id: "drawdownGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#FF4D67", stopOpacity: 0.1 }), _jsx("stop", { offset: "95%", stopColor: "#FF4D67", stopOpacity: 0.01 })] }) }), _jsx(Area, { type: "monotone", dataKey: "value", stroke: "#FF4D67", strokeWidth: 2, fill: "url(#drawdownGradient)" })] }) }) }) }));
}
