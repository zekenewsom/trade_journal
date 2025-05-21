import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { colors, borderRadius } from '../../styles/design-tokens';

interface KeyMetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeColor?: string;
  trendData?: { value: number }[];
}

const KeyMetricCard: React.FC<KeyMetricCardProps> = ({ title, value, change, changeColor, trendData }) => {
  return (
    <Paper sx={{ p: 2, backgroundColor: colors.surface, color: colors.onSurface, height: '100%', position: 'relative', borderRadius: borderRadius.xl }}>
      <Typography variant="subtitle1" sx={{ color: colors.accent, mb: 1 }}>{title}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: colors.onSurface, mb: 0.5 }}>{value}</Typography>
      {change && <Typography variant="body2" sx={{ color: changeColor || colors.onSurface }}>{change}</Typography>}
      {trendData && trendData.length > 0 && (
        <Box sx={{ height: '50px', width: '100%', position: 'absolute', bottom: 0, left: 0, opacity: 0.5 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Line type="monotone" dataKey="value" stroke={changeColor || colors.accent} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default KeyMetricCard;
