// File: zekenewsom-trade_journal/packages/react-app/src/components/analytics/PerformanceByTimeChart.tsx
// New File for Stage 6 (Example for P&L by Month)

import React from 'react';
import type { TimePerformanceData } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { colors } from '../../styles/design-tokens';

interface Props {
  title: string;
  data: TimePerformanceData[];
  dataKeyX: string;
  dataKeyY: string;
}

const PerformanceByTimeChart: React.FC<Props> = ({ title, data, dataKeyX, dataKeyY }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-sm" style={{ color: colors.textSecondary }}>
        No data available for {title}.
      </div>
    );
  }

  const yAxisLabel = dataKeyY === 'totalNetPnl' ? "Net P&L ($)" : "Count / Rate";

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4" style={{ color: colors.onSurface }}>{title}</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.cardStroke} />
            <XAxis 
              dataKey={dataKeyX} 
              tick={{ fontSize: 12, fill: colors.textSecondary }}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              tick={{ fontSize: 12, fill: colors.textSecondary }}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
              contentStyle={{ 
                backgroundColor: colors.surface,
                border: `1px solid ${colors.cardStroke}`,
                borderRadius: '0.375rem'
              }}
            />
            <Bar dataKey={dataKeyY} name="P&L">
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.totalNetPnl >= 0 ? colors.success : colors.error}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceByTimeChart;