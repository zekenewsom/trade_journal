import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { useAppStore } from '../../stores/appStore';
export function BuyingPowerCard({ allocation = 64 }) {
    // Get aggregated available buying power from the store
    const totalBuyingPower = useAppStore(s => s.getTotalBuyingPower());
    return (_jsx(MetricCard, { title: "Available Buying Power", className: "bg-white", children: _jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: "text-2xl font-semibold font-mono text-primary", children: ["$", _jsx(CountUp, { end: totalBuyingPower, separator: ",", decimals: 2, preserveValue: true })] }), _jsxs("div", { className: "flex items-center justify-between mt-4", children: [_jsxs("div", { className: "text-xs text-secondary", children: [_jsx("span", { className: "mr-1", children: "Allocation:" }), _jsxs("span", { className: "font-medium", children: [allocation, "%"] })] }), _jsxs("div", { className: "text-xs text-secondary", children: [_jsx("span", { className: "mr-1", children: "Free:" }), _jsxs("span", { className: "font-medium", children: [100 - allocation, "%"] })] })] }), _jsx("div", { className: "mt-1", children: _jsx("div", { className: "w-full h-1.5 rounded-full overflow-hidden bg-gray-200", children: _jsx("div", { className: "h-full bg-primary", style: { width: `${allocation}%` } }) }) })] }) }));
}
