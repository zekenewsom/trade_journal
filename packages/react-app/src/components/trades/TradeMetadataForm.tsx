// File: zekenewsom-trade_journal/packages/react-app/src/components/trades/TradeMetadataForm.tsx
// New component for editing trade metadata and emotions

import React from 'react';
import type { EditTradeDetailsFormData, EmotionRecord } from '../../types';

interface TradeMetadataFormProps {
  formData: Partial<EditTradeDetailsFormData>;
  availableEmotions: EmotionRecord[];
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onEmotionChange: (emotionId: number) => void;
}

const TradeMetadataForm: React.FC<TradeMetadataFormProps> = ({
  formData,
  availableEmotions,
  onFormChange,
  onEmotionChange
}) => {
  return (
    <form className="flex flex-col gap-4 p-4 bg-surface rounded-2xl text-on-surface">

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
        <textarea
          name="market_conditions"
          value={formData.market_conditions || ''}
          onChange={onFormChange}
          className="p-2 border border-card-stroke rounded bg-surface-variant text-on-surface w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Describe the market conditions during this trade..."
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="block mb-1 text-accent text-sm font-medium">Setup Description</label>
        <textarea
          name="setup_description"
          value={formData.setup_description || ''}
          onChange={onFormChange}
          className="p-2 border border-card-stroke rounded bg-surface-variant text-on-surface w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Describe the trade setup..."
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="block mb-1 text-accent text-sm font-medium">Reasoning</label>
        <textarea
          name="reasoning"
          value={formData.reasoning || ''}
          onChange={onFormChange}
          className="p-2 border border-card-stroke rounded bg-surface-variant text-on-surface w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Explain your reasoning for taking this trade..."
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