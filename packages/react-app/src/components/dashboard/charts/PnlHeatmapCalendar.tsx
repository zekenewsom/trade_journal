import React from 'react';
import { Paper, Typography } from '@mui/material';

const PnlHeatmapCalendar: React.FC = () => (
  <Paper sx={{ p: 2, backgroundColor: '#1e2230', color: '#e0e0e0', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography variant="subtitle2" sx={{ color: '#8be9fd', textAlign:'center', mb:1 }}>
      30-Day P&L Heatmap Calendar (Coming Soon)
    </Typography>
  </Paper>
);

export default PnlHeatmapCalendar;
