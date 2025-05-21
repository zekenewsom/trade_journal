-- 001_initial_schema.sql: Initial DB schema for trade_journal

CREATE TABLE IF NOT EXISTS emotions (
    emotion_id INTEGER PRIMARY KEY AUTOINCREMENT,
    emotion_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS strategies (
    strategy_id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS trades (
    trade_id INTEGER PRIMARY KEY AUTOINCREMENT,
    instrument_ticker TEXT NOT NULL,
    asset_class TEXT NOT NULL,
    exchange TEXT NOT NULL,
    strategy_id INTEGER,
    trade_direction TEXT NOT NULL,
    open_datetime TEXT,
    close_datetime TEXT,
    current_market_price REAL,
    latest_trade TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_id) REFERENCES strategies(strategy_id)
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- Buy/Sell
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    datetime TEXT NOT NULL,
    fees REAL DEFAULT 0,
    notes TEXT,
    strategy_id INTEGER,
    market_conditions TEXT,
    setup_description TEXT,
    reasoning TEXT,
    lessons_learned TEXT,
    r_multiple_initial_risk REAL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(trade_id),
    FOREIGN KEY (strategy_id) REFERENCES strategies(strategy_id)
);

CREATE TABLE IF NOT EXISTS transaction_emotions (
    transaction_id INTEGER NOT NULL,
    emotion_id INTEGER NOT NULL,
    PRIMARY KEY (transaction_id, emotion_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
    FOREIGN KEY (emotion_id) REFERENCES emotions(emotion_id)
);

-- Add any other required tables here
