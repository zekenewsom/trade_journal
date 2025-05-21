// File: zekenewsom-trade_journal/packages/react-app/src/components/analytics/PnlVsDurationScatterPlot.tsx
// New File for Stage 6

import React from 'react';
import type { DurationPerformanceData } from '../../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { colors } from '../../styles/design-tokens';

interface PnlVsDurationScatterPlotProps {
  data: DurationPerformanceData[];
}

interface FormattedDataPoint extends DurationPerformanceData {
  durationLabel: string;
  tooltipPayload: string;
}

const PnlVsDurationScatterPlot: React.FC<PnlVsDurationScatterPlotProps> = ({ data }) => {
  // Validate input data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <p>No data for P&L vs. Duration scatter plot.</p>;
  }

  // Filter out invalid data points and format the data
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
    .map(item => {
      const rMultipleText = item.rMultiple != null && !isNaN(item.rMultiple) 
        ? `${item.rMultiple.toFixed(2)}R` 
        : 'N/A R';
      
      return {
        ...item,
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
      <h4 style={{ color: colors.onSurface }}>Net P&L vs. Trade Duration (Fully Closed Trades)</h4>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid stroke={colors.cardStroke}/>
          <XAxis 
            type="number" 
            dataKey="durationHours" 
            name="Duration (Hours)" 
            unit="h" 
            tick={{ fontSize: 10, fill: colors.textSecondary }}
            label={{ value: "Duration (Hours)", position: "insideBottom", offset: -15, fill: colors.textSecondary, fontSize: 10 }}
          />
          <YAxis 
            type="number" 
            dataKey="netPnl" 
            name="Net P&L" 
            unit="$" 
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            tick={{ fontSize: 10, fill: colors.textSecondary }}
            label={{ value: "Net P&L ($)", angle: -90, position: "insideLeft", fill: colors.textSecondary, fontSize: 10 }}
          />
          {/* ZAxis can be used for bubble size if we have another metric like volume */}
          {/* <ZAxis dataKey="rMultiple" range={[10, 500]} name="R-Multiple" unit="R"/> */}
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            formatter={(value: any, name: string) => {
                if (name === 'Net P&L') return `$${Number(value).toFixed(2)}`;
                if (name === 'Duration (Hours)') return `${Number(value).toFixed(1)} hrs`;
                return value;
            }}
            content={({ active, payload }) => {
                if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const rMultipleText = data.rMultiple != null && !isNaN(data.rMultiple)
                        ? `${data.rMultiple.toFixed(2)}R`
                        : 'N/A R';
                    return (
                        <div className="custom-tooltip" style={{backgroundColor: 'rgba(35,38,58,0.92)', padding: '10px', borderRadius: '5px', border: `1px solid ${colors.cardStroke}`}}>
                            <p style={{margin:0, color: colors.accent}}>{`Trade ID: ${data.trade_id} (${data.instrument_ticker})`}</p>
                            <p style={{margin:0, color: colors.onSurface}}>{`Duration: ${data.durationHours.toFixed(1)} hrs`}</p>
                            <p style={{margin:0, color: data.netPnl >= 0 ? colors.success : colors.error}}>{`Net P&L: ${data.netPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}</p>
                            <p style={{margin:0, color: colors.onSurface}}>{`R-Multiple: ${rMultipleText}`}</p>
                        </div>
                    );
                }
                return null;
            }}
          />
          <Legend />
          <Scatter 
            name="Trades" 
            data={formattedData} 
            fillOpacity={0.7}
          >
            {formattedData.map((entry: FormattedDataPoint, index: number) => (
              <circle
                key={`point-${index}`}
                cx={entry.durationHours}
                cy={entry.netPnl}
                r={5}
                fill={entry.netPnl >= 0 ? colors.success : colors.error}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PnlVsDurationScatterPlot;