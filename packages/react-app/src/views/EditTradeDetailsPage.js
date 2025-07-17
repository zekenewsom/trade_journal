import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// File: zekenewsom-trade_journal/packages/react-app/src/views/EditTradeDetailsPage.tsx
// Modified for Stage 6: Add Emotion Tagging UI
import { useState, useEffect } from 'react';
import EditTransactionForm from '../components/transactions/EditTransactionForm';
import { useAppStore } from '../stores/appStore';
const EditTradeDetailsPage = ({ tradeId, onCancel, onLogTransaction }) => {
    const { availableEmotions, isLoadingInitialData, errorLoadingInitialData } = useAppStore();
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [fullTrade, setFullTrade] = useState(null);
    // Mark-to-market state
    const [markToMarket, setMarkToMarket] = useState(null);
    const [markPriceInput, setMarkPriceInput] = useState('');
    // Fetch full trade details (with transactions) on mount or when tradeId changes
    useEffect(() => {
        (async () => {
            const trade = await window.electronAPI.getTradeWithTransactions(tradeId);
            setFullTrade(trade);
            if (trade) {
                setMarkToMarket({
                    mark_price: trade.current_market_price ?? undefined,
                    unrealized_pnl: trade.unrealized_pnl ?? undefined,
                    current_open_quantity: trade.current_open_quantity ?? undefined,
                    average_open_price: trade.average_open_price ?? undefined
                });
                setMarkPriceInput(trade.current_market_price ? String(trade.current_market_price) : '');
            }
        })();
    }, [tradeId]);
    const handleEditTransactionClick = (transaction) => {
        // Convert TransactionRecord to EditTransactionFormData
        const formData = {
            transaction_id: transaction.transaction_id,
            trade_id: transaction.trade_id,
            action: transaction.action,
            quantity: String(transaction.quantity),
            price: String(transaction.price),
            datetime: new Date(transaction.datetime).toISOString().slice(0, 16), // Format for datetime-local input
            fees: String(transaction.fees || '0'),
            notes: transaction.notes || '',
            strategy_id: transaction.strategy_id ? String(transaction.strategy_id) : undefined,
            market_conditions: transaction.market_conditions || undefined,
            setup_description: transaction.setup_description || undefined,
            reasoning: transaction.reasoning || undefined,
            lessons_learned: transaction.lessons_learned || undefined,
            r_multiple_initial_risk: transaction.r_multiple_initial_risk ? String(transaction.r_multiple_initial_risk) : undefined,
            emotion_ids: transaction.emotion_ids || []
        };
        setEditingTransaction(formData);
    };
    const handleDeleteTransaction = async (transactionId) => {
        try {
            const result = await window.electronAPI.deleteSingleTransaction(transactionId);
            if (result.success) {
                const trade = await window.electronAPI.getTradeWithTransactions(tradeId);
                setFullTrade(trade);
                // Trades list will refresh automatically via Zustand store
            }
            else {
                alert(result.message || 'Failed to delete transaction');
            }
        }
        catch (err) {
            alert('Error deleting transaction: ' + err.message);
        }
    };
    const handleSaveEditedTransaction = async (data) => {
        try {
            // Convert EditTransactionFormData to UpdateTransactionPayload
            const payload = {
                transaction_id: data.transaction_id,
                quantity: parseFloat(data.quantity),
                price: parseFloat(data.price),
                datetime: data.datetime,
                fees: parseFloat(data.fees),
                notes: data.notes || null,
                strategy_id: data.strategy_id ? parseInt(data.strategy_id) : undefined,
                market_conditions: data.market_conditions,
                setup_description: data.setup_description,
                reasoning: data.reasoning,
                lessons_learned: data.lessons_learned,
                r_multiple_initial_risk: data.r_multiple_initial_risk ? parseFloat(data.r_multiple_initial_risk) : undefined,
                emotion_ids: data.emotion_ids || []
            };
            const result = await window.electronAPI.updateSingleTransaction(payload);
            if (result.success) {
                setEditingTransaction(null);
                // Trades list will refresh automatically via Zustand store
                const trade = await window.electronAPI.getTradeWithTransactions(tradeId);
                setFullTrade(trade);
            }
            else {
                alert(result.message || 'Failed to update transaction');
            }
        }
        catch (err) {
            console.error('Error updating transaction:', err);
            alert('Error updating transaction: ' + err.message);
        }
    };
    if (isLoadingInitialData)
        return _jsx("p", { className: "text-gray-300", children: "Loading trade details..." });
    if (errorLoadingInitialData)
        return _jsx("p", { className: "text-red-500", children: errorLoadingInitialData });
    if (!fullTrade)
        return _jsx("p", { className: "text-gray-400", children: "Trade data not available or invalid ID." });
    return (_jsxs("div", { className: "p-6 max-w-3xl mx-auto text-gray-100", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Trade Details" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: onLogTransaction, className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors", children: "Log Transaction" }), _jsx("button", { onClick: onCancel, className: "px-4 py-2 bg-gray-700 text-white rounded hover:bg-blue-600 transition-colors", children: "Back to Trades List" })] }), _jsxs("span", { className: "text-gray-400", children: ["Trade ID: ", fullTrade.trade_id] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("span", { className: "text-lg font-semibold mr-4", children: fullTrade.instrument_ticker }), _jsx("span", { className: "mr-4", children: fullTrade.asset_class }), _jsx("span", { className: "mr-4", children: fullTrade.exchange }), _jsx("span", { className: "mr-4", children: fullTrade.trade_direction }), _jsxs("span", { className: "mr-4", children: ["Status: ", fullTrade.status] }), _jsxs("span", { children: ["Opened: ", fullTrade.open_datetime ? new Date(fullTrade.open_datetime).toLocaleString() : 'N/A'] })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("span", { className: "mr-4", children: ["Avg Open Price: ", fullTrade.average_open_price !== null && fullTrade.average_open_price !== undefined ? fullTrade.average_open_price.toFixed(4) : 'N/A'] }), _jsxs("span", { className: "mr-4", children: ["Open Qty: ", fullTrade.current_open_quantity !== null && fullTrade.current_open_quantity !== undefined ? fullTrade.current_open_quantity.toFixed(4) : 'N/A'] }), _jsxs("span", { className: "mr-4", children: ["Unrealized P&L: ", fullTrade.unrealized_pnl !== null && fullTrade.unrealized_pnl !== undefined ? fullTrade.unrealized_pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'] }), _jsxs("span", { className: "mr-4", children: ["Mark Price: ", fullTrade.current_market_price !== null && fullTrade.current_market_price !== undefined ? fullTrade.current_market_price.toFixed(4) : 'N/A'] }), _jsxs("span", { children: ["Realized P&L: ", fullTrade.realized_pnl_for_trade !== null && fullTrade.realized_pnl_for_trade !== undefined ? fullTrade.realized_pnl_for_trade.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'] })] }), _jsxs("fieldset", { className: "border border-yellow-500 rounded-lg p-5 mb-6 bg-gray-800", children: [_jsx("legend", { className: "px-2 font-bold text-yellow-400 text-lg", children: "Mark-to-Market (Unrealized P&L)" }), _jsxs("div", { className: "mb-3", children: [_jsx("strong", { children: "Current Mark Price:" }), " ", markToMarket?.mark_price ?? fullTrade.current_market_price ?? 'N/A', _jsx("br", {}), _jsx("strong", { children: "Unrealized P&L:" }), " ", markToMarket?.unrealized_pnl ?? fullTrade.unrealized_pnl ?? 'N/A', _jsx("br", {}), _jsx("strong", { children: "Open Quantity:" }), " ", markToMarket?.current_open_quantity ?? fullTrade.current_open_quantity ?? 'N/A', _jsx("br", {}), _jsx("strong", { children: "Average Open Price:" }), " ", markToMarket?.average_open_price ?? fullTrade.average_open_price ?? 'N/A', _jsx("br", {})] }), _jsxs("label", { className: "block mb-2 text-left font-medium", children: ["Set New Mark Price:", _jsx("input", { type: "number", step: "any", value: markPriceInput, onChange: e => setMarkPriceInput(e.target.value), className: "block w-48 px-3 py-2 mt-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsx("button", { className: "ml-3 px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded hover:bg-yellow-600 transition-colors", onClick: async () => {
                            if (!fullTrade?.trade_id || !markPriceInput)
                                return;
                            try {
                                const result = await window.electronAPI.updateMarkPrice({ tradeId: fullTrade.trade_id, marketPrice: parseFloat(markPriceInput) });
                                if (result.success) {
                                    setMarkToMarket({
                                        mark_price: parseFloat(markPriceInput),
                                        unrealized_pnl: result.unrealized_pnl,
                                        current_open_quantity: result.current_open_quantity,
                                        average_open_price: result.average_open_price
                                    });
                                }
                                else {
                                    alert(result.message || 'Failed to update mark price.');
                                }
                            }
                            catch (err) {
                                alert('Error updating mark price: ' + err.message);
                            }
                        }, children: "Update Mark Price" })] }), _jsxs("fieldset", { className: "border border-gray-700 rounded-lg p-5 mb-6 bg-gray-800", children: [_jsx("legend", { className: "px-2 font-bold text-blue-400 text-lg", children: "Transactions" }), fullTrade?.transactions && fullTrade.transactions.length > 0 ? (_jsx(_Fragment, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full border-collapse mt-2 text-white text-sm", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-900 w-1/5", children: "Date/Time" }), _jsx("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-900 w-1/12", children: "Action" }), _jsx("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-900 w-2/12", children: "Quantity" }), _jsx("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-900 w-2/12", children: "Price" }), _jsx("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-900 w-1/12", children: "Fees" }), _jsx("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-900 w-2/12", children: "Notes" }), _jsx("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-900 w-1/12", children: "Actions" })] }) }), _jsx("tbody", { children: fullTrade.transactions.map((transaction, idx) => (_jsxs("tr", { className: idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900', children: [_jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: new Date(transaction.datetime).toLocaleString() }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: transaction.action }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: transaction.quantity }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: transaction.price }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: transaction.fees || 0 }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: transaction.notes || '' }), _jsxs("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: [_jsx("button", { onClick: () => handleEditTransactionClick(transaction), className: "mr-2 px-3 py-1 bg-gray-700 text-white rounded hover:bg-blue-600 text-xs font-semibold transition-colors", children: "Edit" }), _jsx("button", { onClick: () => handleDeleteTransaction(transaction.transaction_id), className: "px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-semibold transition-colors", children: "Delete" })] })] }, transaction.transaction_id))) }), _jsx("tfoot", { children: _jsxs("tr", { children: [_jsx("td", { colSpan: 2, className: "font-bold bg-gray-900", children: "Summary:" }), _jsx("td", { className: "font-bold bg-gray-900", children: (() => {
                                                        const totalQuantity = fullTrade.transactions.reduce((sum, tx) => {
                                                            return sum + (tx.action === 'Buy' ? tx.quantity : -tx.quantity);
                                                        }, 0);
                                                        return totalQuantity.toFixed(4);
                                                    })() }), _jsx("td", { className: "font-bold bg-gray-900", children: (() => {
                                                        const buyTransactions = fullTrade.transactions.filter((tx) => tx.action === 'Buy');
                                                        const totalBuyQty = buyTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
                                                        const weightedSum = buyTransactions.reduce((sum, tx) => sum + (tx.price * tx.quantity), 0);
                                                        return totalBuyQty > 0 ? (weightedSum / totalBuyQty).toFixed(4) : '0.0000';
                                                    })() }), _jsx("td", { className: "font-bold bg-gray-900", children: fullTrade.transactions.reduce((sum, tx) => sum + (tx.fees || 0), 0).toFixed(4) }), _jsx("td", { colSpan: 2, className: "bg-gray-900" })] }) })] }) }) })) : (_jsx("p", { className: "text-gray-400 mt-3", children: "No transactions recorded for this trade." }))] }), editingTransaction && (_jsx(EditTransactionForm, { transaction: editingTransaction, onSave: handleSaveEditedTransaction, onCancel: () => setEditingTransaction(null), availableEmotions: availableEmotions }))] }));
};
export default EditTradeDetailsPage;
