// File: zekenewsom-trade_journal/packages/react-app/src/components/analytics/GroupedPerformanceTable.tsx
// New File for Stage 6

import React from 'react';
import type { GroupedPerformance } from '../../types';

interface Props {
  title: string;
  data: GroupedPerformance[];
}

const GroupedPerformanceTable: React.FC<Props> = ({ title, data }) => {
  return (
    <div className="p-4 rounded-2xl mb-4">
      <h3 className="text-xl font-semibold text-on-surface mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface">
              <th className="px-4 py-3 text-left text-sm font-medium border-b text-secondary border-card-stroke">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b text-secondary border-card-stroke">Total P&L</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b text-secondary border-card-stroke">Win Rate</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b text-secondary border-card-stroke">Trades</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b text-secondary border-card-stroke">Wins</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b text-secondary border-card-stroke">Losses</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b text-secondary border-card-stroke">Break Even</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="transition-colors hover:bg-surface-variant">
                <td className="px-4 py-3 text-sm border-b text-on-surface border-card-stroke">{item.name}</td>
                <td className={`px-4 py-3 text-sm font-medium border-b border-card-stroke ${item.totalNetPnl >= 0 ? 'text-success' : 'text-error'}`}>${item.totalNetPnl.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm border-b text-on-surface border-card-stroke">
                  {item.winRate !== null ? `${item.winRate.toFixed(1)}%` : 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm border-b text-on-surface border-card-stroke">{item.tradeCount}</td>
                <td className="px-4 py-3 text-sm border-b text-success border-card-stroke">{item.wins}</td>
                <td className="px-4 py-3 text-sm border-b text-error border-card-stroke">{item.losses}</td>
                <td className="px-4 py-3 text-sm border-b text-on-surface border-card-stroke">{item.breakEvens}</td>
                <td className="px-4 py-3 text-sm border-b text-success border-card-stroke">{item.wins}</td>
                <td className="px-4 py-3 text-sm border-b text-error border-card-stroke">{item.losses}</td>
                <td className="px-4 py-3 text-sm border-b text-on-surface border-card-stroke">{item.breakEvens}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupedPerformanceTable;