// File: zekenewsom-trade_journal/packages/react-app/src/App.tsx
// Modified for Stage 6: Add navigation to AnalyticsPage, update ElectronAPI type if needed

import { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import LogTransactionPage from './views/LogTransactionPage';
import EditTradeDetailsPage from './views/EditTradeDetailsPage';
import TradesListPage from './views/TradesListPage';
import DashboardMetrics from './components/dashboard/DashboardMetrics';
import AnalyticsPage from './views/AnalyticsPage'; // New for Stage 6
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
      return <p>Loading application data...</p>;
    }
    if (errorLoadingInitialData) {
      return <p style={{ color: 'red' }}>Error loading application: {errorLoadingInitialData}</p>;
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
          onCancel={() => navigateTo('tradesList')}
          initialValues={currentViewParams?.initialValues}
        />;
      case 'editTradeDetailsForm':
        if (editingTradeId === null) {
          navigateTo('tradesList');
          return <p>Error: No trade selected. Redirecting...</p>;
        }
        return <EditTradeDetailsPage
          tradeId={editingTradeId}
          onEditComplete={handleActionComplete}
          onCancel={() => navigateTo('tradesList')}
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
            <h1>Trade Journal - Dashboard</h1>
            <p>Electron App Version: {appVersion || 'Loading...'}</p>
            <p>Database Status: {dbStatus || 'Testing DB...'}</p>
            <hr style={{ margin: "20px 0" }} />
            <DashboardMetrics />
            <hr style={{ margin: "20px 0" }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={() => navigateTo('logTransactionForm', { navTimestamp: Date.now() })} style={{ padding: '10px' }}>Log New Transaction</button>
              <button onClick={() => navigateTo('tradesList')} style={{ padding: '10px' }}>View All Trades</button>
              <button onClick={() => navigateTo('analyticsPage')} style={{ padding: '10px' }}>View Analytics</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container" style={{ padding: '20px' }}>
      <nav style={{ marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px', display: 'flex', gap: '10px' }}>
        <button onClick={() => navigateTo('dashboard')} disabled={currentView === 'dashboard'}>Dashboard</button>
        <button onClick={() => navigateTo('tradesList')} disabled={currentView === 'tradesList'}>Trades List</button>
        <button onClick={() => navigateTo('analyticsPage')} disabled={currentView === 'analyticsPage'}>Analytics</button>
      </nav>
      {renderView()}
    </div>
  );
}

export default App;