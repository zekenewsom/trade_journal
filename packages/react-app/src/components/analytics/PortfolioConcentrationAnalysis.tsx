// packages/react-app/src/components/analytics/PortfolioConcentrationAnalysis.tsx
import React from 'react';
import { Box, Typography, Paper, Grid, Alert, Chip } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { colors } from '../../styles/design-tokens';
import type { AnalyticsData } from '../../types';

interface PortfolioConcentrationAnalysisProps {
  analytics: AnalyticsData;
}

interface ConcentrationMetricProps {
  title: string;
  value: number | null;
  format: 'percentage' | 'number' | 'ratio';
  description: string;
  benchmark?: {
    value: number;
    label: string;
    comparison: 'higher' | 'lower' | 'neutral';
  };
  interpretation: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

const ConcentrationMetric: React.FC<ConcentrationMetricProps> = ({
  title,
  value,
  format,
  description,
  benchmark,
  interpretation
}) => {
  const formatValue = (val: number | null): string => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    
    switch (format) {
      case 'percentage':
        return `${(val * 100).toFixed(1)}%`;
      case 'ratio':
        return val.toFixed(2);
      default:
        return val.toFixed(0);
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
        border: `1px solid ${colors.border}`
      }}
    >
      <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 1 }}>
        {title}
      </Typography>
      
      <Typography 
        variant="h4" 
        sx={{ 
          color: getPerformanceColor(value), 
          fontWeight: 'bold',
          mb: 1
        }}
      >
        {formatValue(value)}
      </Typography>
      
      <Chip 
        label={getPerformanceLabel(value)}
        size="small"
        sx={{ 
          backgroundColor: `${getPerformanceColor(value)}15`,
          color: getPerformanceColor(value),
          fontWeight: 600,
          mb: 1
        }}
      />
      
      {benchmark && (
        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
          {benchmark.label}: {formatValue(benchmark.value)}
        </Typography>
      )}
      
      <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 12 }}>
        {description}
      </Typography>
    </Paper>
  );
};

const PortfolioConcentrationAnalysis: React.FC<PortfolioConcentrationAnalysisProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No analytics data available for concentration analysis.
      </Alert>
    );
  }

  // Prepare data for concentration visualization
  const assetData = analytics.pnlByAsset?.slice(0, 10).map((asset, index) => ({
    name: asset.name,
    value: Math.abs(asset.totalNetPnl),
    percentage: 0, // Will be calculated
    color: `hsl(${(index * 360) / 10}, 70%, 60%)`
  })) || [];

  const totalValue = assetData.reduce((sum, item) => sum + item.value, 0);
  assetData.forEach(item => {
    item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
  });

  const concentrationMetrics = [
    {
      title: 'Number of Positions',
      value: analytics.numberOfPositions,
      format: 'number' as const,
      description: 'Total number of unique positions held',
      benchmark: {
        value: 20,
        label: 'Typical Portfolio',
        comparison: 'higher' as const
      },
      interpretation: {
        excellent: 15,
        good: 10,
        fair: 5,
        poor: 0
      }
    },
    {
      title: 'Herfindahl Index',
      value: analytics.herfindahlIndex,
      format: 'ratio' as const,
      description: 'Concentration measure. Lower values indicate better diversification',
      benchmark: {
        value: 0.2,
        label: 'Well Diversified',
        comparison: 'lower' as const
      },
      interpretation: {
        excellent: 0.1,
        good: 0.2,
        fair: 0.4,
        poor: 1.0
      }
    },
    {
      title: 'Top 5 Concentration',
      value: analytics.concentrationRatio,
      format: 'percentage' as const,
      description: 'Percentage of portfolio in top 5 positions',
      benchmark: {
        value: 0.5,
        label: 'Moderate Risk',
        comparison: 'lower' as const
      },
      interpretation: {
        excellent: 0.3,
        good: 0.5,
        fair: 0.7,
        poor: 1.0
      }
    },
    {
      title: 'Largest Position',
      value: analytics.largestPositionPercent,
      format: 'percentage' as const,
      description: 'Percentage of portfolio in largest single position',
      benchmark: {
        value: 0.1,
        label: 'Risk Limit',
        comparison: 'lower' as const
      },
      interpretation: {
        excellent: 0.05,
        good: 0.1,
        fair: 0.2,
        poor: 0.5
      }
    },
    {
      title: 'Diversification Ratio',
      value: analytics.diversificationRatio,
      format: 'ratio' as const,
      description: 'Measure of portfolio diversification effectiveness',
      benchmark: {
        value: 0.8,
        label: 'Well Diversified',
        comparison: 'higher' as const
      },
      interpretation: {
        excellent: 0.9,
        good: 0.7,
        fair: 0.5,
        poor: 0.2
      }
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
          Portfolio Concentration Analysis
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Risk assessment through position sizing and diversification metrics
        </Typography>
      </Box>

      {/* Concentration Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {concentrationMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <ConcentrationMetric {...metric} />
          </Grid>
        ))}
      </Grid>

      {/* Visualization Charts */}
      <Grid container spacing={3}>
        {/* Asset Allocation Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
              Top 10 Positions by P&L
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'P&L']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Concentration Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
              Position Concentration
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assetData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: colors.textSecondary }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: colors.textSecondary }}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Portfolio %']}
                  labelStyle={{ color: colors.textPrimary }}
                />
                <Bar 
                  dataKey="percentage" 
                  fill={colors.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Asset Class Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
              Asset Class Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.pnlByAssetClass || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: colors.textSecondary }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: colors.textSecondary }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net P&L']}
                  labelStyle={{ color: colors.textPrimary }}
                />
                <Bar 
                  dataKey="totalNetPnl" 
                  fill={colors.accent}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Exchange Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
              Exchange Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.pnlByExchange || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: colors.textSecondary }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: colors.textSecondary }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net P&L']}
                  labelStyle={{ color: colors.textPrimary }}
                />
                <Bar 
                  dataKey="totalNetPnl" 
                  fill={colors.secondary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default PortfolioConcentrationAnalysis;