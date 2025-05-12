// File: zekenewsom-trade_journal/packages/react-app/src/components/trades/TradesTable.tsx
// Modified for Stage 5 to use TradeListView and display new fields

import React, { useState, useMemo } from 'react';
import type { TradeListView } from '../../types';

interface TradesTableProps {
  trades: TradeListView[];
  onEdit: (tradeId: number) => void;
  onDelete: (tradeId: number) => void;
}

type SortKey = keyof TradeListView | 'open_datetime' | 'close_datetime' | null;
type SortOrder = 'asc' | 'desc';

const TradesTable: React.FC<TradesTableProps> = ({ trades, onEdit, onDelete }) => {
  const [sortKey, setSortKey] = useState<SortKey>('open_datetime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (key: SortKey) => {
    if (!key) return;
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedTrades = useMemo(() => {
    if (!sortKey || !trades) return trades || []; // Ensure trades is not null/undefined
    return [...trades].sort((a, b) => {
      const valA = a[sortKey as keyof TradeListView];
      const valB = b[sortKey as keyof TradeListView];

      let comparison = 0;
      if (valA === null || valA === undefined) comparison = 1;
      else if (valB === null || valB === undefined) comparison = -1;
      else if (sortKey === 'open_datetime' || sortKey === 'close_datetime') {
        const dateA = new Date(valA as string).getTime();
        const dateB = new Date(valB as string).getTime();
        comparison = dateA - dateB;
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [trades, sortKey, sortOrder]);

  const tableHeaderStyle: React.CSSProperties = { cursor: 'pointer', padding: '10px', borderBottom: '2px solid #555', borderRight: '1px solid #444', backgroundColor: '#3a3f47', whiteSpace: 'nowrap' };
  const tableCellStyle: React.CSSProperties = { padding: '8px', borderBottom: '1px solid #444', borderRight: '1px solid #444', textAlign: 'left', verticalAlign: 'top' };

  if (!sortedTrades || sortedTrades.length === 0) {
    return <p>No trades to display.</p>;
  }
  
  const getSortIndicator = (key: SortKey) => {
    if (sortKey === key) {
      return sortOrder === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '0.9em' }}>
      <thead>
        <tr>
          <th style={tableHeaderStyle} onClick={() => handleSort('trade_id')}>ID{getSortIndicator('trade_id')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('instrument_ticker')}>Ticker{getSortIndicator('instrument_ticker')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('asset_class')}>Asset{getSortIndicator('asset_class')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('exchange')}>Exchange{getSortIndicator('exchange')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('trade_direction')}>Direction{getSortIndicator('trade_direction')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('status')}>Status{getSortIndicator('status')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('open_datetime')}>Opened{getSortIndicator('open_datetime')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('close_datetime')}>Closed{getSortIndicator('close_datetime')}</th>
          <th style={{...tableHeaderStyle, cursor: 'default'}}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedTrades.map((trade) => (
          <tr key={trade.trade_id} style={{backgroundColor: trade.trade_id! % 2 === 0 ? '#2f333a' : '#282c34' }}>
            <td style={tableCellStyle}>{trade.trade_id}</td>
            <td style={tableCellStyle}>{trade.instrument_ticker}</td>
            <td style={tableCellStyle}>{trade.asset_class}</td>
            <td style={tableCellStyle}>{trade.exchange || 'N/A'}</td>
            <td style={tableCellStyle}>{trade.trade_direction}</td>
            <td style={tableCellStyle}>{trade.status}</td>
            <td style={tableCellStyle}>{trade.open_datetime ? new Date(trade.open_datetime).toLocaleString() : 'N/A'}</td>
            <td style={tableCellStyle}>{trade.close_datetime ? new Date(trade.close_datetime).toLocaleString() : 'N/A'}</td>
            <td style={tableCellStyle}>
              <button onClick={() => trade.trade_id && onEdit(trade.trade_id)} style={{ marginRight: '5px', padding: '3px 6px', fontSize:'0.9em' }}>Edit/View</button>
              <button onClick={() => trade.trade_id && onDelete(trade.trade_id)} style={{ padding: '3px 6px', backgroundColor: '#c00', color: 'white', fontSize:'0.9em'}}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TradesTable;