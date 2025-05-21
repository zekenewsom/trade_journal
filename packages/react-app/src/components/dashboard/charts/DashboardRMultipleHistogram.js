import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Typography } from '@mui/material';
const DashboardRMultipleHistogram = ({ data }) => {
    if (!data || data.length === 0)
        return _jsx(Typography, { sx: { color: '#ccc', textAlign: 'center', mt: 2 }, children: "No R-Multiple data." });
    // Determine color based on R-multiple range (assuming range string like "<-2R", "-1R to 0R", "1R to 2R", ">2R")
    const getColor = (range) => {
        if (range.includes('-') || range.startsWith('<0'))
            return '#f44336'; // Loss
        if (range.includes('0R to') || range.includes('0R-'))
            return '#ffc658'; // Break-evenish
        return '#4caf50'; // Win
    };
    return (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: data, margin: { top: 5, right: 5, left: -25, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#333" }), _jsx(XAxis, { dataKey: "range", tick: { fontSize: 9, fill: '#aaa' } }), _jsx(YAxis, { allowDecimals: false, tick: { fontSize: 9, fill: '#aaa' } }), _jsx(Tooltip, { formatter: (value, name, props) => [`${value} trades`, props.payload.range], contentStyle: { backgroundColor: 'rgba(30, 34, 48, 0.85)', border: '1px solid #444', borderRadius: '4px' }, itemStyle: { color: '#ccc' }, labelStyle: { display: 'none' } }), _jsx(Bar, { dataKey: "count", name: "Trades", children: data.map((entry, index) => (_jsx(Cell, { fill: getColor(entry.range) }, `cell-${index}`))) })] }) }));
};
export default DashboardRMultipleHistogram;
