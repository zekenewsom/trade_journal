// packages/react-app/src/components/charts/RiskScatterChart.tsx
import React from 'react';
import Box from '@mui/material/Box';
import { Cell } from 'recharts';
import { formatCurrency } from '../dashboard/DashboardMetrics';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ZAxis } from 'recharts';
import { Typography } from '@mui/material';
import { colors, typography, borderRadius as br } from '../../styles/design-tokens';


// The target design shows "Return vs Risk". We'll adapt DurationPerformanceData or expect a similar structure.
// Let's assume data will be: { risk: number; returnPercent: number; tradeVolume?: number; ticker: string }
interface RiskReturnDataPoint {
  risk: number; // Abstract risk unit
  returnPercent: number; // P&L as percentage
  tradeVolume?: number; // Optional for Z-axis (bubble size)
  ticker: string;
  trade_id: number; // For tooltip identification
}

interface RiskScatterChartProps {
  data: RiskReturnDataPoint[];
  height?: number | string;
}

export function RiskScatterChart({ data, height = '100%' }: RiskScatterChartProps) {
  if (!data || data.length === 0) {
     return (
       <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <Typography sx={{ color: colors.textSecondary, fontSize: typography.fontSize.sm }}>
          No Return vs Risk data.
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGridLines} />
        <XAxis
          type="number"
          dataKey="risk"
          name="Risk (e.g., $ Stop)" // Clarify what "Risk" represents
          tick={{ fill: colors.textSecondary, fontSize: typography.fontSize.xs }}
          axisLine={{ stroke: colors.border }}
          tickLine={{ stroke: colors.border }}
          label={{ value: 'Lower / Higher Risk', position: 'insideBottom', offset: -10, fill: colors.textSecondary, fontSize: typography.fontSize.xs }}
          domain={['auto', 'auto']}
        />
        <YAxis
          type="number"
          dataKey="returnPercent"
          name="Return (%)"
          unit="%"
          tick={{ fill: colors.textSecondary, fontSize: typography.fontSize.xs }}
          axisLine={{ stroke: colors.border }}
          tickLine={{ stroke: colors.border }}
          label={{ value: 'Lower / Higher Return', angle: -90, position: 'insideLeft', offset: 10, fill: colors.textSecondary, fontSize: typography.fontSize.xs }}
          domain={['auto', 'auto']}
        />
        {data.some((d: { tradeVolume?: number }) => d.tradeVolume !== undefined) && <ZAxis type="number" dataKey="tradeVolume" range={[40, 300]} name="Trade Volume" />}
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: br.md,
            fontSize: typography.fontSize.xs,
          }}
          itemStyle={{ color: colors.textSecondary }}
          labelStyle={{ color: colors.onSurface, fontWeight: typography.fontWeight.medium }}
          formatter={(value: number, name: string, entry: any) => {
            if (name === "Return (%)") return [`${value.toFixed(2)}%`, name];
            if (name === "Risk (e.g., $ Stop)") return [value.toFixed(2), name];
            if (name === "Trade Volume" && entry.payload?.tradeVolume) return [formatCurrency(entry.payload.tradeVolume), name];
            return [value, name];
          }}
          labelFormatter={(label, payloadArray) => payloadArray?.[0]?.payload.ticker || ''}
        />
        {/* <Legend wrapperStyle={{fontSize: typography.fontSize.xs, color: colors.textSecondary}}/> */}
        <Scatter
          name="Trades"
          data={data}
          fillOpacity={0.7}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.returnPercent >= 0 ? colors.chartPositive : colors.chartNegative} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}