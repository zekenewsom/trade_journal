import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
export function PnLCalendar({ data }) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Calculate value ranges for color mapping
    const values = Object.values(data);
    const maxGain = Math.max(...values.filter(v => v > 0), 0.01);
    const maxLoss = Math.abs(Math.min(...values.filter(v => v < 0), -0.01));
    // Get color class based on value
    const getColorClass = (value) => {
        if (value === 0)
            return 'bg-dark-500';
        const intensity = Math.min(Math.abs(value) / (value > 0 ? maxGain : maxLoss), 1);
        const alphaHex = Math.round(intensity * 255).toString(16).padStart(2, '0');
        if (value > 0) {
            return `bg-[#00E28A${alphaHex}]`;
        }
        else {
            return `bg-[#FF4D67${alphaHex}]`;
        }
    };
    return (_jsx(MetricCard, { title: "30 Day P&L Heatmap Calendar", size: "sm", className: "col-span-3 row-span-2", children: _jsxs("div", { className: "grid grid-cols-7 gap-1", children: [days.map(day => (_jsx("div", { className: "text-center text-xs text-gray-400", children: day }, day))), Object.entries(data).map(([day, value]) => (_jsxs("div", { className: `h-12 rounded flex flex-col items-center justify-center ${getColorClass(value)}`, children: [_jsx("div", { className: "text-xs font-medium", children: day.split('-')[2] }), _jsxs("div", { className: `text-xs ${value > 0 ? 'text-positive' : value < 0 ? 'text-negative' : 'text-gray-400'}`, children: [value > 0 ? '+' : value < 0 ? '-' : '', "$", Math.abs(value).toFixed(1), "k"] })] }, day)))] }) }));
}
