import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// File: zekenewsom-trade_journal/packages/react-app/src/views/TradesListPage.tsx
// Modified for Stage 6: Add onMarkPriceUpdate callback to TradesTable
import { useState, useMemo } from 'react';
import TradesTable from '../components/trades/TradesTable';
import { useAppStore } from '../stores/appStore';
const TradesListPage = ({ onEditTrade, onLogTransaction }) => {
    const { trades, refreshTrades, isLoadingTrades, errorLoadingTrades, deleteFullTradeInStore } = useAppStore();
    const [filterText, setFilterText] = useState('');
    const handleDeleteFullTrade = async (tradeId) => {
        if (window.confirm(`Are you sure you want to delete the ENTIRE trade ID ${tradeId} and all its transactions? This action cannot be undone.`)) {
            try {
                const result = await deleteFullTradeInStore(tradeId);
                if (result.success) {
                    alert(result.message);
                }
                else {
                    alert(result.message);
                }
            }
            catch (err) {
                alert(`Failed to delete trade: ${err.message}`);
            }
        }
    };
    if (isLoadingTrades) {
        return _jsx("p", { children: "Loading trades..." });
    }
    if (errorLoadingTrades) {
        return _jsxs("p", { style: { color: 'red' }, children: ["Error loading trades: ", errorLoadingTrades] });
    }
    const filteredTrades = useMemo(() => {
        if (!filterText.trim())
            return trades;
        const searchTerm = filterText.toLowerCase().trim();
        return trades.filter(trade => trade.instrument_ticker.toLowerCase().includes(searchTerm) ||
            (trade.asset_class && trade.asset_class.toLowerCase().includes(searchTerm)) ||
            (trade.exchange && trade.exchange.toLowerCase().includes(searchTerm)));
    }, [trades, filterText]);
    if (isLoadingTrades)
        return _jsx("p", { children: "Loading trades..." });
    if (errorLoadingTrades)
        return _jsxs("p", { style: { color: 'red' }, children: ["Error loading trades: ", errorLoadingTrades] });
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }, children: [_jsx("h2", { children: "All Trades (Positions)" }), _jsx("button", { onClick: onLogTransaction, style: {
                            padding: '8px 16px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }, children: "Log Transaction" })] }), _jsx("input", { type: "text", placeholder: "Filter trades...", value: filterText, onChange: (e) => setFilterText(e.target.value), style: { marginBottom: '15px', padding: '8px', width: 'calc(100% - 20px)', maxWidth: '400px' } }), filteredTrades.length > 0 ? (_jsx(TradesTable, { trades: filteredTrades, onEdit: onEditTrade, onDelete: handleDeleteFullTrade })) : (_jsx("p", { children: "No trades match your filter, or no trades have been logged yet." }))] }));
};
export default TradesListPage;
