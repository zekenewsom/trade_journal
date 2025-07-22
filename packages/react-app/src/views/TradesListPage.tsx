// File: zekenewsom-trade_journal/packages/react-app/src/views/TradesListPage.tsx
// Modified for Stage 6: Add onMarkPriceUpdate callback to TradesTable

import React, { useState, useMemo, useEffect } from 'react';
import TradesTable from '../components/trades/TradesTable';
import TransactionsTable from '../components/transactions/TransactionsTable';
import { useAppStore } from '../stores/appStore';
import { TransactionRecord, Trade } from '../types';

interface TradesListPageProps {
  onEditTrade: (tradeId: number) => void;
  onLogTransaction: () => void;
}

const TradesListPage: React.FC<TradesListPageProps> = ({ onEditTrade, onLogTransaction }) => {
  const { trades, isLoadingTrades, errorLoadingTrades, deleteFullTradeInStore, refreshTrades } = useAppStore();
  const [filterText, setFilterText] = useState('');
  const [allTransactions, setAllTransactions] = useState<TransactionRecord[]>([]);

  const handleDeleteTransaction = async (transactionId: number) => {
    if (window.confirm(`Are you sure you want to delete transaction ID ${transactionId}? This action cannot be undone.`)) {
      try {
        const result = await window.electronAPI.deleteSingleTransaction(transactionId);
        if (result && result.success) {
          if (typeof refreshTrades === 'function') {
            await refreshTrades();
          }
        } else {
          alert(result?.message || 'Failed to delete transaction.');
        }
      } catch {
        alert('Failed to delete transaction.');
      }
    }
  };

  // Debug: log trades
  useEffect(() => {
    console.log('[TradesListPage DEBUG] trades:', trades);
  }, [trades]);

  // Fetch all transactions for all trades
  useEffect(() => {
    async function fetchAllTransactions() {
      if (!Array.isArray(trades) || trades.length === 0) {
        setAllTransactions([]);
        return;
      }
      try {
        // Fetch each trade in full (with transactions)
        const results = await Promise.all(
          trades.map(async (trade: Trade) => {
            if (!trade.trade_id) return [];
            try {
              const fullTrade = await window.electronAPI.getTradeWithTransactions(trade.trade_id);
              // Inject ticker and exchange from parent trade into each transaction
              if (!Array.isArray(fullTrade?.transactions)) return [];
              // Debug: log trade object and ticker
              console.log('[DEBUG] trade object for transaction mapping:', trade);
              return fullTrade.transactions.map((tx: TransactionRecord) => ({
                ...tx,
                ticker: trade.instrument_ticker, // Use correct field
                exchange: trade.exchange === null ? undefined : trade.exchange,
              }));
            } catch (err) {
              console.error('Failed to fetch full trade', trade.trade_id, err);
              return [];
            }
          })
        );
        // Flatten
        setAllTransactions(results.flat());
      } catch (err) {
        console.error('Error fetching all transactions:', err);
        setAllTransactions([]);
      }
    }
    fetchAllTransactions();
  }, [trades]);

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
    <div className="p-4 bg-surface rounded-2xl shadow-elevation-1 border border-card-stroke">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-on-surface">All Trades (Positions)</h2>
        <button 
          onClick={onLogTransaction}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold shadow-elevation-1 hover:bg-primary/90 transition-colors"
        >
          Log Transaction
        </button>
      </div>
      <input
        type="text"
        placeholder="Filter trades..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="mb-4 px-3 py-2 w-full max-w-md bg-surface-variant border border-card-stroke rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {(() => { console.log('[TradesListPage] filteredTrades:', filteredTrades); return null; })()}
      {filteredTrades.length > 0 ? (
        <TradesTable
          trades={filteredTrades}
          onEdit={onEditTrade}
          onDelete={handleDeleteFullTrade}
        />
      ) : (
        <p>No trades match your filter, or no trades have been logged yet.</p>
      )}
      {/* Transactions Table: show all fetched transactions */}
      <TransactionsTable
        transactions={allTransactions}
        onEditTrade={onEditTrade}
        onDeleteTransaction={handleDeleteTransaction}
      />
    </div>
  );
};

export default TradesListPage;