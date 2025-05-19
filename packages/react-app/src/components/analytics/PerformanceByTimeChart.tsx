// File: zekenewsom-trade_journal/packages/react-app/src/components/analytics/PerformanceByTimeChart.tsx
// New File for Stage 6 (Example for P&L by Month)

import React from 'react';
import type { TimePerformanceData } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  title: string;
  data: TimePerformanceData[];
  dataKeyX: string;
  dataKeyY: string;
}

const PerformanceByTimeChart: React.FC<Props> = ({ title, data, dataKeyX, dataKeyY }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-gray-400 text-sm">
        No data available for {title}.
      </div>
    );
  }

  const yAxisLabel = dataKeyY === 'totalNetPnl' ? "Net P&L ($)" : "Count / Rate";

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2B2D" />
            <XAxis 
              dataKey={dataKeyX} 
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
              contentStyle={{ 
                backgroundColor: '#1A1B1D',
                border: '1px solid #2A2B2D',
                borderRadius: '0.375rem'
              }}
            />
            <Bar dataKey={dataKeyY} name="P&L">
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.totalNetPnl >= 0 ? '#00E28A' : '#FF4D67'}
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