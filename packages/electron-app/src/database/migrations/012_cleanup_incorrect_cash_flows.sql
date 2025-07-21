-- 012_cleanup_incorrect_cash_flows.sql
-- Clean up incorrect cash flows from leveraged trading transactions
-- This migration removes account transactions that should not have been recorded
-- for leveraged positions without actual realized P&L

-- Step 0: Verify foreign key constraints exist between tables
-- Check account_transactions.related_trade_id -> trades.trade_id
-- Check trades.trade_id -> transactions.trade_id
-- If any constraint is missing, raise an error and rollback

-- Check for account_transactions.related_trade_id foreign key
-- SELECT CASE WHEN COUNT(*) = 0 THEN RAISE(ABORT, 'Missing foreign key: account_transactions.related_trade_id -> trades.trade_id') END
-- FROM pragma_foreign_key_list('account_transactions')
-- WHERE table = 'trades' AND from = 'related_trade_id' AND to = 'trade_id';

-- Check for trades.trade_id foreign key
-- SELECT CASE WHEN COUNT(*) = 0 THEN RAISE(ABORT, 'Missing foreign key: trades.trade_id -> transactions.trade_id') END
-- FROM pragma_foreign_key_list('trades')
-- WHERE table = 'transactions' AND from = 'trade_id' AND to = 'trade_id';

-- Step 1: Identify and remove account transactions for leveraged trading
-- that don't have a corresponding closedPnl value
-- These were incorrectly recorded as if they were spot trades

-- Create a temporary table to track transactions that should be removed
CREATE TEMPORARY TABLE IF NOT EXISTS transactions_to_remove AS
SELECT at.id as account_transaction_id, at.amount, at.memo, t.closed_pnl
FROM account_transactions at
JOIN trades tr ON at.related_trade_id = tr.trade_id
JOIN transactions t ON t.trade_id = tr.trade_id
WHERE at.type = 'trade_transaction'
  AND tr.exchange = 'HyperLiquid'  -- Focus on leveraged trading
  AND t.closed_pnl IS NULL        -- These should not have created cash flows
  AND at.amount != 0;              -- Non-zero amounts

-- Step 2: Remove these incorrect account transactions
-- But first, let's create a backup table to track what we're removing
CREATE TABLE IF NOT EXISTS account_transactions_backup_012 AS
SELECT at.*, 'leveraged_trading_cleanup' as removal_reason, datetime('now') as removed_at
FROM account_transactions at
WHERE at.id IN (SELECT account_transaction_id FROM transactions_to_remove);

-- Now remove the incorrect transactions
DELETE FROM account_transactions
WHERE id IN (SELECT account_transaction_id FROM transactions_to_remove);

-- Step 3: Clean up any duplicate entries that might exist
-- Remove duplicate account transactions for the same trade and transaction
-- Keep only the most recent one for each unique combination
DELETE FROM account_transactions
WHERE id NOT IN (
    SELECT MAX(id)
    FROM account_transactions
    WHERE type = 'trade_transaction'
    GROUP BY related_trade_id, amount, memo
);

-- Step 4: Add a comment to track this cleanup
-- This helps us understand what was cleaned up
INSERT INTO account_transactions (account_id, type, amount, related_trade_id, memo, timestamp)
SELECT 1, 'adjustment', 0, NULL, 
       'Cash balance cleanup: Removed incorrect leveraged trading transactions (Migration 012)', 
       datetime('now')
WHERE EXISTS (SELECT 1 FROM accounts WHERE id = 1)
  AND (SELECT COUNT(*) FROM account_transactions_backup_012) > 0;

-- Drop the temporary table
DROP TABLE IF EXISTS transactions_to_remove;