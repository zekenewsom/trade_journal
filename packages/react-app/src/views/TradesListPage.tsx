// File: zekenewsom-trade_journal/packages/react-app/src/views/TradesListPage.tsx
// Modified for Stage 6: Add onMarkPriceUpdate callback to TradesTable

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import TradesTable from '../components/trades/TradesTable';
import type { TradeListView } from '../types/index.ts';

interface TradesListPageProps {
  onEditTrade: (tradeId: number) => void;
  onLogTransaction: () => void;
}

const TradesListPage: React.FC<TradesListPageProps> = ({ onEditTrade, onLogTransaction }) => {
  const [trades, setTrades] = useState<TradeListView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // To trigger re-fetch

  const fetchTradesList = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      if (window.electronAPI?.getTrades) {
        const fetchedTrades = await window.electronAPI.getTrades();
        // Here, we'd ideally get unrealized P&L from backend if calculated there.
        // For now, it will be null until mark price is set and analytics re-run.
        console.log('Fetched trades:', fetchedTrades);
        setTrades(fetchedTrades || []);
      } else { throw new Error("getTrades API not available."); }
    } catch (err) { 
      console.error("Error fetching trades list:", err);
      setError((err as Error).message); setTrades([]); 
    }
    finally { setIsLoading(false); }
  }, []); // No dependency on refreshKey here, manual trigger below

  useEffect(() => {
    fetchTradesList();
  }, [fetchTradesList, refreshKey]); // Re-fetch when refreshKey changes

  const handleMarkPriceUpdated = () => {
    setRefreshKey(prev => prev + 1); // Trigger re-fetch of trades
  };

  const handleDeleteFullTrade = async (tradeId: number) => {
    // ... (same as your Stage 5)
    if (window.confirm(`Are you sure you want to delete the ENTIRE trade ID ${tradeId} and all its transactions? This action cannot be undone.`)) {
      try {
        if (window.electronAPI?.deleteFullTrade) {
          const result = await window.electronAPI.deleteFullTrade(tradeId);
          if (result.success) { alert(result.message); fetchTradesList(); }
          else { alert(`Error deleting trade: ${result.message}`); }
        } else { throw new Error("deleteFullTrade API not available."); }
      } catch (err) { alert(`Failed to delete trade: ${(err as Error).message}`); }
    }
  };

  // ... (filteredTrades memo - same as your Stage 5)
  const filteredTrades = useMemo(() => {
    if (!filterText.trim()) return trades;
    const searchTerm = filterText.toLowerCase().trim();
    return trades.filter(trade => 
      trade.instrument_ticker.toLowerCase().includes(searchTerm) ||
      (trade.asset_class && trade.asset_class.toLowerCase().includes(searchTerm)) ||
      (trade.exchange && trade.exchange.toLowerCase().includes(searchTerm))
    );
  }, [trades, filterText]);


  if (isLoading) return <p>Loading trades...</p>;
  if (error) return <p style={{ color: 'red' }}>Error loading trades: {error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2>All Trades (Positions)</h2>
        <button 
          onClick={onLogTransaction}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Log Transaction
        </button>
      </div>
      <input
        type="text"
        placeholder="Filter trades..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        style={{ marginBottom: '15px', padding: '8px', width: 'calc(100% - 20px)', maxWidth: '400px' }}
      />
      <button onClick={() => setRefreshKey(prev => prev + 1)} style={{marginBottom: '15px', marginLeft: '10px', padding: '8px'}}>Refresh List</button>
      {filteredTrades.length > 0 ? (
        <TradesTable
          trades={filteredTrades}
          onEdit={onEditTrade}
          onDelete={handleDeleteFullTrade}
          onMarkPriceUpdate={handleMarkPriceUpdated}
        />
      ) : (
        <p>No trades match your filter, or no trades have been logged yet.</p>
      )}
    </div>
  );
};

export default TradesListPage;