import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// File: zekenewsom-trade_journal/packages/react-app/src/components/trades/TradesTable.tsx
// Modified for Stage 6: Add Mark Price input and Unrealized P&L display for open trades
import { useState, useMemo } from 'react';
import { useAppStore } from '../../stores/appStore';
const TradesTable = ({ trades, onEdit, onDelete }) => {
    const store = useAppStore();
    const updateMarkPriceInStore = store && typeof store === 'object' && 'updateMarkPriceInStore' in store ? store.updateMarkPriceInStore : undefined;
    const [markPrices, setMarkPrices] = useState({}); // tradeId -> price string
    const handleSort = (key) => {
        void key; // placeholder to satisfy lint
        // Sorting logic can be implemented here if needed
    };
    const sortedTrades = useMemo(() => { /* ... same ... */ return trades || []; }, [trades]);
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
                if (result.trade_id && typeof updateMarkPriceInStore === 'function' && typeof result.unrealized_pnl === 'number' && typeof result.current_open_quantity === 'number') {
                    updateMarkPriceInStore(result.trade_id, marketPrice, result.unrealized_pnl, result.current_open_quantity);
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
    if (!sortedTrades || sortedTrades.length === 0)
        return _jsx("p", { className: "text-on-surface/70", children: "No trades to display." });
    const getSortIndicator = (k) => {
        void k;
        return '';
    };
    return (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full border-collapse text-on-surface text-sm bg-surface", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsxs("th", { className: "px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap cursor-pointer", onClick: () => handleSort('trade_id'), children: ["ID", getSortIndicator('trade_id')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer", onClick: () => handleSort('instrument_ticker'), children: ["Ticker", getSortIndicator('instrument_ticker')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer hidden sm:table-cell", onClick: () => handleSort('asset_class'), children: ["Asset", getSortIndicator('asset_class')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer hidden md:table-cell", onClick: () => handleSort('exchange'), children: ["Exchange", getSortIndicator('exchange')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer hidden md:table-cell", onClick: () => handleSort('trade_direction'), children: ["Direction", getSortIndicator('trade_direction')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer", onClick: () => handleSort('status'), children: ["Status", getSortIndicator('status')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer", onClick: () => handleSort('open_datetime'), children: ["Open Date", getSortIndicator('open_datetime')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer hidden sm:table-cell", onClick: () => handleSort('close_datetime'), children: ["Close Date", getSortIndicator('close_datetime')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer hidden lg:table-cell", onClick: () => handleSort('latest_trade'), children: ["Latest Trade", getSortIndicator('latest_trade')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap cursor-pointer hidden md:table-cell", onClick: () => handleSort('current_open_quantity'), children: ["Open Qty", getSortIndicator('current_open_quantity')] }), _jsxs("th", { className: "px-3 py-2 border-b-2 border-gray-800 bg-gray-800 whitespace-nowrap cursor-pointer hidden md:table-cell", onClick: () => handleSort('unrealized_pnl'), children: ["Unrealized P&L", getSortIndicator('unrealized_pnl')] }), _jsx("th", { className: "px-3 py-2 border-b-2 border-gray-800 bg-gray-800 whitespace-nowrap hidden lg:table-cell", children: "Mark Price" }), _jsx("th", { className: "px-3 py-2 border-b-2 border-gray-700 bg-gray-800 whitespace-nowrap min-w-[120px]", children: "Actions" })] }) }), _jsx("tbody", { children: sortedTrades.map((trade, idx) => (_jsxs("tr", { className: idx % 2 === 0 ? 'bg-surface' : 'bg-surface-variant', children: [_jsx("td", { className: "px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface", children: trade.trade_id }), _jsx("td", { className: "px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface", children: trade.instrument_ticker }), _jsx("td", { className: "px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface hidden sm:table-cell", children: trade.asset_class }), _jsx("td", { className: "px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface hidden md:table-cell", children: trade.exchange || 'N/A' }), _jsx("td", { className: "px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface hidden md:table-cell", children: trade.trade_direction }), _jsx("td", { className: "px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface", children: trade.status }), _jsx("td", { className: "px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface", children: trade.open_datetime ? new Date(trade.open_datetime).toLocaleString() : 'N/A' }), _jsx("td", { className: "px-3 py-2 border-b border-card-stroke text-center whitespace-nowrap text-on-surface hidden sm:table-cell", children: trade.close_datetime ? new Date(trade.close_datetime).toLocaleString() : '-' }), _jsx("td", { className: "px-3 py-2 border-b border-card-stroke text-center whitespace-nowrap text-on-surface hidden lg:table-cell", children: trade.latest_trade ? new Date(trade.latest_trade).toLocaleString() : '-' }), _jsx("td", { className: "px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface hidden md:table-cell", children: trade.status === 'Open' ? trade.current_open_quantity?.toFixed(4) || 'N/A' : '-' }), _jsx("td", { className: "px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface hidden md:table-cell", children: trade.status === 'Open' && trade.unrealized_pnl !== null && trade.unrealized_pnl !== undefined
                                    ? trade.unrealized_pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                                    : '-' }), _jsx("td", { className: "px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface hidden lg:table-cell", children: trade.status === 'Open' && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "number", step: "unknown", className: "w-24 px-2 py-1 bg-surface-variant border border-card-stroke text-on-surface rounded focus:outline-none focus:ring-2 focus:ring-primary", placeholder: trade.current_market_price ? trade.current_market_price.toString() : "Mkt Price", value: markPrices[trade.trade_id] || '', onChange: (e) => handleMarkPriceChange(trade.trade_id, e.target.value) }), _jsx("button", { className: "px-3 py-1 bg-primary text-on-primary rounded hover:bg-primary/90 text-xs font-semibold transition-colors", onClick: () => submitMarkPrice(trade.trade_id), children: "Set" })] })) }), _jsxs("td", { className: "px-3 py-2 border-b border-card-stroke text-left align-top text-on-surface", children: [_jsx("button", { onClick: () => trade.trade_id && onEdit(trade.trade_id), className: "mr-2 px-3 py-1 bg-surface-variant text-on-surface rounded hover:bg-primary/20 text-xs font-semibold transition-colors border border-card-stroke", children: "Edit/View" }), _jsx("button", { onClick: () => trade.trade_id && onDelete(trade.trade_id), className: "px-3 py-1 bg-error text-on-error rounded hover:bg-error/90 text-xs font-semibold transition-colors", children: "Delete" })] })] }, trade.trade_id))) })] }) }));
};
export default TradesTable;
