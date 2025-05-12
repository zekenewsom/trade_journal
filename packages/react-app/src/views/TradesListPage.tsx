// File: zekenewsom-trade_journal/packages/react-app/src/views/TradesListPage.tsx
// Modified for Stage 5 to use TradeListView and handle full trade deletion

import React, { useState, useEffect, useMemo } from 'react';
import TradesTable from '../components/trades/TradesTable';
import type { TradeListView } from '../types/index.ts';

interface TradesListPageProps {
  onEditTrade: (tradeId: number) => void; // Navigates to EditTradeDetailsPage
}

const TradesListPage: React.FC<TradesListPageProps> = ({ onEditTrade }) => {
  const [trades, setTrades] = useState<TradeListView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  const fetchTradesList = async () => {
    setIsLoading(true); setError(null);
    try {
      if (window.electronAPI?.getTrades) {
        const fetchedTrades = await window.electronAPI.getTrades();
        setTrades(fetchedTrades || []);
      } else { throw new Error("getTrades API not available."); }
    } catch (err) { 
      console.error("Error fetching trades list:", err);
      setError((err as Error).message); setTrades([]); 
    }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchTradesList();
  }, []);

  const handleDeleteFullTrade = async (tradeId: number) => {
    if (window.confirm(`Are you sure you want to delete the ENTIRE trade ID ${tradeId} and all its transactions? This action cannot be undone.`)) {
      try {
        if (window.electronAPI?.deleteFullTrade) {
          const result = await window.electronAPI.deleteFullTrade(tradeId);
          if (result.success) { 
            alert(result.message); 
            fetchTradesList(); // Refresh the list
          }
          else { alert(`Error deleting trade: ${result.message}`); }
        } else { throw new Error("deleteFullTrade API not available."); }
      } catch (err) { alert(`Failed to delete trade: ${(err as Error).message}`); }
    }
  };

  const filteredTrades = useMemo(() => {
    if (!filterText) return trades;
    const lowerFilterText = filterText.toLowerCase();
    return trades.filter(trade =>
      Object.values(trade).some(val => 
        String(val).toLowerCase().includes(lowerFilterText)
      )
    );
  }, [trades, filterText]);

  if (isLoading) return <p>Loading trades...</p>;
  if (error) return <p style={{ color: 'red' }}>Error loading trades: {error}</p>;

  return (
    <div>
      <h2>All Trades (Positions)</h2>
      <input
        type="text"
        placeholder="Filter trades..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        style={{ marginBottom: '15px', padding: '8px', width: 'calc(100% - 20px)', maxWidth: '400px' }}
      />
      {filteredTrades.length > 0 ? (
        <TradesTable
          trades={filteredTrades}
          onEdit={onEditTrade}
          onDelete={handleDeleteFullTrade}
        />
      ) : (
        <p>No trades match your filter, or no trades have been logged yet.</p>
      )}
    </div>
  );
};

export default TradesListPage;