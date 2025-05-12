// File: zekenewsom-trade_journal/packages/electron-app/src/database/db.js
// Stage 5: Full DB logic for Transaction-Centric Model

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { createTables } = require('./schema');

let db;

function initializeDatabase(dbFilePath) {
  if (db && db.open) { console.warn('Database already initialized.'); return db; }
  try {
    const dbDir = path.dirname(dbFilePath);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    db = new Database(dbFilePath); // Removed verbose for less console noise
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    createTables(db);
    console.log(`Database ready: ${dbFilePath}`);
  } catch (error) { console.error('DB Init Error:', error); db = null; throw error; }
  return db;
}

function getDb() {
  if (!db || !db.open) throw new Error('Database not initialized or closed.');
  return db;
}

function closeDatabase() {
  if (db && db.open) {
    db.close(err => {
      if (err) console.error('DB Close Error:', err.message);
      else console.log('DB Closed.');
    });
    db = null;
  }
}

function _recalculateTradeState(trade_id) {
  const currentDb = getDb();
  console.log(`Recalculating state for trade ID: ${trade_id}`);

  const allTransactions = currentDb.prepare(
    'SELECT transaction_id, action, quantity, fees, datetime FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC'
  ).all(trade_id);

  if (allTransactions.length === 0) {
    console.warn(`Trade ID ${trade_id} has no transactions. Deleting parent trade.`);
    currentDb.prepare('DELETE FROM trades WHERE trade_id = ?').run(trade_id);
    // Also clean up related emotions/attachments if any, though CASCADE should handle some
    currentDb.prepare('DELETE FROM trade_emotions WHERE trade_id = ?').run(trade_id);
    currentDb.prepare('DELETE FROM trade_attachments WHERE trade_id = ?').run(trade_id);
    return;
  }

  const tradeDetails = currentDb.prepare('SELECT trade_direction, open_datetime FROM trades WHERE trade_id = ?').get(trade_id);
  if (!tradeDetails) {
    console.error(`Cannot recalculate: Trade ID ${trade_id} not found.`);
    return;
  }
  const positionDirection = tradeDetails.trade_direction;

  let total_entry_quantity = 0;
  let total_exit_quantity = 0;
  let accumulated_fees = 0;
  let first_tx_datetime = allTransactions[0].datetime;
  let last_tx_datetime = allTransactions[allTransactions.length - 1].datetime;

  allTransactions.forEach(tx => {
    accumulated_fees += (tx.fees || 0);
    // Determine if action counts as entry or exit based on position's overall direction
    if (positionDirection === 'Long') {
      if (tx.action === 'Buy') total_entry_quantity += tx.quantity;
      else if (tx.action === 'Sell') total_exit_quantity += tx.quantity;
    } else { // Short position
      if (tx.action === 'Sell') total_entry_quantity += tx.quantity; // Selling to open/add to short is an 'entry' for the short position
      else if (tx.action === 'Buy') total_exit_quantity += tx.quantity; // Buying to cover short is an 'exit'
    }
  });

  let newStatus = 'Open';
  let newCloseDatetime = null;
  let newOpenDatetime = tradeDetails.open_datetime || first_tx_datetime; // Keep original open if exists

  // Position is closed if total quantity exited matches or exceeds total quantity entered
  if (total_entry_quantity > 0 && total_exit_quantity >= total_entry_quantity) {
    newStatus = 'Closed';
    newCloseDatetime = last_tx_datetime; // The datetime of the last transaction that led to closure
  }

  currentDb.prepare(
    `UPDATE trades SET 
        status = ?, 
        open_datetime = ?, 
        close_datetime = ?, 
        fees_total = ?, 
        updated_at = CURRENT_TIMESTAMP 
     WHERE trade_id = ?`
  ).run(newStatus, newOpenDatetime, newCloseDatetime, accumulated_fees, trade_id);
  console.log(`Trade ID ${trade_id} state updated: Status=${newStatus}, Fees=${accumulated_fees}`);
}


