import React from 'react';
import { colors } from '/src/styles/design-tokens';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface DrawdownCurveChartProps {
  data?: { date: string; value: number }[];
}

export function DrawdownCurveChart({ data }: DrawdownCurveChartProps = {}) {
  // Mock data if not provided
  const mockData = data || [
    { date: 'Jan 1', value: 0 },
    { date: 'Jan 15', value: -2 },
    { date: 'Feb 1', value: -5 },
    { date: 'Feb 15', value: -3 },
    { date: 'Mar 1', value: -1 },
    { date: 'Mar 15', value: -7 },
    { date: 'Apr 1', value: -10 },
    { date: 'Apr 15', value: -5 },
    { date: 'May 1', value: -2 }
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mockData}>
          <defs>
            <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-error)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-error)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-stroke)" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: colors.cardStroke }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: colors.cardStroke }}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={['dataMin', 0]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: colors.background, borderColor: colors.cardStroke }}
            itemStyle={{ color: colors.error }}
            formatter={(value: number) => [`${value}%`, 'Drawdown']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="var(--color-error)" 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#drawdownGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 