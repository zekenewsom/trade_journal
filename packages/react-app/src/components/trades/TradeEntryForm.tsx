// File: zekenewsom-trade_journal/packages/react-app/src/components/trades/TradeEntryForm.tsx
// Significantly modified to handle editing and full leg CRUD

import React, { useState, useEffect } from 'react';
import type { Trade, TradeLeg, TradeFormData, SaveTradePayload, UpdateTradePayload } from '../../types/index';
import { v4 as uuidv4 } from 'uuid'; // For temporary client-side IDs for new legs

interface TradeEntryFormProps {
  existingTrade?: Trade | null; // Pass full trade object for editing
  onSaveSuccess?: () => void;
}

const createEmptyLeg = (): Omit<TradeLeg, 'price' | 'size'> & { price: string; size: string; temp_id: string } => ({
  temp_id: uuidv4(), // For React key and managing new unsaved legs
  leg_type: 'Entry',
  datetime: '',
  price: '',
  size: '',
});

const convertTradeToFormData = (trade: Trade): TradeFormData => {
  return {
    trade_id: trade.trade_id,
    instrumentTicker: trade.instrument_ticker || '',
    assetClass: trade.asset_class || '',
    direction: trade.trade_direction || '',
    feesCommissionsTotal: trade.fees_commissions_total?.toString() || '0.0',
    initialStopLossPrice: trade.initial_stop_loss_price?.toString() || '',
    initialTakeProfitPrice: trade.initial_take_profit_price?.toString() || '',
    marketConditions: trade.market_conditions || '',
    setupDescription: trade.setup_description || '',
    reasoning: trade.reasoning || '',
    lessonsLearned: trade.lessons_learned || '',
    rMultipleInitialRisk: trade.r_multiple_initial_risk?.toString() || '',
    legs: trade.legs.map(leg => ({
      ...leg,
      price: leg.price.toString(),
      size: leg.size.toString(),
      temp_id: leg.leg_id ? `db-${leg.leg_id}` : uuidv4()
    }))
  };
};


const initialFormDataBase: Omit<TradeFormData, 'legs' | 'trade_id'> = {
  instrumentTicker: '',
  assetClass: '',
  direction: '',
  feesCommissionsTotal: '0.0',
  initialStopLossPrice: '',
  initialTakeProfitPrice: '',
  marketConditions: '',
  setupDescription: '',
  reasoning: '',
  lessonsLearned: '',
  rMultipleInitialRisk: '',
};


