// File: zekenewsom-trade_journal/packages/react-app/src/views/TradesListPage.tsx
// New file for Stage 3

import React, { useState, useEffect, useMemo } from 'react';
import TradesTable from '../components/trades/TradesTable';
import type { Trade, TradeTableDisplay } from '../types/index.ts'; // Using Trade for fetched data

interface TradesListPageProps {
  onEditTrade: (tradeId: number) => void;
}

const TradesListPage: React.FC<TradesListPageProps> = ({ onEditTrade }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  const fetchTrades = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (window.electronAPI && window.electronAPI.getTrades) {
        const fetchedTrades = await window.electronAPI.getTrades();
        // console.log("Fetched trades:", fetchedTrades); // Debug log
        setTrades(fetchedTrades || []);
      } else {
        throw new Error("getTrades API not available.");
      }
    } catch (err) {
      console.error("Error fetching trades:", err);
      setError((err as Error).message);
      setTrades([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleDeleteTrade = async (tradeId: number) => {
    if (window.confirm(`Are you sure you want to delete trade ID ${tradeId}? This action cannot be undone.`)) {
      try {
        if (window.electronAPI && window.electronAPI.deleteTrade) {
          const result = await window.electronAPI.deleteTrade(tradeId);
          if (result.success) {
            alert(result.message);
            fetchTrades(); // Refresh list
          } else {
            alert(`Error deleting trade: ${result.message}`);
          }
        } else {
          throw new Error("deleteTrade API not available.");
        }
      } catch (err) {
        alert(`Failed to delete trade: ${(err as Error).message}`);
      }
    }
  };

  // Basic client-side filtering
  const filteredTrades = useMemo(() => {
    if (!filterText) return trades;
    const lowerFilterText = filterText.toLowerCase();
    return trades.filter(trade =>
      trade.instrument_ticker.toLowerCase().includes(lowerFilterText) ||
      trade.asset_class.toLowerCase().includes(lowerFilterText) ||
      trade.trade_direction.toLowerCase().includes(lowerFilterText) ||
      (trade.trade_id && trade.trade_id.toString().includes(lowerFilterText))
    );
  }, [trades, filterText]);

  // Transform trades for display, e.g., getting first entry leg details
   const tradesForDisplay: TradeTableDisplay[] = useMemo(() => {
    return filteredTrades.map(trade => {
      const firstEntryLeg = trade.legs?.find(leg => leg.leg_type === 'Entry');
      return {
        ...trade,
        trade_id: trade.trade_id, // Ensure trade_id is present
        first_entry_datetime: firstEntryLeg?.datetime,
        // Add more transformations as needed for table display (e.g., avg price, total size)
        // These will be more accurate once full analytics are in place
      };
    });
  }, [filteredTrades]);


  if (isLoading) return <p>Loading trades...</p>;
  if (error) return <p style={{ color: 'red' }}>Error loading trades: {error}</p>;

  return (
    <div>
      <h2>All Trades</h2>
      <input
        type="text"
        placeholder="Filter trades..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        style={{ marginBottom: '15px', padding: '8px', width: '300px' }}
      />
      <TradesTable
        trades={tradesForDisplay}
        onEdit={onEditTrade}
        onDelete={handleDeleteTrade}
      />
    </div>
  );
};

export default TradesListPage;