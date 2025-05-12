// File: zekenewsom-trade_journal/packages/react-app/src/views/EditTradeDetailsPage.tsx
// Modified for Stage 6: Add Emotion Tagging UI

import React, { useState, useEffect, useCallback } from 'react';
import type { Trade, EditTradeDetailsFormData, UpdateTradeDetailsPayload, EmotionRecord, TransactionRecord } from '../types';
import EditTransactionForm from '../components/transactions/EditTransactionForm';

interface EditTradeDetailsPageProps {
  tradeId: number;
  onEditComplete: () => void;
  onCancel: () => void;
}

const EditTradeDetailsPage: React.FC<EditTradeDetailsPageProps> = ({ tradeId, onCancel }) => {
  const [trade, setTrade] = useState<Trade | null>(null);
  const [tradeDetailsForm, setTradeDetailsForm] = useState<Partial<EditTradeDetailsFormData>>({ emotion_ids: [] });
  const [availableEmotions, setAvailableEmotions] = useState<EmotionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<TransactionRecord | null>(null);
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
    setIsLoading(true); setError(null);
    try {
      if (!window.electronAPI?.getTradeWithTransactions || !window.electronAPI?.getEmotions || !window.electronAPI?.getTradeEmotions) {
        throw new Error("Required API functions not available.");
      }
      
      const [fetchedTrade, fetchedEmotions, linkedEmotionIds] = await Promise.all([
        window.electronAPI.getTradeWithTransactions(tradeId),
        window.electronAPI.getEmotions(),
        window.electronAPI.getTradeEmotions(tradeId)
      ]);

      setAvailableEmotions(fetchedEmotions || []);

      if (fetchedTrade) {
        setTrade(fetchedTrade);
        setTradeDetailsForm({
          trade_id: fetchedTrade.trade_id,
          instrument_ticker: fetchedTrade.instrument_ticker,
          asset_class: fetchedTrade.asset_class,
          exchange: fetchedTrade.exchange,
          trade_direction: fetchedTrade.trade_direction,
          status: fetchedTrade.status,
          open_datetime: fetchedTrade.open_datetime,
          close_datetime: fetchedTrade.close_datetime,
          fees_total: fetchedTrade.fees_total,
          strategy_id: (fetchedTrade.strategy_id || '').toString(),
          market_conditions: fetchedTrade.market_conditions || '',
          setup_description: fetchedTrade.setup_description || '',
          reasoning: fetchedTrade.reasoning || '',
          lessons_learned: fetchedTrade.lessons_learned || '',
          r_multiple_initial_risk: (fetchedTrade.r_multiple_initial_risk || '').toString(),
          emotion_ids: linkedEmotionIds || [] // Initialize with fetched emotion IDs
        });
      } else { setError(`Trade ID ${tradeId} not found.`); }
    } catch (err) { setError((err as Error).message); console.error(err); }
    finally { setIsLoading(false); }
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

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTradeDetailsForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEmotionChange = (emotionId: number) => {
    setTradeDetailsForm((prev: any) => {
        const currentEmotionIds = prev.emotion_ids || [];
        const newEmotionIds = currentEmotionIds.includes(emotionId)
            ? currentEmotionIds.filter((id: number) => id !== emotionId)
            : [...currentEmotionIds, emotionId];
        return { ...prev, emotion_ids: newEmotionIds };
    });
  };

  const handleSaveTradeDetailsAndEmotions = async () => {
    if (!tradeDetailsForm.trade_id) return;
    const metadataPayload: UpdateTradeDetailsPayload = {
        trade_id: tradeDetailsForm.trade_id,
        strategy_id: tradeDetailsForm.strategy_id ? Number(tradeDetailsForm.strategy_id) : null,
        market_conditions: tradeDetailsForm.market_conditions || null,
        setup_description: tradeDetailsForm.setup_description || null,
        reasoning: tradeDetailsForm.reasoning || null,
        lessons_learned: tradeDetailsForm.lessons_learned || null,
        r_multiple_initial_risk: tradeDetailsForm.r_multiple_initial_risk ? parseFloat(tradeDetailsForm.r_multiple_initial_risk) : null,
    };
    // Save emotions separately or as part of a combined payload if backend supports it
    const emotionsPayload = {
        tradeId: tradeDetailsForm.trade_id,
        emotionIds: tradeDetailsForm.emotion_ids || []
    };

    try {
        const [detailsResult, emotionsResult] = await Promise.all([
            window.electronAPI.updateTradeDetails(metadataPayload),
            window.electronAPI.saveTradeEmotions(emotionsPayload)
        ]);

        if (detailsResult.success && emotionsResult.success) {
             alert('Trade details and emotions updated!');
             fetchTradeData(); // Refresh
        } else {
           const detailsMsg = detailsResult.success ? '' : detailsResult.message || 'Failed to update trade details.';
           const emotionsMsg = emotionsResult.success ? '' : emotionsResult.message || 'Failed to update emotions.';
           const errorMsg = [detailsMsg, emotionsMsg].filter(Boolean).join(' ');
           alert(`Error: ${errorMsg || 'Unknown error.'}`);
        }  
    } catch (err) { alert(`Failed to update: ${(err as Error).message}`);}
  };

  const handleEditTransactionClick = (transaction: TransactionRecord) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    if (!window.electronAPI?.deleteSingleTransaction) {
      alert('Delete transaction API not available');
      return;
    }
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

  const handleSaveEditedTransaction = async (data: any) => {
    if (!window.electronAPI?.updateSingleTransaction) {
      alert('Update transaction API not available');
      return;
    }
    try {
      const result = await window.electronAPI.updateSingleTransaction({
        transaction_id: data.transaction_id,
        quantity: data.quantity,
        price: data.price,
        datetime: data.datetime,
        fees: data.fees || 0,
        notes: data.notes || null
      });
      
      if (!result) {
        throw new Error('No response received from update transaction API');
      }
      
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

  // Styles (same as before)
  const pageStyle: React.CSSProperties = { padding: '20px', maxWidth: '900px', margin: 'auto', color: '#eee' };
  const fieldsetStyle: React.CSSProperties = { border: '1px solid #444', borderRadius: '8px', padding: '20px', marginBottom: '25px', backgroundColor: '#333940' };
  const legendStyle: React.CSSProperties = { padding: '0 10px', fontWeight: 'bold', color: '#61dafb', fontSize: '1.2em' };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '12px', textAlign: 'left' };
  const inputStyle: React.CSSProperties = {display: 'block', width: 'calc(100% - 16px)', padding: '8px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#2a2f36', color: 'white', marginTop: '4px' };
  const buttonStyle: React.CSSProperties = { padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em', marginRight: '10px' };
  const emotionCheckboxStyle: React.CSSProperties = { marginRight: '15px', marginBottom: '5px'};


  if (isLoading) return <p>Loading trade details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!trade || !tradeDetailsForm.trade_id) return <p>Trade data not available or invalid ID.</p>;

  return (
    <div style={pageStyle}>
      <h2>Edit Trade (ID: {trade.trade_id}) - {trade.instrument_ticker}</h2>

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

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Edit Trade Metadata & Emotions</legend>
        {/* ... (other metadata fields: strategy, market conditions, etc.) ... */}
        <label style={labelStyle}>Strategy ID (Optional): <input type="text" name="strategy_id" value={tradeDetailsForm.strategy_id || ''} onChange={handleDetailChange} style={inputStyle} placeholder="Enter numeric ID or leave blank"/> </label>
        <label style={labelStyle}>Market Conditions: <textarea name="market_conditions" value={tradeDetailsForm.market_conditions} onChange={handleDetailChange} style={inputStyle} rows={2}/> </label>
        <label style={labelStyle}>Setup Description: <textarea name="setup_description" value={tradeDetailsForm.setup_description} onChange={handleDetailChange} style={inputStyle} rows={3}/> </label>
        <label style={labelStyle}>Reasoning: <textarea name="reasoning" value={tradeDetailsForm.reasoning} onChange={handleDetailChange} style={inputStyle} rows={3}/> </label>
        <label style={labelStyle}>Lessons Learned: <textarea name="lessons_learned" value={tradeDetailsForm.lessons_learned} onChange={handleDetailChange} style={inputStyle} rows={3}/> </label>
        <label style={labelStyle}>Initial Risk (1R Value): <input type="number" step="any" name="r_multiple_initial_risk" value={tradeDetailsForm.r_multiple_initial_risk} onChange={handleDetailChange} style={inputStyle}/> </label>
        
        <div style={{marginTop: '15px', marginBottom: '15px'}}>
            <label style={{...labelStyle, marginBottom: '5px'}}>Emotions:</label>
            {availableEmotions.length > 0 ? availableEmotions.map(emotion => (
                <label key={emotion.emotion_id} style={emotionCheckboxStyle}>
                    <input
                        type="checkbox"
                        value={emotion.emotion_id}
                        checked={tradeDetailsForm.emotion_ids?.includes(emotion.emotion_id) || false}
                        onChange={() => handleEmotionChange(emotion.emotion_id)}
                        style={{marginRight: '5px'}}
                    />
                    {emotion.emotion_name}
                </label>
            )) : <p style={{fontSize:'0.9em', color: '#aaa'}}>No predefined emotions found. Add some in settings or DB.</p>}
        </div>
        <button onClick={handleSaveTradeDetailsAndEmotions} style={{...buttonStyle, marginTop: '10px'}}>Save Metadata & Emotions</button>
      </fieldset>

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
        />
      )}

      <button onClick={onCancel} style={{...buttonStyle, backgroundColor: '#6c757d', marginTop: '20px'}}>Back to List</button>
    </div>
  );
};

export default EditTradeDetailsPage;