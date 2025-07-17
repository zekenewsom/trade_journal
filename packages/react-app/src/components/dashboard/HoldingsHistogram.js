import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
const chartConfig = {
    value: {
        label: "Trades",
        color: "hsl(var(--chart-1))",
    },
};
export function HoldingsHistogram({ data }) {
    return (_jsxs(Card, { className: "col-span-3 row-span-2", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "R-Multiple Histogram" }), _jsx(CardDescription, { children: "Distribution of trade returns (Last 100 Trades)" })] }), _jsx(CardContent, { children: _jsx(ChartContainer, { config: chartConfig, children: _jsxs(BarChart, { data: data, margin: { top: 5, right: 5, left: 5, bottom: 5 }, barGap: 0, height: 256, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "r", axisLine: false, tickLine: false, tickCount: data.length }), _jsx(YAxis, { axisLine: false, tickLine: false }), _jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, { formatter: (value, name, item) => [
                                        `${value} trades`,
                                        `R-Multiple: ${item.payload?.r}R`
                                    ] }) }), _jsx(Bar, { dataKey: "value", barSize: 12, radius: [2, 2, 0, 0], children: data.map((entry, index) => (_jsx(Cell, { fill: Number(entry.r) >= 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))" }, `cell-${index}`))) })] }) }) })] }));
}
