// File: zekenewsom-trade_journal/packages/electron-app/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path'); // Only declared once at the top
// This now requires the new facade db.js
const dbModule = require('./src/database/db');
const { isValidFinancialNumber } = require('./src/database/financialUtils');
const { 
  ValidationError, 
  validateAccountData, 
  validateTransactionData, 
  validateTradeData,
  validateInteger,
  validateFinancialNumber,
  validateString,
  validateArray
} = require('./src/database/validationUtils');

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'trade_journal.sqlite3');
console.log('[ELECTRON MAIN] Using DB at:', dbPath);

// Helper function to check maintenance mode and return early if in maintenance
function checkMaintenanceMode() {
  const maintenanceStatus = dbModule.isInMaintenanceMode();
  if (maintenanceStatus.inMaintenance) {
    return {
      success: false,
      message: `Application is currently in maintenance mode (${maintenanceStatus.operation}). Please try again in a moment.`
    };
  }
  return null;
}

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
ipcMain.handle('create-account', async (event, data) => {
  try {
    const validatedData = validateAccountData(data);
    const id = dbModule.createAccount(validatedData);
    return { success: true, id };
  } catch (error) {
    console.error('[IPC:create-account] Validation error:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Invalid account data provided' 
    };
  }
});

ipcMain.handle('rename-account', async (event, { accountId, newName }) => {
  try {
    const validatedAccountId = validateInteger(accountId, 'Account ID', { positive: true });
    const validatedData = validateAccountData({ name: newName });
    dbModule.renameAccount({ accountId: validatedAccountId, newName: validatedData.name });
    return { success: true };
  } catch (error) {
    console.error('[IPC:rename-account] Validation error:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Invalid account data provided' 
    };
  }
});

ipcMain.handle('archive-account', async (event, { accountId }) => {
  try {
    const validatedAccountId = validateInteger(accountId, 'Account ID', { positive: true });
    dbModule.archiveAccount({ accountId: validatedAccountId });
    return { success: true };
  } catch (error) {
    console.error('[IPC:archive-account] Validation error:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Invalid account ID provided' 
    };
  }
});

ipcMain.handle('unarchive-account', async (event, { accountId }) => {
  try {
    const validatedAccountId = validateInteger(accountId, 'Account ID', { positive: true });
    dbModule.unarchiveAccount({ accountId: validatedAccountId });
    return { success: true };
  } catch (error) {
    console.error('[IPC:unarchive-account] Validation error:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Invalid account ID provided' 
    };
  }
});

ipcMain.handle('delete-account', async (event, { accountId }) => {
  try {
    const validatedAccountId = validateInteger(accountId, 'Account ID', { positive: true });
    dbModule.deleteAccount({ accountId: validatedAccountId });
    return { success: true };
  } catch (error) {
    console.error('[IPC:delete-account] Validation error:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Invalid account ID provided' 
    };
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
    const validatedAccountId = validateInteger(accountId, 'Account ID', { positive: true });
    return dbModule.getAccountById(validatedAccountId);
  } catch (error) {
    console.error('[IPC:get-account-by-id] Validation error:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Invalid account ID provided' 
    };
  }
});

ipcMain.handle('add-account-transaction', async (event, data) => {
  try {
    const validatedData = {
      accountId: validateInteger(data.accountId, 'Account ID', { positive: true }),
      type: validateString(data.type, 'Transaction type', { 
        allowedValues: ['deposit', 'withdrawal', 'trade_open', 'trade_close', 'fee', 'adjustment'] 
      }),
      amount: validateFinancialNumber(data.amount, 'Amount', { min: -1000000, max: 1000000, allowZero: true }),
      relatedTradeId: data.relatedTradeId ? validateInteger(data.relatedTradeId, 'Related trade ID', { positive: true }) : null,
      memo: data.memo ? validateString(data.memo, 'Memo', { required: false, maxLength: 500 }) : null
    };
    const id = dbModule.addAccountTransaction(validatedData);
    return { success: true, id };
  } catch (error) {
    console.error('[IPC:add-account-transaction] Validation error:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Invalid transaction data provided' 
    };
  }
});

ipcMain.handle('get-account-transactions', async (event, { accountId, limit = 100, offset = 0 }) => {
  try {
    const validatedParams = {
      accountId: validateInteger(accountId, 'Account ID', { positive: true }),
      limit: validateInteger(limit, 'Limit', { min: 1, max: 1000 }),
      offset: validateInteger(offset, 'Offset', { min: 0 })
    };
    return dbModule.getAccountTransactions(validatedParams);
  } catch (error) {
    console.error('[IPC:get-account-transactions] Validation error:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Invalid request parameters' 
    };
  }
});

