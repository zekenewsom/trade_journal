import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Typography } from '@mui/material';
import { colors } from '../../../styles/design-tokens';
import PropTypes from 'prop-types';
const DashboardRMultipleHistogram = ({ data }) => {
    if (!data || data.length === 0)
        return _jsx(Typography, { sx: { color: colors.textSecondary, textAlign: 'center', mt: 2 }, children: "No R-Multiple data." });
    // Determine color based on R-multiple range (assuming range string like "<-2R", "-1R to 0R", "1R to 2R", ">2R")
    const getColor = (range) => {
        if (range.includes('-') || range.startsWith('<0'))
            return colors.error; // Loss
        if (range.includes('0R to') || range.includes('0R-'))
            return colors.warning; // Break-evenish
        return colors.success; // Win
    };
    return (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: data, margin: { top: 5, right: 5, left: -25, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: colors.cardStroke }), _jsx(XAxis, { dataKey: "range", tick: { fontSize: 9, fill: colors.textSecondary } }), _jsx(YAxis, { allowDecimals: false, tick: { fontSize: 9, fill: colors.textSecondary } }), _jsx(Tooltip, { formatter: (value, name, props) => [`${value} trades`, props.payload.range], contentStyle: { backgroundColor: colors.surface, border: `1px solid ${colors.cardStroke}`, borderRadius: '4px' }, itemStyle: { color: colors.textSecondary }, labelStyle: { display: 'none' } }), _jsx(Bar, { dataKey: "count", name: "Trades", children: data.map((entry, index) => (_jsx(Cell, { fill: getColor(entry.range) }, `cell-${index}`))) })] }) }));
};

DashboardRMultipleHistogram.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            range: PropTypes.string.isRequired,
            count: PropTypes.number.isRequired
        })
    ).isRequired
};

export default DashboardRMultipleHistogram;
