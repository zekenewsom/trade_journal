// File: trade_journal/packages/electron-app/src/database/db.js
// SQLite database setup and utility functions using better-sqlite3

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { createTables } = require('./schema');

let db; // Singleton instance of the database

/**
 * Initializes the SQLite database.
 * Creates the database file if it doesn't exist and sets up the schema.
 * @param {string} dbPath - The absolute path to the database file.
 */
function initializeDatabase(dbFilePath) {
  if (db) {
    console.warn('Database already initialized.');
    return db;
  }

  try {
    // Ensure the directory for the database file exists
    const dbDir = path.dirname(dbFilePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Created database directory: ${dbDir}`);
    }

    db = new Database(dbFilePath, { verbose: console.log }); // Enable verbose logging for better-sqlite3
    console.log(`Database connected at ${dbFilePath}`);

    // Enable WAL mode for better concurrency and performance
    db.pragma('journal_mode = WAL');
    console.log('WAL mode enabled.');

    // Create tables if they don't exist
    createTables(db);

  } catch (error) {
    console.error('Failed to initialize database:', error);
    // If initialization fails, ensure db remains undefined or null
    db = null;
    throw error; // Re-throw the error to be handled by the caller (e.g., in main.js)
  }
  return db;
}

/**
 * Returns the singleton database instance.
 * Throws an error if the database is not initialized.
 * @returns {Database.Database} The better-sqlite3 database instance.
 */
function getDb() {
  if (!db) {
    // This case should ideally not be hit if initializeDatabase is called at app startup.
    // However, it's a safeguard.
    console.error('Database has not been initialized. Call initializeDatabase first.');
    // For a desktop app, it might be better to throw an error or handle this more gracefully.
    // Depending on the design, you might attempt re-initialization or alert the user.
    throw new Error('Database not initialized.');
  }
  return db;
}

/**
 * Closes the database connection.
 * Should be called when the application is shutting down.
 */
function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        return console.error('Error closing the database connection:', err.message);
      }
      console.log('Database connection closed successfully.');
    });
    db = null; // Clear the instance
  }
}

module.exports = {
  initializeDatabase,
  getDb,
  closeDatabase,
};