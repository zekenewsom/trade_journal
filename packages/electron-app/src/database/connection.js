// packages/electron-app/src/database/connection.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { runMigrations } = require('./migrationService'); // Assumes migrationService.js is in the same directory

let db;

function seedInitialData(currentDbInstance) {
  const emotions = ['Confident', 'Greedy', 'Fearful', 'Anxious', 'Disciplined', 'Impatient', 'Hopeful', 'Frustrated', 'Bored', 'Excited', 'Focused', 'Overwhelmed'];
  const insertEmotion = currentDbInstance.prepare('INSERT OR IGNORE INTO emotions (emotion_name) VALUES (?)');
  const seedTx = currentDbInstance.transaction(() => {
    emotions.forEach(name => insertEmotion.run(name));
  });
  try {
    seedTx();
    console.log('[CONNECTION] Initial emotions seeded/checked.');
  } catch (error) {
    console.error("[CONNECTION] Error seeding emotions:", error);
  }
  // Add other seed data here if needed
}

function initializeDatabase(dbFilePath) {
  if (db && db.open) {
    console.log('[CONNECTION] Database already initialized and open.');
    return db;
  }
  try {
    const dbDir = path.dirname(dbFilePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`[CONNECTION] Created database directory: ${dbDir}`);
    }
    db = new Database(dbFilePath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    runMigrations(db); // Run migrations
    seedInitialData(db); // Seed initial data after migrations

    console.log(`[CONNECTION] Database initialized successfully: ${dbFilePath}`);
  } catch (error) {
    console.error('[CONNECTION] Failed to initialize database:', error);
    db = null;
    throw error; // Re-throw the error to be handled by the caller
  }
  return db;
}

function getDb() {
  if (!db || !db.open) {
    console.error('[CONNECTION] Database not initialized or has been closed.');
    throw new Error('Database not initialized or has been closed. Ensure initializeDatabase() is called on app start.');
  }
  return db;
}

function closeDatabase() {
  if (db && db.open) {
    db.close((err) => {
      if (err) console.error('[CONNECTION] Error closing the database connection:', err.message);
      else console.log('[CONNECTION] Database connection closed successfully.');
    });
    db = null;
  }
}

function testDbConnection() {
  try {
    if (db && db.open) {
      return { status: 'ok', message: 'Database connection is open.' };
    }
    return { status: 'error', message: 'Database is not initialized or not open.' };
  } catch (err) {
    return { status: 'error', message: (err instanceof Error ? err.message : String(err)) || 'Unknown error.' };
  }
}

const { dialog } = require('electron');

async function backupDatabase() {
  try {
    if (!db || !db.open) throw new Error('Database not initialized.');
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Save Database Backup',
      defaultPath: `trade_journal_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite3`,
      filters: [{ name: 'SQLite Database', extensions: ['sqlite3'] }]
    });
    if (canceled || !filePath) return { success: false, message: 'Backup canceled by user.' };
    fs.copyFileSync(db.name, filePath);
    return { success: true, message: `Backup saved to ${filePath}` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  }
}

async function restoreDatabase() {
  try {
    if (!db || !db.open) throw new Error('Database not initialized.');
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: 'Select Backup to Restore',
      filters: [{ name: 'SQLite Database', extensions: ['sqlite3'] }],
      properties: ['openFile']
    });
    if (canceled || !filePaths || !filePaths[0]) return { success: false, message: 'Restore canceled by user.' };
    db.close();
    fs.copyFileSync(filePaths[0], db.name);
    initializeDatabase(db.name); // Reopen DB
    return { success: true, message: 'Database restored from backup.' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  }
}

module.exports = {
  initializeDatabase,
  getDb,
  closeDatabase,
  seedInitialData,
  testDbConnection,
  backupDatabase,
  restoreDatabase,
};