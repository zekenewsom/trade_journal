// File: zekenewsom-trade_journal/packages/electron-app/src/database/schema.js
// Modified for Stage 5: `trades` table changes, `trade_legs` becomes `transactions`

// This `accounts` table can be used for storing distinct exchange names if you want to normalize them later
// For now, `trades.exchange` is free text.
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
    exchange TEXT, -- User entered exchange name
    trade_direction TEXT NOT NULL CHECK(trade_direction IN ('Long', 'Short')),
    
    status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN ('Open', 'Closed')),
    open_datetime TEXT NOT NULL, -- Datetime of the first transaction that opened this trade
    close_datetime TEXT,       -- Datetime of the transaction that closed this trade

    fees_total REAL DEFAULT 0.0, -- Sum of fees from all its transactions

    strategy_id INTEGER, -- For user to tag the trade idea
    market_conditions TEXT,
    setup_description TEXT,
    reasoning TEXT,
    lessons_learned TEXT,
    initial_stop_loss_price REAL,
    initial_take_profit_price REAL,
    r_multiple_initial_risk REAL,
    
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

// Renamed from trade_legs to transactions
const transactionsTable = `
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id INTEGER NOT NULL, -- FK to trades table
    
    action TEXT NOT NULL CHECK(action IN ('Buy', 'Sell')), -- User's raw action
    quantity REAL NOT NULL, -- Always positive
    price REAL NOT NULL,
    datetime TEXT NOT NULL, -- ISO 8601
    fees REAL DEFAULT 0.0, -- Fees for this specific transaction/execution
    notes TEXT, -- Notes for this specific transaction/execution
    
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE
);`;

const tradeEmotionsTable = `
CREATE TABLE IF NOT EXISTS trade_emotions (
    trade_emotion_id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id INTEGER NOT NULL, -- Still links to the overall trade
    emotion_id INTEGER NOT NULL,
    UNIQUE (trade_id, emotion_id),
    FOREIGN KEY (trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE,
    FOREIGN KEY (emotion_id) REFERENCES emotions(emotion_id) ON DELETE CASCADE
);`;

const tradeAttachmentsTable = `
CREATE TABLE IF NOT EXISTS trade_attachments (
    attachment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id INTEGER NOT NULL, -- Still links to the overall trade
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE
);`;

function createTables(db) {
  console.log('Applying database schema (Stage 5)...');
  try {
    // To ensure changes: db.exec('DROP TABLE IF EXISTS transactions;'); db.exec('DROP TABLE IF EXISTS trades;');
    db.exec(accountsTable); // You might want an exchanges table later
    db.exec(strategiesTable);
    db.exec(emotionsTable);
    db.exec(tradesTable);
    db.exec(tradesUpdatedAtTrigger);
    db.exec(transactionsTable);
    db.exec(tradeEmotionsTable);
    db.exec(tradeAttachmentsTable);
    console.log('Database schema applied successfully (Stage 5).');
  } catch (error) {
    console.error('Error applying database schema:', error);
    throw error;
  }
}

module.exports = { createTables };