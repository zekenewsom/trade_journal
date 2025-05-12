// File: zekenewsom-trade_journal/packages/electron-app/preload.js
// Modified for Stage 6: Add updateMarkPrice IPC

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  testDbConnection: () => ipcRenderer.invoke('test-db'),
  logTransaction: (data) => ipcRenderer.invoke('log-transaction', data),
  getTrades: () => ipcRenderer.invoke('get-trades'),
  getTradeWithTransactions: (tradeId) => ipcRenderer.invoke('get-trade-with-transactions', tradeId),
  updateTradeDetails: (data) => ipcRenderer.invoke('update-trade-details', data),
  updateSingleTransaction: (data) => ipcRenderer.invoke('update-single-transaction', data),
  deleteSingleTransaction: (transactionId) => ipcRenderer.invoke('delete-single-transaction', transactionId),
  deleteFullTrade: (tradeId) => ipcRenderer.invoke('delete-full-trade', tradeId),
  getAnalyticsData: (filters) => ipcRenderer.invoke('get-analytics-data', filters),
  getEmotions: () => ipcRenderer.invoke('get-emotions'),
  getTradeEmotions: (tradeId) => ipcRenderer.invoke('get-trade-emotions', tradeId),
  saveTradeEmotions: (payload) => ipcRenderer.invoke('save-trade-emotions', payload),

  // --- Stage 6: New IPC for mark-to-market ---
  updateMarkPrice: (payload) => ipcRenderer.invoke('update-mark-price', payload),
});