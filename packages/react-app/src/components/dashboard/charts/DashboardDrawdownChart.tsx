import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { EquityCurvePoint } from '../../../types';
import { Typography } from '@mui/material';
import { colors } from '../../../styles/design-tokens';

interface Props {
  equityCurveData: EquityCurvePoint[];
}

const DashboardDrawdownChart: React.FC<Props> = ({ equityCurveData }) => {
  const drawdownData = useMemo(() => {
    if (!equityCurveData || equityCurveData.length === 0) return [];
    let peak = -Infinity;
    return equityCurveData.map(point => {
      if (point.equity > peak) {
        peak = point.equity;
      }
      const drawdown = peak > 0 ? ((point.equity - peak) / peak) * 100 : 0;
      return { date: point.date, drawdown };
    });
  }, [equityCurveData]);

  if (drawdownData.length === 0) return <Typography sx={{color: colors.textSecondary, textAlign: 'center', mt: 2}}>No drawdown data.</Typography>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={drawdownData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="drawdownGradientDashboard" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.error} stopOpacity={0.7}/>
            <stop offset="95%" stopColor={colors.error} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.cardStroke} />
        <XAxis dataKey="date" tick={{ fontSize: 9, fill: colors.textSecondary }} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} />
        <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} tick={{ fontSize: 9, fill: colors.textSecondary }} domain={['auto', 0]}/>
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(2)}%`, "Drawdown"]}
          labelFormatter={(label) => new Date(label).toLocaleDateString()}
          contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.cardStroke}`, borderRadius: '4px' }}
          itemStyle={{color: colors.onSurface}}
          labelStyle={{color: colors.textSecondary}}
        />
        <Area type="monotone" dataKey="drawdown" name="Drawdown" stroke={colors.onSurface} fill="url(#drawdownGradientDashboard)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
};
export default DashboardDrawdownChart;
