import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
export function MonthlyReturnsChart({ data } = {}) {
    // Mock data if not provided - each bar represents an R-multiple value range
    const mockData = data || [
        { value: -3, count: 3 },
        { value: -2, count: 5 },
        { value: -1, count: 12 },
        { value: 0, count: 20 },
        { value: 1, count: 30 },
        { value: 2, count: 15 },
        { value: 3, count: 8 },
        { value: 4, count: 5 },
        { value: 5, count: 2 }
    ];
    return (_jsx("div", { className: "h-[300px] w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: mockData, barGap: 2, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1A1B1D", vertical: false }), _jsx(XAxis, { dataKey: "value", tick: { fill: '#9ca3af', fontSize: 12 }, axisLine: { stroke: '#1A1B1D' }, tickLine: false, tickFormatter: (value) => `${value}R` }), _jsx(YAxis, { tick: { fill: '#9ca3af', fontSize: 12 }, axisLine: { stroke: '#1A1B1D' }, tickLine: false, tickFormatter: (value) => value, label: { value: 'Frequency', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 } }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#0E0F11', borderColor: '#1A1B1D' }, formatter: (value) => [value, 'Trades'], labelFormatter: (label) => `R-Multiple: ${label}` }), _jsx(Bar, { dataKey: "count", radius: [4, 4, 0, 0], children: mockData.map((entry, index) => (_jsx(Cell, { fill: entry.value < 0 ? '#FF4D67' : entry.value === 0 ? '#FFB547' : '#00E28A' }, `cell-${index}`))) })] }) }) }));
}
