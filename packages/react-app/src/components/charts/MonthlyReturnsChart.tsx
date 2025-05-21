import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { colors } from '/src/styles/design-tokens';

interface MonthlyReturnsChartProps {
  data?: { value: number; count: number }[];
}

export function MonthlyReturnsChart({ data }: MonthlyReturnsChartProps = {}) {
  // Mock data if not provided - each bar represents an R-multiple value range
  const mockData = data || [
    { value: -3, count: 3 },
    { value: -2, count: 5 },
    { value: -1, count: 12 },
    { value: 0, count: 20 },
    { value: 1, count: 30 },
    { value: 2, count: 15 },
    { value: 3, count: 8 },
    { value: 4, count: 5 },
    { value: 5, count: 2 }
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mockData} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A1B1D" vertical={false} />
          <XAxis 
            dataKey="value" 
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: colors.cardStroke }}
            tickLine={false}
            tickFormatter={(value) => `${value}R`}
          />
          <YAxis 
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: colors.cardStroke }}
            tickLine={false}
            tickFormatter={(value) => value}
            label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fill: colors.textSecondary, fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: colors.background, borderColor: colors.cardStroke }}
            formatter={(value: number) => [value, 'Trades']}
            labelFormatter={(label) => `R-Multiple: ${label}`}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {mockData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.value < 0 ? colors.error : entry.value === 0 ? colors.warning : colors.success} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 