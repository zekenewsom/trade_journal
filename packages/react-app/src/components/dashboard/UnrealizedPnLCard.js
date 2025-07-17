import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function UnrealizedPnLCard({ value }) {
    const isPositive = value >= 0;
    return (_jsx(MetricCard, { title: "Unrealized P&L", size: "sm", className: "bg-white order-2", status: isPositive ? 'good' : 'bad', children: _jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: `text-2xl font-semibold font-mono text-primary ${isPositive ? 'text-green-600' : 'text-error'}`, children: [isPositive ? '+' : '', _jsx(CountUp, { end: value, separator: ",", decimal: ".", decimals: 2, duration: 1, prefix: "$" })] }), _jsx("div", { className: "text-xs mt-1 text-secondary", children: "Mark-to-market value" })] }) }));
}
