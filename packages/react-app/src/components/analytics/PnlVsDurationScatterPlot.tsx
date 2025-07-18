import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@mui/material/styles';
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

import type { DurationPerformanceData } from '../../types';

function useIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 639px)').matches;
}

interface PnlVsDurationScatterPlotProps {
  data: DurationPerformanceData[];
}

const PnlVsDurationScatterPlot: React.FC<PnlVsDurationScatterPlotProps> = (props: PnlVsDurationScatterPlotProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  
  // DEBUG: Log the incoming data
  React.useEffect(() => {
    console.log('[PnLvsDuration] formattedData:', props.data);
  }, [props.data]);

  // Validate input data
  const { data } = props;
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-muted-foreground">No data for P&L vs. Duration scatter plot.</p>
      </div>
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
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-muted-foreground">No valid data points for P&L vs. Duration scatter plot.</p>
      </div>
    );
  }

  // Split data into profitable and losing trades
  const profitableData = formattedData.filter(item => item.netPnl > 0);
  const losingData = formattedData.filter(item => item.netPnl <= 0);

  const renderTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 rounded shadow-lg bg-white border border-gray-200">
          <p className="text-xs text-secondary">{data.tooltipPayload}</p>
          <p className="text-sm font-medium">
            Duration: {data.durationHours.toFixed(1)} hrs
          </p>
          <p className="text-sm font-medium" style={{ color: data.netPnl > 0 ? theme.palette.success.main : theme.palette.error.main }}>
            P&L: ${data.netPnl.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <ScatterChart
        data={formattedData}
        margin={{ top: 20, right: 30, left: 80, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis 
          type="number" 
          dataKey="durationHours" 
          name="Duration (Hours)" 
          unit="h" 
          domain={[0, Math.max(...formattedData.map(d => d.durationHours), 1)]}
          label={{ 
            value: "Duration (Hours)", 
            position: "insideBottom", 
            offset: -5,
            style: { textAnchor: 'middle', fontSize: '12px', fill: theme.palette.text.primary }
          }}
          tick={{ fontSize: 12, fill: theme.palette.text.primary }}
          axisLine={{ stroke: theme.palette.divider }}
          tickLine={{ stroke: theme.palette.divider }}
        />
        <YAxis 
          type="number" 
          dataKey="netPnl" 
          name="Net P&L" 
          unit="$" 
          tickFormatter={(value) => `$${Math.round(value)}`}
          label={{ 
            value: "Net P&L ($)", 
            angle: -90, 
            position: "insideLeft",
            style: { textAnchor: 'middle', fontSize: '12px', fill: theme.palette.text.primary }
          }}
          tick={{ fontSize: 12, fill: theme.palette.text.primary }}
          axisLine={{ stroke: theme.palette.divider }}
          tickLine={{ stroke: theme.palette.divider }}
          width={70}
        />
        <Tooltip content={renderTooltip} />
        {!isMobile && (
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
        )}
        {profitableData.length > 0 && (
          <Scatter
            name="Profitable Trades"
            data={profitableData}
            fill={theme.palette.success.main}
          />
        )}
        {losingData.length > 0 && (
          <Scatter
            name="Losing Trades"
            data={losingData}
            fill={theme.palette.error.main}
          />
        )}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default PnlVsDurationScatterPlot;