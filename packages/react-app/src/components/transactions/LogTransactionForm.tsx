// File: zekenewsom-trade_journal/packages/react-app/src/components/transactions/LogTransactionForm.tsx
// New file for Stage 5

import React, { useState } from 'react';
import type { LogTransactionFormData, LogTransactionPayload, EmotionRecord } from '../../types';

interface LogTransactionFormProps {
  onSubmit: (formData: LogTransactionFormData) => Promise<void>;
  onCancel: () => void;
  availableEmotions: EmotionRecord[];
  initialValues?: {
    instrument_ticker: string;
    asset_class: 'Stock' | 'Cryptocurrency';
    exchange: string;
  };
}

const getInitialFormData = (): LogTransactionFormData => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return {
    instrument_ticker: '',
    asset_class: null,
    exchange: '',
    action: 'Buy',
    datetime: `${year}-${month}-${day}T${hours}:${minutes}`,
    quantity: '',
    price: '',
    fees: '0',
    notes: '',
    strategy_id: undefined,
    market_conditions: undefined,
    setup_description: undefined,
    reasoning: undefined,
    lessons_learned: undefined,
    r_multiple_initial_risk: undefined,
    emotion_ids: []
  };
};

const LogTransactionForm: React.FC<LogTransactionFormProps> = ({ 
  onSubmit, 
  onCancel,
  availableEmotions,
  initialValues 
}) => {
  const [formData, setFormData] = useState<LogTransactionFormData>(() => ({
    ...getInitialFormData(),
    instrument_ticker: initialValues?.instrument_ticker || '',
    asset_class: initialValues?.asset_class || null,
    exchange: initialValues?.exchange || ''
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof LogTransactionFormData, string>>>({});
  const [submissionStatus, setSubmissionStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof LogTransactionFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LogTransactionFormData, string>> = {};
    if (!formData.instrument_ticker.trim()) newErrors.instrument_ticker = 'Instrument/Ticker is required.';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload: LogTransactionPayload = {
        instrument_ticker: formData.instrument_ticker.toUpperCase().trim(),
        asset_class: formData.asset_class,
        exchange: formData.exchange.trim(),
        action: formData.action,
        datetime: formData.datetime,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        fees_for_transaction: parseFloat(formData.fees),
        notes_for_transaction: formData.notes || null,
        strategy_id: formData.strategy_id ? parseInt(formData.strategy_id) : undefined,
        market_conditions: formData.market_conditions,
        setup_description: formData.setup_description,
        reasoning: formData.reasoning,
        lessons_learned: formData.lessons_learned,
        r_multiple_initial_risk: formData.r_multiple_initial_risk ? parseFloat(formData.r_multiple_initial_risk) : undefined,
        emotion_ids: formData.emotion_ids
      };

      const result = await window.electronAPI.logTransaction(payload);
      if (result.success) {
        setSubmissionStatus({ message: 'Transaction logged successfully!', type: 'success' });
        setFormData(getInitialFormData()); // Reset form with current date/time
        if (onSubmit) await onSubmit(formData);
      } else {
        setSubmissionStatus({ message: `Error: ${result.message}`, type: 'error' });
      }
    } catch (err) {
      console.error('Error logging transaction:', err);
      setSubmissionStatus({ message: `Error: ${(err as Error).message}`, type: 'error' });
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
        <input type="text" name="instrument_ticker" value={formData.instrument_ticker} onChange={handleInputChange} style={inputStyle} required/>
        {errors.instrument_ticker && <span style={errorStyle}>{errors.instrument_ticker}</span>}
      </div>
      <div style={labelStyle}>Asset Class:
        <select 
          name="asset_class" 
          value={formData.asset_class || ''} 
          onChange={handleInputChange} 
          style={inputStyle} 
          required
        >
          <option value="">Select Asset Class</option>
          <option value="Stock">Stock</option>
          <option value="Cryptocurrency">Cryptocurrency</option>
        </select>
        {errors.asset_class && <span style={errorStyle}>{errors.asset_class}</span>}
      </div>
      <div style={labelStyle}>Exchange:
        <input type="text" name="exchange" value={formData.exchange} onChange={handleInputChange} style={inputStyle} placeholder="e.g., NYSE, Binance" required/>
        {errors.exchange && <span style={errorStyle}>{errors.exchange}</span>}
      </div>
      <div style={labelStyle}>Action:
        <select name="action" value={formData.action} onChange={handleInputChange} style={inputStyle} required>
          <option value="">Select Action</option>
          <option value="Buy">Buy</option>
          <option value="Sell">Sell</option>
        </select>
        {errors.action && <span style={errorStyle}>{errors.action}</span>}
      </div>
      <div style={labelStyle}>Date/Time:
        <input type="datetime-local" name="datetime" value={formData.datetime} onChange={handleInputChange} style={inputStyle} required/>
        {errors.datetime && <span style={errorStyle}>{errors.datetime}</span>}
      </div>
      <div style={labelStyle}>Quantity:
        <input type="number" step="any" min="0.00000001" name="quantity" value={formData.quantity} onChange={handleInputChange} style={inputStyle} required/>
        {errors.quantity && <span style={errorStyle}>{errors.quantity}</span>}
      </div>
      <div style={labelStyle}>Price:
        <input type="number" step="any" min="0.00000001" name="price" value={formData.price} onChange={handleInputChange} style={inputStyle} required/>
        {errors.price && <span style={errorStyle}>{errors.price}</span>}
      </div>
      <div style={labelStyle}>Fees (for this transaction):
        <input type="number" step="any" min="0" name="fees" value={formData.fees} onChange={handleInputChange} style={inputStyle} />
        {errors.fees && <span style={errorStyle}>{errors.fees}</span>}
      </div>
       <div style={labelStyle}>Notes (Optional):
        <textarea name="notes" value={formData.notes} onChange={handleInputChange} style={{...inputStyle, minHeight: '60px' }} />
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