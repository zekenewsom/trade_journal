// File: zekenewsom-trade_journal/packages/react-app/src/views/EditTradeDetailsPage.tsx
// Modified for Stage 6: Add Emotion Tagging UI

import React, { useState, useEffect, useCallback } from 'react';
import type { Trade, EditTradeDetailsFormData, UpdateTradeDetailsPayload, EmotionRecord } from '../types';
// import EditTransactionForm from '../components/transactions/EditTransactionForm'; // Removed as unused

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
  // const [editingTransaction, setEditingTransaction] = useState<TransactionRecord | null>(null);
  // Modal logic placeholder: see below for usage guidance.

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

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTradeDetailsForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEmotionChange = (emotionId: number) => {
    setTradeDetailsForm(prev => {
        const currentEmotionIds = prev.emotion_ids || [];
        const newEmotionIds = currentEmotionIds.includes(emotionId)
            ? currentEmotionIds.filter(id => id !== emotionId)
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
            alert(`Error: ${!detailsResult.success ? detailsResult.message : ''} ${!emotionsResult.success ? emotionsResult.message : ''}`);
        }
    } catch (err) { alert(`Failed to update: ${(err as Error).message}`);}
  };

  // ... (handleEditTransactionClick, handleDeleteTransaction, handleSaveEditedTransaction remain the same)



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
      {/* ... (Trade Overview fieldset same as before) ... */}

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

      {/* ... (Transactions fieldset and EditTransactionModal same as before) ... */}
       <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Transactions</legend>
        {/* ... transaction list ... */}
      </fieldset>
      


      <button onClick={onCancel} style={{...buttonStyle, backgroundColor: '#6c757d', marginTop: '20px'}}>Back to List</button>
    </div>
  );
};

export default EditTradeDetailsPage;