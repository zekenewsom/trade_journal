import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function KellyPercentCard({ value = 18.7, status = 'good' }) {
    // Calculate ratio for the progress bar (Kelly % usually ranges from 0-30)
    const ratio = Math.min(value / 30, 1) * 100;
    return (_jsx(MetricCard, { title: "Kelly %", status: status, children: _jsxs("div", { className: "flex flex-col", children: [_jsx("div", { className: "text-2xl font-semibold font-mono", children: _jsx(CountUp, { end: value, decimals: 1, preserveValue: true, suffix: "%" }) }), _jsx("div", { className: "w-full h-1 bg-dark-700 rounded-full mt-2", children: _jsx("div", { className: "bg-primary", style: { width: `${ratio}%`, height: '100%', borderRadius: '9999px' } }) }), _jsxs("div", { className: "flex items-center justify-between mt-1", children: [_jsx("div", { className: "text-xs text-gray-400", children: "Conservative" }), _jsx("div", { className: "text-xs text-gray-400", children: "Aggressive" })] })] }) }));
}
