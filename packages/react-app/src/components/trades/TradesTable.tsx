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

  if (!sortedTrades || sortedTrades.length === 0) return <p className="text-gray-300">No trades to display.</p>;
  const getSortIndicator = (key: SortKey) => (sortKey === key ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-white text-sm">
        <thead>
          <tr>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('trade_id')}>ID{getSortIndicator('trade_id')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('instrument_ticker')}>Ticker{getSortIndicator('instrument_ticker')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('asset_class')}>Asset{getSortIndicator('asset_class')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('exchange')}>Exchange{getSortIndicator('exchange')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('trade_direction')}>Direction{getSortIndicator('trade_direction')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('status')}>Status{getSortIndicator('status')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('open_datetime')}>Opened{getSortIndicator('open_datetime')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('close_datetime')}>Closed{getSortIndicator('close_datetime')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap">Latest Trade</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('current_open_quantity')}>Open Qty{getSortIndicator('current_open_quantity')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('unrealized_pnl')}>Unrealized P&L{getSortIndicator('unrealized_pnl')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap">Mark Price</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTrades.map((trade, idx) => (
            <tr key={trade.trade_id} className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}>
              <td className="px-3 py-2 border-b border-gray-700 text-left align-top">{trade.trade_id}</td>
              <td className="px-3 py-2 border-b border-gray-700 text-left align-top">{trade.instrument_ticker}</td>
              <td className="px-3 py-2 border-b border-gray-700 text-left align-top">{trade.asset_class}</td>
              <td className="px-3 py-2 border-b border-gray-700 text-left align-top">{trade.exchange || 'N/A'}</td>
              <td className="px-3 py-2 border-b border-gray-700 text-left align-top">{trade.trade_direction}</td>
              <td className="px-3 py-2 border-b border-gray-700 text-left align-top">{trade.status}</td>
              <td className="px-3 py-2 border-b border-gray-700 text-left align-top">{trade.open_datetime ? new Date(trade.open_datetime).toLocaleString() : 'N/A'}</td>
              <td className="px-3 py-2 border-b border-gray-700 text-center whitespace-nowrap">
                {trade.close_datetime ? new Date(trade.close_datetime).toLocaleString() : '-'}
              </td>
              <td className="px-3 py-2 border-b border-gray-700 text-center whitespace-nowrap">
                {trade.latest_trade ? new Date(trade.latest_trade).toLocaleString() : '-'}
              </td>
              <td className="px-3 py-2 border-b border-gray-700 text-left align-top">{trade.status === 'Open' ? trade.current_open_quantity?.toFixed(4) || 'N/A' : '-'}</td>
              <td className="px-3 py-2 border-b border-gray-700 text-left align-top">
                {trade.status === 'Open' && trade.unrealized_pnl !== null && trade.unrealized_pnl !== undefined
                  ? trade.unrealized_pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                  : '-'}
              </td>
              <td className="px-3 py-2 border-b border-gray-700 text-left align-top">
                {trade.status === 'Open' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={trade.current_market_price ? trade.current_market_price.toString() : "Mkt Price"}
                      value={markPrices[trade.trade_id!] || ''}
                      onChange={(e) => handleMarkPriceChange(trade.trade_id!, e.target.value)}
                    />
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold transition-colors"
                      onClick={() => submitMarkPrice(trade.trade_id!)}
                    >
                      Set
                    </button>
                  </div>
                )}
              </td>
              <td className="px-3 py-2 border-b border-gray-700 text-left align-top">
                <button
                  onClick={() => trade.trade_id && onEdit(trade.trade_id)}
                  className="mr-2 px-3 py-1 bg-gray-700 text-white rounded hover:bg-blue-600 text-xs font-semibold transition-colors"
                >
                  Edit/View
                </button>
                <button
                  onClick={() => trade.trade_id && onDelete(trade.trade_id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-semibold transition-colors"
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