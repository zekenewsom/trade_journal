// File: zekenewsom-trade_journal/packages/react-app/src/App.tsx
// Modified for Stage 6: Add navigation to AnalyticsPage, update ElectronAPI type if needed

import { useState, useEffect } from 'react';
import './App.css';
import LogTransactionPage from './views/LogTransactionPage';
import EditTradeDetailsPage from './views/EditTradeDetailsPage';
import TradesListPage from './views/TradesListPage';
import DashboardMetrics from './components/dashboard/DashboardMetrics';
import AnalyticsPage from './views/AnalyticsPage'; // New for Stage 6
import type { ElectronAPIDefinition, TradeListView, EmotionRecord } from './types';

declare global {
  interface Window {
    electronAPI: ElectronAPIDefinition;
  }
}

type View = 'dashboard' | 'tradesList' | 'logTransactionForm' | 'editTradeDetailsForm' | 'analyticsPage'; // Added analyticsPage

interface AppState {
  currentView: View;
  editingTradeId: number | null;
  trades: TradeListView[];
  currentViewParams?: {
    initialValues?: {
      instrument_ticker: string;
      asset_class: 'Stock' | 'Cryptocurrency';
      exchange: string;
    };
  };
}

function App() {
  const [state, setState] = useState<AppState>({
    currentView: 'dashboard',
    editingTradeId: null,
    trades: [],
    currentViewParams: undefined
  });
  const [appVersion, setAppVersion] = useState('Loading...');
  const [dbStatus, setDbStatus] = useState('Testing DB...');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [availableEmotions, setAvailableEmotions] = useState<EmotionRecord[]>([]);

  const forceRefresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const dbTestResult = await window.electronAPI.testDbConnection();
        if (typeof dbTestResult === 'string') {
          setDbStatus(dbTestResult);
        } else if (dbTestResult && 'error' in dbTestResult && dbTestResult.error) {
          setDbStatus(`Error: ${dbTestResult.error}`);
        } else if (dbTestResult && 'status' in dbTestResult && 'message' in dbTestResult) {
          setDbStatus(dbTestResult.message);
        } else {
          setDbStatus('DB status response not recognized.');
        }

        const [trades, emotions] = await Promise.all([
          window.electronAPI.getTrades(),
          window.electronAPI.getEmotions()
        ]);
        setState(prev => ({
          ...prev,
          trades: trades
        }));
        setAvailableEmotions(emotions);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setDbStatus(`Error: ${(error as Error).message}`);
      }
    };
    fetchInitialData();
  }, []);

  const navigateTo = (view: View, params?: AppState['currentViewParams']) => {
    setState(prev => ({
      ...prev,
      currentView: view,
      currentViewParams: params
    }));
  };

  const handleActionComplete = () => {
    navigateTo('tradesList');
  };

  const renderView = () => {
    switch (state.currentView) {
      case 'tradesList':
        return <TradesListPage 
          key={refreshTrigger} 
          onEditTrade={(id) => navigateTo('editTradeDetailsForm', { initialValues: { instrument_ticker: '', asset_class: 'Stock', exchange: '' } })}
          onLogTransaction={() => navigateTo('logTransactionForm')}
        />;
      case 'logTransactionForm':
        return <LogTransactionPage 
          onTransactionLogged={handleActionComplete} 
          onCancel={() => navigateTo('tradesList')}
          initialValues={state.currentViewParams?.initialValues}
        />;
      case 'editTradeDetailsForm':
        if (state.editingTradeId === null) { navigateTo('tradesList'); return <p>Error: No trade selected. Redirecting...</p>; }
        return <EditTradeDetailsPage 
          tradeId={state.editingTradeId} 
          onEditComplete={handleActionComplete} 
          onCancel={() => navigateTo('tradesList')}
          onLogTransaction={() => {
            const trade = state.trades.find(t => t.trade_id === state.editingTradeId);
            if (trade) {
              navigateTo('logTransactionForm', {
                initialValues: {
                  instrument_ticker: trade.instrument_ticker,
                  asset_class: trade.asset_class,
                  exchange: trade.exchange
                }
              });
            } else {
              navigateTo('logTransactionForm');
            }
          }}
        />;
      case 'analyticsPage':
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
              <button onClick={() => navigateTo('analyticsPage')} style={{ padding: '10px' }}>View Analytics</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container" style={{padding: '20px'}}>
      <nav style={{ marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px', display: 'flex', gap: '10px' }}>
        <button onClick={() => navigateTo('dashboard')} disabled={state.currentView === 'dashboard'}>Dashboard</button>
        <button onClick={() => navigateTo('tradesList')} disabled={state.currentView === 'tradesList'}>Trades List</button>
        <button onClick={() => navigateTo('analyticsPage')} disabled={state.currentView === 'analyticsPage'}>Analytics</button>
      </nav>
      {renderView()}
    </div>
  );
}

export default App;