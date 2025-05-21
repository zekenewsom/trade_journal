import React from 'react';
import type { AnalyticsData } from '../../types';
import { colors } from '../../styles/design-tokens';

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
      <h3 className="text-xl font-semibold mb-4" style={{ color: colors.onSurface }}>Trade Statistics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-lg p-4 border"
            style={{
              background: colors.surface,
              borderColor: colors.cardStroke
            }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>{stat.label}</p>
            <p
              className="text-xl font-bold"
              style={{
                color:
                  stat.color === 'text-positive'
                    ? colors.success
                    : stat.color === 'text-negative'
                    ? colors.error
                    : colors.primary
              }}
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