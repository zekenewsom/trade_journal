import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PropTypes from 'prop-types';
export function PnLCalendar({ data }) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Calculate value ranges for color mapping
    const values = Object.values(data);
    const positiveValues = values.filter(v => v > 0);
    const negativeValues = values.filter(v => v < 0);
    const maxGain = positiveValues.length > 0 ? Math.max(...positiveValues) : 0.01;
    const maxLoss = negativeValues.length > 0 ? Math.abs(Math.min(...negativeValues)) : 0.01;
    // Get color class based on value
    const getColorClass = (value) => {
        if (value === 0)
            return { background: "hsl(var(--muted))" };
        const intensity = Math.min(Math.abs(value) / (value > 0 ? maxGain : maxLoss), 1);
        const alpha = intensity * 0.8; // Use 80% max opacity for color
        if (value > 0) {
            return { background: "hsl(var(--chart-1))", opacity: alpha };
        }
        else {
            return { background: "hsl(var(--chart-2))", opacity: alpha };
        }
    };
    return (_jsxs(Card, { className: "col-span-3 row-span-2", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "30 Day P&L Heatmap" }), _jsx(CardDescription, { children: "Daily profit and loss calendar view" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-7 gap-1", children: [days.map(day => (_jsx("div", { className: "text-center text-xs text-muted-foreground", children: day }, day))), Object.entries(data).map(([day, value]) => (_jsxs("div", { className: "h-12 rounded flex flex-col items-center justify-center", style: getColorClass(value), children: [_jsx("div", { className: "text-xs text-muted-foreground", children: day.split('-')[2] }), _jsxs("div", { className: `text-xs ${value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-muted-foreground'}`, children: [value > 0 ? '+' : value < 0 ? '-' : '', "$", Math.abs(value).toFixed(1), "k"] })] }, day)))] }) })] }));
}

PnLCalendar.propTypes = {
  data: PropTypes.objectOf(PropTypes.number).isRequired
};
