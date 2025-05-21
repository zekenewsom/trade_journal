import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
const KeyMetricCard = ({ title, value, change, changeColor, trendData }) => {
    return (_jsxs(Paper, { sx: { p: 2, backgroundColor: '#1e2230', color: '#e0e0e0', height: '100%', position: 'relative' }, children: [_jsx(Typography, { variant: "subtitle1", sx: { color: '#8be9fd', mb: 1 }, children: title }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 'bold', color: '#f8f8f2', mb: 0.5 }, children: value }), change && _jsx(Typography, { variant: "body2", sx: { color: changeColor || '#f8f8f2' }, children: change }), trendData && trendData.length > 0 && (_jsx(Box, { sx: { height: '50px', width: '100%', position: 'absolute', bottom: 0, left: 0, opacity: 0.5 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsx(LineChart, { data: trendData, margin: { top: 5, right: 5, left: 5, bottom: 5 }, children: _jsx(Line, { type: "monotone", dataKey: "value", stroke: changeColor || "#8884d8", strokeWidth: 2, dot: false }) }) }) }))] }));
};
export default KeyMetricCard;
