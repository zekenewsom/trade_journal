import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';


interface KeyMetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeColor?: string;
  trendData?: { value: number }[];
}

const KeyMetricCard: React.FC<KeyMetricCardProps> = ({ title, value, change, changeColor, trendData }) => {
  return (
    <Paper className="p-4 rounded-2xl h-full relative" sx={theme => ({ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary })}>
      <Typography variant="subtitle1" className="mb-1" sx={theme => ({ color: theme.palette.secondary.main })}>{title}</Typography>
      <Typography variant="h4" className="mb-0.5" sx={{ fontWeight: 'bold', color: 'inherit' }}>{value}</Typography>
      {change && <Typography variant="body2" sx={{ color: changeColor }}>{change}</Typography>}
      {trendData && trendData.length > 0 && (
        <Box className="absolute left-0 bottom-0 w-full" sx={{ height: '50px', opacity: 0.5 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Line type="monotone" dataKey="value" stroke={changeColor} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default KeyMetricCard;
