// File: zekenewsom-trade_journal/packages/react-app/src/components/transactions/EditTransactionForm.tsx
// New file for Stage 5 - A small form for editing a single transaction (e.g., in a modal)

import React, { useState } from 'react';
import { colors } from '/src/styles/design-tokens';
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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-surface p-6 rounded-2xl w-[90%] max-w-xl max-h-[90vh] overflow-y-auto shadow-elevation-2 border border-card-stroke">
        <h2 className="text-on-surface text-2xl font-bold mb-6">Edit Transaction</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="mb-4">
            <label className="block mb-1 text-on-surface font-medium">Quantity:</label>
            <input
  className="w-full p-2 bg-surface border border-card-stroke rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-on-surface font-medium">Price:</label>
            <input
  className="w-full p-2 bg-surface border border-card-stroke rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-on-surface font-medium">Date/Time:</label>
            <input
  className="w-full p-2 bg-surface border border-card-stroke rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"              type="datetime-local"
              name="datetime"
              value={formData.datetime}
              onChange={handleChange}
              
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-on-surface font-medium">Fees:</label>
            <input
              type="number"
              name="fees"
              value={formData.fees}
              onChange={handleChange}
              className="w-full p-2 bg-surface border border-card-stroke rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-on-surface font-medium">Notes:</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-2 bg-surface border border-card-stroke rounded text-on-surface min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-on-surface font-medium">Strategy:</label>
            <input
  className="w-full p-2 bg-surface border border-card-stroke rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"              type="number"
              name="strategy_id"
              value={formData.strategy_id || ''}
              onChange={handleChange}
              
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-on-surface font-medium">Market Conditions:</label>
            <textarea
  className="w-full p-2 bg-surface border border-card-stroke rounded text-on-surface min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"              name="market_conditions"
              value={formData.market_conditions || ''}
              onChange={handleChange}
              
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-on-surface font-medium">Setup Description:</label>
            <textarea
  className="w-full p-2 bg-surface border border-card-stroke rounded text-on-surface min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"              name="setup_description"
              value={formData.setup_description || ''}
              onChange={handleChange}
              
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-on-surface font-medium">Reasoning:</label>
            <textarea
  className="w-full p-2 bg-surface border border-card-stroke rounded text-on-surface min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"              name="reasoning"
              value={formData.reasoning || ''}
              onChange={handleChange}
              
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-on-surface font-medium">Lessons Learned:</label>
            <textarea
              name="lessons_learned"
              value={formData.lessons_learned || ''}
              onChange={handleChange}
              className="w-full p-2 bg-surface border border-card-stroke rounded text-on-surface min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-on-surface font-medium">R-Multiple Initial Risk:</label>
            <input
              type="number"
              name="r_multiple_initial_risk"
              value={formData.r_multiple_initial_risk || ''}
              onChange={handleChange}
              className="w-full p-2 bg-surface border border-card-stroke rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {availableEmotions.length > 0 && (
            <div className="mb-4">
              <label className="block mb-1 text-on-surface font-medium">Emotions:</label>
              <div className="flex flex-wrap gap-3">
                {availableEmotions.map(emotion => (
                  <label key={emotion.emotion_id} className="flex items-center text-on-surface">
                    <input
                      type="checkbox"
                      checked={selectedEmotions.includes(emotion.emotion_id)}
                      onChange={() => handleEmotionChange(emotion.emotion_id)}
                      className="mr-2 accent-blue-500"
                    />
                    {emotion.emotion_name}
                  </label>
                ))}
              </div>
            </div>
          )}
        <div className="flex flex-col gap-2 w-full sm:flex-row sm:gap-3 sm:w-auto mt-6 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 bg-surface text-on-surface rounded hover:bg-surface/80 transition-colors font-semibold border border-card-stroke w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-2 px-4 bg-primary text-on-primary rounded hover:bg-primary/90 transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
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