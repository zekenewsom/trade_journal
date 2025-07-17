import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

import type { DurationPerformanceData } from '../../types';

function useIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 639px)').matches;
}

interface PnlVsDurationScatterPlotProps {
  data: DurationPerformanceData[];
}

const chartConfig = {
  netPnl: {
    label: "Net P&L",
    color: "hsl(142 76% 36%)",
  },
  durationHours: {
    label: "Duration",
    color: "hsl(0 84% 60%)",
  },
}

const PnlVsDurationScatterPlot: React.FC<PnlVsDurationScatterPlotProps> = (props: PnlVsDurationScatterPlotProps) => {
  // DEBUG: Log the incoming data
  React.useEffect(() => {
     
    console.log('[PnLvsDuration] formattedData:', props.data);
  }, [props.data]);
  const isMobile = useIsMobile();

  // Validate input data
  const { data } = props;
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>P&L vs Duration</CardTitle>
          <CardDescription>No data for P&L vs. Duration scatter plot.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Filter out invalid data points and format the data
  // Add jitter to durationHours if it is exactly zero
  const formattedData = data
    .filter(item => 
      item != null && 
      typeof item.durationHours === 'number' && 
      !isNaN(item.durationHours) &&
      typeof item.netPnl === 'number' && 
      !isNaN(item.netPnl) &&
      typeof item.trade_id === 'number' &&
      typeof item.instrument_ticker === 'string'
    )
    .map((item, i) => {
      const rMultipleText = item.rMultiple != null && !isNaN(item.rMultiple) 
        ? `${item.rMultiple.toFixed(2)}R` 
        : 'N/A R';
      // Add jitter if duration is zero
      const jitter = item.durationHours === 0 ? (i * 0.05 + 0.01) : 0;
      return {
        ...item,
        durationHours: item.durationHours + jitter,
        durationLabel: `${item.durationHours.toFixed(1)} hrs`,
        tooltipPayload: `ID ${item.trade_id} (${item.instrument_ticker}): ${item.netPnl > 0 ? '+' : ''}${item.netPnl.toFixed(2)} P&L, ${rMultipleText}`
      };
    });

  // If no valid data points after filtering, show message
  if (formattedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>P&L vs Duration</CardTitle>
          <CardDescription>No valid data points for P&L vs. Duration scatter plot.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>P&L vs Duration</CardTitle>
        <CardDescription>Trade performance plotted against holding duration</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ScatterChart
            data={formattedData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            height={isMobile ? 240 : 400}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="durationHours" 
              name="Duration (Hours)" 
              unit="h" 
              domain={[0, Math.max(...formattedData.map(d => d.durationHours), 1)]}
              label={{ value: "Duration (Hours)", position: "insideBottom", offset: -15 }}
            />
            <YAxis 
              type="number" 
              dataKey="netPnl" 
              name="Net P&L" 
              unit="$" 
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              label={{ value: "Net P&L ($)", angle: -90, position: "insideLeft" }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value: any, name: any) => {
                    const numValue = Number(value);
                    if (name === 'netPnl') return [`$${numValue.toFixed(2)}`, 'Net P&L'];
                    if (name === 'durationHours') return [`${numValue.toFixed(1)} hrs`, 'Duration'];
                    return [value, name];
                  }}
                />
              }
            />
            {!isMobile && (
              <ChartLegend content={<ChartLegendContent />} />
            )}
            <Scatter
              name="Trades"
              data={formattedData}
              fill="var(--color-netPnl)"
            />
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PnlVsDurationScatterPlot;