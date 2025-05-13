// File: zekenewsom-trade_journal/packages/react-app/src/views/EditTradeDetailsPage.tsx
// Modified for Stage 6: Add Emotion Tagging UI

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Trade, EditTradeDetailsFormData, EmotionRecord, TransactionRecord, UpdateTransactionPayload, EditTransactionFormData } from '../types';
import EditTransactionForm from '../components/transactions/EditTransactionForm';

interface EditTradeDetailsPageProps {
  tradeId: number;
  onEditComplete: () => void;
  onCancel: () => void;
  onLogTransaction: () => void;
}

const EditTradeDetailsPage: React.FC<EditTradeDetailsPageProps> = ({ tradeId, onEditComplete, onCancel, onLogTransaction }) => {
  const [trade, setTrade] = useState<Trade | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<EditTransactionFormData | null>(null);
  const [availableEmotions, setAvailableEmotions] = useState<EmotionRecord[]>([]);
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

  const fetchTradeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedTrade, emotions] = await Promise.all([
        window.electronAPI.getTradeWithTransactions(tradeId),
        window.electronAPI.getEmotions()
      ]);
      if (fetchedTrade) {
        setTrade(fetchedTrade);
      } else {
        setError(`Trade ID ${tradeId} not found.`);
      }
      setAvailableEmotions(emotions);
    } catch (err) {
      setError((err as Error).message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    fetchTradeData();
  }, [fetchTradeData]);

  // Set initial mark-to-market values when trade loads
  useEffect(() => {
    if (trade) {
      setMarkToMarket({
        mark_price: trade.current_market_price ?? undefined,
        unrealized_pnl: trade.unrealized_pnl ?? undefined,
        current_open_quantity: trade.current_open_quantity ?? undefined,
        average_open_price: trade.average_open_price ?? undefined
      });
      setMarkPriceInput(trade.current_market_price ? String(trade.current_market_price) : '');
    }
  }, [trade]);

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
        fetchTradeData(); // Refresh trade data
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
        fetchTradeData(); // Refresh trade data
      } else {
        alert(result.message || 'Failed to update transaction');
      }
    } catch (err) {
      console.error('Error updating transaction:', err);
      alert('Error updating transaction: ' + (err as Error).message);
    }
  };

  // Styles
  const pageStyle: React.CSSProperties = { padding: '20px', maxWidth: '900px', margin: 'auto', color: '#eee' };
  const fieldsetStyle: React.CSSProperties = { border: '1px solid #444', borderRadius: '8px', padding: '20px', marginBottom: '25px', backgroundColor: '#333940' };
  const legendStyle: React.CSSProperties = { padding: '0 10px', fontWeight: 'bold', color: '#61dafb', fontSize: '1.2em' };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '12px', textAlign: 'left' };
  const inputStyle: React.CSSProperties = { display: 'block', width: 'calc(100% - 16px)', padding: '8px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#2a2f36', color: 'white', marginTop: '4px' };
  const buttonStyle: React.CSSProperties = { padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em', marginRight: '10px' };

  if (isLoading) return <p>Loading trade details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!trade) return <p>Trade data not available or invalid ID.</p>;

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Trade Details</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
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
          <button onClick={onCancel} style={{ padding: '8px 16px' }}>Back to Trades List</button>
        </div>
      </div>

      {/* Mark-to-Market Section */}
      <fieldset style={{...fieldsetStyle, borderColor: '#f39c12'}}>
        <legend style={{...legendStyle, color: '#f39c12'}}>Mark-to-Market (Unrealized P&L)</legend>
        <div style={{marginBottom: '10px'}}>
          <strong>Current Mark Price:</strong> {markToMarket?.mark_price ?? trade.current_market_price ?? 'N/A'}<br/>
          <strong>Unrealized P&amp;L:</strong> {markToMarket?.unrealized_pnl ?? trade.unrealized_pnl ?? 'N/A'}<br/>
          <strong>Open Quantity:</strong> {markToMarket?.current_open_quantity ?? trade.current_open_quantity ?? 'N/A'}<br/>
          <strong>Average Open Price:</strong> {markToMarket?.average_open_price ?? trade.average_open_price ?? 'N/A'}<br/>
        </div>
        <label style={labelStyle}>Set New Mark Price:
          <input
            type="number"
            step="any"
            value={markPriceInput}
            onChange={e => setMarkPriceInput(e.target.value)}
            style={inputStyle}
          />
        </label>
        <button
          style={{...buttonStyle, marginLeft: '10px'}}
          onClick={async () => {
            if (!trade?.trade_id || !markPriceInput) return;
            try {
              const result = await window.electronAPI.updateMarkPrice({ tradeId: trade.trade_id, marketPrice: parseFloat(markPriceInput) });
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
      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Transactions</legend>
        {trade?.transactions && trade.transactions.length > 0 ? (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr>
                  <th style={{...tableHeaderStyle, width: '20%'}}>Date/Time</th>
                  <th style={{...tableHeaderStyle, width: '10%'}}>Action</th>
                  <th style={{...tableHeaderStyle, width: '15%'}}>Quantity</th>
                  <th style={{...tableHeaderStyle, width: '15%'}}>Price</th>
                  <th style={{...tableHeaderStyle, width: '10%'}}>Fees</th>
                  <th style={{...tableHeaderStyle, width: '20%'}}>Notes</th>
                  <th style={{...tableHeaderStyle, width: '10%'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trade.transactions.map((transaction) => (
                  <tr key={transaction.transaction_id}>
                    <td style={tableCellStyle}>{new Date(transaction.datetime).toLocaleString()}</td>
                    <td style={tableCellStyle}>{transaction.action}</td>
                    <td style={tableCellStyle}>{transaction.quantity}</td>
                    <td style={tableCellStyle}>{transaction.price}</td>
                    <td style={tableCellStyle}>{transaction.fees || 0}</td>
                    <td style={tableCellStyle}>{transaction.notes || ''}</td>
                    <td style={tableCellStyle}>
                      <button
                        onClick={() => handleEditTransactionClick(transaction)}
                        style={{ marginRight: '5px', padding: '3px 6px', fontSize: '0.9em' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.transaction_id!)}
                        style={{ padding: '3px 6px', backgroundColor: '#c00', color: 'white', fontSize: '0.9em' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} style={{...tableCellStyle, fontWeight: 'bold', backgroundColor: '#2a2f36'}}>Summary:</td>
                  <td style={{...tableCellStyle, fontWeight: 'bold', backgroundColor: '#2a2f36'}}>
                    {(() => {
                      const totalQuantity = trade.transactions.reduce((sum, tx) => {
                        return sum + (tx.action === 'Buy' ? tx.quantity : -tx.quantity);
                      }, 0);
                      return totalQuantity.toFixed(4);
                    })()}
                  </td>
                  <td style={{...tableCellStyle, fontWeight: 'bold', backgroundColor: '#2a2f36'}}>
                    {(() => {
                      const buyTransactions = trade.transactions.filter(tx => tx.action === 'Buy');
                      const weightedSum = buyTransactions.reduce((sum, tx) => {
                        return sum + (tx.price * tx.quantity);
                      }, 0);
                      const totalBuyQuantity = buyTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
                      return totalBuyQuantity > 0 ? (weightedSum / totalBuyQuantity).toFixed(4) : '0.0000';
                    })()}
                  </td>
                  <td style={{...tableCellStyle, fontWeight: 'bold', backgroundColor: '#2a2f36'}}>
                    {trade.transactions.reduce((sum, tx) => sum + (tx.fees || 0), 0).toFixed(4)}
                  </td>
                  <td colSpan={2} style={{...tableCellStyle, backgroundColor: '#2a2f36'}}></td>
                </tr>
              </tfoot>
            </table>
          </>
        ) : (
          <p style={{ color: '#999', marginTop: '10px' }}>No transactions recorded for this trade.</p>
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