// File: zekenewsom-trade_journal/packages/react-app/src/views/TradesListPage.tsx
// Modified for Stage 6: Add onMarkPriceUpdate callback to TradesTable

import React, { useState, useMemo } from 'react';
import TradesTable from '../components/trades/TradesTable';
import { useAppStore } from '../stores/appStore';

interface TradesListPageProps {
  onEditTrade: (tradeId: number) => void;
  onLogTransaction: () => void;
}

const TradesListPage: React.FC<TradesListPageProps> = ({ onEditTrade, onLogTransaction }) => {
  const { trades, refreshTrades, isLoadingTrades, errorLoadingTrades, deleteFullTradeInStore } = useAppStore();
  const [filterText, setFilterText] = useState('');

  const handleDeleteFullTrade = async (tradeId: number) => {
    if (window.confirm(`Are you sure you want to delete the ENTIRE trade ID ${tradeId} and all its transactions? This action cannot be undone.`)) {
      try {
        const result = await deleteFullTradeInStore(tradeId);
        if (result.success) {
          alert(result.message);
        } else {
          alert(result.message);
        }
      } catch (err) { alert(`Failed to delete trade: ${(err as Error).message}`); }
    }
  };

  if (isLoadingTrades) {
    return <p>Loading trades...</p>;
  }
  if (errorLoadingTrades) {
    return <p style={{ color: 'red' }}>Error loading trades: {errorLoadingTrades}</p>;
  }

  const filteredTrades = useMemo(() => {
    if (!filterText.trim()) return trades;
    const searchTerm = filterText.toLowerCase().trim();
    return trades.filter(trade => 
      trade.instrument_ticker.toLowerCase().includes(searchTerm) ||
      (trade.asset_class && trade.asset_class.toLowerCase().includes(searchTerm)) ||
      (trade.exchange && trade.exchange.toLowerCase().includes(searchTerm))
    );
  }, [trades, filterText]);

  if (isLoadingTrades) return <p>Loading trades...</p>;
  if (errorLoadingTrades) return <p style={{ color: 'red' }}>Error loading trades: {errorLoadingTrades}</p>;

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