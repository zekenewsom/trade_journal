// File: zekenewsom-trade_journal/packages/electron-app/src/database/db.js
// Modified for Stage 3: fetchTrades, fetchTradeById, updateTradeInDb, deleteTradeFromDb
// Also modified insertTrade to handle an array of legs

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { createTables } = require('./schema');

let db;

function initializeDatabase(dbFilePath) {
  // ... (same as Stage 2, ensure foreign_keys = ON)
  if (db) return db;
  try {
    const dbDir = path.dirname(dbFilePath);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    db = new Database(dbFilePath, { verbose: console.log });
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON'); // Important!
    createTables(db);
    console.log(`Database initialized at ${dbFilePath}`);
  } catch (error) {
    console.error('Failed to initialize database:', error); db = null; throw error;
  }
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized.');
  return db;
}

function closeDatabase() {
  if (db && db.open) {
    db.close(err => err && console.error('Error closing DB:', err.message));
    db = null;
  }
}

/**
 * Inserts a new trade and its associated legs into the database.
 * @param {object} tradeData - Includes main trade fields and an array of 'legs'.
 * Example: { instrumentTicker, ..., legs: [{leg_type, datetime, price, size}, ...] }
 * @returns {number} The ID of the newly inserted trade.
 */
function insertTrade(tradeData) {
  const currentDb = getDb();
  const { legs, ...mainTradeData } = tradeData;

  // Map camelCase fields from frontend to snake_case for DB
  const camelToSnake = {
    instrumentTicker: 'instrument_ticker',
    assetClass: 'asset_class',
    direction: 'trade_direction',
    accountId: 'account_id',
    strategyId: 'strategy_id',
    feesCommissionsTotal: 'fees_commissions_total',
    initialStopLossPrice: 'initial_stop_loss_price',
    initialTakeProfitPrice: 'initial_take_profit_price',
    marketConditions: 'market_conditions',
    setupDescription: 'setup_description',
    reasoning: 'reasoning',
    lessonsLearned: 'lessons_learned',
    rMultipleInitialRisk: 'r_multiple_initial_risk'
  };

  const snakeCaseTradeData = {};
  for (const [key, value] of Object.entries(mainTradeData)) {
    if (camelToSnake[key]) {
      snakeCaseTradeData[camelToSnake[key]] = value;
    } else {
      snakeCaseTradeData[key] = value;
    }
  }

  const transact = currentDb.transaction(() => {
    const tradeInsertStmt = currentDb.prepare(`
      INSERT INTO trades (
        instrument_ticker, asset_class, trade_direction, account_id, strategy_id,
        fees_commissions_total, initial_stop_loss_price, initial_take_profit_price,
        market_conditions, setup_description, reasoning, lessons_learned,
        r_multiple_initial_risk
      ) VALUES (
        @instrument_ticker, @asset_class, @trade_direction, @account_id, @strategy_id,
        @fees_commissions_total, @initial_stop_loss_price, @initial_take_profit_price,
        @market_conditions, @setup_description, @reasoning, @lessons_learned,
        @r_multiple_initial_risk
      )
    `);
    // Provide default values for optional fields if not present in mainTradeData
    const fullMainTradeData = {
        account_id: null, strategy_id: null, fees_commissions_total: 0.0,
        initial_stop_loss_price: null, initial_take_profit_price: null,
        market_conditions: null, setup_description: null, reasoning: null,
        lessons_learned: null, r_multiple_initial_risk: null,
        ...snakeCaseTradeData // Spread mapped data over defaults
    };

    const tradeInfo = tradeInsertStmt.run(fullMainTradeData);
    const newTradeId = tradeInfo.lastInsertRowid;
    if (!newTradeId) throw new Error('Failed to insert into trades table.');

    const legInsertStmt = currentDb.prepare(`
      INSERT INTO trade_legs (trade_id, leg_type, datetime, price, size)
      VALUES (?, ?, ?, ?, ?)
    `);
    if (legs && legs.length > 0) {
      for (const leg of legs) {
        legInsertStmt.run(newTradeId, leg.leg_type, leg.datetime, leg.price, leg.size);
      }
    } else {
        // As per PRD, a trade should likely have at least one leg.
        // However, the form now manages legs, so if it's empty, this might be an issue.
        // For now, allow trade without legs, but this could be a validation point.
        console.warn(`Trade ID ${newTradeId} inserted without any legs.`);
    }
    return newTradeId;
  });

  try {
    return transact();
  } catch (error) {
    console.error('Transaction failed for insertTrade:', error); throw error;
  }
}

// --- Stage 3 Functions ---

/**
 * Fetches all trades with their legs.
 * For table display, this might be simplified or aggregated later.
 * @returns {Array<Object>} Array of trade objects, each including an array of its legs.
 */
function fetchTrades() {
  const currentDb = getDb();
  // Fetch all trades
  const trades = currentDb.prepare('SELECT * FROM trades ORDER BY created_at DESC').all();
  // For each trade, fetch its legs
  const tradesWithLegs = trades.map(trade => {
    const legs = currentDb.prepare('SELECT * FROM trade_legs WHERE trade_id = ? ORDER BY datetime ASC').all(trade.trade_id);
    return { ...trade, legs };
  });
  return tradesWithLegs;
}

/**
 * Fetches a single trade by its ID, including all its legs.
 * @param {number} id - The trade_id.
 * @returns {Object|null} The trade object with legs, or null if not found.
 */
function fetchTradeById(id) {
  const currentDb = getDb();
  const trade = currentDb.prepare('SELECT * FROM trades WHERE trade_id = ?').get(id);
  if (!trade) return null;

  const legs = currentDb.prepare('SELECT * FROM trade_legs WHERE trade_id = ? ORDER BY datetime ASC').all(id);
  return { ...trade, legs };
}

