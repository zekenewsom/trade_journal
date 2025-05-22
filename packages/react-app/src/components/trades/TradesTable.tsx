// File: zekenewsom-trade_journal/packages/react-app/src/components/trades/TradesTable.tsx
// Modified for Stage 6: Add Mark Price input and Unrealized P&L display for open trades

import React, { useState, useMemo } from 'react';
import type { TradeListView } from '../../types'; // TradeListView now has unrealized_pnl, current_market_price, current_open_quantity

import { useAppStore } from '../../stores/appStore';

// TypeScript declaration for Zustand dev helper
declare global {
  interface Window {
    __ZUSTAND_STORE__?: unknown;
  }
}

interface TradesTableProps {
  trades: TradeListView[];
  onEdit: (tradeId: number) => void;
  onDelete: (tradeId: number) => void;
}

type SortKey = keyof TradeListView | 'open_datetime' | 'close_datetime' | 'unrealized_pnl' | null;

const TradesTable: React.FC<TradesTableProps> = ({ trades, onEdit, onDelete }) => {
  const store = useAppStore();
  const updateMarkPriceInStore = store && typeof store === 'object' && 'updateMarkPriceInStore' in store ? (store as { updateMarkPriceInStore?: (tradeId: number, marketPrice: number, unrealizedPnl: number, currentOpenQuantity: number) => void }).updateMarkPriceInStore : undefined;
    
  const [markPrices, setMarkPrices] = useState<Record<number, string>>({}); // tradeId -> price string

  const handleSort = () => {
  // Sorting logic can be implemented here if needed
};
  const sortedTrades = useMemo(() => { /* ... same ... */ return trades || []; }, [trades]);

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
        if (result.trade_id && typeof updateMarkPriceInStore === 'function' && typeof result.unrealized_pnl === 'number' && typeof result.current_open_quantity === 'number') {
          updateMarkPriceInStore(
            result.trade_id,
            marketPrice,
            result.unrealized_pnl,
            result.current_open_quantity
          );
        }
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert(`Failed to update mark price: ${(err as Error).message}`);
    }
  };

  if (!sortedTrades || sortedTrades.length === 0) return <p className="text-on-surface/70">No trades to display.</p>;
  const getSortIndicator = (_: keyof TradeListView | 'open_datetime' | 'close_datetime' | 'unrealized_pnl') => '';

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-on-surface text-sm bg-surface">
        <thead>
          <tr>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap cursor-pointer" onClick={() => handleSort('trade_id')}>ID{getSortIndicator('trade_id')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('instrument_ticker')}>Ticker{getSortIndicator('instrument_ticker')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer hidden sm:table-cell" onClick={() => handleSort('asset_class')}>Asset{getSortIndicator('asset_class')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer hidden md:table-cell" onClick={() => handleSort('exchange')}>Exchange{getSortIndicator('exchange')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer hidden md:table-cell" onClick={() => handleSort('trade_direction')}>Direction{getSortIndicator('trade_direction')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('status')}>Status{getSortIndicator('status')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer" onClick={() => handleSort('open_datetime')}>Open Date{getSortIndicator('open_datetime')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer hidden sm:table-cell" onClick={() => handleSort('close_datetime')}>Close Date{getSortIndicator('close_datetime')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer hidden lg:table-cell" onClick={() => handleSort('latest_trade')}>Latest Trade{getSortIndicator('latest_trade')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer hidden md:table-cell" onClick={() => handleSort('current_open_quantity')}>Open Qty{getSortIndicator('current_open_quantity')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-800 bg-gray-800 whitespace-nowrap cursor-pointer hidden md:table-cell" onClick={() => handleSort('unrealized_pnl')}>Unrealized P&L{getSortIndicator('unrealized_pnl')}</th>
            <th className="px-3 py-2 border-b-2 border-gray-800 bg-gray-800 whitespace-nowrap hidden lg:table-cell">Mark Price</th>
            <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap min-w-[120px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTrades.map((trade, idx) => (
            <tr key={trade.trade_id} className={idx % 2 === 0 ? 'bg-surface' : 'bg-surface-variant'}>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">{trade.trade_id}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">{trade.instrument_ticker}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface hidden sm:table-cell">{trade.asset_class}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface hidden md:table-cell">{trade.exchange || 'N/A'}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface hidden md:table-cell">{trade.trade_direction}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">{trade.status}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface">{trade.open_datetime ? new Date(trade.open_datetime).toLocaleString() : 'N/A'}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-center whitespace-nowrap text-on-surface hidden sm:table-cell">
                {trade.close_datetime ? new Date(trade.close_datetime).toLocaleString() : '-'}
              </td>
              <td className="px-3 py-2 border-b border-card-stroke text-center whitespace-nowrap text-on-surface hidden lg:table-cell">
                {trade.latest_trade ? new Date(trade.latest_trade).toLocaleString() : '-'}
              </td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface hidden md:table-cell">{trade.status === 'Open' ? trade.current_open_quantity?.toFixed(4) || 'N/A' : '-'}</td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface hidden md:table-cell">
                {trade.status === 'Open' && trade.unrealized_pnl !== null && trade.unrealized_pnl !== undefined
                  ? trade.unrealized_pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                  : '-'}
              </td>
              <td className="px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface hidden lg:table-cell">
                {trade.status === 'Open' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="unknown"
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