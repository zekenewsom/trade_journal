// File: zekenewsom-trade_journal/packages/electron-app/main.js
// Modified to add IPC handler for 'save-trade'

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initializeDatabase, getDb, insertTrade } = require('./src/database/db'); // Added insertTrade

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'trade_journal.db');

// ... (createWindow function and app lifecycle events remain mostly the same)
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
    console.log('Running in development mode, expecting React app on port 5173');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // For production, you'll need to build the React app and load the file
    // For now, this setup focuses on development.
    // mainWindow.loadFile(path.join(__dirname, '../react-app/dist/index.html')); // Adjust as needed
    console.log("Production build loadFile not configured yet. Ensure React app is built and path is correct.");
    // Fallback for simplicity if not in explicit dev mode but vite dev server is running
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  console.log('App is ready. User data path:', userDataPath);
  console.log('Database path:', dbPath);
  initializeDatabase(dbPath);
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    const db = getDb();
    if (db && db.open) { // Check if db exists and is open
      db.close((err) => {
        if (err) {
          console.error('Error closing database connection:', err.message);
        } else {
          console.log('Database connection closed.');
        }
      });
    }
    app.quit();
  }
});


// --- IPC Handlers ---

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('test-db', () => {
  try {
    const db = getDb();
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='trades'").get();
    if (row) {
      return `Database connection successful. 'trades' table exists. DB Path: ${dbPath}`;
    } else {
      return `Database connection successful, but 'trades' table not found. DB Path: ${dbPath}`;
    }
  } catch (error) {
    console.error('Error testing database:', error);
    return `Error testing database: ${error.message}. DB Path: ${dbPath}`;
  }
});

// --- Added for Stage 2: IPC Handler for saving a trade ---
ipcMain.handle('save-trade', async (event, tradeData) => {
  console.log('Received trade data in main process:', tradeData);
  try {
    const newTradeId = insertTrade(tradeData); // Call the new DB function
    console.log(`Trade inserted with ID: ${newTradeId}`);
    return { success: true, message: 'Trade saved successfully!', tradeId: newTradeId };
  } catch (error) {
    console.error('Failed to save trade in main process:', error);
    return { success: false, message: `Error saving trade: ${error && error.message ? error.message : error}` };
  }
});
// --- End Stage 2 ---

if (!process.env.NODE_ENV && (process.argv.includes('--dev') || process.defaultApp)) {
  process.env.NODE_ENV = 'development';
}