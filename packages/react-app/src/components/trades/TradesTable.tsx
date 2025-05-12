// File: zekenewsom-trade_journal/packages/react-app/src/components/trades/TradesTable.tsx
// New file for Stage 3

import React, { useState } from 'react';
import type { TradeTableDisplay } from '../../types/index.ts';

interface TradesTableProps {
  trades: TradeTableDisplay[];
  onEdit: (tradeId: number) => void;
  onDelete: (tradeId: number) => void;
}

type SortKey = keyof TradeTableDisplay | null;
type SortOrder = 'asc' | 'desc';

const TradesTable: React.FC<TradesTableProps> = ({ trades, onEdit, onDelete }) => {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedTrades = React.useMemo(() => {
    if (!sortKey) return trades;
    return [...trades].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === undefined || valA === null) return 1; // or -1 depending on how you want to sort undefined/null
      if (valB === undefined || valB === null) return -1; // or 1

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      // Add more type handling if necessary (e.g., dates)
      return 0;
    });
  }, [trades, sortKey, sortOrder]);

  const tableHeaderStyle: React.CSSProperties = { cursor: 'pointer', padding: '10px', border: '1px solid #555', backgroundColor: '#444' };
  const tableCellStyle: React.CSSProperties = { padding: '8px', border: '1px solid #555', textAlign: 'left' };

  if (!sortedTrades || sortedTrades.length === 0) {
    return <p>No trades found.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
      <thead>
        <tr>
          <th style={tableHeaderStyle} onClick={() => handleSort('trade_id')}>ID {sortKey === 'trade_id' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('instrument_ticker')}>Ticker {sortKey === 'instrument_ticker' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('asset_class')}>Asset Class {sortKey === 'asset_class' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('trade_direction')}>Direction {sortKey === 'trade_direction' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('first_entry_datetime')}>Entry Date/Time {sortKey === 'first_entry_datetime' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
          {/* Add more headers as needed: Entry Price, Size, Outcome, P&L */}
          <th style={{...tableHeaderStyle, cursor: 'default'}}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedTrades.map((trade) => (
          <tr key={trade.trade_id}>
            <td style={tableCellStyle}>{trade.trade_id}</td>
            <td style={tableCellStyle}>{trade.instrument_ticker}</td>
            <td style={tableCellStyle}>{trade.asset_class}</td>
            <td style={tableCellStyle}>{trade.trade_direction}</td>
            <td style={tableCellStyle}>{trade.first_entry_datetime ? new Date(trade.first_entry_datetime).toLocaleString() : 'N/A'}</td>
            {/* Render more cells */}
            <td style={tableCellStyle}>
              <button onClick={() => trade.trade_id && onEdit(trade.trade_id)} style={{ marginRight: '5px' }}>Edit</button>
              <button onClick={() => trade.trade_id && onDelete(trade.trade_id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TradesTable;