import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const TradeMetadataForm = ({ formData, availableEmotions, onFormChange, onEmotionChange }) => {
    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#2a2f36',
        borderRadius: '8px',
        color: '#fff'
    };
    const inputStyle = {
        padding: '8px',
        backgroundColor: '#1a1f26',
        border: '1px solid #444',
        borderRadius: '4px',
        color: '#fff',
        width: '100%'
    };
    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        color: '#61dafb'
    };
    const emotionsContainerStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.5rem'
    };
    const emotionButtonStyle = (isSelected) => ({
        padding: '0.5rem 1rem',
        backgroundColor: isSelected ? '#61dafb' : '#1a1f26',
        border: '1px solid #444',
        borderRadius: '4px',
        color: isSelected ? '#000' : '#fff',
        cursor: 'pointer',
        transition: 'all 0.2s'
    });
    return (_jsxs("form", { style: formStyle, children: [_jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Strategy" }), _jsx("select", { name: "strategy_id", value: formData.strategy_id !== undefined && formData.strategy_id !== null ? String(formData.strategy_id) : '', onChange: onFormChange, style: inputStyle, children: _jsx("option", { value: "", children: "Select Strategy" }) })] }), _jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Market Conditions" }), _jsx("textarea", { name: "market_conditions", value: formData.market_conditions || '', onChange: onFormChange, style: { ...inputStyle, minHeight: '100px' }, placeholder: "Describe the market conditions during this trade..." })] }), _jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Setup Description" }), _jsx("textarea", { name: "setup_description", value: formData.setup_description || '', onChange: onFormChange, style: { ...inputStyle, minHeight: '100px' }, placeholder: "Describe the trade setup..." })] }), _jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Reasoning" }), _jsx("textarea", { name: "reasoning", value: formData.reasoning || '', onChange: onFormChange, style: { ...inputStyle, minHeight: '100px' }, placeholder: "Explain your reasoning for taking this trade..." })] }), _jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Lessons Learned" }), _jsx("textarea", { name: "lessons_learned", value: formData.lessons_learned || '', onChange: onFormChange, style: { ...inputStyle, minHeight: '100px' }, placeholder: "What did you learn from this trade?" })] }), _jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Initial Risk (R-Multiple)" }), _jsx("input", { type: "number", name: "r_multiple_initial_risk", value: formData.r_multiple_initial_risk !== undefined && formData.r_multiple_initial_risk !== null ? String(formData.r_multiple_initial_risk) : '', onChange: onFormChange, style: inputStyle, placeholder: "Enter initial risk in R-multiples", step: "0.1" })] }), _jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Emotions" }), _jsx("div", { style: emotionsContainerStyle, children: availableEmotions.map(emotion => (_jsx("button", { type: "button", onClick: () => onEmotionChange(emotion.emotion_id), style: emotionButtonStyle((formData.emotion_ids || []).includes(emotion.emotion_id)), children: emotion.emotion_name }, emotion.emotion_id))) })] })] }));
};
export default TradeMetadataForm;
