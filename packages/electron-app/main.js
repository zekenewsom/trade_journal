// File: trade_journal/packages/electron-app/main.js
// Electron main process

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initializeDatabase, getDb } = require('./src/database/db');

// Define the path for the SQLite database file
// It will be stored in the user's application data directory
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'trade_journal.db');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Important for security
      nodeIntegration: false, // Important for security
    },
  });

  // Load the index.html of the app.
  // In development, load from Vite dev server. In production, load from built files.
  if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode, expecting React app on port 5173');
    mainWindow.loadURL('http://localhost:5173'); // Default Vite port
    mainWindow.webContents.openDevTools(); // Open DevTools automatically in dev
  } else {
    // TODO: Adjust this path once the React app is built into electron-app/dist or similar
    // This assumes react-app builds to a 'dist' folder relative to electron-app.
    // Or, more typically, react-app builds to its own dist, and we copy it or point to it.
    // For now, we'll keep it simple and assume dev mode primarily.
    // mainWindow.loadFile(path.join(__dirname, '../react-app/dist/index.html'));
    // A common pattern is to build react-app into a folder that electron-app can access,
    // e.g., electron-app/renderer-dist
    console.log("Production build not configured yet. Run in dev mode.");
    // Fallback to Vite dev server for now, even if NODE_ENV is not explicitly 'development'
    // This will allow the app to run if `pnpm dev` is used, which sets up the react dev server.
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  console.log('App is ready. User data path:', userDataPath);
  console.log('Database path:', dbPath);

  // Initialize the database
  initializeDatabase(dbPath);

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    // Close the database connection when the app quits
    const db = getDb();
    if (db) {
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// --- IPC Handlers ---

// Example IPC handler (can be expanded in future stages)
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Basic IPC handler for testing database initialization
ipcMain.handle('test-db', () => {
  try {
    const db = getDb();
    // Perform a simple query to test
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

// Set NODE_ENV for development if running with nodemon/electron in dev
// This helps the main process know if it should load from Vite dev server
if (!process.env.NODE_ENV && (process.argv.includes('--dev') || process.defaultApp)) {
  process.env.NODE_ENV = 'development';
}