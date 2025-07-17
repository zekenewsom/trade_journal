// packages/react-app/src/components/analytics/VaRStressTestingAnalysis.tsx
import React, { useMemo } from 'react';
import { Box, Typography, Paper, Grid, Alert, Chip, LinearProgress } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';
import { Warning as WarningIcon, TrendingDown as TrendingDownIcon, Security as SecurityIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { colors } from '../../styles/design-tokens';
import type { AnalyticsData } from '../../types';

interface VaRStressTestingAnalysisProps {
  analytics: AnalyticsData;
}

interface VaRMetricProps {
  title: string;
  value: number | null;
  confidence: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const VaRMetric: React.FC<VaRMetricProps> = ({ title, value, confidence, description, severity }) => {
  const formatValue = (val: number | null): string => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    return `${(val * 100).toFixed(2)}%`;
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'low': return colors.success;
      case 'medium': return '#FF9800';
      case 'high': return '#FF5722';
      case 'critical': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <SecurityIcon sx={{ color: colors.success }} />;
      case 'medium': return <WarningIcon sx={{ color: '#FF9800' }} />;
      case 'high': return <TrendingDownIcon sx={{ color: '#FF5722' }} />;
      case 'critical': return <WarningIcon sx={{ color: colors.error }} />;
      default: return null;
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
        borderLeft: `4px solid ${getSeverityColor(severity)}`
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <Typography variant="h6" sx={{ color: colors.textPrimary }}>
          {title}
        </Typography>
        {getSeverityIcon(severity)}
      </div>
      
      <Typography 
        variant="h4" 
        sx={{ 
          color: getSeverityColor(severity), 
          fontWeight: 'bold',
          mb: 1
        }}
      >
        {formatValue(value)}
      </Typography>
      
      <Chip 
        label={`${confidence} Confidence`}
        size="small"
        sx={{ 
          backgroundColor: `${getSeverityColor(severity)}15`,
          color: getSeverityColor(severity),
          fontWeight: 600,
          mb: 1
        }}
      />
      
      <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 12 }}>
        {description}
      </Typography>
    </Paper>
  );
};

