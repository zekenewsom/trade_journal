// packages/react-app/src/components/dashboard/cards/EnhancedMetricCard.tsx
import React from 'react';
import { Box, Paper, Typography, LinearProgress } from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { typography, colors, borderRadius as br, spacing, shadows } from '../../../styles/design-tokens'; // Your design tokens

interface MiniTrendChartProps {
  data: { value: number }[];
  color: string;
}

const MiniTrendChart: React.FC<MiniTrendChartProps> = ({ data, color }) => {
  if (!data || data.length === 0) return null;
  return (
    <Box sx={{ height: '40px', width: '100%', mt: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

interface EnhancedMetricCardProps {
  title: string;
  value: string | number;
  valuePrefix?: string;
  valueSuffix?: string;
  changeText?: string; // e.g., "+$12,487.56 (1.01%)"
  changeColor?: 'success' | 'error' | 'neutral';
  descriptionText?: string | React.ReactNode; // Can also be a component for e.g. progress bar label
  progressValue?: number; // 0-100
  progressBarMinLabel?: string;
  progressBarMaxLabel?: string;
  progressColor?: 'success' | 'error' | 'warning' | 'primary' | 'info';
  trendData?: { value: number }[]; // For mini line chart
  trendColor?: string;
  icon?: React.ReactNode;
  gridColumnSpan?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }; // For direct use in Grid
  minHeight?: string | number;
  children?: React.ReactNode; // For any custom content
}

const EnhancedMetricCard: React.FC<EnhancedMetricCardProps> = ({
  title,
  value,
  valuePrefix = '',
  valueSuffix = '',
  changeText,
  changeColor = 'neutral',
  descriptionText,
  progressValue,
  progressBarMinLabel,
  progressBarMaxLabel,
  progressColor = 'primary',
  trendData,
  trendColor = colors.primary,
  icon,
  minHeight = 'auto',
  children,
}) => {


  const getChangeTextColor = () => {
    if (changeColor === 'success') return colors.success;
    if (changeColor === 'error') return colors.error;
    return colors.textSecondary;
  };

  const getProgressBarMuiColor = (): "success" | "error" | "warning" | "primary" | "info" => {
    return progressColor;
  };

  return (
    <Paper
      elevation={0} // Using custom shadows via sx or className
      sx={{
        backgroundColor: colors.surface,
        padding: spacing['4'], // 1rem
        borderRadius: br.md,   // 0.5rem
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.elevation1,
        color: colors.onSurface,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%', // Important for Grid stretch
        minHeight: minHeight,
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: spacing['1'] }}>
          {icon && <Box sx={{ mr: spacing['2'], color: colors.textSecondary }}>{icon}</Box>}
          <Typography
            variant="overline" // Using overline for small, uppercase titles
            sx={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.cardTitle, // from your tokens
              fontWeight: typography.fontWeight.medium,
              lineHeight: typography.lineHeight.none,
            }}
          >
            {title}
          </Typography>
        </Box>

        <Typography
          variant="h3" // Or a custom variant if h3 is too big
          component="p"
          sx={{
            color: colors.textPrimary,
            fontSize: typography.fontSize.mainMetricValue, // from your tokens
            fontWeight: typography.fontWeight.semiBold,
            lineHeight: typography.lineHeight.tight,
            mb: changeText ? spacing['0.5'] : spacing['1'],
          }}
        >
          {valuePrefix}{value}{valueSuffix}
        </Typography>

        {changeText && (
          <Typography
            variant="caption"
            sx={{
              color: getChangeTextColor(),
              fontSize: typography.fontSize.cardChangeIndicator, // from your tokens
              fontWeight: typography.fontWeight.medium,
              display: 'block',
              mb: trendData || progressValue !== undefined ? spacing['2'] : 0,
            }}
          >
            {changeText}
          </Typography>
        )}
      </Box>

      {children && <Box sx={{ mt: 'auto' }}>{children}</Box>}

      {trendData && trendData.length > 0 && (
        <Box sx={{ mt: 'auto', mb: progressValue !== undefined ? spacing['1'] : 0 }}> {/* Push to bottom */}
          <MiniTrendChart data={trendData} color={trendColor} />
        </Box>
      )}

      {progressValue !== undefined && (
        <Box sx={{ mt: trendData ? spacing['1'] : 'auto' }}> {/* Push to bottom or below trend */}
          <LinearProgress
            variant="determinate"
            value={progressValue}
            color={getProgressBarMuiColor()}
            sx={{
              height: '6px',
              borderRadius: br.full,
              backgroundColor: colors.progressTrack,
              [`& .MuiLinearProgress-barColor${progressColor.charAt(0).toUpperCase() + progressColor.slice(1)}`]: { // Capitalize first letter for sx
                 backgroundColor: colors[progressColor] || colors.primary, // Fallback to primary
              },
            }}
          />
          {(progressBarMinLabel || progressBarMaxLabel || descriptionText) && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: spacing['0.5'] }}>
              <Typography variant="caption" sx={{ fontSize: typography.fontSize.xxs, color: colors.textSecondary }}>
                {progressBarMinLabel || (typeof descriptionText === 'string' && !progressBarMaxLabel ? descriptionText : '')}
              </Typography>
              {progressBarMaxLabel && (
                 <Typography variant="caption" sx={{ fontSize: typography.fontSize.xxs, color: colors.textSecondary }}>
                    {progressBarMaxLabel}
                 </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default EnhancedMetricCard;