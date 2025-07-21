import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function SwingTradesCard({ value = 24957.25, totalTrades = 56, profit = 14720.45 }) {
    // Calculate how much of the swing trades value is profit
    let profitPercentage = 0;
    if (typeof value === 'number' && value > 0) {
        profitPercentage = (profit / value) * 100;
    }
    return (_jsx(MetricCard, { title: "Swing Trades Total", children: _jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: "text-2xl font-semibold font-mono text-primary", children: ["$", _jsx(CountUp, { end: value, separator: ",", decimals: 2, preserveValue: true })] }), _jsxs("div", { className: "flex items-center text-xs gap-3 mt-2", children: [_jsxs("div", { className: "px-2 py-1 rounded-md bg-gray-200", children: [_jsx("span", { className: "mr-1 text-secondary", children: "Trades:" }), _jsx("span", { className: "font-medium", children: totalTrades })] }), _jsxs("div", { className: "px-2 py-1 rounded-md bg-gray-200", children: [_jsx("span", { className: "mr-1 text-secondary", children: "Profit:" }), _jsxs("span", { className: "font-medium text-green-600", children: [Math.round(profitPercentage), "%"] })] })] }), _jsx("div", { className: "w-full h-1.5 rounded-full overflow-hidden mt-2 bg-gray-200", children: _jsx("div", { className: "h-full bg-primary", style: { width: `${Math.min(profitPercentage, 100)}%` } }) })] }) }));
}
