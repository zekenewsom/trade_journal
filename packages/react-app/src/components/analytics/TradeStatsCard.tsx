import React from 'react';
import { Paper, Typography, Box, Grid } from '@mui/material';
import type { AnalyticsData } from '../../types';

interface Props {
  analytics: AnalyticsData;
}

const TradeStatsCard: React.FC<Props> = ({ analytics }) => {
  const stats = [
    {
      label: 'Average Win',
      value: analytics.avgWinPnlOverall ? `$${analytics.avgWinPnlOverall.toFixed(2)}` : 'N/A',
      color: 'success.main'
    },
    {
      label: 'Average Loss',
      value: analytics.avgLossPnlOverall ? `$${analytics.avgLossPnlOverall.toFixed(2)}` : 'N/A',
      color: 'error.main'
    },
    {
      label: 'Largest Win',
      value: analytics.largestWinPnl ? `$${analytics.largestWinPnl.toFixed(2)}` : 'N/A',
      color: 'success.main'
    },
    {
      label: 'Largest Loss',
      value: analytics.largestLossPnl ? `$${analytics.largestLossPnl.toFixed(2)}` : 'N/A',
      color: 'error.main'
    },
    {
      label: 'Profit Factor',
      value: analytics.totalRealizedGrossPnl && analytics.totalFeesPaidOnClosedPortions
        ? ((analytics.totalRealizedGrossPnl - analytics.totalFeesPaidOnClosedPortions) / 
           Math.abs(analytics.totalFeesPaidOnClosedPortions)).toFixed(2)
        : 'N/A',
      color: 'primary.main'
    },
    {
      label: 'Average R-Multiple',
      value: analytics.avgRMultiple ? analytics.avgRMultiple.toFixed(2) : 'N/A',
      color: 'primary.main'
    }
  ];

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" color="primary" gutterBottom>
        Trade Statistics
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
        {stats.map((stat, index) => (
          <Box key={index} sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {stat.label}
            </Typography>
            <Typography variant="h6" color={stat.color}>
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default TradeStatsCard; 