// File: zekenewsom-trade_journal/packages/react-app/src/App.tsx
// Modified for Stage 6: Add navigation to AnalyticsPage, update ElectronAPI type if needed

import { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import LogTransactionPage from './views/LogTransactionPage';
import EditTradeDetailsPage from './views/EditTradeDetailsPage';
import TradesListPage from './views/TradesListPage';
import DashboardMetrics from './components/dashboard/DashboardMetrics';
import AnalyticsPage from './views/AnalyticsPage';
import { AppShell } from './components/layout/AppShell';
// Types now imported in the store as needed

function App() {
  const {
    currentView,
    editingTradeId,
    trades,
    appVersion,
    dbStatus,
    fetchInitialAppData,
    navigateTo,
    setEditingTradeId,
    currentViewParams,
    isLoadingInitialData,
    errorLoadingInitialData
  } = useAppStore();

  useEffect(() => {
    fetchInitialAppData();
  }, [fetchInitialAppData]);

  const handleActionComplete = () => {
    navigateTo('tradesList');
  };

  const renderView = () => {
    if (isLoadingInitialData) {
      return <p className="text-gray-400 text-center py-8">Loading application data...</p>;
    }
    if (errorLoadingInitialData) {
      return <p className="text-red-500 text-center py-8 font-semibold">Error loading application: {errorLoadingInitialData}</p>;
    }
    switch (currentView) {
      case 'tradesList':
        return <TradesListPage
          onEditTrade={(id) => {
            setEditingTradeId(id);
            navigateTo('editTradeDetailsForm');
          }}
          onLogTransaction={() => navigateTo('logTransactionForm', { navTimestamp: Date.now() })}
        />;
      case 'logTransactionForm':
        return <LogTransactionPage
          key={currentViewParams?.navTimestamp || Date.now()}
          onTransactionLogged={handleActionComplete}
          initialValues={currentViewParams?.initialValues}
        />;
      case 'editTradeDetailsForm':
        if (editingTradeId === null) {
          navigateTo('tradesList');
          return <p>Error: No trade selected. Redirecting...</p>;
        }
        return <EditTradeDetailsPage
          tradeId={editingTradeId}
          onCancel={handleActionComplete}
          onLogTransaction={() => {
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
            } else {
              navigateTo('logTransactionForm', { navTimestamp: Date.now() });
            }
          }}
        />;
      case 'analyticsPage':
        return <AnalyticsPage />;
      case 'dashboard':
      default:
        return (
          <div>
            <DashboardMetrics />
            <hr className="my-5" />
            <div className="flex gap-2.5 justify-center mt-5">
              <button onClick={() => navigateTo('logTransactionForm', { navTimestamp: Date.now() })} className="px-4 py-2.5">Log New Transaction</button>
              <button onClick={() => navigateTo('tradesList')} className="px-4 py-2.5">View All Trades</button>
              <button onClick={() => navigateTo('analyticsPage')} className="px-4 py-2.5">View Analytics</button>
            </div>
          </div>
        );
    }
  };

  return (
    <AppShell>
      {renderView()}
    </AppShell>
  );
}

export default App;