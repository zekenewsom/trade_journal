// packages/electron-app/src/database/connection.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { runMigrations } = require('./migrationService'); // Assumes migrationService.js is in the same directory

let db;
let isMaintenanceMode = false;
let maintenanceOperation = null;

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
  if (isMaintenanceMode) {
    console.error(`[CONNECTION] Database is in maintenance mode: ${maintenanceOperation}`);
    throw new Error(`Database is currently in maintenance mode (${maintenanceOperation}). Please try again in a moment.`);
  }
  if (!db || !db.open) {
    console.error('[CONNECTION] Database not initialized or has been closed.');
    throw new Error('Database not initialized or has been closed. Ensure initializeDatabase() is called on app start.');
  }
  return db;
}

function closeDatabase() {
  if (db && db.open) {
    try {
      db.close();
      console.log('[CONNECTION] Database connection closed successfully.');
    } catch (err) {
      console.error('[CONNECTION] Error closing the database connection:', err instanceof Error ? err.message : err);
    }
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
    if (isMaintenanceMode) {
      return { success: false, message: `Cannot create backup: currently in maintenance mode (${maintenanceOperation}).` };
    }
    if (!db || !db.open) throw new Error('Database not initialized.');
    
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Save Database Backup',
      defaultPath: `trade_journal_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite3`,
      filters: [{ name: 'SQLite Database', extensions: ['sqlite3'] }]
    });
    if (canceled || !filePath) return { success: false, message: 'Backup canceled by user.' };
    
    // Use WAL checkpoint to ensure all data is written to main database file
    db.pragma('wal_checkpoint(TRUNCATE)');
    
    fs.copyFileSync(db.name, filePath);
    return { success: true, message: `Backup saved to ${filePath}` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  }
}

async function restoreDatabase() {
  // Check if already in maintenance mode
  if (isMaintenanceMode) {
    return { success: false, message: `Cannot restore database: currently in maintenance mode (${maintenanceOperation}).` };
  }
  
  let originalDbPath = null;
  let backupBeforeRestore = null;
  
  try {
    if (!db || !db.open) throw new Error('Database not initialized.');
    
    // Get user selection for restore file
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: 'Select Backup to Restore',
      filters: [{ name: 'SQLite Database', extensions: ['sqlite3'] }],
      properties: ['openFile']
    });
    if (canceled || !filePaths || !filePaths[0]) {
      return { success: false, message: 'Restore canceled by user.' };
    }
    
    const restoreFilePath = filePaths[0];
    originalDbPath = db.name;
    
    // Validate the backup file exists and is readable
    if (!fs.existsSync(restoreFilePath)) {
      throw new Error('Selected backup file does not exist.');
    }
    
    // Test if the backup file is a valid SQLite database
    let testDb;
    try {
      testDb = new Database(restoreFilePath, { readonly: true });
      testDb.prepare('SELECT name FROM sqlite_master WHERE type="table"').all();
      testDb.close();
    } catch (error) {
      throw new Error('Selected file is not a valid SQLite database.');
    }
    
    // Enter maintenance mode
    isMaintenanceMode = true;
    maintenanceOperation = 'Database Restore';
    console.log('[CONNECTION] Entering maintenance mode for database restore');
    
    // Create a backup of current database before restoration
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    backupBeforeRestore = `${originalDbPath}.pre-restore-${timestamp}.bak`;
    fs.copyFileSync(originalDbPath, backupBeforeRestore);
    console.log(`[CONNECTION] Created pre-restore backup: ${backupBeforeRestore}`);
    
    // Close current database connection
    db.close();
    console.log('[CONNECTION] Closed database for restore operation');
    
    // Copy the restore file to the database location
    fs.copyFileSync(restoreFilePath, originalDbPath);
    console.log(`[CONNECTION] Copied restore file to: ${originalDbPath}`);
    
    // Reinitialize database with restored data
    initializeDatabase(originalDbPath);
    console.log('[CONNECTION] Database reinitialized after restore');
    
    // Exit maintenance mode
    isMaintenanceMode = false;
    maintenanceOperation = null;
    console.log('[CONNECTION] Exited maintenance mode');
    
    // Clean up the pre-restore backup after successful restore
    try {
      fs.unlinkSync(backupBeforeRestore);
      console.log('[CONNECTION] Cleaned up pre-restore backup');
    } catch (cleanupError) {
      console.warn('[CONNECTION] Could not clean up pre-restore backup:', cleanupError.message);
    }
    
    return { 
      success: true, 
      message: 'Database successfully restored from backup. All data has been replaced with the backup data.' 
    };
    
  } catch (error) {
    console.error('[CONNECTION] Database restore failed:', error);
    
    // Attempt to rollback if we have a backup and the original database is corrupted
    if (backupBeforeRestore && fs.existsSync(backupBeforeRestore) && originalDbPath) {
      try {
        console.log('[CONNECTION] Attempting to rollback to pre-restore state');
        if (db && db.open) {
          db.close();
        }
        fs.copyFileSync(backupBeforeRestore, originalDbPath);
        initializeDatabase(originalDbPath);
        fs.unlinkSync(backupBeforeRestore); // Clean up backup
        console.log('[CONNECTION] Successfully rolled back to pre-restore state');
      } catch (rollbackError) {
        console.error('[CONNECTION] Rollback failed:', rollbackError);
        // Database is in an unknown state - this is critical
        return { 
          success: false, 
          message: `Database restore failed and rollback also failed. Database may be corrupted. Error: ${error.message}. Rollback error: ${rollbackError.message}` 
        };
      }
    }
    
    // Ensure maintenance mode is exited even on failure
    isMaintenanceMode = false;
    maintenanceOperation = null;
    
    return { 
      success: false, 
      message: `Database restore failed: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

function isInMaintenanceMode() {
  return {
    inMaintenance: isMaintenanceMode,
    operation: maintenanceOperation
  };
}

function setMaintenanceMode(enabled, operation = null) {
  isMaintenanceMode = enabled;
  maintenanceOperation = operation;
  console.log(`[CONNECTION] Maintenance mode ${enabled ? 'enabled' : 'disabled'}${operation ? ` for: ${operation}` : ''}`);
}

module.exports = {
  initializeDatabase,
  getDb,
  closeDatabase,
  seedInitialData,
  testDbConnection,
  backupDatabase,
  restoreDatabase,
  isInMaintenanceMode,
  setMaintenanceMode,
};