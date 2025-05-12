// File: trade_journal/packages/electron-app/preload.js
// Exposes protected methods from the Electron main process to the renderer process

const { contextBridge, ipcRenderer } = require('electron');

// Expose specific IPC channels to the renderer
// This is more secure than enabling nodeIntegration a_nd exposing all of Node.js
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  testDbConnection: () => ipcRenderer.invoke('test-db'), // Expose the test-db IPC
  // Add more IPC functions here as needed for future stages
  // For example:
  // saveTrade: (tradeData) => ipcRenderer.invoke('save-trade', tradeData),
  // getTrades: () => ipcRenderer.invoke('get-trades'),
});

console.log('Preload script loaded.');