const TradeEntryForm: React.FC<TradeEntryFormProps> = ({ existingTrade, onSaveSuccess }) => {
  const [formData, setFormData] = useState<TradeFormData>(
    existingTrade ? convertTradeToFormData(existingTrade) : { ...initialFormDataBase, legs: [createEmptyLeg()] }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof TradeFormData | `leg_${number}_price` | `leg_${number}_size` | `leg_${number}_datetime`, string>>>({});
  const [submissionStatus, setSubmissionStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const isEditMode = !!existingTrade;

  useEffect(() => {
    if (existingTrade) {
      setFormData(convertTradeToFormData(existingTrade));
    } else {
      setFormData({ ...initialFormDataBase, legs: [createEmptyLeg()] });
    }
    setErrors({});
    setSubmissionStatus(null);
  }, [existingTrade]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof TradeFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLegChange = (index: number, field: keyof TradeLeg | 'price' | 'size', value: string | number) => {
    const newLegs = [...formData.legs];
    // @ts-ignore
    newLegs[index][field] = value;
    setFormData(prev => ({ ...prev, legs: newLegs }));
     if (errors[`leg_${index}_${field as string}`]) {
      setErrors(prev => ({ ...prev, [`leg_${index}_${field as string}`]: undefined }));
    }
  };

  const addLeg = () => {
    setFormData(prev => ({ ...prev, legs: [...prev.legs, createEmptyLeg()] }));
  };

  const removeLeg = (tempIdToRemove: string) => {
    setFormData(prev => ({ ...prev, legs: prev.legs.filter(leg => leg.temp_id !== tempIdToRemove) }));
  };


  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.instrumentTicker || !formData.instrumentTicker.trim()) newErrors.instrumentTicker = 'Instrument/Ticker is required.';
    if (!formData.assetClass) newErrors.assetClass = 'Asset Class is required.';
    if (!formData.direction) newErrors.direction = 'Direction is required.';

    if (formData.legs.length === 0) {
      // @ts-ignore
      newErrors.legs = "At least one trade leg is required.";
    }
    formData.legs.forEach((leg, index) => {
      if (!leg.datetime) newErrors[`leg_${index}_datetime`] = `Leg ${index + 1}: Date/Time is required.`;
      if (!leg.price || isNaN(parseFloat(leg.price)) || parseFloat(leg.price) <= 0) {
        newErrors[`leg_${index}_price`] = `Leg ${index + 1}: Valid Price is required.`;
      }
      if (!leg.size || isNaN(parseFloat(leg.size)) || parseFloat(leg.size) === 0) { // Allow negative size for shorts if needed later, for now > 0
        newErrors[`leg_${index}_size`] = `Leg ${index + 1}: Valid, non-zero Position Size is required.`;
      }
    });

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

    const processedLegs: TradeLeg[] = formData.legs.map(formLeg => ({
      leg_id: formLeg.leg_id, // Will be undefined for new legs
      leg_type: formLeg.leg_type,
      datetime: formLeg.datetime,
      price: parseFloat(formLeg.price),
      size: parseFloat(formLeg.size),
    }));

    const tradePayload = {
      ...formData,
      // Convert string numbers to actual numbers for main trade fields
      fees_commissions_total: parseFloat(formData.feesCommissionsTotal) || 0,
      initial_stop_loss_price: formData.initialStopLossPrice ? parseFloat(formData.initialStopLossPrice) : null,
      initial_take_profit_price: formData.initialTakeProfitPrice ? parseFloat(formData.initialTakeProfitPrice) : null,
      r_multiple_initial_risk: formData.rMultipleInitialRisk ? parseFloat(formData.rMultipleInitialRisk) : null,
      legs: processedLegs,
    };


    try {
      if (isEditMode && formData.trade_id) {
        const updatePayload: UpdateTradePayload = {
            ...tradePayload,
            trade_id: formData.trade_id, // Ensure trade_id is part of the payload
        };
        if (window.electronAPI && window.electronAPI.updateTrade) {
          const result = await window.electronAPI.updateTrade(updatePayload);
          if (result.success) {
            setSubmissionStatus({ message: result.message, type: 'success' });
            if (onSaveSuccess) onSaveSuccess();
          } else {
            setSubmissionStatus({ message: `Error updating trade: ${result.message}`, type: 'error' });
          }
        } else { throw new Error("updateTrade API not available.");}
      } else {
        // Create new trade - ensure no trade_id is passed for main trade object
        const { trade_id, ...newTradePayloadBase } = tradePayload;
        const savePayload: SaveTradePayload = newTradePayloadBase;

        if (window.electronAPI && window.electronAPI.saveTrade) {
          const result = await window.electronAPI.saveTrade(savePayload);
          if (result.success) {
            setSubmissionStatus({ message: `Trade saved successfully! (ID: ${result.tradeId})`, type: 'success' });
            if (!existingTrade) setFormData({ ...initialFormDataBase, legs: [createEmptyLeg()] }); // Reset for new trade form only
            if (onSaveSuccess) onSaveSuccess();
          } else {
            setSubmissionStatus({ message: `Error saving trade: ${result.message}`, type: 'error' });
          }
        } else { throw new Error("saveTrade API not available.");}
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionStatus({ message: `Operation failed: ${(error as Error).message}`, type: 'error' });
    }
  };

  // Basic inline styles - replace with Tailwind later
  const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '700px', margin: 'auto' };
  const fieldsetStyle: React.CSSProperties = { border: '1px solid #666', borderRadius: '4px', padding: '15px', marginBottom: '15px' };
  const legendStyle: React.CSSProperties = { padding: '0 5px', color: '#61dafb' };
  const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' };
  const inputStyle: React.CSSProperties = { padding: '8px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#333', color: 'white' };
  const errorStyle: React.CSSProperties = { color: 'red', fontSize: '0.9em', marginTop: '2px' };
  const buttonStyle: React.CSSProperties = { padding: '10px 15px', backgroundColor: '#61dafb', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em' };
  const legItemStyle: React.CSSProperties = { border: '1px dashed #444', padding: '10px', marginBottom: '10px', borderRadius: '4px' };
  const legInputRowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', alignItems: 'flex-start' };

  return (
    <form onSubmit={handleSubmit} style={formStyle} noValidate>
      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Trade Details</legend>
        {/* Main Trade Fields */}
        <div style={labelStyle}>
            Instrument/Ticker:
            <input type="text" name="instrumentTicker" value={formData.instrumentTicker} onChange={handleChange} style={inputStyle} />
            {errors.instrumentTicker && <span style={errorStyle}>{errors.instrumentTicker}</span>}
        </div>
        <div style={labelStyle}>
            Asset Class:
            <select name="assetClass" value={formData.assetClass} onChange={handleChange} style={inputStyle}>
                <option value="">Select...</option>
                <option value="Stock">Stock</option>
                <option value="Cryptocurrency">Cryptocurrency</option>
            </select>
            {errors.assetClass && <span style={errorStyle}>{errors.assetClass}</span>}
        </div>
        <div style={labelStyle}>
            Direction:
            <select name="direction" value={formData.direction} onChange={handleChange} style={inputStyle}>
                <option value="">Select...</option>
                <option value="Long">Long</option>
                <option value="Short">Short</option>
            </select>
            {errors.direction && <span style={errorStyle}>{errors.direction}</span>}
        </div>
         {/* Add other main trade fields: Fees, SL, TP, Notes etc. */}
         <div style={labelStyle}>
            Fees/Commissions:
            <input type="number" step="any" name="feesCommissionsTotal" value={formData.feesCommissionsTotal} onChange={handleChange} style={inputStyle} />
        </div>
         <div style={labelStyle}>
            Initial Stop Loss:
            <input type="number" step="any" name="initialStopLossPrice" value={formData.initialStopLossPrice} onChange={handleChange} style={inputStyle} />
        </div>
        {/* ... other main fields like initialTakeProfitPrice, marketConditions, etc. */}
      </fieldset>

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Trade Legs</legend>
        {/* @ts-ignore */}
        {errors.legs && <span style={errorStyle}>{errors.legs}</span>}
        {formData.legs.map((leg, index) => (
          <div key={leg.temp_id || `leg-${index}`} style={legItemStyle}>
            <h4>Leg {index + 1} {leg.leg_id ? `(ID: ${leg.leg_id})`: ''}</h4>
            <div style={legInputRowStyle}>
              <div style={labelStyle}>
                Type:
                <select value={leg.leg_type} onChange={(e) => handleLegChange(index, 'leg_type', e.target.value)} style={inputStyle}>
                  <option value="Entry">Entry</option>
                  <option value="Exit">Exit</option>
                </select>
              </div>
              <div style={labelStyle}>
                Date/Time:
                <input type="datetime-local" value={leg.datetime} onChange={(e) => handleLegChange(index, 'datetime', e.target.value)} style={inputStyle} />
                {errors[`leg_${index}_datetime`] && <span style={errorStyle}>{errors[`leg_${index}_datetime`]}</span>}
              </div>
              <div style={labelStyle}>
                Price:
                <input type="number" step="any" value={leg.price} onChange={(e) => handleLegChange(index, 'price', e.target.value)} style={inputStyle} />
                {errors[`leg_${index}_price`] && <span style={errorStyle}>{errors[`leg_${index}_price`]}</span>}
              </div>
              <div style={labelStyle}>
                Size:
                <input type="number" step="any" value={leg.size} onChange={(e) => handleLegChange(index, 'size', e.target.value)} style={inputStyle} />
                {errors[`leg_${index}_size`] && <span style={errorStyle}>{errors[`leg_${index}_size`]}</span>}
              </div>
            </div>
            {formData.legs.length > 1 && (
              <button type="button" onClick={() => removeLeg(leg.temp_id!)} style={{ ...buttonStyle, backgroundColor: '#f44336', color: 'white', marginTop: '10px', float: 'right' }}>
                Remove Leg
              </button>
            )}
             <div style={{clear: 'both'}}></div>
          </div>
        ))}
        <button type="button" onClick={addLeg} style={{ ...buttonStyle, backgroundColor: '#4CAF50', marginTop: '10px' }}>Add Another Leg</button>
      </fieldset>

      <button type="submit" style={buttonStyle}>{isEditMode ? 'Update Trade' : 'Save Trade'}</button>

      {submissionStatus && (
        <div style={{ padding: '10px', marginTop: '15px', borderRadius: '4px', backgroundColor: submissionStatus.type === 'success' ? '#4CAF50' : '#f44336', color: 'white', textAlign: 'center' }}>
          {submissionStatus.message}
        </div>
      )}
    </form>
  );
};

export default TradeEntryForm;