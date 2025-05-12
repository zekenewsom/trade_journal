// File: zekenewsom-trade_journal/packages/electron-app/src/database/db.js
// Modified for Stage 4: calculateBasicAnalytics and supporting P&L logic

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { createTables } = require('./schema');

let db;

// ... (initializeDatabase, getDb, closeDatabase, insertTrade, fetchTrades, fetchTradeById, updateTradeInDb, deleteTradeFromDb remain the same as Stage 3)
// Ensure these functions are present from your Stage 3 code. I'll include them briefly for completeness here if they were modified.

function initializeDatabase(dbFilePath) {
  if (db) return db;
  try {
    const dbDir = path.dirname(dbFilePath);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    db = new Database(dbFilePath, { verbose: console.log });
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
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
function insertTrade(tradeData) {
  const currentDb = getDb();
  const { legs, ...mainTradeDataNoInstrument } = tradeData;
  const { instrumentTicker, assetClass, direction, ...restOfMainTradeData } = mainTradeDataNoInstrument;

  const mainTradeFields = {
    instrument_ticker: instrumentTicker,
    asset_class: assetClass,
    trade_direction: direction,
    account_id: restOfMainTradeData.accountId,
    strategy_id: restOfMainTradeData.strategyId,
    fees_commissions_total: restOfMainTradeData.feesCommissionsTotal,
    initial_stop_loss_price: restOfMainTradeData.initialStopLossPrice,
    initial_take_profit_price: restOfMainTradeData.initialTakeProfitPrice,
    market_conditions: restOfMainTradeData.marketConditions,
    setup_description: restOfMainTradeData.setupDescription,
    reasoning: restOfMainTradeData.reasoning,
    lessons_learned: restOfMainTradeData.lessonsLearned,
    r_multiple_initial_risk: restOfMainTradeData.rMultipleInitialRisk,
  };


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

    const defaultMainTradeData = {
        account_id: null, strategy_id: null, fees_commissions_total: 0.0,
        initial_stop_loss_price: null, initial_take_profit_price: null,
        market_conditions: null, setup_description: null, reasoning: null,
        lessons_learned: null, r_multiple_initial_risk: null,
    };
    const finalMainTradeData = { ...defaultMainTradeData, ...mainTradeFields };


    const tradeInfo = tradeInsertStmt.run(finalMainTradeData);
    const newTradeId = tradeInfo.lastInsertRowid;
    if (!newTradeId) throw new Error('Failed to insert into trades table.');

    const legInsertStmt = currentDb.prepare(
      'INSERT INTO trade_legs (trade_id, leg_type, datetime, price, size) VALUES (?, ?, ?, ?, ?)'
    );
    if (legs && legs.length > 0) {
      for (const leg of legs) {
        legInsertStmt.run(newTradeId, leg.leg_type, leg.datetime, leg.price, leg.size);
      }
    }
    return newTradeId;
  });
  return transact();
}
function fetchTrades() {
  const currentDb = getDb();
  const trades = currentDb.prepare('SELECT * FROM trades ORDER BY created_at DESC').all();
  return trades.map(trade => {
    const legs = currentDb.prepare('SELECT * FROM trade_legs WHERE trade_id = ? ORDER BY datetime ASC').all(trade.trade_id);
    return { ...trade, legs };
  });
}
function fetchTradeById(id) {
  const currentDb = getDb();
  const trade = currentDb.prepare('SELECT * FROM trades WHERE trade_id = ?').get(id);
  if (!trade) return null;
  const legs = currentDb.prepare('SELECT * FROM trade_legs WHERE trade_id = ? ORDER BY datetime ASC').all(id);
  return { ...trade, legs };
}

