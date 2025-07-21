import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// File: zekenewsom-trade_journal/packages/react-app/src/components/transactions/EditTransactionForm.tsx
// New file for Stage 5 - A small form for editing a single transaction (e.g., in a modal)
import { useState } from 'react';
const EditTransactionForm = ({ transaction, onSave, onCancel, availableEmotions = [] }) => {
    const [formData, setFormData] = useState(transaction);
    const [selectedEmotions, setSelectedEmotions] = useState(transaction.emotion_ids || []);
    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'strategy_id' || name === 'r_multiple_initial_risk') {
            const numValue = value === '' ? undefined : Number(value);
            if (numValue === undefined || !isNaN(numValue)) {
                setFormData(prev => ({
                    ...prev,
                    [name]: numValue
                }));
            }
            // If NaN, do not update the state
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    const handleEmotionChange = (emotionId) => {
        setSelectedEmotions(prev => {
            if (prev.includes(emotionId)) {
                return prev.filter(id => id !== emotionId);
            }
            else {
                return [...prev, emotionId];
            }
        });
    };
    const validateForm = () => {
        const newErrors = {};
        // Required: quantity
        const quantityStr = String(formData.quantity).trim();
        const quantityNum = parseFloat(quantityStr);
        if (!quantityStr || isNaN(quantityNum) || quantityNum <= 0) {
            newErrors.quantity = 'Valid positive quantity is required.';
        }
        // Required: price
        const priceStr = String(formData.price).trim();
        const priceNum = parseFloat(priceStr);
        if (!priceStr || isNaN(priceNum) || priceNum <= 0) {
            newErrors.price = 'Valid positive price is required.';
        }
        // Required: datetime
        if (!formData.datetime || String(formData.datetime).trim() === '') {
            newErrors.datetime = 'Date/Time is required.';
        }
        // Optionally require at least one emotion
        // if (selectedEmotions.length === 0) {
        //     newErrors.emotions = 'Select at least one emotion.';
        // }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        onSave({
            ...formData,
            emotion_ids: selectedEmotions
        });
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50", children: _jsxs("div", { className: "bg-surface p-6 rounded-2xl w-[90%] max-w-xl max-h-[90vh] overflow-y-auto shadow-elevation-2 border border-card-stroke", children: [_jsx("h2", { className: "text-on-surface text-2xl font-bold mb-6", children: "Edit Transaction" }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4 w-full", children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-on-surface font-medium", children: "Quantity:" }), _jsx("input", { className: "w-full p-2 bg-surface border border-card-stroke rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary", type: "number", name: "quantity", value: formData.quantity, onChange: handleChange, required: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-on-surface font-medium", children: "Price:" }), _jsx("input", { className: "w-full p-2 bg-surface border border-card-stroke rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary", type: "number", name: "price", value: formData.price, onChange: handleChange, required: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-on-surface font-medium", children: "Date/Time:" }), _jsx("input", { className: "w-full p-2 bg-surface border border-card-stroke rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary", type: "datetime-local", name: "datetime", value: formData.datetime, onChange: handleChange, required: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-on-surface font-medium", children: "Fees:" }), _jsx("input", { type: "number", name: "fees", value: formData.fees, onChange: handleChange, className: "w-full p-2 bg-surface border border-card-stroke rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-on-surface font-medium", children: "Notes:" }), _jsx("textarea", { name: "notes", value: formData.notes, onChange: handleChange, className: "w-full p-2 bg-surface border border-card-stroke rounded text-on-surface min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-on-surface font-medium", children: "Strategy:" }), _jsx("input", { className: "w-full p-2 bg-surface border border-card-stroke rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary", type: "number", name: "strategy_id", value: formData.strategy_id || '', onChange: handleChange })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-on-surface font-medium", children: "Market Conditions:" }), _jsx("textarea", { className: "w-full p-2 bg-surface border border-card-stroke rounded text-on-surface min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary", name: "market_conditions", value: formData.market_conditions || '', onChange: handleChange })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-on-surface font-medium", children: "Setup Description:" }), _jsx("textarea", { className: "w-full p-2 bg-surface border border-card-stroke rounded text-on-surface min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary", name: "setup_description", value: formData.setup_description || '', onChange: handleChange })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-on-surface font-medium", children: "Reasoning:" }), _jsx("textarea", { className: "w-full p-2 bg-surface border border-card-stroke rounded text-on-surface min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary", name: "reasoning", value: formData.reasoning || '', onChange: handleChange })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-on-surface font-medium", children: "Lessons Learned:" }), _jsx("textarea", { name: "lessons_learned", value: formData.lessons_learned || '', onChange: handleChange, className: "w-full p-2 bg-surface border border-card-stroke rounded text-on-surface min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-on-surface font-medium", children: "R-Multiple Initial Risk:" }), _jsx("input", { type: "number", name: "r_multiple_initial_risk", value: formData.r_multiple_initial_risk || '', onChange: handleChange, className: "w-full p-2 bg-surface border border-card-stroke rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" })] }), availableEmotions.length > 0 && (_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-on-surface font-medium", children: "Emotions:" }), _jsx("div", { className: "flex flex-wrap gap-3", children: availableEmotions.map(emotion => (_jsxs("label", { className: "flex items-center text-on-surface", children: [_jsx("input", { type: "checkbox", checked: selectedEmotions.includes(emotion.emotion_id), onChange: () => handleEmotionChange(emotion.emotion_id), className: "mr-2 accent-blue-500" }), emotion.emotion_name] }, emotion.emotion_id))) })] })), _jsxs("div", { className: "flex flex-col gap-2 w-full sm:flex-row sm:gap-3 sm:w-auto mt-6 justify-end", children: [_jsx("button", { type: "button", onClick: onCancel, className: "py-2 px-4 bg-surface text-on-surface rounded hover:bg-surface/80 transition-colors font-semibold border border-card-stroke w-full sm:w-auto", children: "Cancel" }), _jsx("button", { type: "submit", className: "py-2 px-4 bg-primary text-on-primary rounded hover:bg-primary/90 transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto", children: "Save" })] })] })] }) }));
};
export default EditTransactionForm;
