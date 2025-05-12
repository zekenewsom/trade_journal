// File: trade_journal/packages/electron-app/src/database/schema.js
// Defines the SQLite database schema

// SQL statements to create the tables
const accountsTable = `
CREATE TABLE IF NOT EXISTS accounts (
    account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_name TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);`;

const strategiesTable = `
CREATE TABLE IF NOT EXISTS strategies (
    strategy_id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy_name TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);`;

const emotionsTable = `
CREATE TABLE IF NOT EXISTS emotions (
    emotion_id INTEGER PRIMARY KEY AUTOINCREMENT,
    emotion_name TEXT NOT NULL UNIQUE
);`;
// TODO: Seed with some common emotions later (e.g., Greedy, Fearful, Confident, Anxious, Disciplined)

const tradesTable = `
CREATE TABLE IF NOT EXISTS trades (
    trade_id INTEGER PRIMARY KEY AUTOINCREMENT,
    instrument_ticker TEXT NOT NULL,
    asset_class TEXT NOT NULL CHECK(asset_class IN ('Stock', 'Cryptocurrency')),
    account_id INTEGER,
    strategy_id INTEGER,
    trade_direction TEXT NOT NULL CHECK(trade_direction IN ('Long', 'Short')),
    market_conditions TEXT,
    setup_description TEXT,
    reasoning TEXT,
    lessons_learned TEXT,
    initial_stop_loss_price REAL,
    initial_take_profit_price REAL,
    fees_commissions_total REAL DEFAULT 0.0,
    r_multiple_initial_risk REAL, -- The monetary value of 1R for this trade
    r_multiple_actual REAL,
    outcome TEXT CHECK(outcome IN ('Win', 'Loss', 'Break Even')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id),
    FOREIGN KEY (strategy_id) REFERENCES strategies(strategy_id)
);`;

// Trigger to update 'updated_at' timestamp on trades table
const tradesUpdatedAtTrigger = `
CREATE TRIGGER IF NOT EXISTS update_trades_updated_at
AFTER UPDATE ON trades
FOR EACH ROW
BEGIN
    UPDATE trades SET updated_at = CURRENT_TIMESTAMP WHERE trade_id = OLD.trade_id;
END;
`;

const tradeLegsTable = `
CREATE TABLE IF NOT EXISTS trade_legs (
    leg_id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id INTEGER NOT NULL,
    leg_type TEXT NOT NULL CHECK(leg_type IN ('Entry', 'Exit')),
    datetime TEXT NOT NULL, -- ISO 8601 format: YYYY-MM-DDTHH:MM:SS.SSSZ
    price REAL NOT NULL,
    size REAL NOT NULL, -- Number of shares, contracts, tokens
    -- adjusted_stop_loss_price REAL, -- Decided to keep SL/TP on the main trade table for now
    -- adjusted_take_profit_price REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE
);`;

const tradeEmotionsTable = `
CREATE TABLE IF NOT EXISTS trade_emotions (
    trade_emotion_id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id INTEGER NOT NULL,
    emotion_id INTEGER NOT NULL,
    UNIQUE (trade_id, emotion_id),
    FOREIGN KEY (trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE,
    FOREIGN KEY (emotion_id) REFERENCES emotions(emotion_id) ON DELETE CASCADE
);`;
// Note: ON DELETE CASCADE for emotion_id might be too aggressive if an emotion is deleted.
// Consider changing to ON DELETE SET NULL or restrict deletion if an emotion is in use.
// For now, CASCADE is simple.

const tradeAttachmentsTable = `
CREATE TABLE IF NOT EXISTS trade_attachments (
    attachment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id INTEGER NOT NULL,
    file_path TEXT NOT NULL, -- Path where the file is stored (managed by the app)
    file_name TEXT NOT NULL,
    file_type TEXT, -- e.g., 'image/png', 'application/pdf'
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE
);`;

/**
 * Executes all CREATE TABLE statements to set up the database schema.
 * @param {Database.Database} db The better-sqlite3 database instance.
 */
function createTables(db) {
  console.log('Creating database tables if they do not exist...');
  try {
    db.exec(accountsTable);
    console.log("'accounts' table checked/created.");
    db.exec(strategiesTable);
    console.log("'strategies' table checked/created.");
    db.exec(emotionsTable);
    console.log("'emotions' table checked/created.");
    db.exec(tradesTable);
    console.log("'trades' table checked/created.");
    db.exec(tradesUpdatedAtTrigger);
    console.log("'trades_updated_at' trigger checked/created.");
    db.exec(tradeLegsTable);
    console.log("'trade_legs' table checked/created.");
    db.exec(tradeEmotionsTable);
    console.log("'trade_emotions' table checked/created.");
    db.exec(tradeAttachmentsTable);
    console.log("'trade_attachments' table checked/created.");
    console.log('Database schema initialization complete.');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error; // Propagate error
  }
}

module.exports = {
  createTables,
  // Export individual table creation strings if needed elsewhere, though typically not.
};