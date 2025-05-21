import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const PnlVsDurationScatterPlot = ({ data }) => {
    // Validate input data
    if (!data || !Array.isArray(data) || data.length === 0) {
        return _jsx("p", { children: "No data for P&L vs. Duration scatter plot." });
    }
    // Filter out invalid data points and format the data
    const formattedData = data
        .filter(item => item != null &&
        typeof item.durationHours === 'number' &&
        !isNaN(item.durationHours) &&
        typeof item.netPnl === 'number' &&
        !isNaN(item.netPnl) &&
        typeof item.trade_id === 'number' &&
        typeof item.instrument_ticker === 'string')
        .map(item => {
        const rMultipleText = item.rMultiple != null && !isNaN(item.rMultiple)
            ? `${item.rMultiple.toFixed(2)}R`
            : 'N/A R';
        return {
            ...item,
            durationLabel: `${item.durationHours.toFixed(1)} hrs`,
            tooltipPayload: `ID ${item.trade_id} (${item.instrument_ticker}): ${item.netPnl > 0 ? '+' : ''}${item.netPnl.toFixed(2)} P&L, ${rMultipleText}`
        };
    });
    // If no valid data points after filtering, show message
    if (formattedData.length === 0) {
        return _jsx("p", { children: "No valid data points for P&L vs. Duration scatter plot." });
    }
    return (_jsxs("div", { children: [_jsx("h4", { children: "Net P&L vs. Trade Duration (Fully Closed Trades)" }), _jsx(ResponsiveContainer, { width: "100%", height: 400, children: _jsxs(ScatterChart, { margin: { top: 20, right: 20, bottom: 20, left: 20 }, children: [_jsx(CartesianGrid, { stroke: "#555" }), _jsx(XAxis, { type: "number", dataKey: "durationHours", name: "Duration (Hours)", unit: "h", tick: { fontSize: 10, fill: '#ccc' }, label: { value: "Duration (Hours)", position: "insideBottom", offset: -15, fill: '#ccc', fontSize: 10 } }), _jsx(YAxis, { type: "number", dataKey: "netPnl", name: "Net P&L", unit: "$", tickFormatter: (value) => `$${value.toFixed(0)}`, tick: { fontSize: 10, fill: '#ccc' }, label: { value: "Net P&L ($)", angle: -90, position: "insideLeft", fill: '#ccc', fontSize: 10 } }), _jsx(Tooltip, { cursor: { strokeDasharray: '3 3' }, formatter: (value, name) => {
                                if (name === 'Net P&L')
                                    return `$${Number(value).toFixed(2)}`;
                                if (name === 'Duration (Hours)')
                                    return `${Number(value).toFixed(1)} hrs`;
                                return value;
                            }, content: ({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    const rMultipleText = data.rMultiple != null && !isNaN(data.rMultiple)
                                        ? `${data.rMultiple.toFixed(2)}R`
                                        : 'N/A R';
                                    return (_jsxs("div", { className: "custom-tooltip", style: { backgroundColor: 'rgba(40,44,52,0.9)', padding: '10px', borderRadius: '5px', border: '1px solid #555' }, children: [_jsx("p", { style: { margin: 0, color: '#61dafb' }, children: `Trade ID: ${data.trade_id} (${data.instrument_ticker})` }), _jsx("p", { style: { margin: 0 }, children: `Duration: ${data.durationHours.toFixed(1)} hrs` }), _jsx("p", { style: { margin: 0, color: data.netPnl >= 0 ? '#4CAF50' : '#f44336' }, children: `Net P&L: ${data.netPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}` }), _jsx("p", { style: { margin: 0 }, children: `R-Multiple: ${rMultipleText}` })] }));
                                }
                                return null;
                            } }), _jsx(Legend, {}), _jsx(Scatter, { name: "Trades", data: formattedData, fillOpacity: 0.7, children: formattedData.map((entry, index) => (_jsx("circle", { cx: entry.durationHours, cy: entry.netPnl, r: 5, fill: entry.netPnl >= 0 ? "#4CAF50" : "#f44336" }, `point-${index}`))) })] }) })] }));
};
export default PnlVsDurationScatterPlot;
