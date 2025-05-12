// File: zekenewsom-trade_journal/packages/react-app/src/components/dashboard/DashboardMetrics.tsx
// New file for Stage 4

import React, { useState, useEffect } from 'react';
import type { BasicAnalyticsData } from '../../types';

const DashboardMetrics: React.FC = () => {
  const [analytics, setAnalytics] = useState<BasicAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (window.electronAPI && window.electronAPI.getBasicAnalytics) {
          const data = await window.electronAPI.getBasicAnalytics();
          setAnalytics(data);
        } else {
          throw new Error("getBasicAnalytics API not available.");
        }
      } catch (err) {
        console.error("Error fetching basic analytics:", err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const metricCardStyle: React.CSSProperties = {
    border: '1px solid #555',
    borderRadius: '8px',
    padding: '15px',
    minWidth: '180px',
    textAlign: 'center',
    backgroundColor: '#3a3f47'
  };
  const metricValueStyle: React.CSSProperties = {
    fontSize: '1.5em',
    fontWeight: 'bold',
    margin: '5px 0',
    color: '#61dafb'
  };
   const positiveValueStyle: React.CSSProperties = { ...metricValueStyle, color: '#4CAF50'};
   const negativeValueStyle: React.CSSProperties = { ...metricValueStyle, color: '#f44336'};


  if (isLoading) return <p>Loading analytics...</p>;
  if (error) return <p style={{ color: 'red' }}>Error loading analytics: {error}</p>;
  if (!analytics) return <p>No analytics data available.</p>;

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(2)}%`;
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3>Key Performance Indicators</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
        <div style={metricCardStyle}>
          <div>Total Net P&L</div>
          <div style={analytics.totalNetPnl >= 0 ? positiveValueStyle : negativeValueStyle}>{formatCurrency(analytics.totalNetPnl)}</div>
        </div>
        <div style={metricCardStyle}>
          <div>Total Gross P&L</div>
          <div style={analytics.totalGrossPnl >= 0 ? positiveValueStyle : negativeValueStyle}>{formatCurrency(analytics.totalGrossPnl)}</div>
        </div>
        <div style={metricCardStyle}>
          <div>Win Rate</div>
          <div style={metricValueStyle}>{formatPercentage(analytics.winRate)}</div>
          <div style={{fontSize: '0.8em'}}>({analytics.numberOfWinningTrades} W / {analytics.numberOfLosingTrades} L / {analytics.numberOfBreakEvenTrades} B)</div>
        </div>
        <div style={metricCardStyle}>
          <div>Avg. Winning Trade</div>
          <div style={positiveValueStyle}>{formatCurrency(analytics.avgWinPnl)}</div>
        </div>
        <div style={metricCardStyle}>
          <div>Avg. Losing Trade</div>
          <div style={negativeValueStyle}>{formatCurrency(analytics.avgLossPnl)}</div>
        </div>
        <div style={metricCardStyle}>
          <div>Longest Win Streak</div>
          <div style={metricValueStyle}>{analytics.longestWinStreak}</div>
        </div>
        <div style={metricCardStyle}>
          <div>Longest Loss Streak</div>
          <div style={metricValueStyle}>{analytics.longestLossStreak}</div>
        </div>
         <div style={metricCardStyle}>
          <div>Total Fees</div>
          <div style={metricValueStyle}>{formatCurrency(analytics.totalFees)}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;