// File: zekenewsom-trade_journal/packages/react-app/src/views/EditTradeDetailsPage.tsx
// Modified for Stage 6: Add Emotion Tagging UI

import React, { useState, useEffect } from 'react';
import type { EditTradeDetailsFormData, TransactionRecord, UpdateTransactionPayload, EditTransactionFormData, Trade } from '../types';
import EditTransactionForm from '../components/transactions/EditTransactionForm';
import { useAppStore } from '../stores/appStore';

interface EditTradeDetailsPageProps {
  tradeId: number;
  onEditComplete: () => void;
  onCancel: () => void;
  onLogTransaction: () => void;
}

const EditTradeDetailsPage: React.FC<EditTradeDetailsPageProps> = ({ tradeId, onEditComplete, onCancel, onLogTransaction }) => {
  const { availableEmotions, isLoadingInitialData, errorLoadingInitialData, refreshTrades } = useAppStore();
  const [editingTransaction, setEditingTransaction] = useState<EditTransactionFormData | null>(null);
  const [fullTrade, setFullTrade] = useState<Trade | null>(null);
  // Mark-to-market state
  const [markToMarket, setMarkToMarket] = useState<{
    mark_price?: number,
    unrealized_pnl?: number,
    current_open_quantity?: number,
    average_open_price?: number
  } | null>(null);
  const [markPriceInput, setMarkPriceInput] = useState<string>('');

  // Add style definitions
  const tableHeaderStyle: React.CSSProperties = {
    padding: '8px',
    textAlign: 'left',
    borderBottom: '1px solid #444',
    backgroundColor: '#2a2f36',
    color: '#fff'
  };

  const tableCellStyle: React.CSSProperties = {
    padding: '8px',
    borderBottom: '1px solid #333',
    color: '#fff'
  };

  

    // Fetch full trade details (with transactions) on mount or when tradeId changes
  useEffect(() => {
    (async () => {
      const trade = await window.electronAPI.getTradeWithTransactions(tradeId);
      setFullTrade(trade);
      if (trade) {
        setMarkToMarket({
          mark_price: trade.current_market_price ?? undefined,
          unrealized_pnl: trade.unrealized_pnl ?? undefined,
          current_open_quantity: trade.current_open_quantity ?? undefined,
          average_open_price: trade.average_open_price ?? undefined
        });
        setMarkPriceInput(trade.current_market_price ? String(trade.current_market_price) : '');
      }
    })();
  }, [tradeId]);

  const handleEditTransactionClick = (transaction: TransactionRecord) => {
    // Convert TransactionRecord to EditTransactionFormData
    const formData = {
      transaction_id: transaction.transaction_id!,
      trade_id: transaction.trade_id,
      action: transaction.action,
      quantity: String(transaction.quantity),
      price: String(transaction.price),
      datetime: new Date(transaction.datetime).toISOString().slice(0, 16), // Format for datetime-local input
      fees: String(transaction.fees || '0'),
      notes: transaction.notes || '',
      strategy_id: transaction.strategy_id ? String(transaction.strategy_id) : undefined,
      market_conditions: transaction.market_conditions || undefined,
      setup_description: transaction.setup_description || undefined,
      reasoning: transaction.reasoning || undefined,
      lessons_learned: transaction.lessons_learned || undefined,
      r_multiple_initial_risk: transaction.r_multiple_initial_risk ? String(transaction.r_multiple_initial_risk) : undefined,
      emotion_ids: transaction.emotion_ids || []
    };
    setEditingTransaction(formData);
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    try {
      const result = await window.electronAPI.deleteSingleTransaction(transactionId);
      if (result.success) {
        const trade = await window.electronAPI.getTradeWithTransactions(tradeId);
        setFullTrade(trade);
        // Trades list will refresh automatically via Zustand store
      } else {
        alert(result.message || 'Failed to delete transaction');
      }
    } catch (err) {
      alert('Error deleting transaction: ' + (err as Error).message);
    }
  };

  const handleSaveEditedTransaction = async (data: EditTransactionFormData) => {
    try {
      // Convert EditTransactionFormData to UpdateTransactionPayload
      const payload: UpdateTransactionPayload = {
        transaction_id: data.transaction_id,
        quantity: parseFloat(data.quantity),
        price: parseFloat(data.price),
        datetime: data.datetime,
        fees: parseFloat(data.fees),
        notes: data.notes || null,
        strategy_id: data.strategy_id ? parseInt(data.strategy_id) : undefined,
        market_conditions: data.market_conditions,
        setup_description: data.setup_description,
        reasoning: data.reasoning,
        lessons_learned: data.lessons_learned,
        r_multiple_initial_risk: data.r_multiple_initial_risk ? parseFloat(data.r_multiple_initial_risk) : undefined,
        emotion_ids: data.emotion_ids || []
      };

      const result = await window.electronAPI.updateSingleTransaction(payload);
      if (result.success) {
        setEditingTransaction(null);
        // Trades list will refresh automatically via Zustand store
        const trade = await window.electronAPI.getTradeWithTransactions(tradeId);
        setFullTrade(trade);
      } else {
        alert(result.message || 'Failed to update transaction');
      }
    } catch (err) {
      console.error('Error updating transaction:', err);
      alert('Error updating transaction: ' + (err as Error).message);
    }
  };

  // Styles removed: now using Tailwind CSS classes

  if (isLoadingInitialData) return <p className="text-gray-300">Loading trade details...</p>;
  if (errorLoadingInitialData) return <p className="text-red-500">{errorLoadingInitialData}</p>;
  if (!fullTrade) return <p className="text-gray-400">Trade data not available or invalid ID.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Trade Details</h2>
        <div className="flex gap-3">
          <button
            onClick={onLogTransaction}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Log Transaction
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Back to Trades List
          </button>
        </div>
        <span className="text-gray-400">Trade ID: {fullTrade.trade_id}</span>
      </div>
      <div className="mb-4">
        <span className="text-lg font-semibold mr-4">{fullTrade.instrument_ticker}</span>
        <span className="mr-4">{fullTrade.asset_class}</span>
        <span className="mr-4">{fullTrade.exchange}</span>
        <span className="mr-4">{fullTrade.trade_direction}</span>
        <span className="mr-4">Status: {fullTrade.status}</span>
        <span>Opened: {fullTrade.open_datetime ? new Date(fullTrade.open_datetime).toLocaleString() : 'N/A'}</span>
      </div>
      <div className="mb-6">
        <span className="mr-4">Avg Open Price: {fullTrade.average_open_price !== null && fullTrade.average_open_price !== undefined ? fullTrade.average_open_price.toFixed(4) : 'N/A'}</span>
        <span className="mr-4">Open Qty: {fullTrade.current_open_quantity !== null && fullTrade.current_open_quantity !== undefined ? fullTrade.current_open_quantity.toFixed(4) : 'N/A'}</span>
        <span className="mr-4">Unrealized P&L: {fullTrade.unrealized_pnl !== null && fullTrade.unrealized_pnl !== undefined ? fullTrade.unrealized_pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'}</span>
        <span className="mr-4">Mark Price: {fullTrade.current_market_price !== null && fullTrade.current_market_price !== undefined ? fullTrade.current_market_price.toFixed(4) : 'N/A'}</span>
        <span>Realized P&L: {fullTrade.realized_pnl_for_trade !== null && fullTrade.realized_pnl_for_trade !== undefined ? fullTrade.realized_pnl_for_trade.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'}</span>
      </div>
      {/* Mark-to-Market Section */}
      <fieldset className="border border-yellow-500 rounded-lg p-5 mb-6 bg-gray-800">
        <legend className="px-2 font-bold text-yellow-400 text-lg">Mark-to-Market (Unrealized P&L)</legend>
        <div className="mb-3">
          <strong>Current Mark Price:</strong> {markToMarket?.mark_price ?? fullTrade.current_market_price ?? 'N/A'}<br/>
          <strong>Unrealized P&amp;L:</strong> {markToMarket?.unrealized_pnl ?? fullTrade.unrealized_pnl ?? 'N/A'}<br/>
          <strong>Open Quantity:</strong> {markToMarket?.current_open_quantity ?? fullTrade.current_open_quantity ?? 'N/A'}<br/>
          <strong>Average Open Price:</strong> {markToMarket?.average_open_price ?? fullTrade.average_open_price ?? 'N/A'}<br/>
        </div>
        <label className="block mb-2 text-left font-medium">Set New Mark Price:
          <input
            type="number"
            step="any"
            value={markPriceInput}
            onChange={e => setMarkPriceInput(e.target.value)}
            className="block w-48 px-3 py-2 mt-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <button
          className="ml-3 px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded hover:bg-yellow-600 transition-colors"
          onClick={async () => {
            if (!fullTrade?.trade_id || !markPriceInput) return;
            try {
              const result = await window.electronAPI.updateMarkPrice({ tradeId: fullTrade.trade_id, marketPrice: parseFloat(markPriceInput) });
              if (result.success) {
                setMarkToMarket({
                  mark_price: parseFloat(markPriceInput),
                  unrealized_pnl: result.unrealized_pnl,
                  current_open_quantity: result.current_open_quantity,
                  average_open_price: result.average_open_price
                });
              } else {
                alert(result.message || 'Failed to update mark price.');
              }
            } catch (err) {
              alert('Error updating mark price: ' + (err as Error).message);
            }
          }}
        >Update Mark Price</button>
      </fieldset>

      {/* Transactions Section */}
      <fieldset className="border border-gray-700 rounded-lg p-5 mb-6 bg-gray-800">
        <legend className="px-2 font-bold text-blue-400 text-lg">Transactions</legend>
        {fullTrade?.transactions && fullTrade.transactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse mt-2 text-white text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-900 w-1/5">Date/Time</th>
                    <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-900 w-1/12">Action</th>
                    <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-900 w-2/12">Quantity</th>
                    <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-900 w-2/12">Price</th>
                    <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-900 w-1/12">Fees</th>
                    <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-900 w-2/12">Notes</th>
                    <th className="px-3 py-2 border-b-2 border-gray-700 bg-gray-900 w-1/12">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fullTrade.transactions.map((transaction: TransactionRecord, idx: number) => (
                    <tr key={transaction.transaction_id} className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}>
                      <td className="px-3 py-2 border-b border-gray-700 text-left align-top">{new Date(transaction.datetime).toLocaleString()}</td>
                      <td className="px-3 py-2 border-b border-gray-700 text-left align-top">{transaction.action}</td>
                      <td className="px-3 py-2 border-b border-gray-700 text-left align-top">{transaction.quantity}</td>
                      <td className="px-3 py-2 border-b border-gray-700 text-left align-top">{transaction.price}</td>
                      <td className="px-3 py-2 border-b border-gray-700 text-left align-top">{transaction.fees || 0}</td>
                      <td className="px-3 py-2 border-b border-gray-700 text-left align-top">{transaction.notes || ''}</td>
                      <td className="px-3 py-2 border-b border-gray-700 text-left align-top">
                        <button
                          onClick={() => handleEditTransactionClick(transaction)}
                          className="mr-2 px-3 py-1 bg-gray-700 text-white rounded hover:bg-blue-600 text-xs font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.transaction_id!)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className="font-bold bg-gray-900">Summary:</td>
                    <td className="font-bold bg-gray-900">
                      {(() => {
                        const totalQuantity = fullTrade.transactions.reduce((sum: number, tx: TransactionRecord) => {
                          return sum + (tx.action === 'Buy' ? tx.quantity : -tx.quantity);
                        }, 0);
                        return totalQuantity.toFixed(4);
                      })()}
                    </td>
                    <td className="font-bold bg-gray-900">
                      {(() => {
                        const buyTransactions = fullTrade.transactions.filter((tx: TransactionRecord) => tx.action === 'Buy');
                        const totalBuyQty = buyTransactions.reduce((sum: number, tx: TransactionRecord) => sum + tx.quantity, 0);
                        const weightedSum = buyTransactions.reduce((sum: number, tx: TransactionRecord) => sum + (tx.price * tx.quantity), 0);
                        const totalQty = fullTrade.transactions.reduce((sum: number, tx: TransactionRecord) => sum + tx.quantity, 0);
                        return totalBuyQty > 0 ? (weightedSum / totalBuyQty).toFixed(4) : '0.0000';
                      })()}
                    </td>
                    <td className="font-bold bg-gray-900">
                      {fullTrade.transactions.reduce((sum: number, tx: TransactionRecord) => sum + (tx.fees || 0), 0).toFixed(4)}
                    </td>
                    <td colSpan={2} className="bg-gray-900"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        ) : (
          <p className="text-gray-400 mt-3">No transactions recorded for this trade.</p>
        )}
      </fieldset>

      {editingTransaction && (
        <EditTransactionForm
          transaction={editingTransaction}
          onSave={handleSaveEditedTransaction}
          onCancel={() => setEditingTransaction(null)}
          availableEmotions={availableEmotions}
        />
      )}
    </div>
  );
};

export default EditTradeDetailsPage;