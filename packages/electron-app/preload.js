// File: zekenewsom-trade_journal/packages/electron-app/preload.js
// Modified to add saveTrade

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  testDbConnection: () => ipcRenderer.invoke('test-db'),
  // --- Added for Stage 2 ---
  saveTrade: (tradeData) => ipcRenderer.invoke('save-trade', tradeData),
  // --- End Stage 2 ---
});

console.log('Preload script loaded. saveTrade API exposed.');