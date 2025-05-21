import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ZAxis } from 'recharts';
export function RiskScatterChart({ data } = {}) {
    // Mock data if not provided
    const mockData = data || [
        { risk: 1.2, return: 2.5, size: 30000, ticker: 'AAPL' },
        { risk: 0.8, return: 1.2, size: 25000, ticker: 'MSFT' },
        { risk: 2.1, return: 3.1, size: 40000, ticker: 'AMZN' },
        { risk: 1.5, return: -0.8, size: 15000, ticker: 'META' },
        { risk: 0.5, return: 0.7, size: 10000, ticker: 'GOOGL' },
        { risk: 2.3, return: -1.2, size: 35000, ticker: 'TSLA' },
        { risk: 1.7, return: 2.1, size: 22000, ticker: 'NVDA' },
        { risk: 1.0, return: 1.5, size: 18000, ticker: 'AMD' },
        { risk: 0.3, return: 0.2, size: 5000, ticker: 'INTC' }
    ];
    // Split data into positive and negative returns
    const positiveData = mockData.filter(item => item.return >= 0);
    const negativeData = mockData.filter(item => item.return < 0);
    return (_jsx("div", { className: "h-[300px] w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(ScatterChart, { margin: { top: 20, right: 20, bottom: 20, left: 20 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1A1B1D" }), _jsx(XAxis, { type: "number", dataKey: "risk", name: "Risk", tick: { fill: '#9ca3af', fontSize: 12 }, axisLine: { stroke: '#1A1B1D' }, tickLine: false, label: { value: 'Risk', position: 'insideBottom', offset: -10, fill: '#9ca3af', fontSize: 12 }, domain: [0, 'dataMax'] }), _jsx(YAxis, { type: "number", dataKey: "return", name: "Return", tick: { fill: '#9ca3af', fontSize: 12 }, axisLine: { stroke: '#1A1B1D' }, tickLine: false, label: { value: 'Return', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 } }), _jsx(ZAxis, { type: "number", dataKey: "size", range: [40, 160], name: "Position Size" }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#0E0F11', borderColor: '#1A1B1D' }, formatter: (value, name) => {
                            if (name === 'Risk')
                                return [`${value.toFixed(2)}`, name];
                            if (name === 'Return')
                                return [`${value.toFixed(2)}%`, name];
                            if (name === 'Position Size')
                                return [`$${value.toLocaleString()}`, name];
                            return [value, name];
                        }, cursor: { strokeDasharray: '3 3' }, labelFormatter: (index) => mockData[index]?.ticker || '' }), _jsx(Scatter, { name: "Positive Returns", data: positiveData, fill: "#00E28A", fillOpacity: 0.7 }), _jsx(Scatter, { name: "Negative Returns", data: negativeData, fill: "#FF4D67", fillOpacity: 0.7 })] }) }) }));
}
