import React from 'react';
import { colors } from '../../styles/design-tokens';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface EquityCurveChartProps {
  data?: { date: string; value: number }[];
}

export function EquityCurveChart({ data }: EquityCurveChartProps = {}) {
  // Mock data if not provided
  const mockData = data || [
    { date: 'Jan 1', value: 1000000 },
    { date: 'Jan 15', value: 1050000 },
    { date: 'Feb 1', value: 1080000 },
    { date: 'Feb 15', value: 1040000 },
    { date: 'Mar 1', value: 1100000 },
    { date: 'Mar 15', value: 1150000 },
    { date: 'Apr 1', value: 1180000 },
    { date: 'Apr 15', value: 1200000 },
    { date: 'May 1', value: 1247862 }
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.accent} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors.accent} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: colors.border }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: colors.border }}
            tickLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: colors.surface, 
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ color: colors.onSurface }}
            labelStyle={{ color: colors.textSecondary }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={colors.accent} 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, stroke: colors.accent, strokeWidth: 2, fill: colors.surface }}
            fillOpacity={1}
            fill="url(#equityGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 