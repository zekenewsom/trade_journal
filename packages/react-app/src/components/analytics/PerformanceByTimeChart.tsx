// File: zekenewsom-trade_journal/packages/react-app/src/components/analytics/PerformanceByTimeChart.tsx
// New File for Stage 6 (Example for P&L by Month)

import React from 'react';
import type { TimePerformanceData } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';


interface Props {
  title: string;
  data: TimePerformanceData[];
  dataKeyX: string;
  dataKeyY: string;
}

const PerformanceByTimeChart: React.FC<Props> = ({ title, data, dataKeyX, dataKeyY }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No data available for {title}.
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey={dataKeyX} 
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '0.375rem'
              }}
            />
            <Bar dataKey={dataKeyY} name="P&L">
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.totalNetPnl >= 0 ? '#22C55E' : '#EF4444'}
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