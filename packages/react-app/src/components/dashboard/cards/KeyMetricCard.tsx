import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface KeyMetricCardProps {
  title: string;
  value: string;
  change?: string;
  trendData?: { value: number }[];
}

const KeyMetricCard: React.FC<KeyMetricCardProps> = ({ title, value, change, trendData }) => {
  return (
    <Paper className="p-4 rounded-2xl h-full relative bg-white">
      <Typography variant="subtitle1" className="mb-1 text-secondary">{title}</Typography>
      <Typography variant="h4" className="mb-0.5 font-bold text-primary">{value}</Typography>
      {change && <Typography variant="body2" className="text-secondary">{change}</Typography>}
      {trendData && trendData.length > 0 && (
        <Box className="absolute left-0 bottom-0 w-full bg-gray-200" sx={{ height: '50px', opacity: 0.5 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <Line type="monotone" dataKey="value" stroke="var(--color-on-surface-variant)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default KeyMetricCard;
