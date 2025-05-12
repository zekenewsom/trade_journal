// File: zekenewsom-trade_journal/packages/electron-app/preload.js
// Modified for Stage 5: Updated ElectronAPI definitions

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  testDbConnection: () => ipcRenderer.invoke('test-db'),
  
  // Stage 5: Transaction-centric workflow
  logTransaction: (data) => ipcRenderer.invoke('log-transaction', data),
  getTrades: () => ipcRenderer.invoke('get-trades'), // Returns TradeListView[]
  getTradeWithTransactions: (tradeId) => ipcRenderer.invoke('get-trade-with-transactions', tradeId), // Returns full Trade with transactions
  updateTradeDetails: (data) => ipcRenderer.invoke('update-trade-details', data),
  updateSingleTransaction: (data) => ipcRenderer.invoke('update-single-transaction', data),
  deleteSingleTransaction: (transactionId) => ipcRenderer.invoke('delete-single-transaction', transactionId),
  deleteFullTrade: (tradeId) => ipcRenderer.invoke('delete-full-trade', tradeId),

  // Stage 4: Analytics
  getBasicAnalytics: () => ipcRenderer.invoke('get-basic-analytics'),
});