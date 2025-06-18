-- Add conviction_score to trades
drop table if exists trades_temp;
-- ALTER TABLE trades ADD COLUMN conviction_score INTEGER; -- Already exists, skipping to avoid duplicate column error

-- Add initial_take_profit_price and initial_stop_loss_price if not present
-- ALTER TABLE trades ADD COLUMN initial_take_profit_price REAL; -- Already exists, skipping if duplicate
-- ALTER TABLE trades ADD COLUMN initial_stop_loss_price REAL; -- Already exists, skipping if duplicate

-- Add thesis_validation (reflection)
-- ALTER TABLE trades ADD COLUMN thesis_validation TEXT CHECK(thesis_validation IN ('Correct', 'Partially Correct', 'Incorrect')); -- Already exists, skipping if duplicate

-- Add adherence_to_plan (reflection)
-- ALTER TABLE trades ADD COLUMN adherence_to_plan TEXT CHECK(adherence_to_plan IN ('High', 'Medium', 'Low')); -- Already exists, skipping if duplicate

-- Add unforeseen_events (reflection)
-- ALTER TABLE trades ADD COLUMN unforeseen_events TEXT; -- Already exists, skipping if duplicate

-- Add overall_trade_rating (reflection)
-- ALTER TABLE trades ADD COLUMN overall_trade_rating INTEGER CHECK(overall_trade_rating >= 1 AND overall_trade_rating <= 10); -- Already exists, skipping if duplicate

-- Add strategy_id to transactions for per-transaction logging
-- ALTER TABLE transactions ADD COLUMN strategy_id INTEGER REFERENCES strategies(strategy_id); -- Already exists, skipping if duplicate
