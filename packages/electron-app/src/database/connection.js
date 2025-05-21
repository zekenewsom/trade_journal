// Database connection and initialization logic

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { runMigrations } = require('./migrationService');

let db;

function initializeDatabase(dbFilePath) {
  if (db && db.open) {
    console.log('Database already initialized and open');
    return db;
  }
  try {
    const dbDir = path.dirname(dbFilePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Created database directory: ${dbDir}`);
    }
    db = new Database(dbFilePath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    seedInitialData(db);
    console.log(`Database initialized successfully: ${dbFilePath}`);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    db = null;
    throw error;
  }
  return db;
}

function getDb() {
  if (!db || !db.open) {
    console.error('Database not initialized or has been closed');
    throw new Error('Database not initialized or has been closed. Ensure initializeDatabase() is called on app start.');
  }
  return db;
}

function closeDatabase() {
  if (db && db.open) {
    db.close((err) => {
      if (err) console.error('Error closing the database connection:', err.message);
      else console.log('Database connection closed successfully.');
    });
    db = null;
  }
}

function seedInitialData(currentDb) {
  const emotions = ['Confident', 'Greedy', 'Fearful', 'Anxious', 'Disciplined', 'Impatient', 'Hopeful', 'Frustrated', 'Bored', 'Excited', 'Focused', 'Overwhelmed'];
  const insertEmotion = currentDb.prepare('INSERT OR IGNORE INTO emotions (emotion_name) VALUES (?)');
  const seedTx = currentDb.transaction(() => {
    emotions.forEach(name => insertEmotion.run(name));
  });
  try {
    seedTx();
    console.log('Initial emotions seeded/checked.');
  } catch (error) {
    console.error("Error seeding emotions:", error);
  }
  // Add other seed data here if needed (e.g., default strategies, accounts/exchanges if normalized)
}

function testDbConnection() {
  try {
    if (db && db.open) {
      return { status: 'ok', message: 'Database connection is open.' };
    } else {
      return { status: 'error', message: 'Database is not initialized or not open.' };
    }
  } catch (err) {
    return { status: 'error', message: err.message || 'Unknown error.' };
  }
}

module.exports = {
  initializeDatabase,
  getDb,
  closeDatabase,
  seedInitialData,
  testDbConnection,
};
