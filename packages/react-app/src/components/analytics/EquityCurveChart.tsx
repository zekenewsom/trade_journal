import React, { useMemo } from 'react';
import { AreaChart, XAxis, YAxis, CartesianGrid, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { EquityCurvePoint } from '../../types';

function useIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 639px)').matches;
}

interface Props {
  equityCurve: EquityCurvePoint[];
}

const chartConfig = {
  equity: {
    label: "Equity",
    color: "hsl(142 76% 36%)", // Green color for equity
  },
  drawdown: {
    label: "Drawdown", 
    color: "hsl(0 84% 60%)", // Red color for drawdown
  },
}

const EquityCurveChart: React.FC<Props> = ({ equityCurve }: Props) => {
  const isMobile = useIsMobile();
  const equityData = useMemo(() => {
    let peak = -Infinity;
    return equityCurve.map((point: EquityCurvePoint) => {
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
          <CardDescription>No equity curve data available.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equity Curve</CardTitle>
        <CardDescription>Portfolio equity and drawdown over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={equityData}
            margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
            height={isMobile ? 300 : 500}
          >
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-equity)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-equity)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-drawdown)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-drawdown)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => {
                const date = new Date(value);
                return isMobile ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : 
                                 date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
              interval={Math.max(Math.floor(equityData.length / 8), 1)}
            />
            <YAxis 
              yAxisId="equity"
              orientation="left"
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <YAxis 
              yAxisId="drawdown"
              orientation="right"
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value: any, name: any) => {
                    const numValue = Number(value);
                    if (name === 'equity') return [`$${numValue.toFixed(2)}`, 'Equity'];
                    if (name === 'drawdown') return [`${numValue.toFixed(2)}%`, 'Drawdown'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
              }
            />
            {!isMobile && (
              <ChartLegend content={<ChartLegendContent />} />
            )}
            <Area
              yAxisId="equity"
              type="monotone"
              dataKey="equity"
              stroke="var(--color-equity)"
              fillOpacity={1}
              fill="url(#equityGradient)"
            />
            <Area
              yAxisId="drawdown"
              type="monotone"
              dataKey="drawdown"
              stroke="var(--color-drawdown)"
              fillOpacity={1}
              fill="url(#drawdownGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EquityCurveChart;