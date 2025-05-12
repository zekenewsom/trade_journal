// File: zekenewsom-trade_journal/packages/react-app/src/App.tsx
// Modified to include routing/navigation to TradesListPage and NewTradePage (acting as Add/Edit)

import { useState, useEffect } from 'react';
import './App.css';
import NewTradePage from './views/NewTradePage';
import TradesListPage from './views/TradesListPage';
import type { Trade, TradeLeg } from './types/index.ts'; // Import shared types

// Define ElectronAPI interface (ensure it's comprehensive for all stages)
export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  testDbConnection: () => Promise<string>;
  // Stage 2
  saveTrade: (tradeData: Omit<Trade, 'trade_id' | 'created_at' | 'updated_at' | 'legs'> & { legs: TradeLeg[] }) => Promise<{ success: boolean; message: string; tradeId?: number }>;
  // Stage 3
  getTrades: () => Promise<Trade[]>; // Should return an array of Trade objects, potentially simplified for table
  getTradeById: (id: number) => Promise<Trade | null>; // Returns a full Trade object with legs
  updateTrade: (tradeData: Trade & { trade_id: number }) => Promise<{ success: boolean; message: string }>;
  deleteTrade: (id: number) => Promise<{ success: boolean; message: string }>;
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
            <hr />
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
      <nav style={{ marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
        <button onClick={() => navigateTo('dashboard')} disabled={currentView === 'dashboard'}>Dashboard</button>
        <button onClick={() => navigateTo('tradesList')} disabled={currentView === 'tradesList'}>Trades List</button>
        {currentView !== 'dashboard' && currentView !== 'tradesList' && (
           <button onClick={() => navigateTo(editingTradeId ? 'tradesList' : 'dashboard')}>
            {editingTradeId ? 'Cancel Edit' : 'Cancel New Trade'}
           </button>
        )}
      </nav>
      {renderView()}
    </div>
  );
}

export default App;