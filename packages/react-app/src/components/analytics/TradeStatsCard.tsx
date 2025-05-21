import React from 'react';
import type { AnalyticsData } from '../../types';


interface Props {
  analytics: AnalyticsData;
}

const TradeStatsCard: React.FC<Props> = ({ analytics }) => {
  const stats = [
    {
      label: 'Average Win',
      value: analytics.avgWinPnlOverall ? `$${analytics.avgWinPnlOverall.toFixed(2)}` : 'N/A',
      color: 'text-positive'
    },
    {
      label: 'Average Loss',
      value: analytics.avgLossPnlOverall ? `$${analytics.avgLossPnlOverall.toFixed(2)}` : 'N/A',
      color: 'text-negative'
    },
    {
      label: 'Largest Win',
      value: analytics.largestWinPnl ? `$${analytics.largestWinPnl.toFixed(2)}` : 'N/A',
      color: 'text-positive'
    },
    {
      label: 'Largest Loss',
      value: analytics.largestLossPnl ? `$${analytics.largestLossPnl.toFixed(2)}` : 'N/A',
      color: 'text-negative'
    },
    {
      label: 'Profit Factor',
      value: analytics.totalRealizedGrossPnl && analytics.totalFeesPaidOnClosedPortions
        ? ((analytics.totalRealizedGrossPnl - analytics.totalFeesPaidOnClosedPortions) / 
           Math.abs(analytics.totalFeesPaidOnClosedPortions)).toFixed(2)
        : 'N/A',
      color: 'text-primary-action'
    },
    {
      label: 'Average R-Multiple',
      value: analytics.avgRMultiple ? analytics.avgRMultiple.toFixed(2) : 'N/A',
      color: 'text-primary-action'
    }
  ];

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Trade Statistics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-lg p-4 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p
              className={`text-xl font-bold ${stat.color === 'text-positive' ? 'text-green-500' : stat.color === 'text-negative' ? 'text-red-500' : 'text-blue-600'}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeStatsCard; 