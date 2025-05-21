import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
const EquityCurveChart = ({ equityCurve }) => {
    const { equityData, drawdownData } = useMemo(() => {
        let peak = -Infinity;
        const processedData = equityCurve.map(point => {
            if (point.equity > peak) {
                peak = point.equity;
            }
            const drawdown = peak > 0 ? ((point.equity - peak) / peak) * 100 : 0;
            return {
                ...point,
                drawdown,
                peak
            };
        });
        return {
            equityData: processedData,
            drawdownData: processedData.map(point => ({
                date: point.date,
                drawdown: point.drawdown
            }))
        };
    }, [equityCurve]);
    if (!equityCurve || equityCurve.length === 0) {
        return _jsx("p", { children: "No equity curve data available." });
    }
    return (_jsxs("div", { children: [_jsx("h3", { style: { color: '#61dafb', marginBottom: '15px' }, children: "Equity Curve & Drawdown" }), _jsx(ResponsiveContainer, { width: "100%", height: 400, children: _jsxs(AreaChart, { data: equityData, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "equityGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#82ca9d", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#82ca9d", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "drawdownGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#f44336", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#f44336", stopOpacity: 0 })] })] }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#555" }), _jsx(XAxis, { dataKey: "date", tick: { fontSize: 10, fill: '#ccc' }, tickFormatter: (value) => new Date(value).toLocaleDateString() }), _jsx(YAxis, { yAxisId: "equity", orientation: "left", tickFormatter: (value) => `$${value.toFixed(0)}`, tick: { fontSize: 10, fill: '#ccc' } }), _jsx(YAxis, { yAxisId: "drawdown", orientation: "right", tickFormatter: (value) => `${value.toFixed(1)}%`, tick: { fontSize: 10, fill: '#ccc' } }), _jsx(Tooltip, { formatter: (value, name) => {
                                if (name === 'Equity')
                                    return [`$${value.toFixed(2)}`, 'Equity'];
                                if (name === 'Drawdown')
                                    return [`${value.toFixed(2)}%`, 'Drawdown'];
                                return [value, name];
                            }, labelFormatter: (label) => new Date(label).toLocaleDateString(), contentStyle: {
                                backgroundColor: '#2a2f36',
                                border: '1px solid #444',
                                borderRadius: '4px'
                            } }), _jsx(Legend, {}), _jsx(Area, { yAxisId: "equity", type: "monotone", dataKey: "equity", name: "Equity", stroke: "#82ca9d", fillOpacity: 1, fill: "url(#equityGradient)" }), _jsx(Area, { yAxisId: "drawdown", type: "monotone", dataKey: "drawdown", name: "Drawdown", stroke: "#f44336", fillOpacity: 1, fill: "url(#drawdownGradient)" })] }) })] }));
};
export default EquityCurveChart;
