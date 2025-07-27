-- 012_cleanup_incorrect_cash_flows.sql
-- Clean up incorrect cash flows from leveraged trading transactions
-- This migration removes account transactions that should not have been recorded
-- for leveraged positions without actual realized P&L

-- Step 0: Re-enable foreign key enforcement and check for violations
PRAGMA foreign_keys = ON;

-- Create temporary table to store foreign key check results
CREATE TEMPORARY TABLE IF NOT EXISTS fk_check_results AS
SELECT 'account_transactions' as table_name, COUNT(*) as fk_count
FROM pragma_foreign_key_list('account_transactions')
WHERE "table" = 'trades' AND "from" = 'related_trade_id' AND "to" = 'trade_id';

-- Check for foreign key violations before proceeding with data cleanup
CREATE TEMPORARY TABLE IF NOT EXISTS fk_violations AS
SELECT * FROM pragma_foreign_key_check('account_transactions');

-- Log foreign key violations if any exist
-- This helps maintain data integrity by identifying orphaned records
INSERT INTO fk_check_results (table_name, fk_count)
SELECT 'fk_violations', COUNT(*) FROM fk_violations;

-- If foreign key violations exist, log them but continue with migration
-- as this is a data cleanup operation that may resolve some violations

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

-- Ensure the backup table does not exist before creating it
DROP TABLE IF EXISTS account_transactions_backup_012;

-- Now remove the incorrect transactions
CREATE TABLE account_transactions_backup_012 AS
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
WHERE id IN (
    SELECT id FROM account_transactions
    WHERE type = 'trade_transaction'
      AND id IN (SELECT account_transaction_id FROM transactions_to_remove)
      AND id NOT IN (
        SELECT MAX(id)
        FROM account_transactions
        WHERE type = 'trade_transaction'
        GROUP BY related_trade_id, amount, memo
      )
);

-- Step 4: Add a comment to track this cleanup
-- This helps us understand what was cleaned up
INSERT INTO account_transactions (account_id, type, amount, related_trade_id, memo, timestamp)
SELECT account_id, 'adjustment', 0, NULL,
       'Cash balance cleanup: Removed incorrect leveraged trading transactions (Migration 012)',
       datetime('now')
FROM (SELECT MIN(id) as account_id FROM accounts WHERE id IS NOT NULL)
WHERE (SELECT COUNT(*) FROM account_transactions_backup_012) > 0
  AND (SELECT COUNT(*) FROM accounts) > 0;

-- Step 5: Log migration results and cleanup temporary tables

-- Log the results of foreign key checks and violations
INSERT INTO account_transactions (account_id, type, amount, related_trade_id, memo, timestamp)
SELECT 
    (SELECT MIN(id) FROM accounts WHERE id IS NOT NULL) as account_id,
    'adjustment' as type,
    0 as amount,
    NULL as related_trade_id,
    'Migration 012: Foreign key constraints found: ' || 
    (SELECT fk_count FROM fk_check_results WHERE table_name = 'account_transactions') || 
    ', Violations: ' || 
    (SELECT fk_count FROM fk_check_results WHERE table_name = 'fk_violations') as memo,
    datetime('now') as timestamp
WHERE (SELECT COUNT(*) FROM fk_check_results) > 0
  AND (SELECT COUNT(*) FROM accounts) > 0;

-- Clean up temporary tables
DROP TABLE IF EXISTS transactions_to_remove;
DROP TABLE IF EXISTS fk_check_results;
DROP TABLE IF EXISTS fk_violations;