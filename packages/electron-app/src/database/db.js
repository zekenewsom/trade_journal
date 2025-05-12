// File: zekenewsom-trade_journal/packages/electron-app/src/database/db.js
// Modified to add insertTrade function

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { createTables } = require('./schema');

let db;

function initializeDatabase(dbFilePath) {
  if (db) {
    console.warn('Database already initialized.');
    return db;
  }
  try {
    const dbDir = path.dirname(dbFilePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Created database directory: ${dbDir}`);
    }
    db = new Database(dbFilePath, { verbose: console.log });
    console.log(`Database connected at ${dbFilePath}`);
    db.pragma('journal_mode = WAL');
    console.log('WAL mode enabled.');
    db.pragma('foreign_keys = ON'); // Ensure foreign key constraints are enforced
    console.log('Foreign key enforcement enabled.');
    createTables(db);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    db = null;
    throw error;
  }
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized.');
  }
  return db;
}

function closeDatabase() {
  // ... (implementation as before)
  if (db && db.open) {
    db.close((err) => {
      if (err) {
        return console.error('Error closing the database connection:', err.message);
      }
      console.log('Database connection closed successfully.');
    });
    db = null;
  }
}

// --- Added for Stage 2: Function to insert a new trade ---
/**
 * Inserts a new trade and its initial entry leg into the database.
 * @param {object} tradeData - The trade data from the form.
 * Expected structure: { instrumentTicker, assetClass, entryDatetime, entryPrice, positionSize, direction, ...other optional trade fields }
 * @returns {number} The ID of the newly inserted trade.
 */
function insertTrade(tradeData) {
  const currentDb = getDb();

  // Destructure relevant fields for the 'trades' table and 'trade_legs' table
  const {
    instrumentTicker,
    assetClass,
    direction,
    entryDatetime, // This will be for the first leg
    entryPrice,    // This will be for the first leg
    positionSize,  // This will be for the first leg
    // Potentially other fields for the 'trades' table if collected in the form:
    accountId = null, // Example: default to null if not provided
    strategyId = null,
    feesCommissionsTotal = 0.0,
    initialStopLossPrice = null,
    initialTakeProfitPrice = null,
    marketConditions = null,
    setupDescription = null,
    reasoning = null,
    lessonsLearned = null,
    rMultipleInitialRisk = null,
  } = tradeData;

  // Define the transaction
  const transact = currentDb.transaction(() => {
    // Insert into 'trades' table
    const tradeInsertStmt = currentDb.prepare(`
      INSERT INTO trades (
        instrument_ticker, asset_class, trade_direction, account_id, strategy_id,
        fees_commissions_total, initial_stop_loss_price, initial_take_profit_price,
        market_conditions, setup_description, reasoning, lessons_learned,
        r_multiple_initial_risk
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tradeInfo = tradeInsertStmt.run(
      instrumentTicker, assetClass, direction, accountId, strategyId,
      feesCommissionsTotal, initialStopLossPrice, initialTakeProfitPrice,
      marketConditions, setupDescription, reasoning, lessonsLearned,
      rMultipleInitialRisk
    );

    const newTradeId = tradeInfo.lastInsertRowid;
    if (!newTradeId) {
      throw new Error('Failed to insert trade into trades table.');
    }

    // Insert the first entry leg into 'trade_legs' table
    const legInsertStmt = currentDb.prepare(`
      INSERT INTO trade_legs (trade_id, leg_type, datetime, price, size)
      VALUES (?, 'Entry', ?, ?, ?)
    `);
    // Ensure datetime is in ISO 8601 format if it's not already.
    // HTML datetime-local input provides it in a suitable format that SQLite can store as TEXT.
    const legInfo = legInsertStmt.run(newTradeId, entryDatetime, entryPrice, positionSize);

    if (legInfo.changes === 0) {
        throw new Error('Failed to insert initial entry leg into trade_legs table.');
    }

    console.log(`Successfully inserted trade ID: ${newTradeId} and its first entry leg.`);
    return newTradeId; // Return the ID of the main trade record
  });

  // Execute the transaction
  try {
    const tradeId = transact();
    return tradeId;
  } catch (error) {
    console.error('Transaction failed for insertTrade:', error);
    throw error; // Re-throw to be caught by the IPC handler
  }
}
// --- End Stage 2 ---


module.exports = {
  initializeDatabase,
  getDb,
  closeDatabase,
  insertTrade, // Export the new function
};