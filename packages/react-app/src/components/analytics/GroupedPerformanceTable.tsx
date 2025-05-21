// File: zekenewsom-trade_journal/packages/react-app/src/components/analytics/GroupedPerformanceTable.tsx
// New File for Stage 6

import React from 'react';
import type { GroupedPerformance } from '../../types';
import { colors } from '../../styles/design-tokens';

interface Props {
  title: string;
  data: GroupedPerformance[];
}

const GroupedPerformanceTable: React.FC<Props> = ({ title, data }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4" style={{ color: colors.onSurface }}>{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: colors.surface }}>
              <th className="px-4 py-3 text-left text-sm font-medium border-b" style={{ color: colors.textSecondary, borderColor: colors.cardStroke }}>Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b" style={{ color: colors.textSecondary, borderColor: colors.cardStroke }}>Total P&L</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b" style={{ color: colors.textSecondary, borderColor: colors.cardStroke }}>Win Rate</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b" style={{ color: colors.textSecondary, borderColor: colors.cardStroke }}>Trades</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b" style={{ color: colors.textSecondary, borderColor: colors.cardStroke }}>Wins</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b" style={{ color: colors.textSecondary, borderColor: colors.cardStroke }}>Losses</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b" style={{ color: colors.textSecondary, borderColor: colors.cardStroke }}>Break Even</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} style={{ transition: 'background 0.2s' }} onMouseOver={e => (e.currentTarget.style.background = colors.surfaceVariant)} onMouseOut={e => (e.currentTarget.style.background = '')}>
                <td className="px-4 py-3 text-sm border-b" style={{ color: colors.onSurface, borderColor: colors.cardStroke }}>{item.name}</td>
                <td className="px-4 py-3 text-sm font-medium border-b" style={{ color: item.totalNetPnl >= 0 ? colors.success : colors.error, borderColor: colors.cardStroke }}>
                  ${item.totalNetPnl.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm border-b" style={{ color: colors.onSurface, borderColor: colors.cardStroke }}>
                  {item.winRate !== null ? `${item.winRate.toFixed(1)}%` : 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm border-b" style={{ color: colors.onSurface, borderColor: colors.cardStroke }}>{item.tradeCount}</td>
                <td className="px-4 py-3 text-sm border-b" style={{ color: colors.success, borderColor: colors.cardStroke }}>{item.wins}</td>
                <td className="px-4 py-3 text-sm border-b" style={{ color: colors.error, borderColor: colors.cardStroke }}>{item.losses}</td>
                <td className="px-4 py-3 text-sm border-b" style={{ color: colors.onSurface, borderColor: colors.cardStroke }}>{item.breakEvens}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupedPerformanceTable;