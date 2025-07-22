-- 011_add_closed_pnl_column.sql
-- Add closedPnl column to transactions table to track actual realized P&L for leveraged positions

-- Add the closedPnl column to the transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS closed_pnl NUMERIC(18,2) DEFAULT NULL;

-- Create an index for better performance when querying by closedPnl
CREATE INDEX IF NOT EXISTS idx_transactions_closed_pnl ON transactions(closed_pnl);

-- Update the database schema version or add a comment for tracking
-- This migration adds support for storing actual realized P&L from leveraged trading platforms
-- such as HyperLiquid, where closedPnl represents the actual cash impact of a position closure