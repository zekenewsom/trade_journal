// File: zekenewsom-trade_journal/packages/react-app/src/components/dashboard/DashboardMetrics.tsx
// Modified for Stage 6 to use getAnalyticsData

import React, { useState, useEffect } from 'react';
import type { AnalyticsData } from '../../types'; // Changed from BasicAnalyticsData

const DashboardMetrics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null); // Use new AnalyticsData type
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true); setError(null);
      try {
        // Using the new unified analytics endpoint
        if (window.electronAPI && window.electronAPI.getAnalyticsData) {
          const data = await window.electronAPI.getAnalyticsData(); // No filters for dashboard summary for now
          if (data == null) {
            throw new Error('No analytics data returned from backend.');
          }
          if ('error' in data) { throw new Error(data.error); }
          setAnalytics(data);
        } else { throw new Error("getAnalyticsData API not available."); }
      } catch (err) {
        console.error("Error fetching dashboard analytics:", err);
        setError((err as Error).message); setAnalytics(null);
      } finally { setIsLoading(false); }
    };
    fetchAnalytics();
  }, []); // Runs once on mount or if parent forces re-render via key

  // Styles (same as before)
  const metricCardStyle: React.CSSProperties = { border: '1px solid #555', borderRadius: '8px', padding: '15px', minWidth: '180px', flex: '1 1 200px', margin: '5px', textAlign: 'center', backgroundColor: '#3a3f47' };
  const metricLabelStyle: React.CSSProperties = { fontSize: '0.9em', color: '#ccc', marginBottom: '5px' };
  const metricValueStyle: React.CSSProperties = { fontSize: '1.5em', fontWeight: 'bold', margin: '5px 0' };
  const positiveValueStyle: React.CSSProperties = { ...metricValueStyle, color: '#4CAF50'};
  const negativeValueStyle: React.CSSProperties = { ...metricValueStyle, color: '#f44336'};
  const neutralValueStyle: React.CSSProperties = { ...metricValueStyle, color: '#61dafb'};

  if (isLoading) return <p>Loading dashboard metrics...</p>;
  if (error) return <p style={{ color: 'red' }}>Error loading metrics: {error}</p>;
  if (!analytics) return <p>No analytics data available for dashboard.</p>;

  const formatCurrency = (value: number | null | undefined) => value === null || value === undefined ? 'N/A' : value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const formatPercentage = (value: number | null | undefined) => value === null || value === undefined ? 'N/A' : `${value.toFixed(2)}%`;

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3>Dashboard Summary</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
        <div style={metricCardStyle}>
          <div style={metricLabelStyle}>Total Realized Net P&L</div>
          <div style={analytics.totalRealizedNetPnl >= 0 ? positiveValueStyle : negativeValueStyle}>
            {formatCurrency(analytics.totalRealizedNetPnl)}
          </div>
        </div>
        <div style={metricCardStyle}>
          <div style={metricLabelStyle}>Win Rate (Closed Trades)</div>
          <div style={neutralValueStyle}>{analytics.winRateOverall !== null ? formatPercentage(analytics.winRateOverall * 100) : 'N/A'}</div>
          <div style={{fontSize: '0.8em', color: '#aaa'}}>({analytics.numberOfWinningTrades}W / {analytics.numberOfLosingTrades}L / {analytics.numberOfBreakEvenTrades}B of {analytics.totalFullyClosedTrades} closed)</div>
        </div>
        <div style={metricCardStyle}>
          <div style={metricLabelStyle}>Avg. Win (Closed)</div>
          <div style={positiveValueStyle}>{formatCurrency(analytics.avgWinPnlOverall)}</div>
        </div>
        <div style={metricCardStyle}>
          <div style={metricLabelStyle}>Avg. Loss (Closed)</div>
          <div style={negativeValueStyle}>{formatCurrency(analytics.avgLossPnlOverall)}</div>
        </div>
        <div style={metricCardStyle}>
          <div style={metricLabelStyle}>Max Drawdown</div>
          <div style={negativeValueStyle}>{formatPercentage(analytics.maxDrawdownPercentage)}</div>
        </div>
        {/* Add more key metrics as desired for dashboard */}
      </div>
    </div>
  );
};

export default DashboardMetrics;