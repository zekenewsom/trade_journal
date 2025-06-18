// accountService.js
// Service for managing accounts and account transactions
const { getDb } = require('./connection');

/**
 * Account CRUD
 */
function createAccount({ name, type = 'cash' }) {
    const stmt = getDb().prepare('INSERT INTO accounts (name, type, archived, deleted) VALUES (?, ?, 0, 0)');
    const info = stmt.run(name, type);
    return info.lastInsertRowid;
}

function renameAccount({ accountId, newName }) {
    const stmt = getDb().prepare('UPDATE accounts SET name = ? WHERE id = ? AND deleted = 0');
    stmt.run(newName, accountId);
}

function archiveAccount({ accountId }) {
    const stmt = getDb().prepare('UPDATE accounts SET archived = 1 WHERE id = ? AND deleted = 0');
    stmt.run(accountId);
}

function unarchiveAccount({ accountId }) {
    const stmt = getDb().prepare('UPDATE accounts SET archived = 0 WHERE id = ? AND deleted = 0');
    stmt.run(accountId);
}

function deleteAccount({ accountId }) {
    const stmt = getDb().prepare('UPDATE accounts SET deleted = 1 WHERE id = ?');
    stmt.run(accountId);
}

function getAccounts({ includeArchived = false, includeDeleted = false } = {}) {
    let sql = 'SELECT id as account_id, name, type, archived as is_archived, deleted as is_deleted, created_at, updated_at FROM accounts WHERE 1=1';
    if (!includeArchived) sql += ' AND archived = 0';
    if (!includeDeleted) sql += ' AND deleted = 0';
    return getDb().prepare(sql).all();
}

function getAccountById(accountId) {
    return getDb().prepare('SELECT * FROM accounts WHERE id = ? AND deleted = 0').get(accountId);
}

/**
 * Account Transactions
 */
function addAccountTransaction({ accountId, type, amount, relatedTradeId = null, memo = null }) {
    const stmt = getDb().prepare(`
        INSERT INTO account_transactions (account_id, type, amount, related_trade_id, memo)
        VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(accountId, type, amount, relatedTradeId, memo);
    return info.lastInsertRowid;
}

function getAccountTransactions({ accountId, limit = 100, offset = 0 }) {
    return getDb().prepare(`
        SELECT * FROM account_transactions
        WHERE account_id = ?
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
    `).all(accountId, limit, offset);
}

function getAccountBalance(accountId) {
    const row = getDb().prepare(`
        SELECT SUM(amount) as balance
        FROM account_transactions
        WHERE account_id = ?
    `).get(accountId);
    return row.balance || 0;
}

function getAccountTimeSeries(accountId) {
    // Returns [{timestamp, balance}] for time series chart
    return getDb().prepare(`
        SELECT timestamp,
               SUM(amount) OVER (ORDER BY timestamp ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as balance
        FROM account_transactions
        WHERE account_id = ?
        ORDER BY timestamp ASC
    `).all(accountId);
}

module.exports = {
    createAccount,
    renameAccount,
    archiveAccount,
    unarchiveAccount,
    deleteAccount,
    getAccounts,
    getAccountById,
    addAccountTransaction,
    getAccountTransactions,
    getAccountBalance,
    getAccountTimeSeries
};
