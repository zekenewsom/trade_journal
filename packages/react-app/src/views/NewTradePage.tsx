// File: zekenewsom-trade_journal/packages/react-app/src/views/NewTradePage.tsx
// Modified to handle both adding new trades and editing existing trades

import React, { useEffect, useState } from 'react';
import TradeEntryForm from '../components/trades/TradeEntryForm';
import type { Trade } from '../types/index.ts';

interface NewTradePageProps {
  tradeId: number | null; // If null, it's a new trade; otherwise, it's an edit
  onFormSubmitOrCancel: () => void;
}

const NewTradePage: React.FC<NewTradePageProps> = ({ tradeId, onFormSubmitOrCancel }) => {
  const [initialTradeData, setInitialTradeData] = useState<Trade | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tradeId) {
      setIsLoading(true);
      setError(null);
      const fetchTrade = async () => {
        try {
          if (window.electronAPI && window.electronAPI.getTradeById) {
            const trade = await window.electronAPI.getTradeById(tradeId);
            if (trade) {
              setInitialTradeData(trade);
            } else {
              setError(`Trade with ID ${tradeId} not found.`);
            }
          } else {
            throw new Error("getTradeById API not available.");
          }
        } catch (err) {
          console.error("Error fetching trade for edit:", err);
          setError((err as Error).message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTrade();
    } else {
      setInitialTradeData(null); // Reset for new trade form
    }
  }, [tradeId]);

  if (tradeId && isLoading) return <p>Loading trade details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>{tradeId ? 'Edit Trade' : 'Record New Trade'}</h2>
      <TradeEntryForm
        existingTrade={initialTradeData}
        onSaveSuccess={onFormSubmitOrCancel} // Go back to list on success
      />
      <button onClick={onFormSubmitOrCancel} style={{ marginTop: '20px' }}>
        Cancel
      </button>
    </div>
  );
};

export default NewTradePage;