import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { AreaChart, XAxis, YAxis, CartesianGrid, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
function useIsMobile() {
    if (typeof window === 'undefined')
        return false;
    return window.matchMedia('(max-width: 639px)').matches;
}
const chartConfig = {
    equity: {
        label: "Equity",
        color: "hsl(var(--chart-1))",
    },
    drawdown: {
        label: "Drawdown",
        color: "hsl(var(--chart-2))",
    },
};
const EquityCurveChart = ({ equityCurve }) => {
    const isMobile = useIsMobile();
    const equityData = useMemo(() => {
        let peak = -Infinity;
        return equityCurve.map((point) => {
            if (point.equity > peak) {
                peak = point.equity;
            }
            return {
                ...point,
                peak,
                drawdown: ((point.equity - peak) / peak) * 100,
            };
        });
    }, [equityCurve]);
    if (!equityCurve || equityCurve.length === 0) {
        return (_jsx(Card, { children: _jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Equity Curve" }), _jsx(CardDescription, { children: "No equity curve data available." })] }) }));
    }
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Equity Curve" }), _jsx(CardDescription, { children: "Portfolio equity and drawdown over time" })] }), _jsx(CardContent, { children: _jsx(ChartContainer, { config: chartConfig, children: _jsxs(AreaChart, { data: equityData, margin: { top: 20, right: 30, left: 20, bottom: 5 }, height: isMobile ? 240 : 400, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "equityGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "var(--color-equity)", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "var(--color-equity)", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "drawdownGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "var(--color-drawdown)", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "var(--color-drawdown)", stopOpacity: 0 })] })] }), _jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date", tickFormatter: (value) => new Date(value).toLocaleDateString(), interval: isMobile ? 'preserveStartEnd' : 0 }), _jsx(YAxis, { yAxisId: "equity", orientation: "left", tickFormatter: (value) => `$${value.toFixed(0)}` }), _jsx(YAxis, { yAxisId: "drawdown", orientation: "right", tickFormatter: (value) => `${value.toFixed(1)}%` }), _jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, { formatter: (value, name) => {
                                        const numValue = Number(value);
                                        if (name === 'equity')
                                            return [`$${numValue.toFixed(2)}`, 'Equity'];
                                        if (name === 'drawdown')
                                            return [`${numValue.toFixed(2)}%`, 'Drawdown'];
                                        return [value, name];
                                    }, labelFormatter: (label) => new Date(label).toLocaleDateString() }) }), !isMobile && (_jsx(ChartLegend, { content: _jsx(ChartLegendContent, {}) })), _jsx(Area, { yAxisId: "equity", type: "monotone", dataKey: "equity", stroke: "var(--color-equity)", fillOpacity: 1, fill: "url(#equityGradient)" }), _jsx(Area, { yAxisId: "drawdown", type: "monotone", dataKey: "drawdown", stroke: "var(--color-drawdown)", fillOpacity: 1, fill: "url(#drawdownGradient)" })] }) }) })] }));
};
export default EquityCurveChart;
