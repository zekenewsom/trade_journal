-- 013_add_leverage_tracking.sql
-- Add leverage tracking to trades table to properly distinguish between spot and leveraged trading

-- Add leverage indicator and ratio to trades table
-- Using INTEGER for boolean (0 = FALSE, 1 = TRUE) since SQLite doesn't have native boolean type
ALTER TABLE trades ADD COLUMN is_leveraged INTEGER DEFAULT 0;
ALTER TABLE trades ADD COLUMN leverage_ratio DECIMAL(10,2) DEFAULT NULL;

-- Create index for leverage queries
CREATE INDEX IF NOT EXISTS idx_trades_is_leveraged ON trades(is_leveraged);

-- Update existing HyperLiquid trades to be marked as leveraged
-- This is based on the pattern identified in migration 012
UPDATE trades 
SET is_leveraged = 1, leverage_ratio = 1.0
WHERE exchange = 'HyperLiquid' 
  AND EXISTS (
    SELECT 1 FROM transactions t 
    WHERE t.trade_id = trades.trade_id 
    AND t.closed_pnl IS NOT NULL
  );

-- Add comment to track this migration
INSERT INTO account_transactions (account_id, type, amount, related_trade_id, memo, timestamp)
SELECT 1, 'adjustment', 0, NULL, 
       'Added leverage tracking to trades table (Migration 013)', 
       datetime('now')
WHERE EXISTS (SELECT 1 FROM accounts WHERE id = 1);