/**
 * Updates an existing trade and its legs.
 * @param {Object} tradeData - The full trade object including trade_id and an array of legs.
 * Each leg in tradeData.legs should have leg_id if it's an existing leg.
 */
function updateTradeInDb(tradeData) {
  const currentDb = getDb();
  const { trade_id, legs, ...mainTradeFields } = tradeData;

  if (!trade_id) throw new Error("trade_id is required for updating a trade.");

  // Map camelCase fields from frontend to snake_case for DB
  const camelToSnake = {
    instrumentTicker: 'instrument_ticker',
    assetClass: 'asset_class',
    direction: 'trade_direction',
    accountId: 'account_id',
    strategyId: 'strategy_id',
    feesCommissionsTotal: 'fees_commissions_total',
    initialStopLossPrice: 'initial_stop_loss_price',
    initialTakeProfitPrice: 'initial_take_profit_price',
    marketConditions: 'market_conditions',
    setupDescription: 'setup_description',
    reasoning: 'reasoning',
    lessonsLearned: 'lessons_learned',
    rMultipleInitialRisk: 'r_multiple_initial_risk'
  };

  const snakeCaseTradeData = {};
  for (const [key, value] of Object.entries(mainTradeFields)) {
    if (camelToSnake[key]) {
      snakeCaseTradeData[camelToSnake[key]] = value;
    } else {
      snakeCaseTradeData[key] = value;
    }
  }

  const transact = currentDb.transaction(() => {
    // 1. Update the main trades table record
    const updateTradeStmt = currentDb.prepare(`
      UPDATE trades SET
        instrument_ticker = @instrument_ticker, asset_class = @asset_class,
        trade_direction = @trade_direction, account_id = @account_id, strategy_id = @strategy_id,
        fees_commissions_total = @fees_commissions_total,
        initial_stop_loss_price = @initial_stop_loss_price,
        initial_take_profit_price = @initial_take_profit_price,
        market_conditions = @market_conditions, setup_description = @setup_description,
        reasoning = @reasoning, lessons_learned = @lessons_learned,
        r_multiple_initial_risk = @r_multiple_initial_risk
        /* updated_at is handled by trigger */
      WHERE trade_id = @trade_id
    `);
    // Provide default values for optional fields if not present in snakeCaseTradeData
    const fullMainTradeData = {
      account_id: null, strategy_id: null, fees_commissions_total: 0.0,
      initial_stop_loss_price: null, initial_take_profit_price: null,
      market_conditions: null, setup_description: null, reasoning: null,
      lessons_learned: null, r_multiple_initial_risk: null,
      ...snakeCaseTradeData
    };
    const mainTradeUpdateResult = updateTradeStmt.run({ trade_id, ...fullMainTradeData });
    if (mainTradeUpdateResult.changes === 0) {
        // This could happen if the trade_id doesn't exist, or no values changed.
        // Check if trade exists to differentiate
        const exists = currentDb.prepare('SELECT 1 FROM trades WHERE trade_id = ?').get(trade_id);
        if (!exists) throw new Error(`Trade with ID ${trade_id} not found for update.`);
        console.warn(`No changes made to main trade data for ID ${trade_id}. This might be okay if only legs changed.`);
    }


    // 2. Manage Legs:
    const existingLegIdsInDb = currentDb.prepare('SELECT leg_id FROM trade_legs WHERE trade_id = ?')
                                     .all(trade_id).map(l => l.leg_id);
    const submittedLegIds = legs.map(l => l.leg_id).filter(id => id !== undefined);

    const legInsertStmt = currentDb.prepare(
      'INSERT INTO trade_legs (trade_id, leg_type, datetime, price, size) VALUES (?, ?, ?, ?, ?)'
    );
    const legUpdateStmt = currentDb.prepare(
      'UPDATE trade_legs SET leg_type = ?, datetime = ?, price = ?, size = ? WHERE leg_id = ? AND trade_id = ?'
    );

    for (const leg of legs) {
      if (leg.leg_id && existingLegIdsInDb.includes(leg.leg_id)) { // Existing leg to update
        legUpdateStmt.run(leg.leg_type, leg.datetime, leg.price, leg.size, leg.leg_id, trade_id);
      } else { // New leg to insert (leg.leg_id is undefined or not in DB for this trade)
        legInsertStmt.run(trade_id, leg.leg_type, leg.datetime, leg.price, leg.size);
      }
    }

    // 3. Delete legs that were in DB but not in submitted data
    const legIdsToDelete = existingLegIdsInDb.filter(id => !submittedLegIds.includes(id));
    if (legIdsToDelete.length > 0) {
      const deleteLegStmt = currentDb.prepare('DELETE FROM trade_legs WHERE leg_id = ? AND trade_id = ?');
      for (const legId of legIdsToDelete) {
        deleteLegStmt.run(legId, trade_id);
      }
    }
  });

  try {
    transact();
  } catch (error) {
    console.error(`Transaction failed for updateTradeInDb (ID: ${trade_id}):`, error);
    throw error;
  }
}


/**
 * Deletes a trade and its associated legs (due to ON DELETE CASCADE).
 * @param {number} id - The trade_id to delete.
 */
function deleteTradeFromDb(id) {
  const currentDb = getDb();
  const stmt = currentDb.prepare('DELETE FROM trades WHERE trade_id = ?');
  const result = stmt.run(id);
  if (result.changes === 0) {
    throw new Error(`Trade with ID ${id} not found for deletion.`);
  }
  console.log(`Trade ID ${id} and associated data deleted.`);
}


module.exports = {
  initializeDatabase,
  getDb,
  closeDatabase,
  insertTrade,
  fetchTrades,
  fetchTradeById,
  updateTradeInDb,
  deleteTradeFromDb,
};