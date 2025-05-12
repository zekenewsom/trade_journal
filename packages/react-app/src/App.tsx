// File: zekenewsom-trade_journal/packages/react-app/src/App.tsx
// Modified for Stage 5: Updated navigation, API interface

import { useState, useEffect } from 'react';
import './App.css';
import LogTransactionPage from './views/LogTransactionPage';
import EditTradeDetailsPage from './views/EditTradeDetailsPage';
import TradesListPage from './views/TradesListPage';
import DashboardMetrics from './components/dashboard/DashboardMetrics';
import type { ElectronAPIDefinition } from './types/index.ts';

// Expose ElectronAPI to the window object for TypeScript
declare global {
  interface Window {
    electronAPI: ElectronAPIDefinition;
  }
}

type View = 'dashboard' | 'tradesList' | 'logTransactionForm' | 'editTradeDetailsForm';

function App() {
  const [appVersion, setAppVersion] = useState('Loading...');
  const [dbStatus, setDbStatus] = useState('Testing DB...');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingTradeId, setEditingTradeId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to force re-fetch in child components

  const forceRefresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (window.electronAPI) {
        try {
          setAppVersion(await window.electronAPI.getAppVersion());
          const dbTestResult = await window.electronAPI.testDbConnection();
          if (typeof dbTestResult === 'string') { // Simple string success
            setDbStatus(dbTestResult);
          } else if (dbTestResult && 'error' in dbTestResult) { // Error object
             setDbStatus(`Error: ${dbTestResult.error}`);
          } else { // Unknown response
             setDbStatus('DB status unknown');
          }
        } catch (error) {
          console.error("Error fetching initial data:", error);
          setAppVersion('Error');
          setDbStatus(`Error: ${(error as Error).message}`);
        }
      } else {
        console.warn("electronAPI not found during initial load.");
        setAppVersion('N/A (Not in Electron)');
        setDbStatus('N/A (Not in Electron)');
      }
    };
    fetchInitialData();
  }, []);

  const navigateTo = (view: View, tradeId: number | null = null) => {
    setEditingTradeId(tradeId);
    setCurrentView(view);
    // When navigating to views that display lists or summaries, trigger a refresh
    if (view === 'dashboard' || view === 'tradesList') {
      forceRefresh();
    }
  };

  const handleActionComplete = () => {
    // After logging a transaction or editing a trade, go to trades list
    // This will inherently refresh the list and dashboard if it's re-rendered
    navigateTo('tradesList');
  };

  const renderView = () => {
    switch (currentView) {
      case 'tradesList':
        return <TradesListPage key={refreshTrigger} onEditTrade={(id) => navigateTo('editTradeDetailsForm', id)} />;
      case 'logTransactionForm':
        return <LogTransactionPage onTransactionLogged={handleActionComplete} onCancel={() => navigateTo('dashboard')} />;
      case 'editTradeDetailsForm':
        if (editingTradeId === null) {
            console.error("Attempted to navigate to editTradeDetailsForm without a tradeId.");
            navigateTo('tradesList'); // Fallback
            return <p>Error: No trade selected for editing. Redirecting...</p>;
        }
        return <EditTradeDetailsPage tradeId={editingTradeId} onEditComplete={handleActionComplete} onCancel={() => navigateTo('tradesList')} />;
      case 'dashboard':
      default:
        return (
          <div>
            <h1>Trade Journal - Dashboard</h1>
            <p>Electron App Version: {appVersion}</p>
            <p>Database Status: {dbStatus}</p>
            <hr style={{margin: "20px 0"}}/>
            <DashboardMetrics key={refreshTrigger} /> {/* Key helps re-trigger fetch in DashboardMetrics */}
            <hr style={{margin: "20px 0"}}/>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={() => navigateTo('logTransactionForm')} style={{ padding: '10px' }}>
                Log New Transaction
              </button>
              <button onClick={() => navigateTo('tradesList')} style={{ padding: '10px' }}>
                View All Trades
              </button>
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
      </nav>
      {renderView()}
    </div>
  );
}

export default App;