function addTransactionAndManageTrade(transactionData) {
  const currentDb = getDb();
  const {
    instrument_ticker, asset_class, exchange,
    action, quantity, price, datetime,
    fees_for_transaction = 0, notes_for_transaction = null
  } = transactionData;

  // Validation
  if (!instrument_ticker || !asset_class || !exchange || !action || quantity <= 0 || price <= 0 || !datetime) {
    throw new Error("Core transaction fields are missing or invalid.");
  }

  const transactFn = currentDb.transaction(() => {
    let trade;
    const findOpenTradeQuery = `
        SELECT trade_id, trade_direction FROM trades 
        WHERE instrument_ticker = @instrument_ticker 
          AND asset_class = @asset_class 
          AND exchange = @exchange 
          AND status = 'Open'`;
    trade = currentDb.prepare(findOpenTradeQuery).get({ instrument_ticker, asset_class, exchange });

    let current_trade_id;
    let position_trade_direction;

    if (!trade) { // No open trade for this instrument/exchange, so this transaction starts a new trade
      position_trade_direction = (action === 'Buy') ? 'Long' : 'Short';
      
      const newTradeStmt = currentDb.prepare(`
        INSERT INTO trades (
          instrument_ticker, asset_class, exchange, trade_direction, 
          status, open_datetime, fees_total, created_at, updated_at
        ) VALUES (@instrument_ticker, @asset_class, @exchange, @trade_direction, 
                  'Open', @open_datetime, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING trade_id
      `);
      const newTradeResult = newTradeStmt.get({
        instrument_ticker, asset_class, exchange,
        trade_direction: position_trade_direction,
        open_datetime: datetime
      });
      current_trade_id = newTradeResult.trade_id;
      if (!current_trade_id) throw new Error("DB error: Failed to create new trade record.");
      console.log(`New trade created ID: ${current_trade_id}, Direction: ${position_trade_direction}`);
    } else { // Existing open trade found
      current_trade_id = trade.trade_id;
      position_trade_direction = trade.trade_direction;
      console.log(`Found existing open trade ID: ${current_trade_id}, Direction: ${position_trade_direction}`);

      // Check for "cannot sell more than held" or "buy back more than shorted"
      const transactionsForThisTrade = currentDb.prepare('SELECT action, quantity FROM transactions WHERE trade_id = ?').all(current_trade_id);
      let currentOpenPositionSize = 0;
      transactionsForThisTrade.forEach(tx => {
        if (position_trade_direction === 'Long') {
          currentOpenPositionSize += (tx.action === 'Buy' ? tx.quantity : -tx.quantity);
        } else { // Short
          currentOpenPositionSize += (tx.action === 'Sell' ? tx.quantity : -tx.quantity);
        }
      });

      const isExitingAction = (position_trade_direction === 'Long' && action === 'Sell') ||
                              (position_trade_direction === 'Short' && action === 'Buy');

      if (isExitingAction && quantity > currentOpenPositionSize) {
        throw new Error(`Cannot ${action.toLowerCase()} ${quantity} units. Only ${currentOpenPositionSize} units are effectively open for trade ID ${current_trade_id}.`);
      }
    }

    const transactionInsertStmt = currentDb.prepare(`
      INSERT INTO transactions (trade_id, action, quantity, price, datetime, fees, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING transaction_id
    `);
    const transactionResult = transactionInsertStmt.get(current_trade_id, action, quantity, price, datetime, fees_for_transaction, notes_for_transaction);
    const newTransactionId = transactionResult.transaction_id;
    if(!newTransactionId) throw new Error("DB error: Failed to insert transaction record.");

    _recalculateTradeState(current_trade_id);
    
    console.log(`Transaction ${newTransactionId} logged for trade ID ${current_trade_id}.`);
    return { tradeId: current_trade_id, transactionId: newTransactionId };
  });

  return transactFn();
}


function updateTradeMetadata(payload) {
  const currentDb = getDb();
  const { trade_id, strategy_id, market_conditions, setup_description, reasoning, lessons_learned, r_multiple_initial_risk } = payload;
  const stmt = currentDb.prepare(`
    UPDATE trades SET
      strategy_id = @strategy_id, market_conditions = @market_conditions,
      setup_description = @setup_description, reasoning = @reasoning,
      lessons_learned = @lessons_learned, r_multiple_initial_risk = @r_multiple_initial_risk,
      updated_at = CURRENT_TIMESTAMP
    WHERE trade_id = @trade_id
  `);
  const result = stmt.run({
    trade_id, strategy_id: strategy_id || null, market_conditions, setup_description,
    reasoning, lessons_learned, 
    r_multiple_initial_risk: (r_multiple_initial_risk !== undefined && r_multiple_initial_risk !== null && !isNaN(parseFloat(r_multiple_initial_risk))) ? parseFloat(r_multiple_initial_risk) : null
  });
  if (result.changes === 0) console.warn(`No trade metadata updated for ID ${trade_id}. Trade not found or data identical.`);
  return { success: true };
}

