// File: zekenewsom-trade_journal/packages/react-app/src/components/transactions/EditTransactionForm.tsx
// New file for Stage 5 - A small form for editing a single transaction (e.g., in a modal)

import React, { useState, useEffect } from 'react';
import type { TransactionRecord, UpdateTransactionPayload, EditTransactionFormData } from '../../types';

interface EditTransactionFormProps {
  transaction: TransactionRecord; // The transaction to edit
  onSave: (updatedTxData: UpdateTransactionPayload) => Promise<void>;
  onCancel: () => void;
}

const EditTransactionForm: React.FC<EditTransactionFormProps> = ({ transaction, onSave, onCancel }) => {
  const [formData, setFormData] = useState<EditTransactionFormData>({
    transaction_id: transaction.transaction_id!,
    trade_id: transaction.trade_id,
    action: transaction.action, // Display only, not typically editable
    quantity: transaction.quantity.toString(),
    price: transaction.price.toString(),
    datetime: transaction.datetime.slice(0, 16), // Format for datetime-local input
    fees: (transaction.fees || 0).toString(),
    notes: transaction.notes || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EditTransactionFormData, string>>>({});


  useEffect(() => { // Re-initialize if the transaction prop changes
    setFormData({
        transaction_id: transaction.transaction_id!,
        trade_id: transaction.trade_id,
        action: transaction.action,
        quantity: transaction.quantity.toString(),
        price: transaction.price.toString(),
        datetime: new Date(transaction.datetime).toISOString().slice(0,16),
        fees: (transaction.fees || 0).toString(),
        notes: transaction.notes || '',
    });
  }, [transaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev: EditTransactionFormData) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name as keyof EditTransactionFormData]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

   const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EditTransactionFormData, string>> = {};
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

    setIsSaving(true);
    const payload: UpdateTransactionPayload = {
      transaction_id: formData.transaction_id,
      // trade_id is not needed in payload for updateSingleTransaction, but good to have in form state
      quantity: parseFloat(formData.quantity),
      price: parseFloat(formData.price),
      datetime: new Date(formData.datetime).toISOString(),
      fees: parseFloat(formData.fees) || 0,
      notes: formData.notes.trim() || null,
    };
    try {
        await onSave(payload);
    } finally {
        setIsSaving(false);
    }
  };
  
  // Basic inline styles
  const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '10px' };
  const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left', fontSize: '0.9em' };
  const inputStyle: React.CSSProperties = { padding: '6px', border: '1px solid #555', borderRadius: '3px', backgroundColor: '#444', color: 'white' };
  const errorStyle: React.CSSProperties = { color: 'orange', fontSize: '0.8em', marginTop: '1px' };
  const buttonRowStyle: React.CSSProperties = {display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px'};


  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h4>Edit Transaction (ID: {formData.transaction_id})</h4>
      <div style={labelStyle}>
        <label>Date/Time:</label>
        <input
          type="datetime-local"
          name="datetime"
          value={formData.datetime}
          onChange={handleChange}
          style={inputStyle}
        />
        {errors.datetime && <span style={errorStyle}>{errors.datetime}</span>}
      </div>

      <div style={labelStyle}>
        <label>Action:</label>
        <input
          type="text"
          name="action"
          value={formData.action}
          disabled
          style={{...inputStyle, backgroundColor: '#333'}}
        />
      </div>

      <div style={labelStyle}>
        <label>Quantity:</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          step="any"
          style={inputStyle}
        />
        {errors.quantity && <span style={errorStyle}>{errors.quantity}</span>}
      </div>

      <div style={labelStyle}>
        <label>Price:</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          step="any"
          style={inputStyle}
        />
        {errors.price && <span style={errorStyle}>{errors.price}</span>}
      </div>

      <div style={labelStyle}>
        <label>Fees:</label>
        <input
          type="number"
          name="fees"
          value={formData.fees}
          onChange={handleChange}
          step="any"
          style={inputStyle}
        />
        {errors.fees && <span style={errorStyle}>{errors.fees}</span>}
      </div>

      <div style={labelStyle}>
        <label>Notes:</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          style={{...inputStyle, minHeight: '60px'}}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button
          type="submit"
          disabled={isSaving}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditTransactionForm;