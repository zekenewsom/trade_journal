// Transaction handlers
ipcMain.handle('update-single-transaction', async (event, data) => {
  return db.updateSingleTransaction(data);
});

ipcMain.handle('delete-single-transaction', async (event, transactionId) => {
  return db.deleteSingleTransaction(transactionId);
});

ipcMain.handle('fetch-trade-with-transactions', async (event, tradeId) => {
  return db.fetchTradeWithTransactions(tradeId);
}); 