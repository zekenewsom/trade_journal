// File: zekenewsom-trade_journal/packages/react-app/src/App.tsx
// Modified for Stage 6: Add navigation to AnalyticsPage, update ElectronAPI type if needed

import { useState, useEffect } from 'react';
import './App.css';
import LogTransactionPage from './views/LogTransactionPage';
import EditTradeDetailsPage from './views/EditTradeDetailsPage';
import TradesListPage from './views/TradesListPage';
import DashboardMetrics from './components/dashboard/DashboardMetrics';
import AnalyticsPage from './views/AnalyticsPage'; // New for Stage 6
import type { ElectronAPIDefinition } from './types/index.ts';

declare global {
  interface Window {
    electronAPI: ElectronAPIDefinition;
  }
}

type View = 'dashboard' | 'tradesList' | 'logTransactionForm' | 'editTradeDetailsForm' | 'analyticsPage'; // Added analyticsPage

function App() {
  const [appVersion, setAppVersion] = useState('Loading...');
  const [dbStatus, setDbStatus] = useState('Testing DB...');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingTradeId, setEditingTradeId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const forceRefresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const fetchInitialData = async () => {
      // ... (same as before)
       if (window.electronAPI) {
        try {
          setAppVersion(await window.electronAPI.getAppVersion());
          const dbTestResult = await window.electronAPI.testDbConnection();
          if (typeof dbTestResult === 'string') {
            setDbStatus(dbTestResult);
          } else if (
            dbTestResult &&
            typeof dbTestResult === 'object' &&
            'status' in dbTestResult &&
            (dbTestResult.status === 'ok' || dbTestResult.status === 'error')
          ) {
            if (dbTestResult.status === 'ok') {
              setDbStatus('Database is OK');
            } else {
              setDbStatus(`Error: ${dbTestResult.message}`);
            }
          } else {
            setDbStatus('DB status unknown');
          }
        } catch (error) {
          console.error("Error fetching initial data:", error);
          setAppVersion('Error'); setDbStatus(`Error: ${(error as Error).message}`);
        }
      } else { /* ... */ }
    };
    fetchInitialData();
  }, []);

  const navigateTo = (view: View, tradeId: number | null = null) => {
    setEditingTradeId(tradeId);
    setCurrentView(view);
    if (view === 'dashboard' || view === 'tradesList' || view === 'analyticsPage') {
      forceRefresh();
    }
  };

  const handleActionComplete = () => {
    navigateTo('tradesList');
  };

  const renderView = () => {
    switch (currentView) {
      case 'tradesList':
        return <TradesListPage key={refreshTrigger} onEditTrade={(id) => navigateTo('editTradeDetailsForm', id)} />;
      case 'logTransactionForm':
        return <LogTransactionPage onTransactionLogged={handleActionComplete} onCancel={() => navigateTo('dashboard')} />;
      case 'editTradeDetailsForm':
        if (editingTradeId === null) { navigateTo('tradesList'); return <p>Error: No trade selected. Redirecting...</p>; }
        return <EditTradeDetailsPage tradeId={editingTradeId} onEditComplete={handleActionComplete} onCancel={() => navigateTo('tradesList')} />;
      case 'analyticsPage': // New case for Stage 6
        return <AnalyticsPage key={refreshTrigger} />;
      case 'dashboard':
      default:
        return (
          <div>
            <h1>Trade Journal - Dashboard</h1>
            <p>Electron App Version: {appVersion}</p>
            <p>Database Status: {dbStatus}</p>
            <hr style={{margin: "20px 0"}}/>
            <DashboardMetrics key={refreshTrigger} />
            <hr style={{margin: "20px 0"}}/>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={() => navigateTo('logTransactionForm')} style={{ padding: '10px' }}>Log New Transaction</button>
              <button onClick={() => navigateTo('tradesList')} style={{ padding: '10px' }}>View All Trades</button>
              <button onClick={() => navigateTo('analyticsPage')} style={{ padding: '10px' }}>View Analytics</button> {/* New Button */}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container" style={{padding: '20px'}}>
      <nav style={{ marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px', display: 'flex', gap: '10px' }}>
        <button onClick={() => navigateTo('dashboard')} disabled={currentView === 'dashboard'}>Dashboard</button>
        <button onClick={() => navigateTo('tradesList')} disabled={currentView === 'tradesList'}>Trades List</button>
        <button onClick={() => navigateTo('analyticsPage')} disabled={currentView === 'analyticsPage'}>Analytics</button> {/* New Button */}
      </nav>
      {renderView()}
    </div>
  );
}

export default App;