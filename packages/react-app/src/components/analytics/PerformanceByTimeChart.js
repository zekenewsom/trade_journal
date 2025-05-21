import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
const PerformanceByTimeChart = ({ title, data, dataKeyX, dataKeyY }) => {
    if (!data || data.length === 0) {
        return (_jsxs("div", { className: "text-gray-400 text-sm", children: ["No data available for ", title, "."] }));
    }
    const yAxisLabel = dataKeyY === 'totalNetPnl' ? "Net P&L ($)" : "Count / Rate";
    return (_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold mb-4 text-white", children: title }), _jsx("div", { className: "h-[400px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: data, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#2A2B2D" }), _jsx(XAxis, { dataKey: dataKeyX, tick: { fontSize: 12, fill: '#9CA3AF' } }), _jsx(YAxis, { tickFormatter: (value) => `$${value.toFixed(0)}`, tick: { fontSize: 12, fill: '#9CA3AF' } }), _jsx(Tooltip, { formatter: (value) => [`$${value.toFixed(2)}`, 'P&L'], contentStyle: {
                                    backgroundColor: '#1A1B1D',
                                    border: '1px solid #2A2B2D',
                                    borderRadius: '0.375rem'
                                } }), _jsx(Bar, { dataKey: dataKeyY, name: "P&L", children: data.map((entry, index) => (_jsx(Cell, { fill: entry.totalNetPnl >= 0 ? '#00E28A' : '#FF4D67' }, `cell-${index}`))) })] }) }) })] }));
};
export default PerformanceByTimeChart;
