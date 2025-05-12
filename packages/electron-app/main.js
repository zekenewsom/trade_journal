// File: zekenewsom-trade_journal/packages/electron-app/main.js
// Modified for Stage 5 IPC Handlers

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dbModule = require('./src/database/db');

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'trade_journal.db');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400, // Increased width a bit
    height: 900, // Increased height a bit
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false,
    },
  });
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // This needs to be configured for production builds
    // mainWindow.loadFile(path.join(__dirname, '../react-app/dist/index.html'));
    console.warn("Production loadFile not configured. Using dev server URL as fallback.");
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  dbModule.initializeDatabase(dbPath);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    dbModule.closeDatabase(); // Use the exported closeDatabase
    app.quit();
  }
});

// --- IPC Handlers ---
ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.handle('test-db', () => {
  try {
    const db = dbModule.getDb();
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='trades'").get();
    return `DB connection ${row ? 'successful, trades table exists' : 'successful, but trades table NOT found?'}. Path: ${dbPath}`;
  } catch (e) { return { error: `Error testing database: ${(e).message}`}; }
});

// Stage 5: Transaction Centric
ipcMain.handle('log-transaction', async (event, transactionData) => {
  console.log('Main: log-transaction received', transactionData);
  try {
    const result = dbModule.addTransactionAndManageTrade(transactionData);
    return { success: true, message: 'Transaction logged successfully!', ...result };
  } catch (error) {
    console.error('Main: Error logging transaction:', error);
    return { success: false, message: (error).message || 'Unknown error logging transaction.' };
  }
});

ipcMain.handle('get-trades', async () => {
  try { return dbModule.fetchTradesForListView(); }
  catch (error) { console.error('Main: Error fetching trades list:', error); return []; }
});

ipcMain.handle('get-trade-with-transactions', async (event, tradeId) => {
  try { return dbModule.fetchTradeWithTransactions(tradeId); }
  catch (error) { console.error(`Main: Error fetching trade ${tradeId} with transactions:`, error); return null; }
});

ipcMain.handle('update-trade-details', async (event, data) => {
  try {
    dbModule.updateTradeMetadata(data); // Changed function name for clarity
    return { success: true, message: 'Trade details updated!' };
  } catch (error) {
    console.error('Main: Error updating trade details:', error);
    return { success: false, message: (error).message };
  }
});

ipcMain.handle('update-single-transaction', async (event, data) => {
  try {
    dbModule.updateSingleTransaction(data);
    return { success: true, message: 'Transaction updated successfully!' };
  } catch (error) {
    console.error('Main: Error updating single transaction:', error);
    return { success: false, message: (error).message };
  }
});

ipcMain.handle('delete-single-transaction', async (event, transactionId) => {
  try {
    dbModule.deleteSingleTransaction(transactionId);
    return { success: true, message: 'Transaction deleted successfully!' };
  } catch (error) {
    console.error('Main: Error deleting single transaction:', error);
    return { success: false, message: (error).message };
  }
});

ipcMain.handle('delete-full-trade', async (event, tradeId) => {
  try {
    dbModule.deleteFullTradeAndTransactions(tradeId);
    return { success: true, message: 'Trade and all its transactions deleted!' };
  } catch (error) {
    console.error(`Main: Error deleting full trade ID ${tradeId}:`, error);
    return { success: false, message: (error).message };
  }
});

// Stage 4: Analytics
ipcMain.handle('get-basic-analytics', async () => {
  try {
    const analyticsData = dbModule.calculateBasicAnalytics();
    return analyticsData;
  } catch (error) {
    console.error('Main: Error calculating basic analytics:', error);
    return { error: (error).message || 'Unknown error in analytics' };
  }
});

if (!process.env.NODE_ENV && (process.argv.includes('--dev') || process.defaultApp)) {
  process.env.NODE_ENV = 'development';
}