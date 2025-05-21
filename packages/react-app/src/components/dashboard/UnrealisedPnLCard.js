import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { ArrowUp } from 'lucide-react';
export function UnrealisedPnLCard({ value = 47892.21, change = 3200.21, changePercentage = 7.15 }) {
    const isPositive = value >= 0;
    const statusColor = isPositive ? 'good' : 'bad';
    return (_jsx(MetricCard, { title: "Unrealised P&L", status: statusColor, children: _jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: `text-2xl font-semibold font-mono ${isPositive ? 'text-positive' : 'text-negative'}`, children: [isPositive ? '+' : '', "$", _jsx(CountUp, { end: value, separator: ",", decimals: 2, preserveValue: true })] }), change !== 0 && (_jsxs("div", { className: "flex items-center gap-1.5 mt-1 text-xs text-gray-400", children: [_jsx("span", { children: "vs previous day:" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(ArrowUp, { size: 10, className: isPositive ? 'text-positive' : 'text-negative rotate-180' }), _jsxs("span", { className: isPositive ? 'text-positive' : 'text-negative', children: [Math.abs(changePercentage).toFixed(2), "%"] })] })] })), _jsx("div", { className: "mt-2", children: _jsx("div", { className: "w-full bg-dark-800 h-1.5 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full ${isPositive ? 'bg-positive' : 'bg-negative'}`, style: { width: `${Math.min(Math.abs(changePercentage) * 4, 100)}%` } }) }) })] }) }));
}
