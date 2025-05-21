import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function RoiCard({ value }) {
    // Determine status based on ROI value
    const getStatus = () => {
        if (value >= 15)
            return 'good';
        if (value >= 5)
            return 'moderate';
        if (value < 0)
            return 'bad';
        return 'default';
    };
    return (_jsx(MetricCard, { title: "ROI %", size: "sm", status: getStatus(), children: _jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: `text-2xl font-semibold ${value >= 0 ? 'text-positive' : 'text-negative'}`, children: [value >= 0 ? '+' : '', _jsx(CountUp, { end: value, decimals: 1, duration: 1, suffix: "%" })] }), _jsxs("div", { className: "flex gap-1 mt-2", children: [_jsx("div", { className: `h-1.5 rounded-sm ${value >= 0 ? 'bg-positive/30' : 'bg-negative/30'}`, style: { width: '10%' } }), _jsx("div", { className: `h-1.5 rounded-sm ${value >= 5 ? 'bg-positive/50' : 'bg-dark-500'}`, style: { width: '20%' } }), _jsx("div", { className: `h-1.5 rounded-sm ${value >= 10 ? 'bg-positive/70' : 'bg-dark-500'}`, style: { width: '30%' } }), _jsx("div", { className: `h-1.5 rounded-sm ${value >= 15 ? 'bg-positive' : 'bg-dark-500'}`, style: { width: '40%' } })] })] }) }));
}
