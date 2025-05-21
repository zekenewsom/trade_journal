import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { MetricCard } from '../ui/MetricCard';
export function ReturnScatterChart({ data }) {
    const renderTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (_jsxs("div", { className: "bg-dark-600 p-2 border border-dark-400 rounded shadow-lg", children: [_jsx("p", { className: "text-xs font-medium", children: item.ticker }), _jsxs("p", { className: "text-xs text-gray-400", children: ["Risk: ", item.x.toFixed(2)] }), _jsxs("p", { className: `text-xs ${item.y >= 0 ? 'text-positive' : 'text-negative'}`, children: ["Return: ", item.y >= 0 ? '+' : '', item.y.toFixed(2), "%"] })] }));
        }
        return null;
    };
    // Prepare data with fill colors
    const dataWithColors = data.map(item => ({
        ...item,
        fill: item.y >= 0 ? '#00E28A' : '#FF4D67'
    }));
    return (_jsx(MetricCard, { title: "Return vs Risk Scatter", size: "lg", className: "col-span-6 row-span-2", children: _jsxs("div", { className: "h-64 relative", children: [_jsxs("div", { className: "absolute inset-0 flex items-center justify-between px-8 text-xs text-gray-400 pointer-events-none", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { children: "Lower risk" }), _jsx("div", { children: "Lower return" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { children: "Higher risk" }), _jsx("div", { children: "Higher return" })] })] }), _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(ScatterChart, { margin: { top: 20, right: 20, bottom: 20, left: 20 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1A1B1D" }), _jsx(XAxis, { type: "number", dataKey: "x", name: "Risk", axisLine: false, tickLine: false, tick: { fontSize: 10, fill: '#9ca3af' }, domain: ['dataMin', 'dataMax'] }), _jsx(YAxis, { type: "number", dataKey: "y", name: "Return", axisLine: false, tickLine: false, tick: { fontSize: 10, fill: '#9ca3af' }, domain: ['dataMin', 'dataMax'] }), _jsx(ZAxis, { type: "number", dataKey: "z", range: [50, 500], name: "Volume" }), _jsx(Tooltip, { content: renderTooltip, cursor: { strokeDasharray: '3 3' } }), _jsx(Scatter, { name: "Trades", data: dataWithColors, fill: "#00E28A" })] }) })] }) }));
}
