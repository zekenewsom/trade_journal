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
    return <p>No data available for {title}.</p>;
  }
  const yAxisLabel = dataKeyY === 'totalNetPnl' ? "Net P&L ($)" : "Count / Rate";

  return (
    <div>
      <h3 style={{ color: '#61dafb', marginBottom: '15px' }}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis 
            dataKey={dataKeyX} 
            tick={{ fontSize: 10, fill: '#ccc' }}
          />
          <YAxis 
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            tick={{ fontSize: 10, fill: '#ccc' }}
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
            labelStyle={{ color: '#61dafb' }}
            contentStyle={{ 
              backgroundColor: '#2a2f36',
              border: '1px solid #444',
              borderRadius: '4px'
            }}
          />
          <Bar 
            dataKey={dataKeyY} 
            fill="#8884d8"
            name="P&L"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceByTimeChart;