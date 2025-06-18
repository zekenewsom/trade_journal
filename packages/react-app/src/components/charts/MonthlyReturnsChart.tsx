// packages/react-app/src/components/charts/MonthlyReturnsChart.tsx
// This should be adapted to display R-Multiple Distribution based on target design
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Typography, Box } from '@mui/material';
import { colors, typography, borderRadius as br } from '../../styles/design-tokens';

interface RMultipleBucket {
  range: string; // e.g., "<-2R", "-1R to 0R", "1R to 2R"
  count: number;
}

interface RMultipleHistogramProps {
  data: RMultipleBucket[];
  height?: number | string;
}

export function MonthlyReturnsChart({ data, height = '100%' }: RMultipleHistogramProps) { // Renamed prop
  if (!data || data.length === 0) {
    return (
       <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <Typography sx={{ color: colors.textSecondary, fontSize: typography.fontSize.sm }}>
          No R-Multiple data available.
        </Typography>
      </Box>
    );
  }

  const getColor = (range: string) => {
    if (range.includes('-') || range.startsWith('<0') || parseFloat(range) < 0) return colors.chartNegative;
    if (range.includes('0R to') || range.startsWith('0R') || range === "N/A" || parseFloat(range) === 0) return colors.chartNeutral;
    return colors.chartPositive;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGridLines} vertical={false} />
        <XAxis
          dataKey="range"
          tick={{ fill: colors.textSecondary, fontSize: typography.fontSize.xs }}
          axisLine={{ stroke: colors.border }}
          tickLine={false}
          interval={0} // Show all labels if space permits
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: colors.textSecondary, fontSize: typography.fontSize.xs }}
          axisLine={{ stroke: colors.border }}
          tickLine={{ stroke: colors.border }}
        />
        <Tooltip
          formatter={(value: number) => value}
          labelFormatter={(label: string) => `R-Multiple: ${label}`}
          contentStyle={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: br.md,
            fontSize: typography.fontSize.xs,
          }}
          itemStyle={{ color: colors.textSecondary }}
          labelStyle={{ color: colors.onSurface, fontWeight: typography.fontWeight.medium }}
        />
        <Bar dataKey="count" name="Trades" barSize={20}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.range)} radius={[parseInt(br.sm), parseInt(br.sm), 0, 0]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}