import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { useTheme } from '@mui/material/styles';
export function SharpeDailyCard({ value = 4.32 }) {
    // Determine color based on value
    const theme = useTheme();
    const getStatusColor = () => {
        if (value >= 4)
            return theme.palette.success.main;
        if (value >= 2)
            return theme.palette.warning.main;
        return theme.palette.error.main;
    };
    return (_jsx(MetricCard, { title: "Daily Sharpe", className: "bg-white", children: _jsxs("div", { className: "flex flex-col h-full justify-between", children: [_jsx("div", { className: "text-2xl font-semibold font-mono text-primary", style: { color: getStatusColor() }, children: _jsx(CountUp, { end: value, decimals: 2, preserveValue: true }) }), _jsx("div", { className: "text-xs mt-2 text-secondary", children: value >= 4 ? 'Excellent' : value >= 2 ? 'Good' : value >= 1 ? 'Moderate' : 'Poor' })] }) }));
}
