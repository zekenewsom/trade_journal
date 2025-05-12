// File: zekenewsom-trade_journal/packages/react-app/src/components/trades/TradeEntryForm.tsx
// New file

import React, { useState } from 'react';

// Define an interface for the trade data structure
interface TradeFormData {
  instrumentTicker: string;
  assetClass: 'Stock' | 'Cryptocurrency' | '';
  entryDatetime: string;
  entryPrice: string; // Keep as string for input, convert to number on submission
  positionSize: string; // Keep as string for input, convert to number on submission
  direction: 'Long' | 'Short' | '';
  // Add other fields as needed from PRD:
  // accountId: number | null;
  // strategyId: number | null;
  // feesCommissionsTotal: string;
  // initialStopLossPrice: string;
  // initialTakeProfitPrice: string;
  // marketConditions: string;
  // setupDescription: string;
  // reasoning: string;
  // lessonsLearned: string;
  // rMultipleInitialRisk: string;
}

const initialFormData: TradeFormData = {
  instrumentTicker: '',
  assetClass: '',
  entryDatetime: '',
  entryPrice: '',
  positionSize: '',
  direction: '',
};

const TradeEntryForm: React.FC = () => {
  const [formData, setFormData] = useState<TradeFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof TradeFormData, string>>>({});
  const [submissionStatus, setSubmissionStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field on change
    if (errors[name as keyof TradeFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TradeFormData, string>> = {};
    if (!formData.instrumentTicker.trim()) newErrors.instrumentTicker = 'Instrument/Ticker is required.';
    if (!formData.assetClass) newErrors.assetClass = 'Asset Class is required.';
    if (!formData.entryDatetime) newErrors.entryDatetime = 'Entry Date/Time is required.';
    if (!formData.entryPrice || isNaN(parseFloat(formData.entryPrice)) || parseFloat(formData.entryPrice) <= 0) {
      newErrors.entryPrice = 'Valid Entry Price is required.';
    }
    if (!formData.positionSize || isNaN(parseFloat(formData.positionSize)) || parseFloat(formData.positionSize) <= 0) {
      newErrors.positionSize = 'Valid Position Size is required.';
    }
    if (!formData.direction) newErrors.direction = 'Direction is required.';

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

    // Prepare data for submission (e.g., convert strings to numbers)
    const tradeToSave = {
      ...formData,
      entryPrice: parseFloat(formData.entryPrice),
      positionSize: parseFloat(formData.positionSize),
      // For this stage, we assume the form collects data for the 'trades' table
      // and the first 'trade_legs' entry.
      // The main process will handle splitting this into the respective tables.
    };

    try {
      if (window.electronAPI && typeof window.electronAPI.saveTrade === 'function') {
        const result = await window.electronAPI.saveTrade(tradeToSave);
        if (result.success) {
          setSubmissionStatus({ message: `Trade saved successfully! (ID: ${result.tradeId})`, type: 'success' });
          setFormData(initialFormData); // Reset form
        } else {
          setSubmissionStatus({ message: `Error saving trade: ${result.message}`, type: 'error' });
        }
      } else {
        throw new Error('saveTrade API is not available. Ensure the app is running in Electron.');
      }
    } catch (error) {
      console.error('Failed to save trade:', error);
      setSubmissionStatus({ message: `Failed to save trade: ${(error as Error).message}`, type: 'error' });
    }
  };

  // Basic inline styles for demonstration. Replace with Tailwind CSS later.
  const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', margin: 'auto' };
  const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' };
  const inputStyle: React.CSSProperties = { padding: '8px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#333', color: 'white' };
  const errorStyle: React.CSSProperties = { color: 'red', fontSize: '0.9em', marginTop: '2px' };
  const buttonStyle: React.CSSProperties = { padding: '10px 15px', backgroundColor: '#61dafb', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em' };
  const statusMessageStyle = (type: 'success' | 'error'): React.CSSProperties => ({
    padding: '10px',
    marginTop: '15px',
    borderRadius: '4px',
    backgroundColor: type === 'success' ? '#4CAF50' : '#f44336',
    color: 'white',
    textAlign: 'center',
  });


  return (
    <form onSubmit={handleSubmit} style={formStyle} noValidate>
      <div style={labelStyle}>
        <label htmlFor="instrumentTicker">Instrument/Ticker:</label>
        <input
          type="text"
          id="instrumentTicker"
          name="instrumentTicker"
          value={formData.instrumentTicker}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        {errors.instrumentTicker && <span style={errorStyle}>{errors.instrumentTicker}</span>}
      </div>

      <div style={labelStyle}>
        <label htmlFor="assetClass">Asset Class:</label>
        <select
          id="assetClass"
          name="assetClass"
          value={formData.assetClass}
          onChange={handleChange}
          style={inputStyle}
          required
        >
          <option value="">Select Asset Class</option>
          <option value="Stock">Stock</option>
          <option value="Cryptocurrency">Cryptocurrency</option>
        </select>
        {errors.assetClass && <span style={errorStyle}>{errors.assetClass}</span>}
      </div>

      <div style={labelStyle}>
        <label htmlFor="entryDatetime">Entry Date/Time:</label>
        <input
          type="datetime-local"
          id="entryDatetime"
          name="entryDatetime"
          value={formData.entryDatetime}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        {errors.entryDatetime && <span style={errorStyle}>{errors.entryDatetime}</span>}
      </div>

      <div style={labelStyle}>
        <label htmlFor="entryPrice">Entry Price:</label>
        <input
          type="number"
          id="entryPrice"
          name="entryPrice"
          value={formData.entryPrice}
          onChange={handleChange}
          style={inputStyle}
          step="any" // Allows for decimal prices
          required
        />
        {errors.entryPrice && <span style={errorStyle}>{errors.entryPrice}</span>}
      </div>

      <div style={labelStyle}>
        <label htmlFor="positionSize">Position Size:</label>
        <input
          type="number"
          id="positionSize"
          name="positionSize"
          value={formData.positionSize}
          onChange={handleChange}
          style={inputStyle}
          step="any"
          required
        />
        {errors.positionSize && <span style={errorStyle}>{errors.positionSize}</span>}
      </div>

      <div style={labelStyle}>
        <label htmlFor="direction">Direction:</label>
        <select
          id="direction"
          name="direction"
          value={formData.direction}
          onChange={handleChange}
          style={inputStyle}
          required
        >
          <option value="">Select Direction</option>
          <option value="Long">Long</option>
          <option value="Short">Short</option>
        </select>
        {errors.direction && <span style={errorStyle}>{errors.direction}</span>}
      </div>

      {/* Add more form fields here as needed for future stages, e.g.:
      <div style={labelStyle}>
        <label htmlFor="setupDescription">Setup Description:</label>
        <textarea
          id="setupDescription"
          name="setupDescription"
          value={formData.setupDescription || ''}
          onChange={handleChange}
          style={{...inputStyle, minHeight: '80px' }}
        />
      </div>
      */}

      <button type="submit" style={buttonStyle}>Save Trade</button>

      {submissionStatus && (
        <div style={statusMessageStyle(submissionStatus.type)}>
          {submissionStatus.message}
        </div>
      )}
    </form>
  );
};

export default TradeEntryForm;