function updateTradeInDb(tradeData) {
  const currentDb = getDb();
  const { trade_id, legs, ...mainTradeDataNoInstrument } = tradeData;
   const { instrumentTicker, assetClass, direction, ...restOfMainTradeData } = mainTradeDataNoInstrument;


  if (!trade_id) throw new Error("trade_id is required for updating a trade.");

  const mainTradeFields = {
    instrument_ticker: instrumentTicker,
    asset_class: assetClass,
    trade_direction: direction,
    account_id: restOfMainTradeData.accountId,
    strategy_id: restOfMainTradeData.strategyId,
    fees_commissions_total: restOfMainTradeData.feesCommissionsTotal,
    initial_stop_loss_price: restOfMainTradeData.initialStopLossPrice,
    initial_take_profit_price: restOfMainTradeData.initialTakeProfitPrice,
    market_conditions: restOfMainTradeData.marketConditions,
    setup_description: restOfMainTradeData.setupDescription,
    reasoning: restOfMainTradeData.reasoning,
    lessons_learned: restOfMainTradeData.lessonsLearned,
    r_multiple_initial_risk: restOfMainTradeData.rMultipleInitialRisk,
  };


  const transact = currentDb.transaction(() => {
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
      WHERE trade_id = @trade_id
    `);
     const defaultMainTradeData = {
        account_id: null, strategy_id: null, fees_commissions_total: 0.0,
        initial_stop_loss_price: null, initial_take_profit_price: null,
        market_conditions: null, setup_description: null, reasoning: null,
        lessons_learned: null, r_multiple_initial_risk: null,
    };
    const finalMainTradeData = { ...defaultMainTradeData, ...mainTradeFields };


    updateTradeStmt.run({ trade_id, ...finalMainTradeData });

    const existingLegIdsInDb = currentDb.prepare('SELECT leg_id FROM trade_legs WHERE trade_id = ?').all(trade_id).map(l => l.leg_id);
    const submittedLegIds = legs.map(l => l.leg_id).filter(id => id !== undefined);

    const legInsertStmt = currentDb.prepare('INSERT INTO trade_legs (trade_id, leg_type, datetime, price, size) VALUES (?, ?, ?, ?, ?)');
    const legUpdateStmt = currentDb.prepare('UPDATE trade_legs SET leg_type = ?, datetime = ?, price = ?, size = ? WHERE leg_id = ? AND trade_id = ?');

    for (const leg of legs) {
      if (leg.leg_id && existingLegIdsInDb.includes(leg.leg_id)) {
        legUpdateStmt.run(leg.leg_type, leg.datetime, leg.price, leg.size, leg.leg_id, trade_id);
      } else {
        legInsertStmt.run(trade_id, leg.leg_type, leg.datetime, leg.price, leg.size);
      }
    }
    const legIdsToDelete = existingLegIdsInDb.filter(id => !submittedLegIds.includes(id));
    if (legIdsToDelete.length > 0) {
      const deleteLegStmt = currentDb.prepare('DELETE FROM trade_legs WHERE leg_id = ? AND trade_id = ?');
      for (const legId of legIdsToDelete) {
        deleteLegStmt.run(legId, trade_id);
      }
    }
  });
  transact();
}
function deleteTradeFromDb(id) {
  const currentDb = getDb();
  const result = currentDb.prepare('DELETE FROM trades WHERE trade_id = ?').run(id);
  if (result.changes === 0) throw new Error(`Trade ID ${id} not found for deletion.`);
}


// --- Stage 4: Analytics Calculation ---

/**
 * Calculates P&L for a single trade using FIFO.
 * @param {Object} trade - A trade object with its legs array. Legs should be sorted by datetime.
 * @returns {Object} { grossPnl, netPnl, isClosed, totalBuySize, totalSellSize }
 */
function calculateTradePnlFifo(trade) {
  let grossPnl = 0;
  let entries = trade.legs
    .filter(leg => leg.leg_type === 'Entry')
    .map(leg => ({ ...leg, remainingSize: Math.abs(leg.size) })) // Store remaining size for FIFO
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  let exits = trade.legs
    .filter(leg => leg.leg_type === 'Exit')
    .map(leg => ({ ...leg, remainingSize: Math.abs(leg.size) }))
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const directionMultiplier = trade.trade_direction === 'Long' ? 1 : -1;
  let totalEntrySize = entries.reduce((sum, leg) => sum + Math.abs(leg.size), 0);
  let totalExitSize = exits.reduce((sum, leg) => sum + Math.abs(leg.size), 0);


  for (const exit of exits) {
    let exitSizeToMatch = exit.remainingSize;
    for (const entry of entries) {
      if (entry.remainingSize === 0 || exitSizeToMatch === 0) continue;

      const matchedSize = Math.min(exitSizeToMatch, entry.remainingSize);
      
      grossPnl += (exit.price - entry.price) * matchedSize * directionMultiplier;

      entry.remainingSize -= matchedSize;
      exitSizeToMatch -= matchedSize;

      if (exitSizeToMatch === 0) break; // Current exit fully matched
    }
  }

  const isClosed = totalEntrySize > 0 && totalEntrySize === totalExitSize; // Basic check, can be refined for tolerance
  const netPnl = grossPnl - (trade.fees_commissions_total || 0);

  return {
    grossPnl,
    netPnl,
    isClosed,
    totalEntrySize,
    totalExitSize,
    trade_id: trade.trade_id,
    fees_commissions_total: trade.fees_commissions_total || 0,
    // Include trade_id and exit datetime of last leg for streak calculation
    // This needs the actual last leg's datetime that closed the trade, which is more complex if partially closed.
    // For simplicity now, we'll use the trade's created_at or updated_at for sorting for streaks.
    // A better approach would be to find the datetime of the leg that makes totalEntrySize === totalExitSize
    relevant_date_for_streak: trade.updated_at || trade.created_at
  };
}


function calculateBasicAnalytics() {
  const currentDb = getDb();
  const allTradesRaw = currentDb.prepare(`
    SELECT t.*, GROUP_CONCAT(tl.leg_id || ',' || tl.leg_type || ',' || tl.datetime || ',' || tl.price || ',' || tl.size, ';') as legs_data
    FROM trades t
    LEFT JOIN trade_legs tl ON t.trade_id = tl.trade_id
    GROUP BY t.trade_id
    ORDER BY t.created_at ASC;
  `).all();

  const tradesWithProcessedLegs = allTradesRaw.map(rawTrade => {
      const legs = [];
      if (rawTrade.legs_data) {
          rawTrade.legs_data.split(';').forEach(legStr => {
              const parts = legStr.split(',');
              legs.push({
                  leg_id: parseInt(parts[0], 10),
                  leg_type: parts[1],
                  datetime: parts[2],
                  price: parseFloat(parts[3]),
                  size: parseFloat(parts[4])
              });
          });
      }
      return { ...rawTrade, legs };
  });


  let totalGrossPnl = 0;
  let totalNetPnl = 0;
  let totalFees = 0;
  let numberOfWinningTrades = 0;
  let numberOfLosingTrades = 0;
  let numberOfBreakEvenTrades = 0;
  let totalClosedTrades = 0;
  let sumWinningPnl = 0;
  let sumLosingPnl = 0;

  let longestWinStreak = 0;
  let currentWinStreak = 0;
  let longestLossStreak = 0;
  let currentLossStreak = 0;

  const pnlResults = [];

  for (const trade of tradesWithProcessedLegs) {
    const pnlData = calculateTradePnlFifo(trade);
    if (pnlData.isClosed) {
      totalClosedTrades++;
      totalGrossPnl += pnlData.grossPnl;
      totalNetPnl += pnlData.netPnl;
      totalFees += pnlData.fees_commissions_total;

      pnlResults.push({ pnl: pnlData.netPnl, date: pnlData.relevant_date_for_streak });

      if (pnlData.netPnl > 0) {
        numberOfWinningTrades++;
        sumWinningPnl += pnlData.netPnl;
      } else if (pnlData.netPnl < 0) {
        numberOfLosingTrades++;
        sumLosingPnl += pnlData.netPnl;
      } else {
        numberOfBreakEvenTrades++;
      }
    }
  }

  // Sort P&L results by date for streak calculation
  pnlResults.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const result of pnlResults) {
      if (result.pnl > 0) {
          currentWinStreak++;
          currentLossStreak = 0;
          if (currentWinStreak > longestWinStreak) {
              longestWinStreak = currentWinStreak;
          }
      } else if (result.pnl < 0) {
          currentLossStreak++;
          currentWinStreak = 0;
          if (currentLossStreak > longestLossStreak) {
              longestLossStreak = currentLossStreak;
          }
      } else { // Break-even resets both streaks
          currentWinStreak = 0;
          currentLossStreak = 0;
      }
  }


  const winRate = totalClosedTrades > 0 ? (numberOfWinningTrades / totalClosedTrades) * 100 : null;
  const avgWinPnl = numberOfWinningTrades > 0 ? sumWinningPnl / numberOfWinningTrades : null;
  const avgLossPnl = numberOfLosingTrades > 0 ? sumLosingPnl / numberOfLosingTrades : null;


  return {
    totalGrossPnl,
    totalNetPnl,
    totalFees,
    winRate,
    numberOfWinningTrades,
    numberOfLosingTrades,
    numberOfBreakEvenTrades,
    totalClosedTrades,
    avgWinPnl,
    avgLossPnl,
    longestWinStreak,
    longestLossStreak,
    currentWinStreak, // Could be useful for display too
    currentLossStreak, // Could be useful for display too
  };
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
  calculateBasicAnalytics, // Export new function
};