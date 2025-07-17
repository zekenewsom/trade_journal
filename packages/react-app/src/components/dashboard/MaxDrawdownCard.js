import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function MaxDrawdownCard({ value = -12.47, amountLost = 156483.48 }) {
    // Drawdown is always shown as negative, so we need to ensure the value is negative
    const drawdownValue = value <= 0 ? value : -value;
    return (_jsx(MetricCard, { title: "Max Historical Drawdown", status: "bad", children: _jsxs("div", { className: "flex flex-col bg-white", children: [_jsx("div", { className: "text-2xl font-semibold font-mono text-primary", children: _jsx(CountUp, { end: drawdownValue, decimals: 2, preserveValue: true, suffix: "%" }) }), _jsxs("div", { className: "text-xs text-secondary mt-1", children: [_jsxs("span", { className: "text-primary", children: ["$", Math.abs(amountLost).toLocaleString()] }), " lost"] }), _jsx("div", { className: "w-full h-1.5 rounded-full overflow-hidden mt-2 bg-gray-200", children: _jsx("div", { className: "h-full bg-red-500", style: { width: `${Math.min(Math.abs(drawdownValue) / 25 * 100, 100)}%` } }) })] }) }));
}
