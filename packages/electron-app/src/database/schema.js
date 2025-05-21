// File: zekenewsom-trade_journal/packages/electron-app/src/database/schema.js
// Modified for Stage 6: Add current_market_price to trades table

// ... (accountsTable, strategiesTable, emotionsTable - same as your Stage 5)
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


const tradesTable = `
CREATE TABLE IF NOT EXISTS trades (
    trade_id INTEGER PRIMARY KEY AUTOINCREMENT,
    instrument_ticker TEXT NOT NULL,
    asset_class TEXT NOT NULL CHECK(asset_class IN ('Stock', 'Cryptocurrency')),
    exchange TEXT, 
    trade_direction TEXT NOT NULL CHECK(trade_direction IN ('Long', 'Short')),
    status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN ('Open', 'Closed')),
    open_datetime TEXT NOT NULL, 
    close_datetime TEXT,       
    fees_total REAL DEFAULT 0.0, 
    strategy_id INTEGER, 
    market_conditions TEXT,
    setup_description TEXT,
    reasoning TEXT,
    lessons_learned TEXT,
    initial_stop_loss_price REAL,
    initial_take_profit_price REAL,
    r_multiple_initial_risk REAL,
    
    current_market_price REAL, -- Stage 6: For mark-to-market of open positions
    
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_id) REFERENCES strategies(strategy_id)
);`;

const tradesUpdatedAtTrigger = `
CREATE TRIGGER IF NOT EXISTS update_trades_updated_at
AFTER UPDATE ON trades
FOR EACH ROW
BEGIN
    UPDATE trades SET updated_at = CURRENT_TIMESTAMP WHERE trade_id = OLD.trade_id;
END;`;

const transactionsTable = `
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    trade_id INTEGER NOT NULL, 
    action TEXT NOT NULL CHECK(action IN ('Buy', 'Sell')), 
    quantity REAL NOT NULL, 
    price REAL NOT NULL,
    datetime TEXT NOT NULL, 
    fees REAL DEFAULT 0.0, 
    notes TEXT,
    strategy_id INTEGER,
    market_conditions TEXT,
    setup_description TEXT,
    reasoning TEXT,
    lessons_learned TEXT,
    r_multiple_initial_risk REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE,
    FOREIGN KEY (strategy_id) REFERENCES strategies(strategy_id)
);`;

const transactionEmotionsTable = `
CREATE TABLE IF NOT EXISTS transaction_emotions (
    transaction_emotion_id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    emotion_id INTEGER NOT NULL,
    UNIQUE (transaction_id, emotion_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (emotion_id) REFERENCES emotions(emotion_id) ON DELETE CASCADE
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
const tradeAttachmentsTable = `
CREATE TABLE IF NOT EXISTS trade_attachments (
    attachment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE
);`;

function createTables(db) {
  // Only ensure the migrations table exists (for legacy use, but migrationService now handles this)
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

module.exports = { createTables };