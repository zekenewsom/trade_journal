// File: zekenewsom-trade_journal/packages/react-app/src/components/trades/TradesTable.tsx
// Modified for Stage 6: Add Mark Price input and Unrealized P&L display for open trades

import React, { useState, useMemo } from 'react';
import type { TradeListView } from '../../types'; // TradeListView now has unrealized_pnl, current_market_price, current_open_quantity

import { useAppStore } from '../../stores/appStore';

// TypeScript declaration for Zustand dev helper
declare global {
  interface Window {
    __ZUSTAND_STORE__?: any;
  }
}


interface TradesTableProps {
  trades: TradeListView[];
  onEdit: (tradeId: number) => void;
  onDelete: (tradeId: number) => void;
}

type SortKey = keyof TradeListView | 'open_datetime' | 'close_datetime' | 'unrealized_pnl' | null;
type SortOrder = 'asc' | 'desc';

const TradesTable: React.FC<TradesTableProps> = ({ trades, onEdit, onDelete }) => {
  const { updateMarkPriceInStore } = useAppStore();
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
        if (result.trade_id) {
          updateMarkPriceInStore(
            result.trade_id,
            marketPrice,
            result.unrealized_pnl,
            result.current_open_quantity
          );
          // If the backend does not return updated unrealized_pnl, force a refresh
          if (typeof result.unrealized_pnl !== 'number' || typeof result.current_open_quantity !== 'number') {
            if (typeof window !== 'undefined' && window.__ZUSTAND_STORE__) {
              window.__ZUSTAND_STORE__.getState().refreshTrades();
            }
          }
        }
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert(`Failed to update mark price: ${(err as Error).message}`);
    }
  };

  // Styles removed: now using Tailwind CSS classes

  if (!sortedTrades || sortedTrades.length === 0) return <p className="text-on-surface/70">No trades to display.</p>;
  const getSortIndicator = (key: SortKey) => (sortKey === key ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-on-surface text-sm bg-surface">
        <thead>
          <tr>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap cursor-pointer" onClick={() => handleSort('trade_id')}>ID{getSortIndicator('trade_id')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('instrument_ticker')}>Ticker{getSortIndicator('instrument_ticker')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('asset_class')}>Asset{getSortIndicator('asset_class')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('exchange')}>Exchange{getSortIndicator('exchange')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('trade_direction')}>Direction{getSortIndicator('trade_direction')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('status')}>Status{getSortIndicator('status')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('open_datetime')}>Opened{getSortIndicator('open_datetime')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('close_datetime')}>Closed{getSortIndicator('close_datetime')}</th>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap text-on-surface">Latest Trade</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('current_open_quantity')}>Open Qty{getSortIndicator('current_open_quantity')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('unrealized_pnl')}>Unrealized P&L{getSortIndicator('unrealized_pnl')}</th>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap text-on-surface">Mark Price</th>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap text-on-surface">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTrades.map((trade, idx) => (
            <tr key={trade.trade_id} className={idx % 2 === 0 ? 'bg-surface' : 'bg-surface-variant'}>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">{trade.trade_id}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">{trade.instrument_ticker}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">{trade.asset_class}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">{trade.exchange || 'N/A'}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">{trade.trade_direction}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">{trade.status}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">{trade.open_datetime ? new Date(trade.open_datetime).toLocaleString() : 'N/A'}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-center whitespace-nowrap text-on-surface">
                {trade.close_datetime ? new Date(trade.close_datetime).toLocaleString() : '-'}
              </td>
              <td className="px-3 py-2 border-b border-card-stroke text-center whitespace-nowrap text-on-surface">
                {trade.latest_trade ? new Date(trade.latest_trade).toLocaleString() : '-'}
              </td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">{trade.status === 'Open' ? trade.current_open_quantity?.toFixed(4) || 'N/A' : '-'}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">
                {trade.status === 'Open' && trade.unrealized_pnl !== null && trade.unrealized_pnl !== undefined
                  ? trade.unrealized_pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                  : '-'}
              </td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">
                {trade.status === 'Open' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      className="w-24 px-2 py-1 bg-surface-variant border border-card-stroke text-on-surface rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={trade.current_market_price ? trade.current_market_price.toString() : "Mkt Price"}
                      value={markPrices[trade.trade_id!] || ''}
                      onChange={(e) => handleMarkPriceChange(trade.trade_id!, e.target.value)}
                    />
                    <button
                      className="px-3 py-1 bg-primary text-on-primary rounded hover:bg-primary/90 text-xs font-semibold transition-colors"
                      onClick={() => submitMarkPrice(trade.trade_id!)}
                    >
                      Set
                    </button>
                  </div>
                )}
              </td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">
                <button
                  onClick={() => trade.trade_id && onEdit(trade.trade_id)}
                  className="mr-2 px-3 py-1 bg-surface-variant text-on-surface rounded hover:bg-primary/20 text-xs font-semibold transition-colors border border-card-stroke"
                >
                  Edit/View
                </button>
                <button
                  onClick={() => trade.trade_id && onDelete(trade.trade_id)}
                  className="px-3 py-1 bg-error text-on-error rounded hover:bg-error/90 text-xs font-semibold transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradesTable;