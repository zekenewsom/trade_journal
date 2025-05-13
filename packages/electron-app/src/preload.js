contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing exposed functions ...
  
  // Transaction functions
  updateSingleTransaction: (data) => ipcRenderer.invoke('update-single-transaction', data),
  deleteSingleTransaction: (transactionId) => ipcRenderer.invoke('delete-single-transaction', transactionId),
  fetchTradeWithTransactions: (tradeId) => ipcRenderer.invoke('fetch-trade-with-transactions', tradeId),
  
  // ... rest of existing code ...
}); 