// File: zekenewsom-trade_journal/packages/react-app/src/App.tsx
// Modified to integrate DashboardMetrics into the dashboard view

import { useState, useEffect } from 'react';
import './App.css';
import NewTradePage from './views/NewTradePage';
import TradesListPage from './views/TradesListPage';
import DashboardMetrics from './components/dashboard/DashboardMetrics'; // Import DashboardMetrics
import type { Trade, TradeLeg, BasicAnalyticsData } from './types/index.ts';

export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  testDbConnection: () => Promise<string>;
  saveTrade: (tradeData: Omit<Trade, 'trade_id' | 'created_at' | 'updated_at' | 'legs' | 'calculated_pnl_gross' | 'calculated_pnl_net' | 'is_closed' | 'outcome'> & { legs: TradeLeg[] }) => Promise<{ success: boolean; message: string; tradeId?: number }>;
  getTrades: () => Promise<Trade[]>;
  getTradeById: (id: number) => Promise<Trade | null>;
  updateTrade: (tradeData: Omit<Trade, 'created_at' | 'updated_at' | 'calculated_pnl_gross' | 'calculated_pnl_net' | 'is_closed' | 'outcome'> & { trade_id: number }) => Promise<{ success: boolean; message: string }>;
  deleteTrade: (id: number) => Promise<{ success: boolean; message: string }>;
  // --- Added for Stage 4 ---
  getBasicAnalytics: () => Promise<BasicAnalyticsData>;
  // --- End Stage 4 ---
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

type View = 'dashboard' | 'tradesList' | 'tradeForm';

function App() {
  const [appVersion, setAppVersion] = useState('Loading...');
  const [dbStatus, setDbStatus] = useState('Testing DB...');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingTradeId, setEditingTradeId] = useState<number | null>(null);

  useEffect(() => {
    // ... (fetchInitialData remains the same)
    const fetchInitialData = async () => {
      if (window.electronAPI) {
        try {
          setAppVersion(await window.electronAPI.getAppVersion());
          setDbStatus(await window.electronAPI.testDbConnection());
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
  };

  const renderView = () => {
    switch (currentView) {
      case 'tradesList':
        return <TradesListPage onEditTrade={(id) => navigateTo('tradeForm', id)} />;
      case 'tradeForm':
        return <NewTradePage tradeId={editingTradeId} onFormSubmitOrCancel={() => navigateTo('tradesList')} />;
      case 'dashboard':
      default:
        return (
          <div>
            <h1>Trade Journal - Dashboard</h1>
            <p>Electron App Version: {appVersion}</p>
            <p>Database Status: {dbStatus}</p>
            <hr style={{margin: "20px 0"}}/>
            {/* Integrate DashboardMetrics here */}
            <DashboardMetrics />
            <hr style={{margin: "20px 0"}}/>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={() => navigateTo('tradeForm')} style={{ padding: '10px' }}>
                Add New Trade
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
        {/* Conditional cancel/back button can be refined */}
      </nav>
      {renderView()}
    </div>
  );
}

export default App;