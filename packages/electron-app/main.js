// File: zekenewsom-trade_journal/packages/electron-app/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path'); // Only declared once at the top
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

// --- Account IPC Handlers ---
ipcMain.handle('create-account', async (event, { name, type = 'cash' }) => {
  try {
    if (!name) throw new Error('Account name is required');
    const id = dbModule.createAccount({ name, type });
    return { success: true, id };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('rename-account', async (event, { accountId, newName }) => {
  try {
    if (!accountId || !newName) throw new Error('accountId and newName required');
    dbModule.renameAccount({ accountId, newName });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('archive-account', async (event, { accountId }) => {
  try {
    if (!accountId) throw new Error('accountId required');
    dbModule.archiveAccount({ accountId });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('unarchive-account', async (event, { accountId }) => {
  try {
    if (!accountId) throw new Error('accountId required');
    dbModule.unarchiveAccount({ accountId });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('delete-account', async (event, { accountId }) => {
  try {
    if (!accountId) throw new Error('accountId required');
    dbModule.deleteAccount({ accountId });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-accounts', async (event, opts = {}) => {
  try {
    return dbModule.getAccounts(opts);
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-account-by-id', async (event, accountId) => {
  try {
    if (!accountId) throw new Error('accountId required');
    return dbModule.getAccountById(accountId);
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('add-account-transaction', async (event, { accountId, type, amount, relatedTradeId = null, memo = null }) => {
  try {
    if (!accountId || !type || typeof amount !== 'number') throw new Error('accountId, type, and amount required');
    const id = dbModule.addAccountTransaction({ accountId, type, amount, relatedTradeId, memo });
    return { success: true, id };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-account-transactions', async (event, { accountId, limit = 100, offset = 0 }) => {
  try {
    if (!accountId) throw new Error('accountId required');
    return dbModule.getAccountTransactions({ accountId, limit, offset });
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-account-balance', async (event, accountId) => {
  try {
    if (!accountId) throw new Error('accountId required');
    return dbModule.getAccountBalance(accountId);
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-account-time-series', async (event, accountId) => {
  try {
    if (!accountId) throw new Error('accountId required');
    return dbModule.getAccountTimeSeries(accountId);
  } catch (error) {
    return { success: false, message: error.message };
  }
});


const { dialog } = require('electron');
const fs = require('fs');
const { Parser: Json2CsvParser } = (() => { try { return require('json2csv'); } catch { return {}; } })();
const xlsx = (() => { try { return require('xlsx'); } catch { return {}; } })();

ipcMain.handle('export-data-csv', async () => {
  try {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Export Data as CSV',
      defaultPath: `trade_journal_export_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`,
      filters: [{ name: 'CSV File', extensions: ['csv'] }]
    });
    if (canceled || !filePath) return { success: false, message: 'Export canceled by user.' };
    const trades = await dbModule.fetchTradesForListView();
    if (!trades || trades.length === 0) return { success: false, message: 'No trades to export.' };
    if (!Json2CsvParser) return { success: false, message: 'json2csv not installed.' };
    const parser = new Json2CsvParser();
    const csv = parser.parse(trades);
    fs.writeFileSync(filePath, csv);
    return { success: true, message: `Exported to ${filePath}` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('export-data-json', async () => {
  try {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Export Data as JSON',
      defaultPath: `trade_journal_export_${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
      filters: [{ name: 'JSON File', extensions: ['json'] }]
    });
    if (canceled || !filePath) return { success: false, message: 'Export canceled by user.' };
    const trades = await dbModule.fetchTradesForListView();
    if (!trades || trades.length === 0) return { success: false, message: 'No trades to export.' };
    fs.writeFileSync(filePath, JSON.stringify(trades, null, 2));
    return { success: true, message: `Exported to ${filePath}` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('export-data-xlsx', async () => {
  try {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Export Data as Excel',
      defaultPath: `trade_journal_export_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`,
      filters: [{ name: 'Excel File', extensions: ['xlsx'] }]
    });
    if (canceled || !filePath) return { success: false, message: 'Export canceled by user.' };
    const trades = await dbModule.fetchTradesForListView();
    if (!trades || trades.length === 0) return { success: false, message: 'No trades to export.' };
    if (!xlsx || !xlsx.utils) return { success: false, message: 'xlsx package not installed.' };
    const ws = xlsx.utils.json_to_sheet(trades);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Trades');
    xlsx.writeFile(wb, filePath);
    return { success: true, message: `Exported to ${filePath}` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('backup-database', async () => {
  try {
    const result = await dbModule.backupDatabase();
    return result;
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('restore-database', async () => {
  try {
    const result = await dbModule.restoreDatabase();
    return result;
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  }
});

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