const VaRStressTestingAnalysis: React.FC<VaRStressTestingAnalysisProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No analytics data available for VaR and stress testing analysis.
      </Alert>
    );
  }

  // Generate stress test scenarios
  const stressTestScenarios = useMemo(() => {
    const scenarios = [
      {
        name: 'Market Crash (-20%)',
        impact: (analytics.totalRealizedNetPnl || 0) * -0.20,
        probability: 0.05,
        description: 'Severe market downturn scenario'
      },
      {
        name: 'Moderate Correction (-10%)',
        impact: (analytics.totalRealizedNetPnl || 0) * -0.10,
        probability: 0.15,
        description: 'Typical market correction'
      },
      {
        name: 'Volatility Spike',
        impact: (analytics.totalRealizedNetPnl || 0) * -0.05,
        probability: 0.25,
        description: 'Increased market volatility'
      },
      {
        name: 'Black Swan Event',
        impact: (analytics.totalRealizedNetPnl || 0) * -0.35,
        probability: 0.01,
        description: 'Extremely rare but severe event'
      },
      {
        name: 'Sector Rotation',
        impact: (analytics.totalRealizedNetPnl || 0) * -0.08,
        probability: 0.30,
        description: 'Unfavorable sector rotation'
      }
    ];

    return scenarios.map(scenario => ({
      ...scenario,
      riskAdjustedImpact: scenario.impact * scenario.probability
    }));
  }, [analytics.totalRealizedNetPnl]);

  // Calculate drawdown distribution
  const drawdownDistribution = useMemo(() => {
    if (!analytics.equityCurve || analytics.equityCurve.length < 2) return [];
    
    const drawdowns = [];
    let peak = analytics.equityCurve[0].equity;
    
    for (let i = 1; i < analytics.equityCurve.length; i++) {
      const current = analytics.equityCurve[i].equity;
      if (current > peak) {
        peak = current;
      }
      const drawdown = peak > 0 ? (current - peak) / peak : 0;
      drawdowns.push(drawdown);
    }
    
    // Create histogram bins
    const bins = [];
    for (let i = 0; i >= -0.5; i -= 0.05) {
      const binStart = i;
      const binEnd = i - 0.05;
      const count = drawdowns.filter(dd => dd <= binStart && dd > binEnd).length;
      bins.push({
        range: `${(binStart * 100).toFixed(1)}% to ${(binEnd * 100).toFixed(1)}%`,
        count,
        binStart: binStart * 100
      });
    }
    
    return bins.filter(bin => bin.count > 0);
  }, [analytics.equityCurve]);

  const varMetrics = [
    {
      title: 'Value at Risk (95%)',
      value: analytics.valueAtRisk95,
      confidence: '95%',
      description: 'Maximum expected loss on 95% of trading days',
      severity: (analytics.valueAtRisk95 && analytics.valueAtRisk95 < -0.05) ? 'high' : 'medium' as const
    },
    {
      title: 'Value at Risk (99%)',
      value: analytics.valueAtRisk99,
      confidence: '99%',
      description: 'Maximum expected loss on 99% of trading days',
      severity: (analytics.valueAtRisk99 && analytics.valueAtRisk99 < -0.08) ? 'critical' : 'high' as const
    },
    {
      title: 'Conditional VaR (95%)',
      value: analytics.conditionalVaR95,
      confidence: '95%',
      description: 'Expected loss when VaR threshold is exceeded',
      severity: (analytics.conditionalVaR95 && analytics.conditionalVaR95 < -0.07) ? 'high' : 'medium' as const
    },
    {
      title: 'Conditional VaR (99%)',
      value: analytics.conditionalVaR99,
      confidence: '99%',
      description: 'Expected loss in worst-case scenarios',
      severity: (analytics.conditionalVaR99 && analytics.conditionalVaR99 < -0.12) ? 'critical' : 'high' as const
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
          Value at Risk & Stress Testing
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Risk measurement and scenario analysis for portfolio protection
        </Typography>
      </Box>

      {/* VaR Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {varMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <VaRMetric {...metric} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Stress Test Scenarios */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
              Stress Test Scenarios
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stressTestScenarios}>
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
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Impact']}
                  labelStyle={{ color: colors.textPrimary }}
                />
                <Bar 
                  dataKey="impact" 
                  fill={colors.error}
                  radius={[4, 4, 0, 0]}
                />
                <ReferenceLine y={0} stroke={colors.textSecondary} strokeDasharray="3 3" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Drawdown Distribution */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
              Drawdown Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={drawdownDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis 
                  dataKey="range" 
                  tick={{ fontSize: 10, fill: colors.textSecondary }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: colors.textSecondary }}
                  label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Occurrences']}
                  labelStyle={{ color: colors.textPrimary }}
                />
                <Bar 
                  dataKey="count" 
                  fill={colors.warning}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Risk-Adjusted Impact */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
              Risk-Adjusted Scenario Impact
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stressTestScenarios}>
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
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Risk-Adjusted Impact']}
                  labelStyle={{ color: colors.textPrimary }}
                />
                <Bar 
                  dataKey="riskAdjustedImpact" 
                  fill={colors.secondary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Risk Summary */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
              Risk Summary
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ color: colors.textPrimary, mb: 2 }}>
                Portfolio Risk Assessment
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                  Maximum Drawdown Risk
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((analytics.maxDrawdownPercentage || 0) * 2, 100)} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: `${colors.error}20`,
                    '& .MuiLinearProgress-bar': { backgroundColor: colors.error }
                  }}
                />
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  {(analytics.maxDrawdownPercentage || 0).toFixed(1)}% maximum observed
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                  Volatility Risk
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((analytics.annualizedVolatility || 0) * 500, 100)} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: `${colors.warning}20`,
                    '& .MuiLinearProgress-bar': { backgroundColor: colors.warning }
                  }}
                />
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  {((analytics.annualizedVolatility || 0) * 100).toFixed(1)}% annualized volatility
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                  Tail Risk (VaR 99%)
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(Math.abs((analytics.valueAtRisk99 || 0)) * 1000, 100)} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: `${colors.primary}20`,
                    '& .MuiLinearProgress-bar': { backgroundColor: colors.primary }
                  }}
                />
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  {((analytics.valueAtRisk99 || 0) * 100).toFixed(2)}% worst-case daily loss
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Risk metrics are based on historical data. Actual future losses may exceed these estimates.
                </Typography>
              </Alert>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default VaRStressTestingAnalysis;