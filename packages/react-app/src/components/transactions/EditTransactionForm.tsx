// File: zekenewsom-trade_journal/packages/react-app/src/components/transactions/EditTransactionForm.tsx
// New file for Stage 5 - A small form for editing a single transaction (e.g., in a modal)

import React, { useState, useEffect } from 'react';
import type { EditTransactionFormData, EmotionRecord } from '../../types';

interface EditTransactionFormProps {
  transaction: EditTransactionFormData;
  onSave: (data: EditTransactionFormData) => void;
  onCancel: () => void;
  availableEmotions?: EmotionRecord[];
}

const EditTransactionForm: React.FC<EditTransactionFormProps> = ({
  transaction,
  onSave,
  onCancel,
  availableEmotions = []
}) => {
  const [formData, setFormData] = useState<EditTransactionFormData>(transaction);
  const [selectedEmotions, setSelectedEmotions] = useState<number[]>(transaction.emotion_ids || []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'strategy_id' || name === 'r_multiple_initial_risk') {
      const numValue = value === '' ? undefined : Number(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEmotionChange = (emotionId: number) => {
    setSelectedEmotions(prev => {
      if (prev.includes(emotionId)) {
        return prev.filter(id => id !== emotionId);
      } else {
        return [...prev, emotionId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      emotion_ids: selectedEmotions
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#2a2f36',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ color: '#fff', marginBottom: '20px' }}>Edit Transaction</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1d21',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Price:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1d21',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Date/Time:</label>
            <input
              type="datetime-local"
              name="datetime"
              value={formData.datetime}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1d21',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Fees:</label>
            <input
              type="number"
              name="fees"
              value={formData.fees}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1d21',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Notes:</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1d21',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                minHeight: '100px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Strategy:</label>
            <input
              type="number"
              name="strategy_id"
              value={formData.strategy_id || ''}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1d21',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Market Conditions:</label>
            <textarea
              name="market_conditions"
              value={formData.market_conditions || ''}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1d21',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                minHeight: '100px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Setup Description:</label>
            <textarea
              name="setup_description"
              value={formData.setup_description || ''}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1d21',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                minHeight: '100px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Reasoning:</label>
            <textarea
              name="reasoning"
              value={formData.reasoning || ''}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1d21',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                minHeight: '100px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Lessons Learned:</label>
            <textarea
              name="lessons_learned"
              value={formData.lessons_learned || ''}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1d21',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                minHeight: '100px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>R-Multiple Initial Risk:</label>
            <input
              type="number"
              name="r_multiple_initial_risk"
              value={formData.r_multiple_initial_risk || ''}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1d21',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff'
              }}
            />
          </div>

          {availableEmotions.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Emotions:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {availableEmotions.map(emotion => (
                  <label key={emotion.emotion_id} style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
                    <input
                      type="checkbox"
                      checked={selectedEmotions.includes(emotion.emotion_id)}
                      onChange={() => handleEmotionChange(emotion.emotion_id)}
                      style={{ marginRight: '5px' }}
                    />
                    {emotion.emotion_name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionForm;