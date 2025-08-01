// File: zekenewsom-trade_journal/packages/react-app/src/components/transactions/LogTransactionForm.tsx
// New file for Stage 5

import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import type { LogTransactionFormData, LogTransactionPayload } from '../../types';
import AutocompleteInput from '../common/AutocompleteInput';

interface LogTransactionFormProps {
  onSubmit: (formData: LogTransactionFormData) => Promise<void>;
  initialValues?: {
    instrument_ticker: string;
    asset_class: 'Stock' | 'Cryptocurrency';
    exchange: string;
  };
}

const getInitialFormData = (defaultAccountId?: number): LogTransactionFormData => {
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
    account_id: defaultAccountId ?? 0,
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
  initialValues 
}) => {
  const accounts = useAppStore(s => s.accounts);
  const selectedAccountId = useAppStore(s => s.selectedAccountId);

  const [formData, setFormData] = useState<LogTransactionFormData>(() => ({
    ...getInitialFormData(selectedAccountId ?? (accounts.length > 0 ? accounts[0].account_id : 0)),
    instrument_ticker: initialValues?.instrument_ticker || '',
    asset_class: initialValues?.asset_class || null,
    exchange: initialValues?.exchange || '',
    account_id: selectedAccountId ?? (accounts.length > 0 ? accounts[0].account_id : 0),
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof LogTransactionFormData, string>>>({});
  const [submissionStatus, setSubmissionStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue: string | number = value;
    if (name === 'account_id') {
      newValue = Number(value);
    }
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    if (errors[name as keyof LogTransactionFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LogTransactionFormData, string>> = {};
    if (!formData.account_id || !accounts.some(acc => acc.account_id === formData.account_id)) {
      newErrors.account_id = 'Account is required.';
    }
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
    console.log('[DEBUG] LogTransactionForm handleSubmit', formData);
    e.preventDefault();
    if (submitting) return; // Prevent double submission
    if (!validateForm()) return;
    setSubmitting(true);
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
        account_id: formData.account_id,
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
        setFormData(getInitialFormData(selectedAccountId ?? (accounts.length > 0 ? accounts[0].account_id : 0)));
        if (onSubmit) await onSubmit(formData);
      } else {
        setSubmissionStatus({ message: `Error: ${result.message}`, type: 'error' });
      }
    } catch (err) {
      console.error('Error logging transaction:', err);
      setSubmissionStatus({ message: `Error: ${(err as Error).message}`, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col gap-4 w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-1 text-left">
          <label htmlFor="account_id" className="font-medium">Account:</label>
          <select
            id="account_id"
            name="account_id"
            value={formData.account_id || ''}
            onChange={handleInputChange}
            className="p-2 border border-card-stroke rounded bg-surface text-on-surface w-full focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select Account</option>
            {accounts.map((acc) => (
              <option key={acc.account_id} value={acc.account_id}>
                {acc.name} {acc.is_archived ? '(Archived)' : ''}
              </option>
            ))}
          </select>
          {errors.account_id && <span className="text-error text-sm mt-1">{errors.account_id}</span>}
        </div>
        <div className="flex flex-col gap-1 text-left">
          <label htmlFor="instrument_ticker" className="font-medium">Instrument/Ticker:</label>
          <AutocompleteInput
            id="instrument_ticker"
            name="instrument_ticker"
            value={formData.instrument_ticker}
            onChange={handleInputChange}
            field="instrument_ticker"
            placeholder="e.g., AAPL, BTC"
            required
            className="p-2 border border-card-stroke rounded bg-surface text-on-surface w-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.instrument_ticker && <span className="text-error text-sm mt-1">{errors.instrument_ticker}</span>}
        <label htmlFor="asset_class" className="font-medium">Asset Class:</label>
        <select 
          id="asset_class"
          name="asset_class" 
          value={formData.asset_class || ''} 
          onChange={handleInputChange}          className="p-2 border border-card-stroke rounded bg-surface text-on-surface w-full focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="">Select Asset Class</option>
          <option value="Stock">Stock</option>
          <option value="Cryptocurrency">Cryptocurrency</option>
        </select>
        {errors.asset_class && <span className="text-error text-sm mt-1">{errors.asset_class}</span>}
      </div>
      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="exchange" className="font-medium">Exchange:</label>
        <AutocompleteInput
          id="exchange"
          name="exchange"
          value={formData.exchange}
          onChange={handleInputChange}
          field="exchange"
          placeholder="e.g., NYSE, Binance"
          required
          className="p-2 border border-card-stroke rounded bg-surface text-on-surface w-full focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.exchange && <span className="text-error text-sm mt-1">{errors.exchange}</span>}
      </div>
      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="action" className="font-medium">Action:</label>
        <select id="action" name="action" value={formData.action} onChange={handleInputChange} className="p-2 border border-card-stroke rounded bg-surface text-on-surface w-full focus:outline-none focus:ring-2 focus:ring-primary" required>
          <option value="">Select Action</option>
          <option value="Buy">Buy</option>
          <option value="Sell">Sell</option>
        </select>
        {errors.action && <span className="text-error text-sm mt-1">{errors.action}</span>}
      </div>
      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="datetime" className="font-medium">Date/Time:</label>
        <input type="datetime-local" id="datetime" name="datetime" value={formData.datetime} onChange={handleInputChange} className="p-2 border border-card-stroke rounded bg-surface text-on-surface w-full focus:outline-none focus:ring-2 focus:ring-primary" required />
        {errors.datetime && <span className="text-error text-sm mt-1">{errors.datetime}</span>}
      </div>
      
        <div className="flex flex-col gap-1 text-left">
          <label htmlFor="quantity" className="font-medium">Quantity:</label>
          <input type="number" step="any" min="0.00000001" id="quantity" name="quantity" value={formData.quantity} onChange={handleInputChange} className="p-2 border border-card-stroke rounded bg-surface text-on-surface w-full focus:outline-none focus:ring-2 focus:ring-primary" required />
          {errors.quantity && <span className="text-error text-sm mt-1">{errors.quantity}</span>}
        </div>
        <div className="flex flex-col gap-1 text-left">
          <label htmlFor="price" className="font-medium">Price:</label>
          <input type="number" step="any" min="0.00000001" id="price" name="price" value={formData.price} onChange={handleInputChange} className="p-2 border border-card-stroke rounded bg-surface text-on-surface w-full focus:outline-none focus:ring-2 focus:ring-primary" required />
          {errors.price && <span className="text-error text-sm mt-1">{errors.price}</span>}
        </div>
        <div className="flex flex-col gap-1 text-left">
          <label htmlFor="fees" className="font-medium">Fees (for this transaction):</label>
          <input type="number" step="any" min="0" id="fees" name="fees" value={formData.fees} onChange={handleInputChange} className="p-2 border border-card-stroke rounded bg-surface text-on-surface w-full focus:outline-none focus:ring-2 focus:ring-primary" />
          {errors.fees && <span className="text-error text-sm mt-1">{errors.fees}</span>}
        </div>
        <div className="flex flex-col gap-1 text-left">
          <label htmlFor="notes" className="font-medium">Notes (Optional):</label>
          <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} className="p-2 border border-card-stroke rounded bg-surface text-on-surface w-full min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary" />

          {/* Trade Thesis Summary (Reasoning) field, if present in formData */}
          {'reasoning' in formData && (
            <div className="flex flex-col gap-1 text-left mt-4">
              <label htmlFor="reasoning" className="font-medium">Trade Thesis Summary:</label>
              <textarea
                id="reasoning"
                name="reasoning"
                value={formData.reasoning || ''}
                onChange={handleInputChange}
                className="p-2 border border-card-stroke rounded bg-surface text-on-surface w-full min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Summarize your trade thesis for this transaction..."
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full sm:flex-row sm:gap-3 sm:w-auto mt-2">
          <button type="submit" className="py-2 px-4 bg-primary text-on-primary rounded hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-semibold w-full sm:w-auto" disabled={submitting}>
            {submitting ? 'Logging…' : 'Log Transaction'}
          </button>
        </div>
        {submissionStatus && (
          <div className={`py-2 mt-4 rounded text-on-primary text-center ${submissionStatus.type === 'success' ? 'bg-success' : 'bg-error'}`}>
            {submissionStatus.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default LogTransactionForm;