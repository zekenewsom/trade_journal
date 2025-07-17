import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
const chartConfig = {
    x: {
        label: "Risk",
        color: "hsl(var(--chart-1))",
    },
    y: {
        label: "Return",
        color: "hsl(var(--chart-2))",
    },
};
export function ReturnScatterChart({ data }) {
    return (_jsxs(Card, { className: "col-span-6 row-span-2", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Return vs Risk Scatter" }), _jsx(CardDescription, { children: "Risk-return profile of trades with volume sizing" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "h-64 relative", children: [_jsxs("div", { className: "absolute inset-0 flex items-center justify-between px-8 text-xs pointer-events-none text-muted-foreground", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { children: "Lower risk" }), _jsx("div", { children: "Lower return" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { children: "Higher risk" }), _jsx("div", { children: "Higher return" })] })] }), _jsx(ChartContainer, { config: chartConfig, children: _jsxs(ScatterChart, { data: data, margin: { top: 20, right: 20, bottom: 20, left: 20 }, height: 256, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { type: "number", dataKey: "x", name: "Risk", axisLine: false, tickLine: false, domain: ['dataMin', 'dataMax'] }), _jsx(YAxis, { type: "number", dataKey: "y", name: "Return", axisLine: false, tickLine: false, domain: ['dataMin', 'dataMax'] }), _jsx(ZAxis, { type: "number", dataKey: "z", range: [50, 500], name: "Volume" }), _jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, { formatter: (value, name, item) => [
                                                name === 'x' ? `Risk: ${value.toFixed(2)}` :
                                                    name === 'y' ? `Return: ${value >= 0 ? '+' : ''}${value.toFixed(2)}%` :
                                                        value,
                                                item.payload?.ticker || 'Trade'
                                            ] }) }), _jsx(Scatter, { name: "Trades", data: data, fill: "var(--color-x)" })] }) })] }) })] }));
}
