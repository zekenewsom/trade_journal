import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function SharpeRatioCard({ value = 2.37, status = 'good' }) {
    // Calculate the ratio for the progress bar (assuming good > 2, moderate 1-2, bad < 1)
    const ratio = Math.min(value / 4, 1) * 100;
    return (_jsx(MetricCard, { title: "Sharpe Ratio (YTD)", status: status, children: _jsxs("div", { className: "flex flex-col", children: [_jsx("div", { className: "text-2xl font-semibold font-mono", children: _jsx(CountUp, { end: value, decimals: 2, preserveValue: true }) }), _jsxs("div", { className: "flex items-center justify-between mt-1 mb-1", children: [_jsx("div", { className: "text-xs text-gray-400", children: "Poor" }), _jsx("div", { className: "text-xs text-gray-400", children: "Good" })] }), _jsx("div", { className: "w-full h-1 bg-dark-700 rounded-full", children: _jsx("div", { className: status === 'good'
                            ? 'bg-positive'
                            : status === 'moderate'
                                ? 'bg-warning'
                                : 'bg-negative', style: { width: `${ratio}%`, height: '100%', borderRadius: '9999px' } }) })] }) }));
}
