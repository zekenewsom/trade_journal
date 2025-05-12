// File: zekenewsom-trade_journal/packages/electron-app/main.js
// Modified for Stage 6: New IPC handlers for analytics and emotions

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dbModule = require('./src/database/db');

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'trade_journal.sqlite3');
// ... (createWindow, app lifecycle events - same)
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // recommended for security
      contextIsolation: true, // recommended for security
    },
  });

  const startUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../react-app/dist/index.html')}`;
  win.loadURL(startUrl);

  // Open devtools automatically in dev mode
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => { dbModule.initializeDatabase(dbPath); createWindow(); /* ... */ });
app.on('window-all-closed', () => { /* ... */ });


// --- IPC Handlers ---
// ... (getAppVersion, testDb, logTransaction, getTrades, getTradeWithTransactions, updateTradeDetails, updateSingleTransaction, deleteSingleTransaction, deleteFullTrade - same as Stage 5)
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('test-db', () => {
  try {
    const db = dbModule.getDb(); // Will throw if not initialized
    if (db && db.open) {
      return { status: 'ok', message: 'Database is initialized and open.' };
    } else {
      return { status: 'error', message: 'Database is not open.' };
    }
  } catch (error) {
    return { status: 'error', message: error.message || 'Database status unknown.' };
  }
});
ipcMain.handle('log-transaction', async (event, transactionData) => {
  try {
    const result = dbModule.addTransactionAndManageTrade(transactionData);
    return { success: true, result };
  } catch (error) {
    console.error('Main: Error logging transaction:', error);
    return { success: false, message: (error && error.message) || 'Unknown error logging transaction' };
  }
});
ipcMain.handle('get-trades', async () => dbModule.fetchTradesForListView());
ipcMain.handle('get-trade-with-transactions', async (event, tradeId) => dbModule.fetchTradeWithTransactions(tradeId));
ipcMain.handle('update-trade-details', async (event, data) => {
  try {
    const changes = dbModule.updateTradeMetadata(data);
    if (changes > 0) {
      return { success: true, message: 'Trade details updated.' };
    } else {
      return { success: false, message: 'No trade was updated. Check trade ID.' };
    }
  } catch (error) {
    console.error('Main: Error updating trade details:', error);
    return { success: false, message: (error && error.message) || 'Unknown error updating trade details' };
  }
});
ipcMain.handle('update-single-transaction', async (event, data) => { /* ... */});
ipcMain.handle('delete-single-transaction', async (event, transactionId) => { /* ... */});
ipcMain.handle('delete-full-trade', async (event, tradeId) => { /* ... */});


// --- Modified/New for Stage 6 ---
ipcMain.handle('get-analytics-data', async (event, filters) => {
  console.log('Main: get-analytics-data received with filters:', filters);
  try {
    const analyticsData = dbModule.calculateAnalyticsData(filters); // Pass filters
    return analyticsData;
  } catch (error) {
    console.error('Main: Error calculating analytics data:', error);
    return { error: (error).message || 'Unknown error calculating analytics' };
  }
});

ipcMain.handle('get-emotions', async () => {
    try { return dbModule.getEmotions(); }
    catch (error) { console.error('Main: Error fetching emotions:', error); return [];}
});

ipcMain.handle('get-trade-emotions', async (event, tradeId) => {
    try { return dbModule.getEmotionsForTrade(tradeId); }
    catch (error) { console.error(`Main: Error fetching emotions for trade ${tradeId}:`, error); return [];}
});

ipcMain.handle('save-trade-emotions', async (event, payload) => {
    const { tradeId, emotionIds } = payload;
    try {
        dbModule.saveEmotionsForTrade(tradeId, emotionIds);
        return { success: true, message: 'Trade emotions updated.' };
    } catch (error) {
        console.error(`Main: Error saving emotions for trade ${tradeId}:`, error);
        return { success: false, message: (error).message };
    }
});
// --- End Stage 6 ---

if (!process.env.NODE_ENV && (process.argv.includes('--dev') || process.defaultApp)) {
  process.env.NODE_ENV = 'development';
}