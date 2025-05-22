import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { AnalyticsData } from '../../../types';
import { Typography } from '@mui/material';
import { colors } from '/src/styles/design-tokens';

interface Props {
  data: AnalyticsData['rMultipleDistribution'];
}

const DashboardRMultipleHistogram: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return <Typography sx={{color: colors.textSecondary, textAlign: 'center', mt: 2}}>No R-Multiple data.</Typography>;

  // Determine color based on R-multiple range (assuming range string like "<-2R", "-1R to 0R", "1R to 2R", ">2R")
  const getColor = (range: string) => {
    if (range.includes('-') || range.startsWith('<0')) return colors.error; // Loss
    if (range.includes('0R to') || range.includes('0R-')) return colors.warning; // Break-evenish
    return colors.success; // Win
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.cardStroke} />
        <XAxis dataKey="range" tick={{ fontSize: 9, fill: colors.textSecondary }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: colors.textSecondary }} />
        <Tooltip
          formatter={(value: number, name: string, props) => [`${value} trades`, props.payload.range]}
          contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.cardStroke}`, borderRadius: '4px' }}
          itemStyle={{color: colors.textSecondary}}
          labelStyle={{display: 'none'}}
        />
        <Bar dataKey="count" name="Trades">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.range)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
export default DashboardRMultipleHistogram;
