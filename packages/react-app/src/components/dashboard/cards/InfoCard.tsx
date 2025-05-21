import React from 'react';
import { Paper, Typography, Box, LinearProgress } from '@mui/material';
import { colors, borderRadius } from '../../styles/design-tokens';

interface InfoCardProps {
  title: string;
  value: string | number;
  description?: string;
  progress?: number; // 0-100
  progressColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  valueColor?: string;
  icon?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, description, progress, progressColor, valueColor, icon }) => {
  return (
    <Paper sx={{ p: 2, backgroundColor: colors.surface, color: colors.onSurface, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: borderRadius.xl }}>
      <Box>
        <Typography variant="subtitle2" sx={{ color: colors.accent, mb: 0.5, display: 'flex', alignItems: 'center' }}>
          {icon && <Box component="span" sx={{ mr: 1 }}>{icon}</Box>}
          {title}
        </Typography>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: valueColor || colors.onSurface, mb: 1 }}>
          {value}
        </Typography>
        {description && <Typography variant="caption" sx={{ color: colors.textSecondary }}>{description}</Typography>}
      </Box>
      {progress !== undefined && (
        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress variant="determinate" value={progress} color={progressColor || 'primary'} />
        </Box>
      )}
    </Paper>
  );
};

export default InfoCard;
