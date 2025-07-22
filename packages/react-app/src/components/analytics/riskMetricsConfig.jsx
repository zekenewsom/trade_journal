// Static configuration for institutional risk metrics
// This file contains only static definitions, not dynamic values

const riskMetricsConfig = [
  {
    title: 'Sharpe Ratio',
    description: 'Risk-adjusted return measure. Higher values indicate better risk-adjusted performance.',
    benchmark: {
      label: 'Hedge Fund Avg',
      value: 0.8
    },
    interpretation: {
      excellent: 1.5,
      good: 1.0,
      fair: 0.5,
      poor: 0
    },
    format: 'ratio',
    precision: 2
  },
  {
    title: 'Sortino Ratio',
    description: 'Downside risk-adjusted return. Only considers negative volatility.',
    benchmark: {
      label: 'Hedge Fund Avg',
      value: 1.2
    },
    interpretation: {
      excellent: 2.0,
      good: 1.5,
      fair: 1.0,
      poor: 0
    },
    format: 'ratio',
    precision: 2
  },
  {
    title: 'Calmar Ratio',
    description: 'Annual return divided by maximum drawdown. Higher is better.',
    benchmark: {
      label: 'Hedge Fund Avg',
      value: 0.5
    },
    interpretation: {
      excellent: 1.0,
      good: 0.5,
      fair: 0.2,
      poor: 0
    },
    format: 'ratio',
    precision: 2
  },
  {
    title: 'Ulcer Index',
    description: 'Measures depth and duration of drawdowns. Lower values are better.',
    interpretation: {
      excellent: 0.05,
      good: 0.10,
      fair: 0.20,
      poor: 1.0
    },
    format: 'percentage',
    precision: 1
  },
  {
    title: 'Omega Ratio',
    description: 'Probability-weighted ratio of gains to losses. Higher is better.',
    benchmark: {
      label: 'Benchmark',
      value: 1.0
    },
    interpretation: {
      excellent: 2.0,
      good: 1.5,
      fair: 1.0,
      poor: 0
    },
    format: 'ratio',
    precision: 2
  },
  {
    title: 'Skewness',
    description: 'Measures asymmetry of returns. Positive skewness is preferred.',
    benchmark: {
      label: 'Benchmark',
      value: 0
    },
    interpretation: {
      excellent: 1.0,
      good: 0.5,
      fair: 0,
      poor: -1.0
    },
    format: 'number',
    precision: 2
  }
];

export default riskMetricsConfig; 