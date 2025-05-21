import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
export function DrawdownCurveChart({ data } = {}) {
    // Mock data if not provided
    const mockData = data || [
        { date: 'Jan 1', value: 0 },
        { date: 'Jan 15', value: -2 },
        { date: 'Feb 1', value: -5 },
        { date: 'Feb 15', value: -3 },
        { date: 'Mar 1', value: -1 },
        { date: 'Mar 15', value: -7 },
        { date: 'Apr 1', value: -10 },
        { date: 'Apr 15', value: -5 },
        { date: 'May 1', value: -2 }
    ];
    return (_jsx("div", { className: "h-[300px] w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: mockData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "drawdownGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#FF4D67", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#FF4D67", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1A1B1D" }), _jsx(XAxis, { dataKey: "date", tick: { fill: '#9ca3af', fontSize: 12 }, axisLine: { stroke: '#1A1B1D' }, tickLine: false }), _jsx(YAxis, { tick: { fill: '#9ca3af', fontSize: 12 }, axisLine: { stroke: '#1A1B1D' }, tickLine: false, tickFormatter: (value) => `${value}%`, domain: ['dataMin', 0] }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#0E0F11', borderColor: '#1A1B1D' }, itemStyle: { color: '#FF4D67' }, formatter: (value) => [`${value}%`, 'Drawdown'], labelFormatter: (label) => `Date: ${label}` }), _jsx(Area, { type: "monotone", dataKey: "value", stroke: "#FF4D67", strokeWidth: 2, fillOpacity: 1, fill: "url(#drawdownGradient)" })] }) }) }));
}
