import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format } from 'date-fns';
const chartConfig = {
    value: {
        label: "Cumulative Equity",
        color: "hsl(var(--chart-1))",
    },
};
export function CumulativeEquityChart({ data }) {
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Cumulative Equity" }), _jsx(CardDescription, { children: "Portfolio value over time" })] }), _jsx(CardContent, { children: _jsx(ChartContainer, { config: chartConfig, children: _jsxs(AreaChart, { data: data, margin: { top: 5, right: 5, left: 5, bottom: 5 }, height: 256, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date", axisLine: false, tickLine: false, tickFormatter: (value) => format(new Date(value), 'MMM') }), _jsx(YAxis, { axisLine: false, tickLine: false, tickFormatter: (value) => `$${value}` }), _jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, { formatter: (value) => [
                                        `$${value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                                        "Cumulative Equity"
                                    ], labelFormatter: (label) => format(new Date(label), 'MMM d, yyyy') }) }), _jsx("defs", { children: _jsxs("linearGradient", { id: "equityGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "var(--color-value)", stopOpacity: 0.2 }), _jsx("stop", { offset: "95%", stopColor: "var(--color-value)", stopOpacity: 0.01 })] }) }), _jsx(Area, { type: "monotone", dataKey: "value", stroke: "var(--color-value)", strokeWidth: 2, fill: "url(#equityGradient)", fillOpacity: 1 })] }) }) })] }));
}