function updateSingleTransaction(data) {
  const currentDb = getDb();
  const { transaction_id, quantity, price, datetime, fees, notes } = data;
  // trade_id and action are not part of the update payload here, assuming they are fixed or handled differently
  const txDetails = currentDb.prepare('SELECT trade_id FROM transactions WHERE transaction_id = ?').get(transaction_id);
  if (!txDetails) throw new Error(`Transaction ID ${transaction_id} not found.`);

  const stmt = currentDb.prepare(`
    UPDATE transactions SET
      quantity = ?, price = ?, datetime = ?, fees = ?, notes = ?
    WHERE transaction_id = ?
  `);
  const result = stmt.run(quantity, price, datetime, fees, notes, transaction_id);
  if (result.changes === 0) console.warn(`No changes for transaction ID ${transaction_id} or transaction not found.`);
  
  _recalculateTradeState(txDetails.trade_id);
  return { success: true };
}

function deleteSingleTransaction(transaction_id) {
  const currentDb = getDb();
  const transactFn = currentDb.transaction(() => {
    const tx = currentDb.prepare('SELECT trade_id FROM transactions WHERE transaction_id = ?').get(transaction_id);
    if (!tx) throw new Error(`Transaction ID ${transaction_id} not found.`);
    
    const result = currentDb.prepare('DELETE FROM transactions WHERE transaction_id = ?').run(transaction_id);
    if (result.changes === 0) throw new Error(`Failed to delete transaction ID ${transaction_id}.`); // Should not happen if tx was found
    
    _recalculateTradeState(tx.trade_id);
    return { success: true };
  });
  return transactFn();
}

function deleteFullTradeAndTransactions(tradeId) {
  const currentDb = getDb();
  const transactFn = currentDb.transaction(() => {
    // ON DELETE CASCADE on transactions table handles deleting associated transactions.
    // Explicitly delete from related tables not covered by CASCADE from 'transactions'.
    currentDb.prepare('DELETE FROM trade_emotions WHERE trade_id = ?').run(tradeId);
    currentDb.prepare('DELETE FROM trade_attachments WHERE trade_id = ?').run(tradeId);
    const result = currentDb.prepare('DELETE FROM trades WHERE trade_id = ?').run(tradeId);
    if (result.changes === 0) throw new Error(`Trade ID ${tradeId} not found for deletion.`);
  });
  transactFn();
  return { success: true };
}

// Read operations adapted for new structure
function fetchTradesForListView() {
  const currentDb = getDb();
  return currentDb.prepare(
    'SELECT trade_id, instrument_ticker, asset_class, exchange, trade_direction, status, open_datetime, close_datetime, fees_total, strategy_id, created_at, updated_at FROM trades ORDER BY COALESCE(open_datetime, created_at) DESC'
  ).all();
}

function fetchTradeWithTransactions(tradeId) {
  const currentDb = getDb();
  const trade = currentDb.prepare('SELECT * FROM trades WHERE trade_id = ?').get(tradeId);
  if (!trade) return null;
  const transactions = currentDb.prepare(
    'SELECT * FROM transactions WHERE trade_id = ? ORDER BY datetime ASC, transaction_id ASC'
  ).all(tradeId);
  return { ...trade, transactions };
}

