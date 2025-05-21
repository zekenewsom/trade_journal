import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { AnalyticsData } from '../../../types';
import { Typography } from '@mui/material';

interface Props {
  data: AnalyticsData['rMultipleDistribution'];
}

const DashboardRMultipleHistogram: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return <Typography sx={{color: '#ccc', textAlign: 'center', mt: 2}}>No R-Multiple data.</Typography>;

  // Determine color based on R-multiple range (assuming range string like "<-2R", "-1R to 0R", "1R to 2R", ">2R")
  const getColor = (range: string) => {
    if (range.includes('-') || range.startsWith('<0')) return '#f44336'; // Loss
    if (range.includes('0R to') || range.includes('0R-')) return '#ffc658'; // Break-evenish
    return '#4caf50'; // Win
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#aaa' }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#aaa' }} />
        <Tooltip
          formatter={(value: number, name: string, props) => [`${value} trades`, props.payload.range]}
          contentStyle={{ backgroundColor: 'rgba(30, 34, 48, 0.85)', border: '1px solid #444', borderRadius: '4px' }}
          itemStyle={{color: '#ccc'}}
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
