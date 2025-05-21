import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function UnrealizedPnLCard({ value }) {
    const isPositive = value >= 0;
    return (_jsx(MetricCard, { title: "Unrealized P&L", size: "sm", status: isPositive ? 'good' : 'bad', className: "order-2", children: _jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: `text-2xl font-semibold font-mono ${isPositive ? 'text-positive' : 'text-negative'}`, children: [isPositive ? '+' : '', _jsx(CountUp, { end: value, separator: ",", decimal: ".", decimals: 2, duration: 1, prefix: "$" })] }), _jsx("div", { className: "text-xs text-gray-400 mt-1", children: "Mark-to-market value" })] }) }));
}
