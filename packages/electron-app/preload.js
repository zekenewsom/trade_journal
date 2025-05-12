// File: zekenewsom-trade_journal/packages/electron-app/preload.js
// Modified for Stage 3

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  testDbConnection: () => ipcRenderer.invoke('test-db'),
  // Stage 2
  saveTrade: (tradeData) => ipcRenderer.invoke('save-trade', tradeData),
  // --- Added for Stage 3 ---
  getTrades: () => ipcRenderer.invoke('get-trades'),
  getTradeById: (id) => ipcRenderer.invoke('get-trade-by-id', id),
  updateTrade: (tradeData) => ipcRenderer.invoke('update-trade', tradeData),
  deleteTrade: (id) => ipcRenderer.invoke('delete-trade', id),
  // --- End Stage 3 ---
});

console.log('Preload script loaded. Stage 3 APIs exposed.');