import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
const KeyMetricCard = ({ title, value, change, trendData }) => {
    return (_jsxs(Paper, { className: "p-4 rounded-2xl h-full relative bg-white", children: [_jsx(Typography, { variant: "subtitle1", className: "mb-1 text-secondary", children: title }), _jsx(Typography, { variant: "h4", className: "mb-0.5 font-bold text-primary", children: value }), change && _jsx(Typography, { variant: "body2", className: "text-secondary", children: change }), trendData && trendData.length > 0 && (_jsx(Box, { className: "absolute left-0 bottom-0 w-full bg-gray-200", sx: { height: '50px', opacity: 0.5 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsx(LineChart, { data: trendData, margin: { top: 8, right: 8, left: 8, bottom: 8 }, children: _jsx(Line, { type: "monotone", dataKey: "value", stroke: "var(--color-on-surface-variant)", strokeWidth: 2, dot: false }) }) }) }))] }));
};
export default KeyMetricCard;
