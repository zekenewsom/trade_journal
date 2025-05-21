import React from 'react';
import { Paper, Typography } from '@mui/material';
import { colors } from '/src/styles/design-tokens';

const PnlHeatmapCalendar: React.FC = () => (
  <Paper sx={{ p: 2, backgroundColor: colors.surface, color: colors.onSurface, height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography variant="subtitle2" sx={{ color: colors.textSecondary, textAlign:'center', mb:1 }}>
      30-Day P&L Heatmap Calendar (Coming Soon)
    </Typography>
  </Paper>
);

export default PnlHeatmapCalendar;
