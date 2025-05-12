// File: zekenewsom-trade_journal/packages/react-app/src/views/AnalyticsPage.tsx
// New file for Stage 6

import React, { useState, useEffect } from 'react';
import type { AnalyticsData } from '../types';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true); setError(null);
      try {
        if (window.electronAPI?.getAnalyticsData) {
          const data = await window.electronAPI.getAnalyticsData(); // No filters for now
          if ('error' in data) throw new Error(data.error);
          setAnalytics(data);
        } else { throw new Error("getAnalyticsData API not available."); }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError((err as Error).message);
      } finally { setIsLoading(false); }
    };
    fetchAnalyticsData();
  }, []);

  const COLORS_PIE = ['#4CAF50', '#f44336', '#FFBB28']; // Green for Wins, Red for Losses, Yellow for Break-even

  if (isLoading) return <p>Loading analytics data...</p>;
  if (error) return <p style={{ color: 'red' }}>Error loading analytics: {error}</p>;
  if (!analytics) return <p>No analytics data available.</p>;
  
  // Basic styling for layout
  const chartContainerStyle: React.CSSProperties = { marginBottom: '40px', padding: '20px', backgroundColor: '#333940', borderRadius: '8px'};
  const chartTitleStyle: React.CSSProperties = { color: '#61dafb', marginBottom: '15px'};

  return (
    <div style={{color: '#eee'}}>
      <h2>Advanced Trading Analytics</h2>

      {/* Cumulative P&L Chart */}
      {analytics.cumulativePnlSeries && analytics.cumulativePnlSeries.length > 0 && (
        <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>Cumulative Realized Net P&L</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.cumulativePnlSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#ccc' }}/>
              <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} tick={{ fontSize: 10, fill: '#ccc' }}/>
              <Tooltip formatter={(value:number) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="cumulativeNetPnl" name="Cumulative Net P&L" stroke="#82ca9d" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* P&L Per Trade Bar Chart (for fully closed trades) */}
      {analytics.pnlPerTradeSeries && analytics.pnlPerTradeSeries.length > 0 && (
         <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>Net P&L per Fully Closed Trade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.pnlPerTradeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555"/>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#ccc' }}/>
              <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} tick={{ fontSize: 10, fill: '#ccc' }}/>
              <Tooltip formatter={(value:number) => `$${value.toFixed(2)}`}/>
              <Legend />
              <Bar dataKey="netPnl" name="Net P&L">
                {analytics.pnlPerTradeSeries.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.netPnl >= 0 ? '#4CAF50' : '#f44336'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Win/Loss Pie Chart (for fully closed trades) */}
      {analytics.winLossBreakEvenCounts && analytics.winLossBreakEvenCounts.some(item => item.value > 0) && (
        <div style={chartContainerStyle}>
            <h3 style={chartTitleStyle}>Trade Outcomes (Fully Closed)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={analytics.winLossBreakEvenCounts}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {analytics.winLossBreakEvenCounts.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`${value} trades`, name]} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      )}
      
      {/* R-Multiple Histogram (if data available) */}
      {analytics.rMultipleDistribution && analytics.rMultipleDistribution.length > 0 && (
        <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>R-Multiple Distribution (Fully Closed Trades)</h3>
          <p>Average R-Multiple: {analytics.avgRMultiple !== null ? analytics.avgRMultiple.toFixed(2) : 'N/A'}</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.rMultipleDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555"/>
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#ccc' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#ccc' }}/>
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Number of Trades" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Placeholder for P&L by Asset Class/Exchange/Strategy tables */}
      {/* ... More charts and tables to be added here ... */}

    </div>
  );
};

export default AnalyticsPage;