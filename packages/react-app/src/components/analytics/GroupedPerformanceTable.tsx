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
    <div>
      <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-900">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 border-b border-gray-800">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 border-b border-gray-800">Total P&L</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 border-b border-gray-800">Win Rate</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 border-b border-gray-800">Trades</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 border-b border-gray-800">Wins</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 border-b border-gray-800">Losses</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 border-b border-gray-800">Break Even</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-300 border-b border-gray-800">{item.name}</td>
                <td className={`px-4 py-3 text-sm font-medium border-b border-gray-800 ${
                  item.totalNetPnl >= 0 ? 'text-positive' : 'text-negative'
                }`}>
                  ${item.totalNetPnl.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300 border-b border-gray-800">
                  {item.winRate !== null ? `${item.winRate.toFixed(1)}%` : 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300 border-b border-gray-800">{item.tradeCount}</td>
                <td className="px-4 py-3 text-sm text-positive border-b border-gray-800">{item.wins}</td>
                <td className="px-4 py-3 text-sm text-negative border-b border-gray-800">{item.losses}</td>
                <td className="px-4 py-3 text-sm text-gray-300 border-b border-gray-800">{item.breakEvens}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupedPerformanceTable;