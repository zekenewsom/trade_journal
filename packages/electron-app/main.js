// File: zekenewsom-trade_journal/packages/electron-app/main.js
// Modified for Stage 3 IPC Handlers

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
// Import all necessary DB functions
const {
  initializeDatabase,
  getDb,
  insertTrade, // From Stage 2
  fetchTrades, // New for Stage 3
  fetchTradeById, // New for Stage 3
  updateTradeInDb, // New for Stage 3
  deleteTradeFromDb // New for Stage 3
} = require('./src/database/db');

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'trade_journal.db');

// ... (createWindow, app.whenReady, app.on('window-all-closed') remain largely the same)
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Proper production loadFile logic should be implemented when packaging
    // mainWindow.loadFile(path.join(__dirname, '../react-app/dist/index.html'));
    console.log("Production build loadFile not configured yet. Ensure React app is built and path is correct.");
    mainWindow.loadURL('http://localhost:5173'); // Fallback for now
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  initializeDatabase(dbPath);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    const db = getDb();
    if (db && db.open) {
      db.close(err => err && console.error('Error closing DB:', err.message));
    }
    app.quit();
  }
});

// --- IPC Handlers ---
ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.handle('test-db', () => {
  // ... (same as before)
  try {
    const db = getDb();
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='trades'").get();
    return `DB ${row ? 'ok' : 'not ok (trades table missing?)'}. Path: ${dbPath}`;
  } catch (e) { return `Error: ${e.message}`; }
});

// Stage 2
ipcMain.handle('save-trade', async (event, tradeData) => {
  console.log('Main: save-trade received', tradeData);
  try {
    const newTradeId = insertTrade(tradeData);
    return { success: true, message: 'Trade saved successfully!', tradeId: newTradeId };
  } catch (error) {
    console.error('Main: Error saving trade:', error);
    return { success: false, message: error && error.message ? error.message : String(error) };
  }
});

// --- Added/Modified for Stage 3 ---
ipcMain.handle('get-trades', async () => {
  console.log('Main: get-trades received');
  try {
    const trades = fetchTrades();
    return trades;
  } catch (error) {
    console.error('Main: Error fetching trades:', error);
    // Return empty array or throw error to be caught by renderer
    return []; // Or: throw error;
  }
});

ipcMain.handle('get-trade-by-id', async (event, id) => {
  console.log('Main: get-trade-by-id received for ID:', id);
  try {
    const trade = fetchTradeById(id);
    return trade; // Can be null if not found
  } catch (error) {
    console.error(`Main: Error fetching trade by ID ${id}:`, error);
    return null; // Or: throw error;
  }
});

ipcMain.handle('update-trade', async (event, tradeData) => {
  console.log('Main: update-trade received for ID:', tradeData.trade_id, tradeData);
  try {
    updateTradeInDb(tradeData);
    return { success: true, message: 'Trade updated successfully!' };
  } catch (error) {
    console.error('Main: Error updating trade:', error);
    return { success: false, message: error && error.message ? error.message : String(error) };
  }
});

ipcMain.handle('delete-trade', async (event, id) => {
  console.log('Main: delete-trade received for ID:', id);
  try {
    deleteTradeFromDb(id);
    return { success: true, message: 'Trade deleted successfully!' };
  } catch (error) {
    console.error(`Main: Error deleting trade ID ${id}:`, error);
    return { success: false, message: error && error.message ? error.message : String(error) };
  }
});
// --- End Stage 3 ---

if (!process.env.NODE_ENV && (process.argv.includes('--dev') || process.defaultApp)) {
  process.env.NODE_ENV = 'development';
}