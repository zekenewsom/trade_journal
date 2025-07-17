// packages/react-app/src/components/charts/MonthlyReturnsChart.tsx
// This should be adapted to display R-Multiple Distribution based on target design
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Typography, Box } from '@mui/material';
import { colors, typography, borderRadius as br } from '../../styles/design-tokens';

interface TimePerformanceData {
  period: string; // e.g., "2024-01", "Monday"
  totalNetPnl: number;
  tradeCount: number;
  winRate: number | null;
  wins?: number;
  losses?: number;
  breakEvens?: number;
}

interface MonthlyReturnsChartProps {
  data: TimePerformanceData[];
  height?: number | string;
}

export function MonthlyReturnsChart({ data, height = '100%' }: MonthlyReturnsChartProps) {
  if (!data || data.length === 0) {
    return (
       <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <Typography sx={{ color: colors.textSecondary, fontSize: typography.fontSize.sm }}>
          No R-Multiple data available.
        </Typography>
      </Box>
    );
  }

  const getColor = (totalNetPnl: number) => {
    if (totalNetPnl < 0) return colors.chartNegative;
    if (totalNetPnl === 0) return colors.chartNeutral;
    return colors.chartPositive;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGridLines} vertical={false} />
        <XAxis
          dataKey="period"
          tick={{ fill: colors.textSecondary, fontSize: typography.fontSize.xs }}
          axisLine={{ stroke: colors.border }}
          tickLine={false}
          interval={0} // Show all labels if space permits
        />
        <YAxis
          allowDecimals={true}
          tick={{ fill: colors.textSecondary, fontSize: typography.fontSize.xs }}
          axisLine={{ stroke: colors.border }}
          tickLine={{ stroke: colors.border }}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Net P&L']}
          labelFormatter={(label: string) => `Period: ${label}`}
          contentStyle={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: br.md,
            fontSize: typography.fontSize.xs,
          }}
          itemStyle={{ color: colors.textSecondary }}
          labelStyle={{ color: colors.onSurface, fontWeight: typography.fontWeight.medium }}
        />
        <Bar dataKey="totalNetPnl" name="Net P&L" barSize={20}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.totalNetPnl)} radius={[parseInt(br.sm), parseInt(br.sm), 0, 0]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}