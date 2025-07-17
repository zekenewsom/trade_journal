import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function ExpectancyCard({ value }) {
    const getStatus = () => {
        if (value >= 2000)
            return 'good';
        if (value >= 500)
            return 'moderate';
        if (value <= 0)
            return 'bad';
        return 'default';
    };
    return (_jsx(MetricCard, { title: "Expectancy (R*Trade)", size: "sm", status: getStatus(), children: _jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: `text-2xl font-semibold font-mono text-primary ${Number(value) >= 0 ? 'text-green-600' : 'text-error'}`, children: [Number(value) >= 0 ? '+' : '', _jsx(CountUp, { end: Number(value), separator: ",", decimal: ".", decimals: 2, duration: 1, prefix: "$" })] }), _jsxs("div", { className: "flex items-center gap-1 mt-1", children: [_jsx("span", { className: "text-xs text-secondary", children: "Per trade profit/loss" }), _jsx("span", { className: `text-xs font-medium ${Number(value) >= 0 ? 'text-green-600' : 'text-error'}`, children: Number(value) >= 500 ? 'Strong' : Number(value) >= 0 ? 'Profitable' : 'Unprofitable' })] })] }) }));
}
