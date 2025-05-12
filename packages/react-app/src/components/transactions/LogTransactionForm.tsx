// File: zekenewsom-trade_journal/packages/react-app/src/components/transactions/LogTransactionForm.tsx
// New file for Stage 5

import React, { useState } from 'react';
import type { LogTransactionFormData, LogTransactionPayload } from '../../types';

const initialLogFormData: LogTransactionFormData = {
  instrumentTicker: '',
  assetClass: '',
  exchange: '',
  action: '',
  quantity: '',
  price: '',
  datetime: new Date().toISOString().slice(0, 16), // Default to current date and time
  fees: '0',
  notes: '',
};

const LogTransactionForm: React.FC<{ onSaveSuccess: () => void }> = ({ onSaveSuccess }) => {
  const [formData, setFormData] = useState<LogTransactionFormData>(initialLogFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof LogTransactionFormData, string>>>({});
  const [submissionStatus, setSubmissionStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof LogTransactionFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LogTransactionFormData, string>> = {};
    if (!formData.instrumentTicker.trim()) newErrors.instrumentTicker = 'Instrument/Ticker is required.';
    if (!formData.assetClass) newErrors.assetClass = 'Asset Class is required.';
    if (!formData.exchange.trim()) newErrors.exchange = 'Exchange is required.';
    if (!formData.action) newErrors.action = 'Action (Buy/Sell) is required.';
    if (!formData.datetime) newErrors.datetime = 'Date/Time is required.';
    if (!formData.quantity || isNaN(parseFloat(formData.quantity)) || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid Positive Quantity is required.';
    }
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid Positive Price is required.';
    }
    if (isNaN(parseFloat(formData.fees)) || parseFloat(formData.fees) < 0) {
        newErrors.fees = 'Valid Fees are required (0 or more).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionStatus(null);

    if (!validateForm()) {
      setSubmissionStatus({ message: 'Please correct the errors in the form.', type: 'error' });
      return;
    }

    const payload: LogTransactionPayload = {
      instrument_ticker: formData.instrumentTicker.toUpperCase().trim(),
      asset_class: formData.assetClass as 'Stock' | 'Cryptocurrency',
      exchange: formData.exchange.trim() || null, // Send null if empty
      action: formData.action as 'Buy' | 'Sell',
      quantity: parseFloat(formData.quantity),
      price: parseFloat(formData.price),
      datetime: new Date(formData.datetime).toISOString(), // Ensure ISO format
      fees_for_transaction: parseFloat(formData.fees) || 0,
      notes_for_transaction: formData.notes.trim() || null,
    };

    try {
      if (window.electronAPI && window.electronAPI.logTransaction) {
        const result = await window.electronAPI.logTransaction(payload);
        if (result.success) {
          setSubmissionStatus({ message: result.message, type: 'success' });
          setFormData(initialLogFormData); // Reset form
          if (onSaveSuccess) onSaveSuccess();
        } else {
          setSubmissionStatus({ message: `Error: ${result.message}`, type: 'error' });
        }
      } else {
        throw new Error('logTransaction API is not available.');
      }
    } catch (error) {
      console.error('Failed to log transaction:', error);
      setSubmissionStatus({ message: `Failed: ${(error as Error).message}`, type: 'error' });
    }
  };
  
  const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', margin: 'auto' };
  const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' };
  const inputStyle: React.CSSProperties = { padding: '8px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#333', color: 'white' };
  const errorStyle: React.CSSProperties = { color: 'red', fontSize: '0.9em', marginTop: '2px' };
  const buttonStyle: React.CSSProperties = { padding: '10px 15px', backgroundColor: '#61dafb', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em' };

  return (
    <form onSubmit={handleSubmit} style={formStyle} noValidate>
      <div style={labelStyle}>Instrument/Ticker:
        <input type="text" name="instrumentTicker" value={formData.instrumentTicker} onChange={handleChange} style={inputStyle} required/>
        {errors.instrumentTicker && <span style={errorStyle}>{errors.instrumentTicker}</span>}
      </div>
      <div style={labelStyle}>Asset Class:
        <select name="assetClass" value={formData.assetClass} onChange={handleChange} style={inputStyle} required>
          <option value="">Select Asset Class</option><option value="Stock">Stock</option><option value="Cryptocurrency">Cryptocurrency</option>
        </select>
        {errors.assetClass && <span style={errorStyle}>{errors.assetClass}</span>}
      </div>
      <div style={labelStyle}>Exchange:
        <input type="text" name="exchange" value={formData.exchange} onChange={handleChange} style={inputStyle} placeholder="e.g., NYSE, Binance" required/>
        {errors.exchange && <span style={errorStyle}>{errors.exchange}</span>}
      </div>
      <div style={labelStyle}>Action:
        <select name="action" value={formData.action} onChange={handleChange} style={inputStyle} required>
          <option value="">Select Action</option><option value="Buy">Buy</option><option value="Sell">Sell</option>
        </select>
        {errors.action && <span style={errorStyle}>{errors.action}</span>}
      </div>
      <div style={labelStyle}>Date/Time:
        <input type="datetime-local" name="datetime" value={formData.datetime} onChange={handleChange} style={inputStyle} required/>
        {errors.datetime && <span style={errorStyle}>{errors.datetime}</span>}
      </div>
      <div style={labelStyle}>Quantity:
        <input type="number" step="any" min="0.00000001" name="quantity" value={formData.quantity} onChange={handleChange} style={inputStyle} required/>
        {errors.quantity && <span style={errorStyle}>{errors.quantity}</span>}
      </div>
      <div style={labelStyle}>Price:
        <input type="number" step="any" min="0.00000001" name="price" value={formData.price} onChange={handleChange} style={inputStyle} required/>
        {errors.price && <span style={errorStyle}>{errors.price}</span>}
      </div>
      <div style={labelStyle}>Fees (for this transaction):
        <input type="number" step="any" min="0" name="fees" value={formData.fees} onChange={handleChange} style={inputStyle} />
        {errors.fees && <span style={errorStyle}>{errors.fees}</span>}
      </div>
       <div style={labelStyle}>Notes (Optional):
        <textarea name="notes" value={formData.notes} onChange={handleChange} style={{...inputStyle, minHeight: '60px' }} />
      </div>
      <button type="submit" style={buttonStyle}>Log Transaction</button>
      {submissionStatus && (
        <div style={{ padding: '10px', marginTop: '15px', borderRadius: '4px', backgroundColor: submissionStatus.type === 'success' ? '#4CAF50' : '#f44336', color: 'white', textAlign: 'center' }}>
          {submissionStatus.message}
        </div>
      )}
    </form>
  );
};

export default LogTransactionForm;