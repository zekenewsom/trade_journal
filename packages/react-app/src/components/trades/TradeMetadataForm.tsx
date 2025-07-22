// File: zekenewsom-trade_journal/packages/react-app/src/components/trades/TradeMetadataForm.tsx
// New component for editing trade metadata and emotions

import React from 'react';
import type { EditTradeDetailsFormData, EmotionRecord } from '../../types';
import AutocompleteTextarea from '../common/AutocompleteTextarea';

interface TradeMetadataFormProps {
  formData: Partial<EditTradeDetailsFormData>;
  availableEmotions: EmotionRecord[];
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onEmotionChange: (emotionId: number) => void;
}

// Helper function to adapt textarea events to the generic handler
const adaptTextareaEvent = (
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  onFormChange(e as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>);
};

const TradeMetadataForm: React.FC<TradeMetadataFormProps> = ({
  formData,
  availableEmotions,
  onFormChange,
  onEmotionChange
}) => {
  const handleTextareaChange = adaptTextareaEvent(onFormChange);
  
  return (
    <form className="flex flex-col gap-4 p-4 bg-surface rounded-2xl text-on-surface w-full">

      <div className="flex flex-col gap-1 text-left">
        <label className="block mb-1 text-accent text-sm font-medium">Strategy</label>
        <select
          name="strategy_id"
          value={formData.strategy_id !== undefined && formData.strategy_id !== null ? String(formData.strategy_id) : ''}
          onChange={onFormChange}
          className="p-2 border border-card-stroke rounded bg-surface-variant text-on-surface w-full focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select Strategy</option>
          {/* Add strategy options here */}
        </select>
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="block mb-1 text-accent text-sm font-medium">Market Conditions</label>
        <AutocompleteTextarea
          id="market_conditions"
          name="market_conditions"
          value={formData.market_conditions || ''}
          onChange={handleTextareaChange}
          field="market_conditions"
          className="p-2 border border-card-stroke rounded bg-surface-variant text-on-surface w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Describe the market conditions during this trade..."
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="block mb-1 text-accent text-sm font-medium">Setup Description</label>
        <AutocompleteTextarea
          id="setup_description"
          name="setup_description"
          value={formData.setup_description || ''}
          onChange={handleTextareaChange}
          field="setup_description"
          className="p-2 border border-card-stroke rounded bg-surface-variant text-on-surface w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Describe the trade setup..."
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="block mb-1 text-accent text-sm font-medium">Trade Thesis Summary</label>
        <textarea
          name="reasoning"
          value={formData.reasoning || ''}
          onChange={onFormChange}
          className="p-2 border border-card-stroke rounded bg-surface-variant text-on-surface w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Summarize your trade thesis for this trade..."
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="block mb-1 text-accent text-sm font-medium">Lessons Learned</label>
        <textarea
          name="lessons_learned"
          value={formData.lessons_learned || ''}
          onChange={onFormChange}
          className="p-2 border border-card-stroke rounded bg-surface-variant text-on-surface w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="What did you learn from this trade?"
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="block mb-1 text-accent text-sm font-medium">Initial Risk (R-Multiple)</label>
        <input
          type="number"
          name="r_multiple_initial_risk"
          value={formData.r_multiple_initial_risk !== undefined && formData.r_multiple_initial_risk !== null ? String(formData.r_multiple_initial_risk) : ''}
          onChange={onFormChange}
          className="p-2 border border-card-stroke rounded bg-surface-variant text-on-surface w-full focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter initial risk in R-multiples"
          step="0.1"
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="block mb-1 text-accent text-sm font-medium">Conviction Score (1-10)</label>
        <input
          type="range"
          name="conviction_score"
          min={1}
          max={10}
          value={formData.conviction_score ?? 5}
          onChange={onFormChange}
          className="w-full"
        />
        <span className="text-sm text-on-surface">{formData.conviction_score ?? 5}</span>
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="block mb-1 text-accent text-sm font-medium">Thesis Validation</label>
        <select
          name="thesis_validation"
          value={formData.thesis_validation || ''}
          onChange={onFormChange}
          className="p-2 border border-card-stroke rounded bg-surface-variant text-on-surface w-full focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select</option>
          <option value="Correct">Correct</option>
          <option value="Partially Correct">Partially Correct</option>
          <option value="Incorrect">Incorrect</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="block mb-1 text-accent text-sm font-medium">Adherence to Plan</label>
        <select
          name="adherence_to_plan"
          value={formData.adherence_to_plan || ''}
          onChange={onFormChange}
          className="p-2 border border-card-stroke rounded bg-surface-variant text-on-surface w-full focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="block mb-1 text-accent text-sm font-medium">Unforeseen Events (if any)</label>
        <textarea
          name="unforeseen_events"
          value={formData.unforeseen_events || ''}
          onChange={onFormChange}
          className="p-2 border border-card-stroke rounded bg-surface-variant text-on-surface w-full min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Describe any unexpected events that affected the trade..."
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="block mb-1 text-accent text-sm font-medium">Overall Trade Rating (1-10)</label>
        <input
          type="range"
          name="overall_trade_rating"
          min={1}
          max={10}
          value={formData.overall_trade_rating ?? 5}
          onChange={onFormChange}
          className="w-full"
        />
        <span className="text-sm text-on-surface">{formData.overall_trade_rating ?? 5}</span>
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="block mb-1 text-accent text-sm font-medium">Emotions</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {availableEmotions.map(emotion => {
            const isSelected = (formData.emotion_ids || []).includes(emotion.emotion_id);
            return (
              <button
                key={emotion.emotion_id}
                type="button"
                onClick={() => onEmotionChange(emotion.emotion_id)}
                className={`px-4 py-2 rounded border border-card-stroke transition-colors focus:outline-none focus:ring-2 focus:ring-primary font-medium text-sm ${isSelected ? 'bg-accent text-black' : 'bg-surface-variant text-on-surface hover:bg-accent/20'}`}
              >
                {emotion.emotion_name}
              </button>
            );
          })}
        </div>
      </div>
    </form>
  );
};

export default TradeMetadataForm; 