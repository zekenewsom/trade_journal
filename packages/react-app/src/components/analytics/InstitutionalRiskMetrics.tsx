// packages/react-app/src/components/analytics/InstitutionalRiskMetrics.tsx
import React from 'react';
import { Box, Typography, Paper, Grid, Tooltip, Alert } from '@mui/material';
import { Info as InfoIcon, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { colors } from '../../styles/design-tokens';
import type { AnalyticsData } from '../../types';

interface InstitutionalRiskMetricsProps {
  analytics: AnalyticsData;
}

interface RiskMetricCardProps {
  title: string;
  value: number | null;
  description: string;
  benchmark?: {
    label: string;
    value: number;
    comparison: 'higher' | 'lower' | 'neutral';
  };
  interpretation: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  format?: 'number' | 'percentage' | 'ratio';
  precision?: number;
  reverseScale?: boolean;
}

const RiskMetricCard: React.FC<RiskMetricCardProps> = ({
  title,
  value,
  description,
  benchmark,
  interpretation,
  format = 'number',
  precision = 2,
  reverseScale = false
}) => {
  const formatValue = (val: number | null): string => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    
    switch (format) {
      case 'percentage':
        return `${(val * 100).toFixed(precision)}%`;
      case 'ratio':
        return `${val.toFixed(precision)}`;
      default:
        return val.toFixed(precision);
    }
  };

  const getPerformanceColor = (val: number | null): string => {
    if (val === null || val === undefined || isNaN(val)) return colors.textSecondary;
    if (!reverseScale) {
      if (val >= interpretation.excellent) return colors.success;
      if (val >= interpretation.good) return '#4CAF50';
      if (val >= interpretation.fair) return '#FF9800';
      return colors.error;
    } else {
      if (val <= interpretation.excellent) return colors.success;
      if (val <= interpretation.good) return '#4CAF50';
      if (val <= interpretation.fair) return '#FF9800';
      return colors.error;
    }
  };

  const getPerformanceLabel = (val: number | null): string => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    if (!reverseScale) {
      if (val >= interpretation.excellent) return 'Excellent';
      if (val >= interpretation.good) return 'Good';
      if (val >= interpretation.fair) return 'Fair';
      return 'Poor';
    } else {
      if (val <= interpretation.excellent) return 'Excellent';
      if (val <= interpretation.good) return 'Good';
      if (val <= interpretation.fair) return 'Fair';
      return 'Poor';
    }
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        height: '100%',
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: `0 4px 12px ${colors.primary}20`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 600 }}>
          {title}
        </Typography>
        <Tooltip title={description} placement="top">
          <InfoIcon sx={{ color: colors.textSecondary, fontSize: 18 }} />
        </Tooltip>
      </div>
      
      <Box sx={{ mb: 2 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: getPerformanceColor(value), 
            fontWeight: 'bold',
            mb: 0.5
          }}
        >
          {formatValue(value)}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: getPerformanceColor(value),
            backgroundColor: `${getPerformanceColor(value)}15`,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontWeight: 600
          }}
        >
          {getPerformanceLabel(value)}
        </Typography>
      </Box>

      {benchmark && (
        <Box sx={{ mb: 1 }}>
          <div className="flex items-center gap-1">
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {benchmark.label}:
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textPrimary, fontWeight: 600 }}>
              {formatValue(benchmark.value)}
            </Typography>
            {benchmark.comparison === 'higher' && (
              <TrendingUpIcon sx={{ color: colors.success, fontSize: 16 }} />
            )}
            {benchmark.comparison === 'lower' && (
              <TrendingDownIcon sx={{ color: colors.error, fontSize: 16 }} />
            )}
          </div>
        </Box>
      )}

      <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 12 }}>
        {description}
      </Typography>
    </Paper>
  );
};

const safeMetricValue = (val: unknown): number | null =>
  typeof val === 'number' ? val : null;

