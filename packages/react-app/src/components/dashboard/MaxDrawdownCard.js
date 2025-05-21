import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function MaxDrawdownCard({ value = -12.47, amountLost = 156483.48 }) {
    // Drawdown is always shown as negative, so we need to ensure the value is negative
    const drawdownValue = value <= 0 ? value : -value;
    return (_jsx(MetricCard, { title: "Max Historical Drawdown", status: "bad", children: _jsxs("div", { className: "flex flex-col", children: [_jsx("div", { className: "text-2xl font-semibold font-mono text-negative", children: _jsx(CountUp, { end: drawdownValue, decimals: 2, preserveValue: true, suffix: "%" }) }), _jsxs("div", { className: "text-sm text-gray-400 mt-1", children: [_jsxs("span", { className: "text-negative", children: ["$", Math.abs(amountLost).toLocaleString()] }), " lost"] }), _jsx("div", { className: "w-full bg-dark-800 h-1.5 rounded-full overflow-hidden mt-2", children: _jsx("div", { className: "h-full bg-negative", 
                        // Assuming -25% is a full bar, scale accordingly
                        style: { width: `${Math.min(Math.abs(drawdownValue) / 25 * 100, 100)}%` } }) })] }) }));
}
