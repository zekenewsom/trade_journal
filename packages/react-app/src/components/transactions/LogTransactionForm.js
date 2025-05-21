import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// File: zekenewsom-trade_journal/packages/react-app/src/components/transactions/LogTransactionForm.tsx
// New file for Stage 5
import { useState } from 'react';
const getInitialFormData = () => {
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
        strategy_id: undefined,
        market_conditions: undefined,
        setup_description: undefined,
        reasoning: undefined,
        lessons_learned: undefined,
        r_multiple_initial_risk: undefined,
        emotion_ids: []
    };
};
const LogTransactionForm = ({ onSubmit, onCancel, availableEmotions, initialValues }) => {
    const [formData, setFormData] = useState(() => ({
        ...getInitialFormData(),
        instrument_ticker: initialValues?.instrument_ticker || '',
        asset_class: initialValues?.asset_class || null,
        exchange: initialValues?.exchange || ''
    }));
    const [errors, setErrors] = useState({});
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.instrument_ticker.trim())
            newErrors.instrument_ticker = 'Instrument/Ticker is required.';
        if (!formData.exchange.trim())
            newErrors.exchange = 'Exchange is required.';
        if (!formData.action)
            newErrors.action = 'Action (Buy/Sell) is required.';
        if (!formData.datetime)
            newErrors.datetime = 'Date/Time is required.';
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
    const handleSubmit = async (e) => {
        console.log('[DEBUG] LogTransactionForm handleSubmit', formData);
        e.preventDefault();
        if (submitting)
            return; // Prevent double submission
        if (!validateForm())
            return;
        setSubmitting(true);
        try {
            const payload = {
                instrument_ticker: formData.instrument_ticker.toUpperCase().trim(),
                asset_class: formData.asset_class,
                exchange: formData.exchange.trim(),
                action: formData.action,
                datetime: formData.datetime,
                quantity: parseFloat(formData.quantity),
                price: parseFloat(formData.price),
                fees_for_transaction: parseFloat(formData.fees),
                notes_for_transaction: formData.notes || null,
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
                setFormData(getInitialFormData()); // Reset form with current date/time
                if (onSubmit)
                    await onSubmit(formData);
            }
            else {
                setSubmissionStatus({ message: `Error: ${result.message}`, type: 'error' });
            }
        }
        catch (err) {
            console.error('Error logging transaction:', err);
            setSubmissionStatus({ message: `Error: ${err.message}`, type: 'error' });
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-6 max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow", noValidate: true, children: [_jsxs("div", { className: "flex flex-col gap-1 text-left", children: [_jsx("label", { htmlFor: "instrument_ticker", className: "font-medium", children: "Instrument/Ticker:" }), _jsx("input", { type: "text", id: "instrument_ticker", name: "instrument_ticker", value: formData.instrument_ticker, onChange: handleInputChange, className: "p-2 border border-gray-600 rounded bg-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500", required: true }), errors.instrument_ticker && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.instrument_ticker })] }), _jsxs("div", { className: "flex flex-col gap-1 text-left", children: [_jsx("label", { htmlFor: "asset_class", className: "font-medium", children: "Asset Class:" }), _jsxs("select", { id: "asset_class", name: "asset_class", value: formData.asset_class || '', onChange: handleInputChange, className: "p-2 border border-gray-600 rounded bg-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500", required: true, children: [_jsx("option", { value: "", children: "Select Asset Class" }), _jsx("option", { value: "Stock", children: "Stock" }), _jsx("option", { value: "Cryptocurrency", children: "Cryptocurrency" })] }), errors.asset_class && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.asset_class })] }), _jsxs("div", { className: "flex flex-col gap-1 text-left", children: [_jsx("label", { htmlFor: "exchange", className: "font-medium", children: "Exchange:" }), _jsx("input", { type: "text", id: "exchange", name: "exchange", value: formData.exchange, onChange: handleInputChange, className: "p-2 border border-gray-600 rounded bg-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "e.g., NYSE, Binance", required: true }), errors.exchange && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.exchange })] }), _jsxs("div", { className: "flex flex-col gap-1 text-left", children: [_jsx("label", { htmlFor: "action", className: "font-medium", children: "Action:" }), _jsxs("select", { id: "action", name: "action", value: formData.action, onChange: handleInputChange, className: "p-2 border border-gray-600 rounded bg-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500", required: true, children: [_jsx("option", { value: "", children: "Select Action" }), _jsx("option", { value: "Buy", children: "Buy" }), _jsx("option", { value: "Sell", children: "Sell" })] }), errors.action && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.action })] }), _jsxs("div", { className: "flex flex-col gap-1 text-left", children: [_jsx("label", { htmlFor: "datetime", className: "font-medium", children: "Date/Time:" }), _jsx("input", { type: "datetime-local", id: "datetime", name: "datetime", value: formData.datetime, onChange: handleInputChange, className: "p-2 border border-gray-600 rounded bg-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500", required: true }), errors.datetime && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.datetime })] }), _jsxs("div", { className: "flex flex-col gap-1 text-left", children: [_jsx("label", { htmlFor: "quantity", className: "font-medium", children: "Quantity:" }), _jsx("input", { type: "number", step: "any", min: "0.00000001", id: "quantity", name: "quantity", value: formData.quantity, onChange: handleInputChange, className: "p-2 border border-gray-600 rounded bg-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500", required: true }), errors.quantity && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.quantity })] }), _jsxs("div", { className: "flex flex-col gap-1 text-left", children: [_jsx("label", { htmlFor: "price", className: "font-medium", children: "Price:" }), _jsx("input", { type: "number", step: "any", min: "0.00000001", id: "price", name: "price", value: formData.price, onChange: handleInputChange, className: "p-2 border border-gray-600 rounded bg-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500", required: true }), errors.price && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.price })] }), _jsxs("div", { className: "flex flex-col gap-1 text-left", children: [_jsx("label", { htmlFor: "fees", className: "font-medium", children: "Fees (for this transaction):" }), _jsx("input", { type: "number", step: "any", min: "0", id: "fees", name: "fees", value: formData.fees, onChange: handleInputChange, className: "p-2 border border-gray-600 rounded bg-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500" }), errors.fees && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.fees })] }), _jsxs("div", { className: "flex flex-col gap-1 text-left", children: [_jsx("label", { htmlFor: "notes", className: "font-medium", children: "Notes (Optional):" }), _jsx("textarea", { id: "notes", name: "notes", value: formData.notes, onChange: handleInputChange, className: "p-2 border border-gray-600 rounded bg-gray-700 text-white w-full min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsx("button", { type: "submit", className: "py-2 px-4 bg-blue-400 text-black rounded hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-semibold", disabled: submitting, children: submitting ? 'Logging…' : 'Log Transaction' }), submissionStatus && (_jsx("div", { className: `py-2 mt-4 rounded text-white text-center ${submissionStatus.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`, children: submissionStatus.message }))] }));
};
export default LogTransactionForm;