const InstitutionalRiskMetrics: React.FC<InstitutionalRiskMetricsProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No analytics data available for risk metrics calculation.
      </Alert>
    );
  }

  const safeHerfindahlIndex = safeMetricValue(analytics.herfindahlIndex);
  const safeConcentrationRatio = safeMetricValue(analytics.concentrationRatio);
  const safeNumberOfPositions = safeMetricValue(analytics.numberOfPositions);
  const safeAveragePositionSize = safeMetricValue(analytics.averagePositionSize);
  const safeLargestPositionPercent = safeMetricValue(analytics.largestPositionPercent);
  const safeDiversificationRatio = safeMetricValue(analytics.diversificationRatio);
  const safeAnnualizedReturn = safeMetricValue(analytics.annualizedReturn);
  const safeMaxDrawdownDuration = safeMetricValue(analytics.maxDrawdownDuration);
  const safeSharpeRatio = safeMetricValue(analytics.sharpeRatio);
  const safeSortinoRatio = safeMetricValue(analytics.sortinoRatio);
  const safeCalmarRatio = safeMetricValue(analytics.calmarRatio);
  const safeOmega = safeMetricValue(analytics.omega);
  const safeSkewness = safeMetricValue(analytics.skewness);
  const safeAnnualizedVolatility = safeMetricValue(analytics.annualizedVolatility);

  const riskMetrics: RiskMetricCardProps[] = [
    {
      title: 'Herfindahl Index',
      value: safeHerfindahlIndex,
      description: 'Portfolio concentration. Lower values indicate better diversification.',
      benchmark: {
        label: 'Ideal',
        value: 0.10,
        comparison: safeHerfindahlIndex !== null && safeHerfindahlIndex < 0.10 ? 'lower' : 'higher' as const
      },
      interpretation: {
        excellent: 0.10,
        good: 0.15,
        fair: 0.20,
        poor: 0.30
      },
      format: 'number' as const,
      precision: 2
    },
    {
      title: 'Concentration Ratio',
      value: safeConcentrationRatio,
      description: 'Top 5 assets as % of portfolio. Lower values are better.',
      benchmark: {
        label: 'Ideal',
        value: 0.40,
        comparison: safeConcentrationRatio !== null && safeConcentrationRatio < 0.40 ? 'lower' : 'higher' as const
      },
      interpretation: {
        excellent: 0.20,
        good: 0.30,
        fair: 0.40,
        poor: 0.50
      },
      format: 'percentage' as const,
      precision: 1
    },
    {
      title: 'Number of Positions',
      value: safeNumberOfPositions,
      description: 'Total unique assets held. Higher values indicate more diversification.',
      benchmark: {
        label: 'Ideal',
        value: 10,
        comparison: safeNumberOfPositions !== null && safeNumberOfPositions > 10 ? 'higher' : 'lower' as const
      },
      interpretation: {
        excellent: 20,
        good: 15,
        fair: 10,
        poor: 5
      },
      format: 'number' as const,
      precision: 0
    },
    {
      title: 'Average Position Size',
      value: safeAveragePositionSize,
      description: 'Mean % of portfolio per asset. Lower values are better.',
      interpretation: {
        excellent: 0.05,
        good: 0.10,
        fair: 0.15,
        poor: 0.20
      },
      format: 'percentage' as const,
      precision: 1
    },
    {
      title: 'Largest Position %',
      value: safeLargestPositionPercent,
      description: 'Largest single asset as % of portfolio. Lower values are better.',
      interpretation: {
        excellent: 0.10,
        good: 0.15,
        fair: 0.20,
        poor: 0.30
      },
      format: 'percentage' as const,
      precision: 1
    },
    {
      title: 'Diversification Ratio',
      value: safeDiversificationRatio,
      description: 'Risk-weighted diversification. Higher values are better.',
      interpretation: {
        excellent: 2.0,
        good: 1.5,
        fair: 1.2,
        poor: 1.0
      },
      format: 'ratio' as const,
      precision: 2
    },
    {
      title: 'Annualized Return',
      value: safeAnnualizedReturn,
      description: 'Annual return rate. Higher positive values are better.',
      benchmark: {
        label: 'S&P 500',
        value: 0.10,
        comparison: safeAnnualizedReturn !== null && safeAnnualizedReturn > 0.10 ? 'higher' : 'lower' as const
      },
      interpretation: {
        excellent: 0.20,
        good: 0.15,
        fair: 0.10,
        poor: 0
      },
      format: 'percentage' as const,
      precision: 1
    },
    {
      title: 'Annualized Volatility',
      value: safeAnnualizedVolatility,
      description: 'Annual volatility measure. Lower values indicate less risk.',
      benchmark: {
        label: 'S&P 500',
        value: 0.16,
        comparison: safeAnnualizedVolatility !== null && safeAnnualizedVolatility < 0.16 ? 'lower' : 'higher' as const
      },
      interpretation: {
        excellent: 0.10,
        good: 0.15,
        fair: 0.20,
        poor: 0.30
      },
      format: 'percentage' as const,
      precision: 1
    },
    {
      title: 'Sharpe Ratio',
      value: safeSharpeRatio,
      description: 'Risk-adjusted return. Higher values are better.',
      benchmark: {
        label: 'Ideal',
        value: 0.8,
        comparison: safeSharpeRatio !== null && safeSharpeRatio > 0.8 ? 'higher' : 'lower' as const
      },
      interpretation: {
        excellent: 1.5,
        good: 1.0,
        fair: 0.8,
        poor: 0.5
      },
      format: 'ratio' as const,
      precision: 2
    },
    {
      title: 'Sortino Ratio',
      value: safeSortinoRatio,
      description: 'Downside risk-adjusted return. Higher values are better.',
      benchmark: {
        label: 'Ideal',
        value: 1.2,
        comparison: safeSortinoRatio !== null && safeSortinoRatio > 1.2 ? 'higher' : 'lower' as const
      },
      interpretation: {
        excellent: 2.0,
        good: 1.5,
        fair: 1.2,
        poor: 0.8
      },
      format: 'ratio' as const,
      precision: 2
    },
    {
      title: 'Calmar Ratio',
      value: safeCalmarRatio,
      description: 'Return vs. drawdown risk. Higher values are better.',
      benchmark: {
        label: 'Ideal',
        value: 0.5,
        comparison: safeCalmarRatio !== null && safeCalmarRatio > 0.5 ? 'higher' : 'lower' as const
      },
      interpretation: {
        excellent: 1.0,
        good: 0.7,
        fair: 0.5,
        poor: 0.3
      },
      format: 'ratio' as const,
      precision: 2
    },
    {
      title: 'Omega Ratio',
      value: safeOmega,
      description: 'Ratio of gains to losses. Higher values are better.',
      benchmark: {
        label: 'Ideal',
        value: 1.0,
        comparison: safeOmega !== null && safeOmega > 1.0 ? 'higher' : 'lower' as const
      },
      interpretation: {
        excellent: 2.0,
        good: 1.5,
        fair: 1.0,
        poor: 0.8
      },
      format: 'ratio' as const,
      precision: 2
    },
    {
      title: 'Skewness',
      value: safeSkewness,
      description: 'Distribution asymmetry. Positive is preferred.',
      benchmark: {
        label: 'Ideal',
        value: 0,
        comparison: safeSkewness !== null && safeSkewness > 0 ? 'higher' : 'lower' as const
      },
      interpretation: {
        excellent: 1.0,
        good: 0.5,
        fair: 0.0,
        poor: -0.5
      },
      format: 'number' as const,
      precision: 2
    },
    {
      title: 'Max Drawdown Duration',
      value: safeMaxDrawdownDuration,
      description: 'Longest drawdown period in days. Lower values are better.',
      interpretation: {
        excellent: 30,
        good: 90,
        fair: 180,
        poor: 365
      },
      format: 'number' as const,
      precision: 0,
      reverseScale: true
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: colors.textPrimary, fontWeight: 'bold', mb: 1 }}>
          Institutional Risk Metrics
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Comprehensive risk-adjusted performance analysis using hedge fund industry standards
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {riskMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <RiskMetricCard {...metric} />
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
};

export default InstitutionalRiskMetrics;