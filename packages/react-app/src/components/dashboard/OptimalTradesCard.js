import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { AreaChart, Area, ResponsiveContainer, XAxis } from 'recharts';
export function OptimalTradesCard({ value = 37428.18, change = -3.21, data = [] }) {
    // Mock data for the chart
    const mockData = data.length > 0 ? data : [
        { month: 'Jan', value: 32000 },
        { month: 'Feb', value: 35000 },
        { month: 'Mar', value: 38000 },
        { month: 'Apr', value: 40000 },
        { month: 'May', value: 37428 },
    ];
    const isNegative = change < 0;
    return (_jsx(MetricCard, { title: "Optimal Trades Gain", status: isNegative ? 'bad' : 'good', children: _jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: "text-2xl font-semibold font-mono", children: ["$", _jsx(CountUp, { end: value, separator: ",", decimals: 2, preserveValue: true })] }), _jsxs("div", { className: `text-sm ${isNegative ? 'text-negative' : 'text-positive'}`, children: [isNegative ? '' : '+', change, "%"] }), _jsx("div", { className: "h-16 mt-2", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: mockData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "optimalGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: isNegative ? "#FF4D67" : "#00E28A", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: isNegative ? "#FF4D67" : "#00E28A", stopOpacity: 0 })] }) }), _jsx(XAxis, { dataKey: "month", tick: { fontSize: 10, fill: '#9ca3af' }, axisLine: false, tickLine: false }), _jsx(Area, { type: "monotone", dataKey: "value", stroke: isNegative ? "#FF4D67" : "#00E28A", fillOpacity: 1, fill: "url(#optimalGradient)" })] }) }) })] }) }));
}
