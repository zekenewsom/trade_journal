import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function KellyPercentCard({ value = 18.7, status = 'good' }) {
    // Calculate ratio for the progress bar (Kelly % usually ranges from 0-30)
    const ratio = Math.min(value / 30, 1) * 100;
    return (_jsx(MetricCard, { title: "Kelly %", status: status, children: _jsxs("div", { className: "flex flex-col", children: [_jsx("div", { className: "text-2xl font-semibold font-mono text-primary", children: _jsx(CountUp, { end: value, decimals: 1, preserveValue: true, suffix: "%" }) }), _jsx("div", { className: "w-full h-1 rounded-full mt-2 bg-gray-200", children: _jsx("div", { className: "rounded-full bg-blue-500", style: { width: `${ratio}%`, height: '100%' } }) }), _jsxs("div", { className: "flex items-center justify-between mt-1", children: [_jsx("div", { className: "text-xs text-secondary", children: "Conservative" }), _jsx("div", { className: "text-xs text-secondary", children: "Aggressive" })] })] }) }));
}
