import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// File: zekenewsom-trade_journal/packages/react-app/src/App.tsx
// Modified for Stage 6: Add navigation to AnalyticsPage, update ElectronAPI type if needed
import { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import LogTransactionPage from './views/LogTransactionPage';
import EditTradeDetailsPage from './views/EditTradeDetailsPage';
import TradesListPage from './views/TradesListPage';
import DashboardMetrics from './components/dashboard/DashboardMetrics';
import AnalyticsPage from './views/AnalyticsPage';
import AccountsPage from './views/AccountsPage';
import { AppShell } from './components/layout/AppShell';
// Types now imported in the store as needed
function App() {
    const { currentView, editingTradeId, trades, fetchInitialAppData, navigateTo, setEditingTradeId, currentViewParams, isLoadingInitialData, errorLoadingInitialData } = useAppStore();
    useEffect(() => {
        fetchInitialAppData();
    }, [fetchInitialAppData]);
    const handleActionComplete = () => {
        navigateTo('tradesList');
    };
    const renderView = () => {
        if (isLoadingInitialData) {
            return _jsx("p", { className: "text-gray-400 text-center py-8", children: "Loading application data..." });
        }
        if (errorLoadingInitialData) {
            return _jsxs("p", { className: "text-red-500 text-center py-8 font-semibold", children: ["Error loading application: ", errorLoadingInitialData] });
        }
        switch (currentView) {
            case 'tradesList':
                return _jsx(TradesListPage, { onEditTrade: (id) => {
                        setEditingTradeId(id);
                        navigateTo('editTradeDetailsForm');
                    }, onLogTransaction: () => navigateTo('logTransactionForm', { navTimestamp: Date.now() }) });
            case 'logTransactionForm':
                return _jsx(LogTransactionPage, { onTransactionLogged: handleActionComplete, initialValues: currentViewParams?.initialValues }, currentViewParams?.navTimestamp || Date.now());
            case 'editTradeDetailsForm':
                if (editingTradeId === null) {
                    navigateTo('tradesList');
                    return _jsx("p", { children: "Error: No trade selected. Redirecting..." });
                }
                return _jsx(EditTradeDetailsPage, { tradeId: editingTradeId, onCancel: handleActionComplete, onLogTransaction: () => {
                        const trade = trades.find(t => t.trade_id === editingTradeId);
                        if (trade) {
                            navigateTo('logTransactionForm', {
                                initialValues: {
                                    instrument_ticker: trade.instrument_ticker ?? '',
                                    asset_class: (trade.asset_class ?? 'Stock'),
                                    exchange: trade.exchange ?? ''
                                },
                                navTimestamp: Date.now()
                            });
                        }
                        else {
                            navigateTo('logTransactionForm', { navTimestamp: Date.now() });
                        }
                    } });
            case 'analyticsPage':
                return _jsx(AnalyticsPage, {});
            case 'accountsPage':
                return _jsx(AccountsPage, {});
            default:
                return (_jsxs("div", { children: [_jsx(DashboardMetrics, {}), _jsx("hr", { className: "my-5" }), _jsxs("div", { className: "flex gap-2.5 justify-center mt-5", children: [_jsx("button", { onClick: () => navigateTo('logTransactionForm', { navTimestamp: Date.now() }), className: "px-4 py-2.5", children: "Log New Transaction" }), _jsx("button", { onClick: () => navigateTo('tradesList'), className: "px-4 py-2.5", children: "View All Trades" }), _jsx("button", { onClick: () => navigateTo('analyticsPage'), className: "px-4 py-2.5", children: "View Analytics" }), _jsx("button", { onClick: () => navigateTo('accountsPage'), className: "px-4 py-2.5", children: "Manage Accounts" })] })] }));
        }
    };
    return (_jsx(AppShell, { children: renderView() }));
}
export default App;
