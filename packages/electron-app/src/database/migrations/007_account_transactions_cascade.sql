-- Migration 007: Add ON DELETE CASCADE to account_transactions.related_trade_id foreign key

PRAGMA foreign_keys=off;

-- 1. Rename the old table
ALTER TABLE account_transactions RENAME TO account_transactions_old;

-- 2. Recreate the table with ON DELETE CASCADE for related_trade_id
CREATE TABLE account_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade_open', 'trade_close', 'fee', 'adjustment')),
    amount NUMERIC NOT NULL,
    related_trade_id INTEGER,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    memo TEXT,
    FOREIGN KEY(account_id) REFERENCES accounts(id),
    FOREIGN KEY(related_trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE
);

-- 3. Copy data from the old table
INSERT INTO account_transactions (id, account_id, type, amount, related_trade_id, timestamp, memo)
SELECT id, account_id, type, amount, related_trade_id, timestamp, memo FROM account_transactions_old;

-- 4. Drop the old table
DROP TABLE account_transactions_old;

PRAGMA foreign_keys=on;
