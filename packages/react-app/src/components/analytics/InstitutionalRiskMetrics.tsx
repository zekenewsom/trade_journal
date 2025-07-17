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
}

const RiskMetricCard: React.FC<RiskMetricCardProps> = ({
  title,
  value,
  description,
  benchmark,
  interpretation,
  format = 'number',
  precision = 2
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
    
    if (val >= interpretation.excellent) return colors.success;
    if (val >= interpretation.good) return '#4CAF50';
    if (val >= interpretation.fair) return '#FF9800';
    return colors.error;
  };

  const getPerformanceLabel = (val: number | null): string => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    
    if (val >= interpretation.excellent) return 'Excellent';
    if (val >= interpretation.good) return 'Good';
    if (val >= interpretation.fair) return 'Fair';
    return 'Poor';
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

const InstitutionalRiskMetrics: React.FC<InstitutionalRiskMetricsProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No analytics data available for risk metrics calculation.
      </Alert>
    );
  }

  const riskMetrics = [
    {
      title: 'Sharpe Ratio',
      value: analytics.sharpeRatio,
      description: 'Risk-adjusted return measure. Higher values indicate better risk-adjusted performance.',
      benchmark: {
        label: 'Hedge Fund Avg',
        value: 0.8,
        comparison: analytics.sharpeRatio && analytics.sharpeRatio > 0.8 ? 'higher' : 'lower' as const
      },
      interpretation: {
        excellent: 1.5,
        good: 1.0,
        fair: 0.5,
        poor: 0
      },
      format: 'ratio' as const,
      precision: 2
    },
    {
      title: 'Sortino Ratio',
      value: analytics.sortinoRatio,
      description: 'Downside risk-adjusted return. Only considers negative volatility.',
      benchmark: {
        label: 'Hedge Fund Avg',
        value: 1.2,
        comparison: analytics.sortinoRatio && analytics.sortinoRatio > 1.2 ? 'higher' : 'lower' as const
      },
      interpretation: {
        excellent: 2.0,
        good: 1.5,
        fair: 1.0,
        poor: 0
      },
      format: 'ratio' as const,
      precision: 2
    },
    {
      title: 'Calmar Ratio',
      value: analytics.calmarRatio,
      description: 'Annual return divided by maximum drawdown. Higher is better.',
      benchmark: {
        label: 'Hedge Fund Avg',
        value: 0.5,
        comparison: analytics.calmarRatio && analytics.calmarRatio > 0.5 ? 'higher' : 'lower' as const
      },
      interpretation: {
        excellent: 1.0,
        good: 0.5,
        fair: 0.2,
        poor: 0
      },
      format: 'ratio' as const,
      precision: 2
    },
    {
      title: 'Ulcer Index',
      value: analytics.ulcerIndex,
      description: 'Measures depth and duration of drawdowns. Lower values are better.',
      interpretation: {
        excellent: 0.05,
        good: 0.10,
        fair: 0.20,
        poor: 1.0
      },
      format: 'percentage' as const,
      precision: 1
    },
    {
      title: 'Omega Ratio',
      value: analytics.omega,
      description: 'Probability-weighted ratio of gains to losses. Higher is better.',
      benchmark: {
        label: 'Benchmark',
        value: 1.0,
        comparison: analytics.omega && analytics.omega > 1.0 ? 'higher' : 'lower' as const
      },
      interpretation: {
        excellent: 2.0,
        good: 1.5,
        fair: 1.0,
        poor: 0
      },
      format: 'ratio' as const,
      precision: 2
    },
    {
      title: 'Skewness',
      value: analytics.skewness,
      description: 'Measures asymmetry of returns. Positive skewness is preferred.',
      benchmark: {
        label: 'Neutral',
        value: 0,
        comparison: analytics.skewness && analytics.skewness > 0 ? 'higher' : 'lower' as const
      },
      interpretation: {
        excellent: 0.5,
        good: 0.2,
        fair: 0,
        poor: -0.5
      },
      format: 'number' as const,
      precision: 2
    },
    {
      title: 'Kurtosis',
      value: analytics.kurtosis,
      description: 'Measures tail risk. Values near 0 indicate normal distribution.',
      benchmark: {
        label: 'Normal',
        value: 0,
        comparison: 'neutral' as const
      },
      interpretation: {
        excellent: 0.5,
        good: 1.0,
        fair: 2.0,
        poor: 5.0
      },
      format: 'number' as const,
      precision: 2
    },
    {
      title: 'Value at Risk (95%)',
      value: analytics.valueAtRisk95,
      description: 'Maximum expected loss at 95% confidence level. Lower absolute values are better.',
      interpretation: {
        excellent: -0.01,
        good: -0.02,
        fair: -0.05,
        poor: -0.10
      },
      format: 'percentage' as const,
      precision: 1
    },
    {
      title: 'Conditional VaR (95%)',
      value: analytics.conditionalVaR95,
      description: 'Expected loss beyond VaR threshold. Lower absolute values are better.',
      interpretation: {
        excellent: -0.02,
        good: -0.03,
        fair: -0.07,
        poor: -0.15
      },
      format: 'percentage' as const,
      precision: 1
    },
    {
      title: 'Annualized Return',
      value: analytics.annualizedReturn,
      description: 'Annual return rate. Higher positive values are better.',
      benchmark: {
        label: 'S&P 500',
        value: 0.10,
        comparison: analytics.annualizedReturn && analytics.annualizedReturn > 0.10 ? 'higher' : 'lower' as const
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
      value: analytics.annualizedVolatility,
      description: 'Annual volatility measure. Lower values indicate less risk.',
      benchmark: {
        label: 'S&P 500',
        value: 0.16,
        comparison: analytics.annualizedVolatility && analytics.annualizedVolatility < 0.16 ? 'lower' : 'higher' as const
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
      title: 'Max Drawdown Duration',
      value: analytics.maxDrawdownDuration,
      description: 'Longest drawdown period in days. Lower values are better.',
      interpretation: {
        excellent: 30,
        good: 90,
        fair: 180,
        poor: 365
      },
      format: 'number' as const,
      precision: 0
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