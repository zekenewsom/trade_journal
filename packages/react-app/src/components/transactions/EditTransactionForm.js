import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// File: zekenewsom-trade_journal/packages/react-app/src/components/transactions/EditTransactionForm.tsx
// New file for Stage 5 - A small form for editing a single transaction (e.g., in a modal)
import { useState } from 'react';
const EditTransactionForm = ({ transaction, onSave, onCancel, availableEmotions = [] }) => {
    const [formData, setFormData] = useState(transaction);
    const [selectedEmotions, setSelectedEmotions] = useState(transaction.emotion_ids || []);
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'strategy_id' || name === 'r_multiple_initial_risk') {
            const numValue = value === '' ? undefined : Number(value);
            setFormData(prev => ({
                ...prev,
                [name]: numValue
            }));
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
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            emotion_ids: selectedEmotions
        });
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50", children: _jsxs("div", { className: "bg-gray-800 p-6 rounded-lg w-[90%] max-w-xl max-h-[90vh] overflow-y-auto shadow-lg", children: [_jsx("h2", { className: "text-white text-2xl font-bold mb-6", children: "Edit Transaction" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-gray-200 font-medium", children: "Quantity:" }), _jsx("input", { className: "w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500", type: "number", name: "quantity", value: formData.quantity, onChange: handleChange, style: {
                                        width: '100%',
                                        padding: '8px',
                                        backgroundColor: '#1a1d21',
                                        border: '1px solid #444',
                                        borderRadius: '4px',
                                        color: '#fff'
                                    }, required: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-gray-200 font-medium", children: "Price:" }), _jsx("input", { className: "w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500", type: "number", name: "price", value: formData.price, onChange: handleChange, style: {
                                        width: '100%',
                                        padding: '8px',
                                        backgroundColor: '#1a1d21',
                                        border: '1px solid #444',
                                        borderRadius: '4px',
                                        color: '#fff'
                                    }, required: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-gray-200 font-medium", children: "Date/Time:" }), _jsx("input", { className: "w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500", type: "datetime-local", name: "datetime", value: formData.datetime, onChange: handleChange, style: {
                                        width: '100%',
                                        padding: '8px',
                                        backgroundColor: '#1a1d21',
                                        border: '1px solid #444',
                                        borderRadius: '4px',
                                        color: '#fff'
                                    }, required: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-gray-200 font-medium", children: "Fees:" }), _jsx("input", { type: "number", name: "fees", value: formData.fees, onChange: handleChange, className: "w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-gray-200 font-medium", children: "Notes:" }), _jsx("textarea", { name: "notes", value: formData.notes, onChange: handleChange, className: "w-full p-2 bg-gray-700 border border-gray-600 rounded text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-gray-200 font-medium", children: "Strategy:" }), _jsx("input", { className: "w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500", type: "number", name: "strategy_id", value: formData.strategy_id || '', onChange: handleChange, style: {
                                        width: '100%',
                                        padding: '8px',
                                        backgroundColor: '#1a1d21',
                                        border: '1px solid #444',
                                        borderRadius: '4px',
                                        color: '#fff'
                                    } })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-gray-200 font-medium", children: "Market Conditions:" }), _jsx("textarea", { className: "w-full p-2 bg-gray-700 border border-gray-600 rounded text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500", name: "market_conditions", value: formData.market_conditions || '', onChange: handleChange, style: {
                                        width: '100%',
                                        padding: '8px',
                                        backgroundColor: '#1a1d21',
                                        border: '1px solid #444',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        minHeight: '100px'
                                    } })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-gray-200 font-medium", children: "Setup Description:" }), _jsx("textarea", { className: "w-full p-2 bg-gray-700 border border-gray-600 rounded text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500", name: "setup_description", value: formData.setup_description || '', onChange: handleChange, style: {
                                        width: '100%',
                                        padding: '8px',
                                        backgroundColor: '#1a1d21',
                                        border: '1px solid #444',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        minHeight: '100px'
                                    } })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-gray-200 font-medium", children: "Reasoning:" }), _jsx("textarea", { className: "w-full p-2 bg-gray-700 border border-gray-600 rounded text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500", name: "reasoning", value: formData.reasoning || '', onChange: handleChange, style: {
                                        width: '100%',
                                        padding: '8px',
                                        backgroundColor: '#1a1d21',
                                        border: '1px solid #444',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        minHeight: '100px'
                                    } })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-gray-200 font-medium", children: "Lessons Learned:" }), _jsx("textarea", { name: "lessons_learned", value: formData.lessons_learned || '', onChange: handleChange, className: "w-full p-2 bg-gray-700 border border-gray-600 rounded text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-gray-200 font-medium", children: "R-Multiple Initial Risk:" }), _jsx("input", { type: "number", name: "r_multiple_initial_risk", value: formData.r_multiple_initial_risk || '', onChange: handleChange, className: "w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), availableEmotions.length > 0 && (_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 text-gray-200 font-medium", children: "Emotions:" }), _jsx("div", { className: "flex flex-wrap gap-3", children: availableEmotions.map(emotion => (_jsxs("label", { className: "flex items-center text-gray-200", children: [_jsx("input", { type: "checkbox", checked: selectedEmotions.includes(emotion.emotion_id), onChange: () => handleEmotionChange(emotion.emotion_id), className: "mr-2 accent-blue-500" }), emotion.emotion_name] }, emotion.emotion_id))) })] })), _jsxs("div", { className: "flex gap-3 mt-6 justify-end", children: [_jsx("button", { type: "button", onClick: onCancel, className: "py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-semibold", children: "Cancel" }), _jsx("button", { type: "submit", className: "py-2 px-4 bg-blue-400 text-black rounded hover:bg-blue-500 transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed", children: "Save" })] })] })] }) }));
};
export default EditTransactionForm;
