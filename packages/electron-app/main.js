// File: zekenewsom-trade_journal/packages/electron-app/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
// This now requires the new facade db.js
const dbModule = require('./src/database/db');

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'trade_journal.sqlite3');
console.log('[ELECTRON MAIN] Using DB at:', dbPath);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Recommended for security
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'sha256-NEZvGkT0ZWP6XHdKYM4B1laRPcM6Lw4LJfkDtIEVAKc='", // Allow this specific inline script
          "style-src 'self' 'unsafe-inline'", // Try to remove 'unsafe-inline'
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
  // initializeDatabase is now part of the dbModule (facade)
  dbModule.initializeDatabase(dbPath);
  console.log('[ELECTRON MAIN] Database initialized via facade at:', dbPath);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    dbModule.closeDatabase(); // Ensure DB is closed
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// --- IPC Handlers ---
// These should now call functions exposed by the db.js facade,
// which in turn call the respective service functions.

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('test-db', async () => {
  try {
    return await dbModule.testDbConnection();
  } catch (err) {
    console.error('[IPC:test-db] Error:', err);
    return { status: 'error', message: (err instanceof Error ? err.message : String(err)) };
  }
});

ipcMain.handle('log-transaction', async (event, transactionData) => {
  try {
    // Input validation can be added here or ensured it's robust in the service
    const result = await dbModule.logTransaction(transactionData); // Calls transactionService via facade
    return result; // Expecting { success: boolean, message: string, ... }
  } catch (err) {
    console.error('[IPC:log-transaction] Error:', err);
    return { success: false, message: (err instanceof Error ? err.message : String(err)) || 'Unknown error logging transaction.' };
  }
});

ipcMain.handle('get-trades', async () => {
  try {
    const trades = await dbModule.fetchTradesForListView(); // Calls tradeService via facade
    return trades; // Expecting TradeListView[]
  } catch (error) {
    console.error('[IPC:get-trades] Error:', error);
    return { error: (error instanceof Error ? error.message : String(error)) || 'Failed to fetch trades' }; // Frontend expects an object with error key on failure
  }
});

ipcMain.handle('get-trade-with-transactions', async (event, tradeId) => {
  try {
    if (typeof tradeId !== 'number') throw new Error("Invalid tradeId provided.");
    const trade = await dbModule.fetchTradeWithTransactions(tradeId); // Calls tradeService
    return trade; // Expecting Trade | null
  } catch (error) {
    console.error('[IPC:get-trade-with-transactions] Error:', error);
    return { error: (error instanceof Error ? error.message : String(error)) || 'Failed to fetch trade details' };
  }
});

ipcMain.handle('update-trade-details', async (event, data) => {
  try {
    // Add validation for 'data' if necessary
    const result = await dbModule.updateTradeMetadata(data); // Calls tradeService
    return result; // Expecting { success: boolean, message: string }
  } catch (error) {
    console.error('[IPC:update-trade-details] Error updating trade details:', error);
    return { success: false, message: (error instanceof Error ? error.message : String(error)) || 'Failed to update trade details.' };
  }
});

ipcMain.handle('update-single-transaction', async (event, data) => {
  try {
    // Add validation for 'data'
    const result = await dbModule.updateSingleTransaction(data); // Calls transactionService
    return result;
  } catch (error) {
    console.error('[IPC:update-single-transaction] Error updating transaction:', error);
    return { success: false, message: (error instanceof Error ? error.message : String(error)) || 'Failed to update transaction.' };
  }
});

ipcMain.handle('delete-single-transaction', async (event, transactionId) => {
  try {
    if (typeof transactionId !== 'number') throw new Error("Invalid transactionId provided.");
    const result = await dbModule.deleteSingleTransaction(transactionId); // Calls transactionService
    return result;
  } catch (error) {
    console.error('[IPC:delete-single-transaction] Error deleting transaction:', error);
    return { success: false, message: (error instanceof Error ? error.message : String(error)) || 'Failed to delete transaction.' };
  }
});

ipcMain.handle('delete-full-trade', async (event, tradeId) => {
  try {
    if (typeof tradeId !== 'number') throw new Error("Invalid tradeId provided.");
    const result = await dbModule.deleteFullTradeAndTransactions(tradeId); // Calls tradeService
    return result;
  } catch (error) {
    console.error('[IPC:delete-full-trade] Error deleting full trade:', error);
    return { success: false, message: (error instanceof Error ? error.message : String(error)) || 'Failed to delete full trade.' };
  }
});

ipcMain.handle('get-analytics-data', async (event, filters) => {
  try {
    // Add validation for 'filters' if necessary
    const result = await dbModule.calculateAnalyticsData(filters); // Calls analyticsService
    return result; // Expecting AnalyticsData | { error: string }
  } catch (error) {
    console.error('[IPC:get-analytics-data] Error:', error);
    return { error: (error instanceof Error ? error.message : String(error)) || 'Failed to calculate analytics data' };
  }
});

ipcMain.handle('get-emotions', async () => {
  try {
    return await dbModule.getEmotions(); // Calls emotionService
  } catch (error) {
    console.error('[IPC:get-emotions] Error:', error);
    return []; // Or an error object
  }
});

ipcMain.handle('get-trade-emotions', async (event, tradeId) => {
  try {
    if (typeof tradeId !== 'number') throw new Error("Invalid tradeId provided.");
    return await dbModule.getEmotionsForTrade(tradeId); // Calls emotionService
  } catch (error) {
    console.error('[IPC:get-trade-emotions] Error:', error);
    return []; // Or an error object
  }
});

ipcMain.handle('save-trade-emotions', async (event, payload) => {
  try {
    // Add validation for 'payload'
    const { tradeId, emotionIds } = payload;
    const result = await dbModule.saveTradeEmotions(tradeId, emotionIds); // Calls emotionService
    return result;
  } catch (error) {
    console.error('[IPC:save-trade-emotions] Error saving trade emotions:', error);
    return { success: false, message: (error instanceof Error ? error.message : String(error)) || 'Failed to save emotions.' };
  }
});

ipcMain.handle('update-mark-price', async (event, payload) => {
  try {
    const { tradeId, marketPrice } = payload;
    if (typeof tradeId !== 'number' || typeof marketPrice !== 'number' || marketPrice < 0) {
        throw new Error("Invalid input for updating mark price.");
    }
    const result = await dbModule.updateMarkToMarketPrice(tradeId, marketPrice); // Calls tradeService
    return result; // Expects { success: boolean, message: string, trade_id?, unrealized_pnl?, ... }
  } catch (error) {
    console.error(`[IPC:update-mark-price] Error for trade ${payload?.tradeId}:`, error);
    return { success: false, message: (error instanceof Error ? error.message : String(error)) || 'Failed to update mark price.' };
  }
});

// Set NODE_ENV for development if not already set
if (!process.env.NODE_ENV && (process.argv.includes('--dev') || process.defaultApp)) {
  process.env.NODE_ENV = 'development';
}