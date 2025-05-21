import React from 'react';
import { Paper, Typography, Box, LinearProgress } from '@mui/material';

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
    <Paper sx={{ p: 2, backgroundColor: '#1e2230', color: '#e0e0e0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="subtitle2" sx={{ color: '#8be9fd', mb: 0.5, display: 'flex', alignItems: 'center' }}>
          {icon && <Box component="span" sx={{ mr: 1 }}>{icon}</Box>}
          {title}
        </Typography>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: valueColor || '#f8f8f2', mb: 1 }}>
          {value}
        </Typography>
        {description && <Typography variant="caption" sx={{ color: '#6272a4' }}>{description}</Typography>}
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
