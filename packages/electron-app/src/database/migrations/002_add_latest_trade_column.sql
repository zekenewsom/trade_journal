-- Migration: Add latest_trade column to trades
ALTER TABLE trades ADD COLUMN latest_trade TEXT;
