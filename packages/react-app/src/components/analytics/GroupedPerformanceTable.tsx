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
      <h3 style={{ color: '#61dafb', marginBottom: '15px' }}>{title}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Total P&L</th>
              <th style={tableHeaderStyle}>Win Rate</th>
              <th style={tableHeaderStyle}>Trades</th>
              <th style={tableHeaderStyle}>Wins</th>
              <th style={tableHeaderStyle}>Losses</th>
              <th style={tableHeaderStyle}>Break Even</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td style={tableCellStyle}>{item.name}</td>
                <td style={{...tableCellStyle, color: item.totalNetPnl >= 0 ? '#4CAF50' : '#f44336'}}>
                  ${item.totalNetPnl.toFixed(2)}
                </td>
                <td style={tableCellStyle}>
                  {item.winRate !== null ? `${item.winRate.toFixed(1)}%` : 'N/A'}
                </td>
                <td style={tableCellStyle}>{item.tradeCount}</td>
                <td style={tableCellStyle}>{item.wins}</td>
                <td style={tableCellStyle}>{item.losses}</td>
                <td style={tableCellStyle}>{item.breakEvens}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const tableHeaderStyle: React.CSSProperties = {
  backgroundColor: '#2a2f36',
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #444',
  color: '#61dafb'
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid #444',
  textAlign: 'left'
};

export default GroupedPerformanceTable;