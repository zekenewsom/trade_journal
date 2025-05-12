// File: zekenewsom-trade_journal/packages/react-app/src/views/EditTradeDetailsPage.tsx
// New file for Stage 5 - For editing overall trade metadata and managing its transactions

import React, { useState, useEffect, useCallback } from 'react';
import type { Trade, TransactionRecord, EditTradeDetailsFormData, UpdateTradeDetailsPayload, UpdateTransactionPayload } from '../types';
import EditTransactionForm from '../components/transactions/EditTransactionForm'; // Import the new form

interface EditTradeDetailsPageProps {
  tradeId: number;
  onEditComplete: () => void; // Callback after any successful save/delete to trigger list refresh
  onCancel: () => void;
}

const EditTradeDetailsPage: React.FC<EditTradeDetailsPageProps> = ({ tradeId, onEditComplete, onCancel }) => {
  const [trade, setTrade] = useState<Trade | null>(null);
  const [tradeDetailsForm, setTradeDetailsForm] = useState<Partial<EditTradeDetailsFormData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<TransactionRecord | null>(null); // Transaction being edited in modal

  const fetchTradeData = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      if (window.electronAPI?.getTradeWithTransactions) {
        const fetchedTrade = await window.electronAPI.getTradeWithTransactions(tradeId);
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
          });
        } else { setError(`Trade ID ${tradeId} not found.`); }
      } else { throw new Error("API (getTradeWithTransactions) not available"); }
    } catch (err) { setError((err as Error).message); console.error(err); }
    finally { setIsLoading(false); }
  }, [tradeId]);

  useEffect(() => {
    fetchTradeData();
  }, [fetchTradeData]);

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTradeDetailsForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveTradeDetails = async () => {
    if (!tradeDetailsForm.trade_id) return;
    const payload: UpdateTradeDetailsPayload = {
        trade_id: tradeDetailsForm.trade_id,
        strategy_id: tradeDetailsForm.strategy_id ? Number(tradeDetailsForm.strategy_id) : null,
        market_conditions: tradeDetailsForm.market_conditions || null,
        setup_description: tradeDetailsForm.setup_description || null,
        reasoning: tradeDetailsForm.reasoning || null,
        lessons_learned: tradeDetailsForm.lessons_learned || null,
        r_multiple_initial_risk: tradeDetailsForm.r_multiple_initial_risk ? parseFloat(tradeDetailsForm.r_multiple_initial_risk) : null,
    };
    try {
        const result = await window.electronAPI.updateTradeDetails(payload);
        if (result.success) { alert('Trade details updated!'); fetchTradeData(); /* Refresh after save */ }
        else { alert(`Error updating trade details: ${result.message}`); }
    } catch (err) { alert(`Failed to update trade details: ${(err as Error).message}`);}
  };

  const handleEditTransactionClick = (transaction: TransactionRecord) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    if (window.confirm(`Are you sure you want to delete transaction ID ${transactionId}? This may affect the overall trade status and P&L.`)) {
        try {
            const result = await window.electronAPI.deleteSingleTransaction(transactionId);
            if (result.success) {
                 alert(result.message);
                 setEditingTransaction(null); // Close modal if it was open for this tx
                 fetchTradeData(); // Refresh all trade data
            } else { alert(`Error deleting transaction: ${result.message}`); }
        } catch (err) { alert(`Failed to delete transaction: ${(err as Error).message}`);}
    }
  };

  const handleSaveEditedTransaction = async (updatedTxData: UpdateTransactionPayload) => {
     try {
        const result = await window.electronAPI.updateSingleTransaction(updatedTxData);
        if (result.success) {
            alert(result.message);
            setEditingTransaction(null); // Close modal
            fetchTradeData(); // Refresh all trade data
        } else { alert(`Error updating transaction: ${result.message}`); }
    } catch (err) { alert(`Failed to update transaction: ${(err as Error).message}`);}
  };

  // Styling (can be moved to CSS files)
  const pageStyle: React.CSSProperties = { padding: '20px', maxWidth: '900px', margin: 'auto', color: '#eee' };
  const fieldsetStyle: React.CSSProperties = { border: '1px solid #444', borderRadius: '8px', padding: '20px', marginBottom: '25px', backgroundColor: '#333940' };
  const legendStyle: React.CSSProperties = { padding: '0 10px', fontWeight: 'bold', color: '#61dafb', fontSize: '1.2em' };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '12px', textAlign: 'left' };
  const inputStyle: React.CSSProperties = {display: 'block', width: 'calc(100% - 16px)', padding: '8px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#2a2f36', color: 'white', marginTop: '4px' };
  const displayFieldStyle: React.CSSProperties = { color: '#bbb', marginLeft: '8px'};
  const buttonStyle: React.CSSProperties = { padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em', marginRight: '10px' };
  const transactionTableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
  const thStyle: React.CSSProperties = { border: '1px solid #444', padding: '8px', backgroundColor: '#3a3f47', textAlign:'left' };
  const tdStyle: React.CSSProperties = { border: '1px solid #444', padding: '8px', textAlign:'left' };
  const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000};
  const modalContentStyle: React.CSSProperties = { background: '#282c34', padding: '25px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)', minWidth: '400px', maxWidth: '600px'};


  if (isLoading) return <p>Loading trade details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!trade || !tradeDetailsForm.trade_id) return <p>Trade data not available or invalid ID.</p>;

  return (
    <div style={pageStyle}>
      <h2>Edit Trade (ID: {trade.trade_id}) - {trade.instrument_ticker}</h2>
      <button onClick={onCancel} style={{...buttonStyle, backgroundColor: '#6c757d', float: 'right'}}>Back to List</button>
      <div style={{clear: 'both', marginBottom:'20px'}}></div>

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Trade Overview</legend>
        <p><strong style={displayFieldStyle}>Asset:</strong> {trade.asset_class}</p>
        <p><strong style={displayFieldStyle}>Exchange:</strong> {trade.exchange || 'N/A'}</p>
        <p><strong style={displayFieldStyle}>Direction:</strong> {trade.trade_direction}</p>
        <p><strong style={displayFieldStyle}>Status:</strong> {trade.status}</p>
        <p><strong style={displayFieldStyle}>Opened:</strong> {trade.open_datetime ? new Date(trade.open_datetime).toLocaleString() : 'N/A'}</p>
        <p><strong style={displayFieldStyle}>Closed:</strong> {trade.close_datetime ? new Date(trade.close_datetime).toLocaleString() : 'N/A'}</p>
        <p><strong style={displayFieldStyle}>Total Fees:</strong> {trade.fees_total?.toFixed(2) || '0.00'}</p>
      </fieldset>

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Edit Trade Metadata</legend>
        {/* Editable fields */}
        <label style={labelStyle}>Strategy ID (Optional): <input type="text" name="strategy_id" value={tradeDetailsForm.strategy_id || ''} onChange={handleDetailChange} style={inputStyle} placeholder="Enter numeric ID or leave blank"/> </label>
        <label style={labelStyle}>Market Conditions: <textarea name="market_conditions" value={tradeDetailsForm.market_conditions} onChange={handleDetailChange} style={inputStyle} rows={2}/> </label>
        <label style={labelStyle}>Setup Description: <textarea name="setup_description" value={tradeDetailsForm.setup_description} onChange={handleDetailChange} style={inputStyle} rows={3}/> </label>
        <label style={labelStyle}>Reasoning: <textarea name="reasoning" value={tradeDetailsForm.reasoning} onChange={handleDetailChange} style={inputStyle} rows={3}/> </label>
        <label style={labelStyle}>Lessons Learned: <textarea name="lessons_learned" value={tradeDetailsForm.lessons_learned} onChange={handleDetailChange} style={inputStyle} rows={3}/> </label>
        <label style={labelStyle}>Initial Risk (1R Value): <input type="number" step="any" name="r_multiple_initial_risk" value={tradeDetailsForm.r_multiple_initial_risk} onChange={handleDetailChange} style={inputStyle}/> </label>
        <button onClick={handleSaveTradeDetails} style={{...buttonStyle, marginTop: '10px'}}>Save Metadata</button>
      </fieldset>

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Transactions</legend>
        {trade.transactions && trade.transactions.length > 0 ? (
          <table style={transactionTableStyle}>
            <thead><tr>
              <th style={thStyle}>ID</th><th style={thStyle}>Action</th><th style={thStyle}>Date/Time</th>
              <th style={thStyle}>Qty</th><th style={thStyle}>Price</th><th style={thStyle}>Fees</th>
              <th style={thStyle}>Notes</th><th style={thStyle}>Actions</th>
            </tr></thead>
            <tbody>
              {trade.transactions.map(tx => (
                <tr key={tx.transaction_id}>
                  <td style={tdStyle}>{tx.transaction_id}</td><td style={tdStyle}>{tx.action}</td>
                  <td style={tdStyle}>{new Date(tx.datetime).toLocaleString()}</td>
                  <td style={tdStyle}>{tx.quantity}</td><td style={tdStyle}>{tx.price.toFixed(2)}</td>
                  <td style={tdStyle}>{tx.fees?.toFixed(2)}</td><td style={tdStyle}>{tx.notes}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEditTransactionClick(tx)} style={{fontSize: '0.8em', padding:'3px 6px', marginRight:'5px'}}>Edit</button>
                    <button onClick={() => handleDeleteTransaction(tx.transaction_id!)} style={{fontSize: '0.8em', padding:'3px 6px', backgroundColor: '#dc3545', color: 'white'}}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No transactions recorded for this trade.</p>}
      </fieldset>
      
      {editingTransaction && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <EditTransactionForm
                    transaction={editingTransaction}
                    onSave={handleSaveEditedTransaction}
                    onCancel={() => setEditingTransaction(null)}
                />
            </div>
          </div>
      )}
    </div>
  );
};

export default EditTradeDetailsPage;