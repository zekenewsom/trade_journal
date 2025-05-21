import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function SharpeDailyCard({ value = 4.32 }) {
    // Determine color based on value
    const getStatusColor = () => {
        if (value >= 4)
            return 'text-positive';
        if (value >= 2)
            return 'text-warning';
        return 'text-negative';
    };
    return (_jsx(MetricCard, { title: "Daily Sharpe", children: _jsxs("div", { className: "flex flex-col h-full justify-between", children: [_jsx("div", { className: `text-2xl font-semibold font-mono ${getStatusColor()}`, children: _jsx(CountUp, { end: value, decimals: 2, preserveValue: true }) }), _jsx("div", { className: "text-xs text-gray-400 mt-2", children: value >= 4 ? 'Excellent' : value >= 2 ? 'Good' : value >= 1 ? 'Moderate' : 'Poor' })] }) }));
}
