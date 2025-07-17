import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function ProfitFactorCard({ value = 2.12, status = 'good' }) {
    // Calculate the ratio for the progress bar (a profit factor of 3+ is typically excellent)
    const ratio = Math.min(value / 3, 1) * 100;
    return (_jsx(MetricCard, { title: "Profit Factor", status: status, children: _jsxs("div", { className: "flex flex-col", children: [_jsx("div", { className: "text-2xl font-semibold font-mono text-primary", children: _jsx(CountUp, { end: value, decimals: 2, preserveValue: true }) }), _jsxs("div", { className: "flex items-center justify-between mt-1 mb-1", children: [_jsx("div", { className: "text-xs text-secondary", children: "Poor" }), _jsx("div", { className: "text-xs text-secondary", children: "Good" })] }), _jsx("div", { className: "w-full h-1 rounded-full bg-gray-200", children: _jsx("div", { className: `h-1 rounded-full ${status === 'good' ? 'bg-green-500' : status === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'}`, style: { width: `${ratio}%` } }) })] }) }));
}
