// File: zekenewsom-trade_journal/packages/react-app/src/components/analytics/PnlVsDurationScatterPlot.tsx
// New File for Stage 6

import React from 'react';
import { colors } from '/src/styles/design-tokens';

import type { DurationPerformanceData } from '../../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function useIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 639px)').matches;
}

interface PnlVsDurationScatterPlotProps {
  data: DurationPerformanceData[];
}

interface FormattedDataPoint extends DurationPerformanceData {
  durationLabel: string;
  tooltipPayload: string;
}

const PnlVsDurationScatterPlot: React.FC<PnlVsDurationScatterPlotProps> = (props: PnlVsDurationScatterPlotProps) => {
  // DEBUG: Log the incoming data
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[PnLvsDuration] formattedData:', props.data);
  }, [props.data]);
  const isMobile = useIsMobile();

  // Validate input data
  const { data } = props;
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <p>No data for P&L vs. Duration scatter plot.</p>;
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
    return <p>No valid data points for P&L vs. Duration scatter plot.</p>;
  }

  return (
    <div>
      <h4 className="mb-3 text-lg font-semibold text-on-surface">Net P&L vs. Trade Duration (Fully Closed Trades)</h4>
      <ResponsiveContainer width="100%" height={isMobile ? 240 : 400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid stroke="var(--color-card-stroke)" />
          <XAxis 
            type="number" 
            dataKey="durationHours" 
            name="Duration (Hours)" 
            unit="h" 
            domain={[0, Math.max(...formattedData.map(d => d.durationHours), 1)]}
            tick={{ fontSize: 10, fill: 'var(--color-on-surface-variant)' }}
            label={{ value: "Duration (Hours)", position: "insideBottom", offset: -15, fill: 'var(--color-on-surface-variant)', fontSize: 10 }}
          />
          <YAxis 
            type="number" 
            dataKey="netPnl" 
            name="Net P&L" 
            unit="$" 
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            tick={{ fontSize: 10, fill: 'var(--color-on-surface-variant)' }}
            label={{ value: "Net P&L ($)", angle: -90, position: "insideLeft", fill: 'var(--color-on-surface-variant)', fontSize: 10 }}
          />
          {/* ZAxis can be used for bubble size if we have another metric like volume */}
          {/* <ZAxis dataKey="rMultiple" range={[10, 500]} name="R-Multiple" unit="R"/> */}
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            formatter={(value: number, name: string) => {
              if (name === 'Net P&L') return `$${value.toFixed(2)}`;
              if (name === 'Duration (Hours)') return `${value.toFixed(1)} hrs`;
              return value;
            }}
          />
          {!isMobile && <Legend />}
          <Scatter
            name="Trades"
            data={formattedData}
            fillOpacity={0.7}
            shape={(props: any) => {
              const { cx, cy, payload } = props as { cx?: number; cy?: number; payload?: any };
              if (typeof cx !== 'number' || typeof cy !== 'number' || isNaN(cx) || isNaN(cy)) {
                // Return an invisible circle to satisfy type
                return <circle cx={0} cy={0} r={0} fill="none" />;
              }
              // Use theme color constants for fill
              const color = payload.netPnl >= 0 ? colors.success : colors.error;
              return <circle cx={cx} cy={cy} r={6} fill={color} />;
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PnlVsDurationScatterPlot;