// Analytics functions (from Stage 4, adapted for new transaction model)
function calculateTradePnlFifo(trade, transactionsForThisTrade) {
  let grossPnl = 0;
  const entries = transactionsForThisTrade
    .filter(tx => (trade.trade_direction === 'Long' && tx.action === 'Buy') || (trade.trade_direction === 'Short' && tx.action === 'Sell'))
    .map(tx => ({ ...tx, remainingQuantity: Math.abs(tx.quantity) }))
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const exits = transactionsForThisTrade
    .filter(tx => (trade.trade_direction === 'Long' && tx.action === 'Sell') || (trade.trade_direction === 'Short' && tx.action === 'Buy'))
    .map(tx => ({ ...tx, remainingQuantity: Math.abs(tx.quantity) }))
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const directionMultiplier = trade.trade_direction === 'Long' ? 1 : -1;

  for (const exit of exits) {
    let exitQtyToMatch = exit.remainingQuantity;
    for (const entry of entries) {
      if (entry.remainingQuantity === 0 || exitQtyToMatch === 0) continue;
      const matchedQty = Math.min(exitQtyToMatch, entry.remainingQuantity);
      grossPnl += (exit.price - entry.price) * matchedQty * directionMultiplier;
      entry.remainingQuantity -= matchedQty;
      exitQtyToMatch -= matchedQty;
      if (exitQtyToMatch === 0) break;
    }
  }
  const netPnl = grossPnl - (trade.fees_total || 0); // Use fees_total from parent trade
  return {
    trade_id: trade.trade_id, grossPnl, netPnl,
    isClosed: trade.status === 'Closed',
    fees: trade.fees_total || 0,
    relevantDate: trade.close_datetime || trade.open_datetime || trade.created_at,
  };
}

function calculateBasicAnalytics() {
  const currentDb = getDb();
  const allClosedTrades = currentDb.prepare("SELECT * FROM trades WHERE status = 'Closed' ORDER BY COALESCE(close_datetime, open_datetime) ASC").all();

  let totalGrossPnl = 0, totalNetPnl = 0, totalFees = 0;
  let numberOfWinningTrades = 0, numberOfLosingTrades = 0, numberOfBreakEvenTrades = 0;
  let sumWinningPnl = 0, sumLosingPnl = 0;
  const closedTradeOutcomesForStreaks = [];

  for (const trade of allClosedTrades) {
    const transactions = currentDb.prepare('SELECT * FROM transactions WHERE trade_id = ? ORDER BY datetime ASC').all(trade.trade_id);
    if (transactions.length === 0) continue; // Should not happen for a closed trade with this logic

    const pnlData = calculateTradePnlFifo(trade, transactions);

    totalGrossPnl += pnlData.grossPnl;
    totalNetPnl += pnlData.netPnl;
    totalFees += pnlData.fees;

    closedTradeOutcomesForStreaks.push({ pnl: pnlData.netPnl, date: pnlData.relevantDate });

    if (pnlData.netPnl > 0) { numberOfWinningTrades++; sumWinningPnl += pnlData.netPnl; }
    else if (pnlData.netPnl < 0) { numberOfLosingTrades++; sumLosingPnl += pnlData.netPnl; }
    else { numberOfBreakEvenTrades++; }
  }
  
  let longestWinStreak = 0, currentWinStreak = 0, longestLossStreak = 0, currentLossStreak = 0;
  for (const outcome of closedTradeOutcomesForStreaks) { // Already sorted by date
    if (outcome.pnl > 0) { currentWinStreak++; currentLossStreak = 0; longestWinStreak = Math.max(longestWinStreak, currentWinStreak); }
    else if (outcome.pnl < 0) { currentLossStreak++; currentWinStreak = 0; longestLossStreak = Math.max(longestLossStreak, currentLossStreak); }
    else { currentWinStreak = 0; currentLossStreak = 0; }
  }

  return {
    totalGrossPnl, totalNetPnl, totalFees,
    winRate: allClosedTrades.length > 0 ? (numberOfWinningTrades / allClosedTrades.length) * 100 : null,
    numberOfWinningTrades, numberOfLosingTrades, numberOfBreakEvenTrades,
    totalClosedTrades: allClosedTrades.length,
    avgWinPnl: numberOfWinningTrades > 0 ? sumWinningPnl / numberOfWinningTrades : null,
    avgLossPnl: numberOfLosingTrades > 0 ? sumLosingPnl / numberOfLosingTrades : null,
    longestWinStreak, longestLossStreak,
  };
}

module.exports = {
  initializeDatabase, getDb, closeDatabase,
  addTransactionAndManageTrade,
  fetchTradesForListView,
  fetchTradeWithTransactions,
  updateTradeMetadata,
  updateSingleTransaction,
  deleteSingleTransaction,
  deleteFullTradeAndTransactions,
  calculateBasicAnalytics,
  // insertTradeViaDetailedForm, // Keep if detailed construction is ever needed, otherwise remove
};