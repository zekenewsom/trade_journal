import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// File: zekenewsom-trade_journal/packages/react-app/src/components/trades/TradesTable.tsx
// Modified for Stage 6: Add Mark Price input and Unrealized P&L display for open trades
import { useState, useMemo } from 'react';
import { useAppStore } from '../../stores/appStore';
const TradesTable = ({ trades, onEdit, onDelete }) => {
    const { updateMarkPriceInStore } = useAppStore();
    const [sortKey] = useState('open_datetime');
    const [sortOrder] = useState('desc');
    const [markPrices, setMarkPrices] = useState({}); // tradeId -> price string
    // ... (handleSort and sortedTrades memoization - same as your Stage 5, ensure types are correct)
    const handleSort = (key) => { };
    const sortedTrades = useMemo(() => { /* ... same ... */ return trades || []; }, [trades, sortKey, sortOrder]);
    const handleMarkPriceChange = (tradeId, value) => {
        setMarkPrices(prev => ({ ...prev, [tradeId]: value }));
    };
    const submitMarkPrice = async (tradeId) => {
        const priceStr = markPrices[tradeId];
        if (priceStr === undefined || priceStr === null || priceStr === '') {
            alert("Please enter a valid market price.");
            return;
        }
        const marketPrice = parseFloat(priceStr);
        if (isNaN(marketPrice) || marketPrice <= 0) {
            alert('Invalid mark price. Please enter a positive number.');
            return;
        }
        try {
            const result = await window.electronAPI.updateMarkPrice({ tradeId, marketPrice });
            if (result.success) {
                alert(result.message);
                setMarkPrices(prev => ({ ...prev, [tradeId]: '' })); // Clear input
                if (result.trade_id) {
                    updateMarkPriceInStore(result.trade_id, marketPrice, result.unrealized_pnl, result.current_open_quantity);
                    // If the backend does not return updated unrealized_pnl, force a refresh
                    if (typeof result.unrealized_pnl !== 'number' || typeof result.current_open_quantity !== 'number') {
                        if (typeof window !== 'undefined' && window.__ZUSTAND_STORE__) {
                            window.__ZUSTAND_STORE__.getState().refreshTrades();
                        }
                    }
                }
            }
            else {
                alert(`Error: ${result.message}`);
            }
        }
        catch (err) {
            alert(`Failed to update mark price: ${err.message}`);
        }
    };
    // Styles removed: now using Tailwind CSS classes
    if (!sortedTrades || sortedTrades.length === 0)
        return _jsx("p", { className: "text-gray-300", children: "No trades to display." });
    const getSortIndicator = (key) => (sortKey === key ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : '');
    return (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full border-collapse text-white text-sm", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer", onClick: () => handleSort('trade_id'), children: ["ID", getSortIndicator('trade_id')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer", onClick: () => handleSort('instrument_ticker'), children: ["Ticker", getSortIndicator('instrument_ticker')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer", onClick: () => handleSort('asset_class'), children: ["Asset", getSortIndicator('asset_class')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer", onClick: () => handleSort('exchange'), children: ["Exchange", getSortIndicator('exchange')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer", onClick: () => handleSort('trade_direction'), children: ["Direction", getSortIndicator('trade_direction')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer", onClick: () => handleSort('status'), children: ["Status", getSortIndicator('status')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer", onClick: () => handleSort('open_datetime'), children: ["Opened", getSortIndicator('open_datetime')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer", onClick: () => handleSort('close_datetime'), children: ["Closed", getSortIndicator('close_datetime')] }), _jsx("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap", children: "Latest Trade" }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer", onClick: () => handleSort('current_open_quantity'), children: ["Open Qty", getSortIndicator('current_open_quantity')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer", onClick: () => handleSort('unrealized_pnl'), children: ["Unrealized P&L", getSortIndicator('unrealized_pnl')] }), _jsx("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap", children: "Mark Price" }), _jsx("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap", children: "Actions" })] }) }), _jsx("tbody", { children: sortedTrades.map((trade, idx) => (_jsxs("tr", { className: idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900', children: [_jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: trade.trade_id }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: trade.instrument_ticker }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: trade.asset_class }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: trade.exchange || 'N/A' }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: trade.trade_direction }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: trade.status }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: trade.open_datetime ? new Date(trade.open_datetime).toLocaleString() : 'N/A' }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-center whitespace-nowrap", children: trade.close_datetime ? new Date(trade.close_datetime).toLocaleString() : '-' }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-center whitespace-nowrap", children: trade.latest_trade ? new Date(trade.latest_trade).toLocaleString() : '-' }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: trade.status === 'Open' ? trade.current_open_quantity?.toFixed(4) || 'N/A' : '-' }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: trade.status === 'Open' && trade.unrealized_pnl !== null && trade.unrealized_pnl !== undefined
                                    ? trade.unrealized_pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                                    : '-' }), _jsx("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: trade.status === 'Open' && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "number", step: "any", className: "w-24 px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: trade.current_market_price ? trade.current_market_price.toString() : "Mkt Price", value: markPrices[trade.trade_id] || '', onChange: (e) => handleMarkPriceChange(trade.trade_id, e.target.value) }), _jsx("button", { className: "px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold transition-colors", onClick: () => submitMarkPrice(trade.trade_id), children: "Set" })] })) }), _jsxs("td", { className: "px-3 py-2 border-b border-gray-700 text-left align-top", children: [_jsx("button", { onClick: () => trade.trade_id && onEdit(trade.trade_id), className: "mr-2 px-3 py-1 bg-gray-700 text-white rounded hover:bg-blue-600 text-xs font-semibold transition-colors", children: "Edit/View" }), _jsx("button", { onClick: () => trade.trade_id && onDelete(trade.trade_id), className: "px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-semibold transition-colors", children: "Delete" })] })] }, trade.trade_id))) })] }) }));
};
export default TradesTable;
