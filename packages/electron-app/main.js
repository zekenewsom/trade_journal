// File: zekenewsom-trade_journal/packages/electron-app/main.js
// Modified for Stage 6: Add IPC handler for update-mark-price

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dbModule = require('./src/database/db');

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'trade_journal.sqlite3');
console.log('[ELECTRON MAIN] Using DB at:', dbPath);
// ... (createWindow, app lifecycle events - same as your Stage 5)
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Set secure Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data:",
          "connect-src 'self'"
        ].join('; ')
      }
    });
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../react-app/dist/index.html'));
  }
}
app.whenReady().then(() => {
  dbModule.initializeDatabase(dbPath);
  console.log('[ELECTRON MAIN] Database initialized at:', dbPath);
  createWindow();
  // You can add further startup logic here
});
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
ipcMain.handle('get-trades', async () => {
  try {
    const trades = await dbModule.fetchTradesForListView();
    return trades;
  } catch (error) {
    console.error('Error in get-trades handler:', error);
    return { error: error.message || 'Failed to fetch trades' };
  }
});
ipcMain.handle('get-trade-with-transactions', async (event, tradeId) => {
  try {
    const trade = await dbModule.fetchTradeWithTransactions(tradeId);
    return trade;
  } catch (error) {
    console.error('Error in get-trade-with-transactions handler:', error);
    return { error: error.message || 'Failed to fetch trade details' };
  }
});
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
ipcMain.handle('delete-single-transaction', async (event, transactionId) => {
  try {
    const result = dbModule.deleteSingleTransaction(transactionId);
    return result;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return { success: false, message: error.message || 'Failed to delete transaction.' };
  }
});
ipcMain.handle('delete-full-trade', async (event, tradeId) => { /* ... from Stage 5 ... */ });
ipcMain.handle('get-analytics-data', async (event, filters) => {
  try {
    const result = await dbModule.calculateAnalyticsData(filters);
    return result;
  } catch (error) {
    console.error('Error in get-analytics-data handler:', error);
    return { error: error.message || 'Failed to calculate analytics data' };
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