-- 010_add_trade_transaction_type.sql
-- Add 'trade_transaction' to the account_transactions type check constraint

-- Pre-migration validation: count rows and check for invalid types
SELECT COUNT(*) AS pre_migration_count FROM account_transactions;
SELECT COUNT(*) AS invalid_types_pre FROM account_transactions WHERE type NOT IN ('deposit', 'withdrawal', 'trade_open', 'trade_close', 'fee', 'adjustment');

-- Drop the existing check constraint and recreate it with the new type
-- SQLite doesn't support ALTER TABLE for check constraints, so we need to recreate the table

-- First, create a temporary table with the new constraint
CREATE TABLE IF NOT EXISTS account_transactions_temp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade_open', 'trade_close', 'fee', 'adjustment', 'trade_transaction')),
    amount NUMERIC NOT NULL,
    related_trade_id INTEGER,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    memo TEXT,
    FOREIGN KEY(account_id) REFERENCES accounts(id),
    FOREIGN KEY(related_trade_id) REFERENCES trades(trade_id)
);

-- Copy data from the original table
INSERT INTO account_transactions_temp (id, account_id, type, amount, related_trade_id, timestamp, memo)
SELECT id, account_id, type, amount, related_trade_id, timestamp, memo
FROM account_transactions;

-- Drop the original table
DROP TABLE account_transactions;

-- Rename the temporary table to the original name
ALTER TABLE account_transactions_temp RENAME TO account_transactions;

-- Recreate the index if it exists
CREATE INDEX IF NOT EXISTS idx_account_transactions_account_id ON account_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_related_trade_id ON account_transactions(related_trade_id);

-- Post-migration validation: count rows and check for invalid types (should be 0)
SELECT COUNT(*) AS post_migration_count FROM account_transactions;
SELECT COUNT(*) AS invalid_types_post FROM account_transactions WHERE type NOT IN ('deposit', 'withdrawal', 'trade_open', 'trade_close', 'fee', 'adjustment', 'trade_transaction');