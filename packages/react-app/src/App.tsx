// File: zekenewsom-trade_journal/packages/react-app/src/App.tsx
// Modified to include a simple way to toggle the NewTradePage view

import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import NewTradePage from './views/NewTradePage';

interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  testDbConnection: () => Promise<string>;
  saveTrade: (tradeData: any) => Promise<{ success: boolean; message: string; tradeId?: number }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

function App() {
  const [count, setCount] = useState(0);
  const [appVersion, setAppVersion] = useState('Loading...');
  const [dbStatus, setDbStatus] = useState('Testing DB...');
  const [showNewTradePage, setShowNewTradePage] = useState(false);

  useEffect(() => {
    const fetchAppVersion = async () => {
      if (window.electronAPI && typeof window.electronAPI.getAppVersion === 'function') {
        try {
          const version = await window.electronAPI.getAppVersion();
          setAppVersion(version);
        } catch (error) {
          console.error('Error fetching app version:', error);
          setAppVersion('Error fetching version');
        }
      } else {
        setAppVersion('electronAPI.getAppVersion not found. Run in Electron.');
        console.warn('window.electronAPI.getAppVersion is not available. Ensure the app is running in Electron and preload.js is configured correctly.');
      }
    };

    const testDb = async () => {
      if (window.electronAPI && typeof window.electronAPI.testDbConnection === 'function') {
        try {
          const status = await window.electronAPI.testDbConnection();
          setDbStatus(status);
        } catch (error) {
          console.error('Error testing DB connection:', error);
          setDbStatus(`Error: ${(error as Error).message}`);
        }
      } else {
        setDbStatus('electronAPI.testDbConnection not found. Run in Electron.');
        console.warn('window.electronAPI.testDbConnection is not available.');
      }
    };

    fetchAppVersion();
    testDb();
  }, []);

  const handleToggleNewTradePage = () => {
    setShowNewTradePage(!showNewTradePage);
  };

  return (
    <>
      {!showNewTradePage ? (
        <div>
          <div>
            <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1>Trade Journal - Stage 2</h1>
          <p>Vite + React + Electron</p>
          <div className="card">
            <button onClick={() => setCount((c) => c + 1)}>
              count is {count}
            </button>
            <p>
              Edit <code>src/App.tsx</code> and save to test HMR
            </p>
          </div>
          <p className="read-the-docs">
            Click on the Vite and React logos to learn more
          </p>
          <hr />
          <p>Electron App Version: {appVersion}</p>
          <p>Database Status: {dbStatus}</p>
          <hr />
          <button onClick={handleToggleNewTradePage} style={{ marginTop: '20px', padding: '10px' }}>
            Add New Trade
          </button>
        </div>
      ) : (
        <NewTradePage onBack={() => setShowNewTradePage(false)} />
      )}
    </>
  );
}

export default App;