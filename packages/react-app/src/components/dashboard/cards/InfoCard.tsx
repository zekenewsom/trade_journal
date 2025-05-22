import React from 'react';
import { Paper, Typography, Box, LinearProgress } from '@mui/material';

interface InfoCardProps {
  title: string;
  value: string | number;
  description?: string;
  progress?: number; // 0-100
  progressColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  icon?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, description, progress, progressColor, icon }) => {
  return (
    <Paper className="p-4 rounded-2xl h-full flex flex-col justify-between bg-white">
      <Box>
        <Typography variant="subtitle2" className="mb-0.5 flex items-center text-secondary">
          {icon && <Box component="span" className="mr-1">{icon}</Box>}
          {title}
        </Typography>
        <Typography variant="h5" component="div" className="mb-1 font-bold text-primary">
          {value}
        </Typography>
        {description && <Typography variant="caption" className="text-secondary">{description}</Typography>}
      </Box>
      {progress !== undefined && (
        <Box className="w-full mt-1">
          <LinearProgress variant="determinate" value={progress} color={progressColor || 'primary'} className="bg-gray-200" />
        </Box>
      )}
    </Paper>
  );
};

export default InfoCard;
