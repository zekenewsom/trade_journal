// File: zekenewsom-trade_journal/packages/electron-app/main.js
// Modified for Stage 4 IPC Handler

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const {
  initializeDatabase,
  getDb,
  insertTrade,
  fetchTrades,
  fetchTradeById,
  updateTradeInDb,
  deleteTradeFromDb,
  // --- Added for Stage 4 ---
  calculateBasicAnalytics
  // --- End Stage 4 ---
} = require('./src/database/db');

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'trade_journal.db');

// ... (createWindow and other app lifecycle events remain the same)
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
    console.log("Production build loadFile not configured yet. Ensure React app is built and path is correct.");
    mainWindow.loadURL('http://localhost:5173');
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
// ... (get-app-version, test-db, save-trade, get-trades, get-trade-by-id, update-trade, delete-trade handlers remain the same)
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('test-db', () => {
  try {
    const db = getDb();
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='trades'").get();
    return `DB ${row ? 'ok' : 'not ok (trades table missing?)'}. Path: ${dbPath}`;
  } catch (e) { return `Error: ${e && e.message ? e.message : e}`; }
});
ipcMain.handle('save-trade', async (event, tradeData) => {
  try {
    const newTradeId = insertTrade(tradeData);
    return { success: true, message: 'Trade saved successfully!', tradeId: newTradeId };
  } catch (error) { return { success: false, message: error && error.message ? error.message : error }; }
});
ipcMain.handle('get-trades', async () => {
  try { return fetchTrades(); } catch (error) { console.error('Main: Error fetching trades:', error); return []; }
});
ipcMain.handle('get-trade-by-id', async (event, id) => {
  try { return fetchTradeById(id); } catch (error) { console.error(`Main: Error fetching trade ID ${id}:`, error); return null; }
});
ipcMain.handle('update-trade', async (event, tradeData) => {
  try { updateTradeInDb(tradeData); return { success: true, message: 'Trade updated successfully!' }; }
  catch (error) { console.error('Main: Error updating trade:', error); return { success: false, message: error && error.message ? error.message : error }; }
});
ipcMain.handle('delete-trade', async (event, id) => {
  try { deleteTradeFromDb(id); return { success: true, message: 'Trade deleted successfully!' }; }
  catch (error) { console.error(`Main: Error deleting trade ID ${id}:`, error); return { success: false, message: error && error.message ? error.message : error }; }
});

// --- Added for Stage 4 ---
ipcMain.handle('get-basic-analytics', async () => {
  console.log('Main: get-basic-analytics received');
  try {
    const analyticsData = calculateBasicAnalytics();
    return analyticsData;
  } catch (error) {
    console.error('Main: Error calculating basic analytics:', error);
    // Consider returning a specific error structure or re-throwing
    return { error: error && error.message ? error.message : error }; // Or simply throw error
  }
});
// --- End Stage 4 ---

if (!process.env.NODE_ENV && (process.argv.includes('--dev') || process.defaultApp)) {
  process.env.NODE_ENV = 'development';
}