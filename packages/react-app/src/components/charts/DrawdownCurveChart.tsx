// packages/react-app/src/components/charts/DrawdownCurveChart.tsx
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Typography, Box } from '@mui/material';
import { colors, typography, borderRadius } from '../../styles/design-tokens'; // Your design tokens
import type { EquityCurvePoint } from '../../types'; // Assuming drawdown is derived from equity curve

interface DrawdownCurveChartProps {
  equityCurveData: EquityCurvePoint[]; // Pass the full equity curve
  height?: number | string;
}

export function DrawdownCurveChart({ equityCurveData, height = '100%' }: DrawdownCurveChartProps) {
  const drawdownData = useMemo(() => {
    if (!equityCurveData || equityCurveData.length === 0) return [];
    let peakEquity = 0;
    // Find initial peak for correct drawdown calculation from the start
    if (equityCurveData.length > 0) {
        peakEquity = equityCurveData.reduce((max, point) => Math.max(max, point.equity), 0);
        // Or, if equity can start negative or zero, initialize peak to the first point or a sensible baseline
        // peakEquity = equityCurveData[0].equity;
    }


    return equityCurveData.map(point => {
      if (point.equity > peakEquity) {
        peakEquity = point.equity;
      }
      // Prevent division by zero or non-positive peak equity if not meaningful
      const drawdownPercentage = peakEquity > 0 ? ((point.equity - peakEquity) / peakEquity) * 100 : 0;
      return {
        date: point.date, // Keep original date for XAxis
        value: Math.min(0, drawdownPercentage), // Drawdown is always <= 0%
      };
    });
  }, [equityCurveData]);

  if (!drawdownData || drawdownData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <Typography sx={{ color: colors.textSecondary, fontSize: typography.fontSize.sm }}>
          No drawdown data available.
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={drawdownData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}> {/* Adjusted left margin for YAxis */}
        <defs>
          <linearGradient id="drawdownChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.error} stopOpacity={0.5} />
            <stop offset="95%" stopColor={colors.error} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGridLines} horizontal={true} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          tick={{ fill: colors.textSecondary, fontSize: typography.fontSize.xs }}
          axisLine={{ stroke: colors.border }}
          tickLine={{ stroke: colors.border }}
          padding={{ left: 10, right: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(value) => `${value.toFixed(0)}%`}
          tick={{ fill: colors.textSecondary, fontSize: typography.fontSize.xs }}
          axisLine={{ stroke: colors.border }}
          tickLine={{ stroke: colors.border }}
          domain={['auto', 0]} // Ensure Y-axis max is 0 for drawdown
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(2)}%`, "Drawdown"]}
          labelFormatter={(label: number) => new Date(label).toLocaleDateString()}
          contentStyle={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.xs,
          }}
          itemStyle={{ color: colors.error }}
          labelStyle={{ color: colors.textSecondary, fontWeight: typography.fontWeight.medium }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={colors.error}
          strokeWidth={1.5}
          fillOpacity={1}
          fill="url(#drawdownChartGradient)"
          name="Drawdown"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}