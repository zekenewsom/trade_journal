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
  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#2a2f36',
    borderRadius: '8px',
    color: '#fff'
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px',
    backgroundColor: '#1a1f26',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#fff',
    width: '100%'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#61dafb'
  };

  const emotionsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem'
  };

  const emotionButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '0.5rem 1rem',
    backgroundColor: isSelected ? '#61dafb' : '#1a1f26',
    border: '1px solid #444',
    borderRadius: '4px',
    color: isSelected ? '#000' : '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  return (
    <form style={formStyle}>
      <div>
        <label style={labelStyle}>Strategy</label>
        <select
          name="strategy_id"
          value={formData.strategy_id !== undefined && formData.strategy_id !== null ? String(formData.strategy_id) : ''}
          onChange={onFormChange}
          style={inputStyle}
        >
          <option value="">Select Strategy</option>
          {/* Add strategy options here */}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Market Conditions</label>
        <textarea
          name="market_conditions"
          value={formData.market_conditions || ''}
          onChange={onFormChange}
          style={{...inputStyle, minHeight: '100px'}}
          placeholder="Describe the market conditions during this trade..."
        />
      </div>

      <div>
        <label style={labelStyle}>Setup Description</label>
        <textarea
          name="setup_description"
          value={formData.setup_description || ''}
          onChange={onFormChange}
          style={{...inputStyle, minHeight: '100px'}}
          placeholder="Describe the trade setup..."
        />
      </div>

      <div>
        <label style={labelStyle}>Reasoning</label>
        <textarea
          name="reasoning"
          value={formData.reasoning || ''}
          onChange={onFormChange}
          style={{...inputStyle, minHeight: '100px'}}
          placeholder="Explain your reasoning for taking this trade..."
        />
      </div>

      <div>
        <label style={labelStyle}>Lessons Learned</label>
        <textarea
          name="lessons_learned"
          value={formData.lessons_learned || ''}
          onChange={onFormChange}
          style={{...inputStyle, minHeight: '100px'}}
          placeholder="What did you learn from this trade?"
        />
      </div>

      <div>
        <label style={labelStyle}>Initial Risk (R-Multiple)</label>
        <input
          type="number"
          name="r_multiple_initial_risk"
          value={formData.r_multiple_initial_risk !== undefined && formData.r_multiple_initial_risk !== null ? String(formData.r_multiple_initial_risk) : ''}
          onChange={onFormChange}
          style={inputStyle}
          placeholder="Enter initial risk in R-multiples"
          step="0.1"
        />
      </div>

      <div>
        <label style={labelStyle}>Emotions</label>
        <div style={emotionsContainerStyle}>
          {availableEmotions.map(emotion => (
            <button
              key={emotion.emotion_id}
              type="button"
              onClick={() => onEmotionChange(emotion.emotion_id)}
              style={emotionButtonStyle((formData.emotion_ids || []).includes(emotion.emotion_id))}
            >
              {emotion.emotion_name}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
};

export default TradeMetadataForm; 