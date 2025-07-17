import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { AreaChart, Area, ResponsiveContainer, XAxis } from 'recharts';
import { useTheme } from '@mui/material/styles';
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
    const theme = useTheme();
    return (_jsx(MetricCard, { title: "Optimal Trades Gain", status: isNegative ? 'bad' : 'good', className: "bg-white", children: _jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: "text-2xl font-semibold font-mono text-primary", children: ["$", _jsx(CountUp, { end: value, separator: ",", decimals: 2, preserveValue: true })] }), _jsxs("div", { className: "text-sm", style: { color: isNegative ? theme.palette.error.main : theme.palette.success.main }, children: [isNegative ? '' : '+', change, "%"] }), _jsx("div", { className: "h-16 mt-2", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: mockData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "optimalGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: isNegative ? theme.palette.error.main : theme.palette.success.main, stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: isNegative ? theme.palette.error.main : theme.palette.success.main, stopOpacity: 0 })] }) }), _jsx(XAxis, { dataKey: "month", tick: { fontSize: 10, fill: theme.palette.text.secondary }, axisLine: false, tickLine: false }), _jsx(Area, { type: "monotone", dataKey: "value", stroke: isNegative ? theme.palette.error.main : theme.palette.success.main, fillOpacity: 1, fill: "url(#optimalGradient)" })] }) }) })] }) }));
}