ipcMain.handle('get-account-balance', async (event, accountId) => {
  try {
    const validatedAccountId = validateInteger(accountId, 'Account ID', { positive: true });
    return dbModule.getAccountBalance(validatedAccountId);
  } catch (error) {
    console.error('[IPC:get-account-balance] Validation error:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Invalid account ID provided' 
    };
  }
});

ipcMain.handle('get-account-time-series', async (event, accountId) => {
  try {
    const validatedAccountId = validateInteger(accountId, 'Account ID', { positive: true });
    return dbModule.getAccountTimeSeries(validatedAccountId);
  } catch (error) {
    console.error('[IPC:get-account-time-series] Validation error:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Invalid account ID provided' 
    };
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

ipcMain.handle('get-maintenance-status', () => {
  try {
    return dbModule.isInMaintenanceMode();
  } catch (error) {
    console.error('[IPC:get-maintenance-status] Error:', error);
    return { inMaintenance: false, operation: null };
  }
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
    // Check maintenance mode first
    const maintenanceCheck = checkMaintenanceMode();
    if (maintenanceCheck) return maintenanceCheck;
    
    // Use shared validation utility for transaction data
    validateTransactionData(transactionData);
    
    const result = await dbModule.logTransaction(transactionData); // Calls transactionService via facade
    return result; // Expecting { success: boolean, message: string, ... }
  } catch (err) {
    console.error('[IPC:log-transaction] Error:', err);
    return { success: false, message: (err instanceof Error ? err.message : String(err)) || 'Unknown error logging transaction.' };
  }
});

ipcMain.handle('log-csv-transaction', async (event, transactionData) => {
  try {
    // Check maintenance mode first
    const maintenanceCheck = checkMaintenanceMode();
    if (maintenanceCheck) return maintenanceCheck;
    
    // Use shared validation utility for transaction data
    validateTransactionData(transactionData);
    
    const result = await dbModule.addCSVTransactionAndManageTrade(transactionData); // CSV-specific processing
    return result; // Expecting { success: boolean, message: string, ... }
  } catch (err) {
    console.error('[IPC:log-csv-transaction] Error:', err);
    return { success: false, message: (err instanceof Error ? err.message : String(err)) || 'Unknown error logging CSV transaction.' };
  }
});

ipcMain.handle('get-trades', async () => {
  try {
    // Check maintenance mode first
    const maintenanceCheck = checkMaintenanceMode();
    if (maintenanceCheck) return maintenanceCheck;
    
    const trades = await dbModule.fetchTradesForListView(); // Calls tradeService via facade
    return trades; // Expecting Trade[]
  } catch (error) {
    console.error('[IPC:get-trades] Error:', error);
    return { error: (error instanceof Error ? error.message : String(error)) || 'Failed to fetch trades' }; // Frontend expects an object with error key on failure
  }
});

ipcMain.handle('get-trade-with-transactions', async (event, tradeId) => {
  try {
    const validatedTradeId = validateInteger(tradeId, 'Trade ID', { positive: true });
    const trade = await dbModule.fetchTradeWithTransactions(validatedTradeId); // Calls tradeService
    return trade; // Expecting Trade | null
  } catch (error) {
    console.error('[IPC:get-trade-with-transactions] Error:', error);
    return { 
      error: error instanceof ValidationError ? error.message : 'Failed to fetch trade details' 
    };
  }
});

ipcMain.handle('update-trade-details', async (event, data) => {
  const maintenanceCheck = checkMaintenanceMode();
  if (maintenanceCheck) return maintenanceCheck;
  try {
    const validatedData = validateTradeData(data);
    const result = await dbModule.updateTradeMetadata(validatedData); // Calls tradeService
    return result; // Expecting { success: boolean, message: string }
  } catch (error) {
    console.error('[IPC:update-trade-details] Error updating trade details:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Failed to update trade details.' 
    };
  }
});

ipcMain.handle('update-single-transaction', async (event, data) => {
  const maintenanceCheck = checkMaintenanceMode();
  if (maintenanceCheck) return maintenanceCheck;
  try {
    // Validate transaction data - requires transaction_id plus any updatable fields
    const validatedData = {
      transaction_id: validateInteger(data.transaction_id, 'Transaction ID', { positive: true })
    };
    
    // Validate optional fields if they exist
    if (data.quantity !== undefined) {
      validatedData.quantity = validateFinancialNumber(data.quantity, 'Quantity');
    }
    if (data.price !== undefined) {
      validatedData.price = validateFinancialNumber(data.price, 'Price');
    }
    if (data.fees !== undefined) {
      validatedData.fees = validateFinancialNumber(data.fees, 'Fees', { allowZero: true });
    }
    if (data.notes !== undefined) {
      validatedData.notes = validateString(data.notes, 'Notes', { required: false, maxLength: 1000 });
    }
    
    const result = await dbModule.updateSingleTransaction(validatedData); // Calls transactionService
    return result;
  } catch (error) {
    console.error('[IPC:update-single-transaction] Error updating transaction:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Failed to update transaction.' 
    };
  }
});

ipcMain.handle('delete-single-transaction', async (event, transactionId) => {
  const maintenanceCheck = checkMaintenanceMode();
  if (maintenanceCheck) return maintenanceCheck;
  try {
    const validatedTransactionId = validateInteger(transactionId, 'Transaction ID', { positive: true });
    const result = await dbModule.deleteSingleTransaction(validatedTransactionId); // Calls transactionService
    return result;
  } catch (error) {
    console.error('[IPC:delete-single-transaction] Error deleting transaction:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Failed to delete transaction.' 
    };
  }
});

ipcMain.handle('delete-full-trade', async (event, tradeId) => {
  const maintenanceCheck = checkMaintenanceMode();
  if (maintenanceCheck) return maintenanceCheck;
  try {
    const validatedTradeId = validateInteger(tradeId, 'Trade ID', { positive: true });
    const result = await dbModule.deleteFullTradeAndTransactions(validatedTradeId); // Calls tradeService
    return result;
  } catch (error) {
    console.error('[IPC:delete-full-trade] Error deleting full trade:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Failed to delete full trade.' 
    };
  }
});

ipcMain.handle('get-analytics-data', async (event, filters) => {
  try {
    // Check maintenance mode first
    const maintenanceCheck = checkMaintenanceMode();
    if (maintenanceCheck) return maintenanceCheck;
    
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
    const validatedTradeId = validateInteger(tradeId, 'Trade ID', { positive: true });
    return await dbModule.getEmotionsForTrade(validatedTradeId); // Calls emotionService
  } catch (error) {
    console.error('[IPC:get-trade-emotions] Error:', error);
    return error instanceof ValidationError ? { error: error.message } : [];
  }
});

ipcMain.handle('save-trade-emotions', async (event, payload) => {
  const maintenanceCheck = checkMaintenanceMode();
  if (maintenanceCheck) return maintenanceCheck;
  try {
    if (!payload || typeof payload !== 'object') {
      throw new ValidationError('Emotion payload must be an object');
    }
    
    const validatedData = {
      tradeId: validateInteger(payload.tradeId, 'Trade ID', { positive: true }),
      emotionIds: validateArray(payload.emotionIds, 'Emotion IDs', {
        required: false,
        maxLength: 20,
        itemValidator: (item) => validateInteger(item, 'Emotion ID', { positive: true })
      })
    };
    
    const result = await dbModule.saveTradeEmotions(validatedData.tradeId, validatedData.emotionIds); // Calls emotionService
    return result;
  } catch (error) {
    console.error('[IPC:save-trade-emotions] Error saving trade emotions:', error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Failed to save emotions.' 
    };
  }
});

ipcMain.handle('update-mark-price', async (event, payload) => {
  const maintenanceCheck = checkMaintenanceMode();
  if (maintenanceCheck) return maintenanceCheck;
  try {
    if (!payload || typeof payload !== 'object') {
      throw new ValidationError('Mark price payload must be an object');
    }
    
    const validatedData = {
      tradeId: validateInteger(payload.tradeId, 'Trade ID', { positive: true }),
      marketPrice: validateFinancialNumber(payload.marketPrice, 'Market price', { min: 0 })
    };
    
    const result = await dbModule.updateMarkToMarketPrice(validatedData.tradeId, validatedData.marketPrice); // Calls tradeService
    return result; // Expects { success: boolean, message: string, trade_id?, unrealized_pnl?, ... }
  } catch (error) {
    console.error(`[IPC:update-mark-price] Error for trade ${payload?.tradeId}:`, error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Failed to update mark price.' 
    };
  }
});

ipcMain.handle('get-autocomplete-data', async (event, field) => {
  const maintenanceCheck = checkMaintenanceMode();
  if (maintenanceCheck) return maintenanceCheck;
  try {
    const validatedField = validateString(field, 'Field name', { allowEmpty: false });
    
    const validFields = ['instrument_ticker', 'exchange', 'setup_description', 'market_conditions'];
    if (!validFields.includes(validatedField)) {
      throw new ValidationError(`Invalid field for autocomplete: ${validatedField}`);
    }
    
    const result = await dbModule.getAutocompleteData(validatedField);
    return { success: true, data: result };
  } catch (error) {
    console.error(`[IPC:get-autocomplete-data] Error for field ${field}:`, error);
    return { 
      success: false, 
      message: error instanceof ValidationError ? error.message : 'Failed to fetch autocomplete data.',
      data: []
    };
  }
});

// Set NODE_ENV for development if not already set
if (!process.env.NODE_ENV && (process.argv.includes('--dev') || process.defaultApp)) {
  process.env.NODE_ENV = 'development';
}