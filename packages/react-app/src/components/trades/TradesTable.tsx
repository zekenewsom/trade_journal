// File: zekenewsom-trade_journal/packages/react-app/src/components/trades/TradesTable.tsx
// Modified for Stage 6: Add Mark Price input and Unrealized P&L display for open trades

import React, { useState, useMemo } from 'react';
import type { TradeListView } from '../../types'; // TradeListView now has unrealized_pnl, current_market_price, current_open_quantity

interface TradesTableProps {
  trades: TradeListView[];
  onEdit: (tradeId: number) => void;
  onDelete: (tradeId: number) => void;
  onMarkPriceUpdate: () => void; // Callback to refresh data after mark price update
}

type SortKey = keyof TradeListView | 'open_datetime' | 'close_datetime' | 'unrealized_pnl' | null;
type SortOrder = 'asc' | 'desc';

const TradesTable: React.FC<TradesTableProps> = ({ trades, onEdit, onDelete, onMarkPriceUpdate }) => {
  const [sortKey] = useState<string>('open_datetime');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [markPrices, setMarkPrices] = useState<Record<number, string>>({}); // tradeId -> price string

  // ... (handleSort and sortedTrades memoization - same as your Stage 5, ensure types are correct)
  const handleSort = (key: SortKey) => { /* ... same ... */};
  const sortedTrades = useMemo(() => { /* ... same ... */ return trades || []; }, [trades, sortKey, sortOrder]);

  const handleMarkPriceChange = (tradeId: number, value: string) => {
    setMarkPrices(prev => ({ ...prev, [tradeId]: value }));
  };

  const submitMarkPrice = async (tradeId: number) => {
    const priceStr = markPrices[tradeId];
    if (priceStr === undefined || priceStr === null || priceStr === '') {
        alert("Please enter a valid market price.");
        return;
    }
    const marketPrice = parseFloat(priceStr);
    if (isNaN(marketPrice) || marketPrice <=0) {
      alert('Invalid mark price. Please enter a positive number.');
      return;
    }
    try {
      const result = await window.electronAPI.updateMarkPrice({ tradeId, marketPrice });
      if (result.success) {
        alert(result.message);
        setMarkPrices(prev => ({...prev, [tradeId]: ''})); // Clear input
        onMarkPriceUpdate(); // Trigger data refresh in parent
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert(`Failed to update mark price: ${(err as Error).message}`);
    }
  };

  // Styles...
  const tableHeaderStyle: React.CSSProperties = { cursor: 'pointer', padding: '10px', borderBottom: '2px solid #555', borderRight: '1px solid #444', backgroundColor: '#3a3f47', whiteSpace: 'nowrap' };
  const tableCellStyle: React.CSSProperties = { padding: '8px', borderBottom: '1px solid #444', borderRight: '1px solid #444', textAlign: 'left', verticalAlign: 'top' };
  const markPriceInputStyle: React.CSSProperties = { width: '80px', marginRight: '5px', padding: '3px', backgroundColor: '#444', color: 'white', border:'1px solid #666'};
  const markPriceButtonStyle: React.CSSProperties = { padding: '3px 6px', fontSize: '0.8em'};


  if (!sortedTrades || sortedTrades.length === 0) return <p>No trades to display.</p>;
  const getSortIndicator = (key: SortKey) => (sortKey === key ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '0.9em' }}>
      <thead>
        <tr>
          {/* ... other headers ... */}
          <th style={tableHeaderStyle} onClick={() => handleSort('trade_id')}>ID{getSortIndicator('trade_id')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('instrument_ticker')}>Ticker{getSortIndicator('instrument_ticker')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('asset_class')}>Asset{getSortIndicator('asset_class')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('exchange')}>Exchange{getSortIndicator('exchange')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('trade_direction')}>Direction{getSortIndicator('trade_direction')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('status')}>Status{getSortIndicator('status')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('open_datetime')}>Opened{getSortIndicator('open_datetime')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('close_datetime')}>Closed{getSortIndicator('close_datetime')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('current_open_quantity')}>Open Qty{getSortIndicator('current_open_quantity')}</th>
          <th style={tableHeaderStyle} onClick={() => handleSort('unrealized_pnl')}>Unrealized P&L{getSortIndicator('unrealized_pnl')}</th>
          <th style={{...tableHeaderStyle, cursor: 'default'}}>Mark Price</th>
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
            <td style={tableCellStyle}>{trade.status === 'Open' ? trade.current_open_quantity?.toFixed(4) || 'N/A' : '-'}</td>
            <td style={tableCellStyle}>
              {trade.status === 'Open' && trade.unrealized_pnl !== null && trade.unrealized_pnl !== undefined
                ? trade.unrealized_pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                : '-'}
            </td>
            <td style={tableCellStyle}>
              {trade.status === 'Open' && (
                <div>
                  <input
                    type="number"
                    step="any"
                    style={markPriceInputStyle}
                    placeholder={trade.current_market_price ? trade.current_market_price.toString() : "Mkt Price"}
                    value={markPrices[trade.trade_id!] || ''}
                    onChange={(e) => handleMarkPriceChange(trade.trade_id!, e.target.value)}
                  />
                  <button style={markPriceButtonStyle} onClick={() => submitMarkPrice(trade.trade_id!)}>Set</button>
                </div>
              )}
            </td>
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