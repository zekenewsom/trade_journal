// File: zekenewsom-trade_journal/packages/electron-app/main.js
// Modified for Stage 6: Add IPC handler for update-mark-price

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dbModule = require('./src/database/db');

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'trade_journal.sqlite3');
// ... (createWindow, app lifecycle events - same as your Stage 5)
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../react-app/dist/index.html'));
  }
}
app.whenReady().then(() => { dbModule.initializeDatabase(dbPath); createWindow(); /* ... */ });
app.on('window-all-closed', () => { /* ... */ });

// --- IPC Handlers ---
// ... (All existing handlers from Stage 5: get-app-version, test-db, log-transaction, get-trades, etc. remain)
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('test-db', () => dbModule.testDbConnection()); // Assuming testDbConnection is defined in db.js
ipcMain.handle('log-transaction', async (event, transactionData) => {
  try {
    const result = dbModule.logTransaction(transactionData);
    return result || { success: false, message: 'No result from logTransaction.' };
  } catch (err) {
    console.error('Error in log-transaction IPC:', err);
    return { success: false, message: err.message || 'Unknown error logging transaction.' };
  }
});
ipcMain.handle('get-trades', async () => dbModule.fetchTradesForListView());
ipcMain.handle('get-trade-with-transactions', async (event, tradeId) => dbModule.fetchTradeWithTransactions(tradeId));
ipcMain.handle('update-trade-details', async (event, data) => {
  try {
    const result = dbModule.updateTradeMetadata(data);
    return result;
  } catch (error) {
    console.error('Error updating trade details:', error);
    return { success: false, message: error.message || 'Failed to update trade details.' };
  }
});
ipcMain.handle('update-single-transaction', async (event, data) => {
  try {
    const result = dbModule.updateSingleTransaction(data);
    return result;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return { success: false, message: error.message || 'Failed to update transaction.' };
  }
});
ipcMain.handle('delete-single-transaction', async (event, transactionId) => { /* ... from Stage 5 ... */ });
ipcMain.handle('delete-full-trade', async (event, tradeId) => { /* ... from Stage 5 ... */ });
ipcMain.handle('get-analytics-data', async (event, filters) => {
  try {
    const result = dbModule.calculateAnalyticsData(filters || {});
    return result || { error: 'No analytics data returned from backend.' };
  } catch (err) {
    console.error('Error in get-analytics-data IPC:', err);
    return { error: err.message || 'Unknown error fetching analytics.' };
  }
});
ipcMain.handle('get-emotions', async () => dbModule.getEmotions());
ipcMain.handle('get-trade-emotions', async (event, tradeId) => dbModule.getEmotionsForTrade(tradeId));
ipcMain.handle('save-trade-emotions', async (event, payload) => {
  try {
    const { tradeId, emotionIds } = payload;
    const result = dbModule.saveTradeEmotions(tradeId, emotionIds);
    return result;
  } catch (error) {
    console.error('Error saving trade emotions:', error);
    return { success: false, message: error.message || 'Failed to save emotions.' };
  }
});

// --- Stage 6: New IPC Handler for Mark-to-Market ---
ipcMain.handle('update-mark-price', async (event, payload) => {
  const { tradeId, marketPrice } = payload;
  try {
    const result = dbModule.updateMarkToMarketPrice(tradeId, marketPrice);
    return result;
  } catch (error) {
    console.error(`Main: Error updating mark price for trade ${tradeId}:`, error);
    return { success: false, message: (error).message || 'Failed to update mark price.' };
  }
});
// --- End Stage 6 ---

if (!process.env.NODE_ENV && (process.argv.includes('--dev') || process.defaultApp)) {
  process.env.NODE_ENV = 'development';
}