// packages/electron-app/src/database/db.js (Facade)
const connection = require('./connection');
const tradeService = require('./tradeService');
const transactionService = require('./transactionService');
const emotionService = require('./emotionService');
const analyticsService = require('./analyticsService');
const accountService = require('./accountService');

console.log('[DB_FACADE] Loaded and re-exporting services.');

module.exports = {
  // Connection
  initializeDatabase: connection.initializeDatabase,
  getDb: connection.getDb, // May not be needed externally if all DB ops are via services
  closeDatabase: connection.closeDatabase,
  testDbConnection: connection.testDbConnection,
  backupDatabase: connection.backupDatabase,
  restoreDatabase: connection.restoreDatabase,
  isInMaintenanceMode: connection.isInMaintenanceMode,
  setMaintenanceMode: connection.setMaintenanceMode,

  // Trade Service
  fetchTradesForListView: tradeService.fetchTradesForListView,
  fetchTradeWithTransactions: tradeService.fetchTradeWithTransactions,
  updateTradeMetadata: tradeService.updateTradeMetadata,
  deleteFullTradeAndTransactions: tradeService.deleteFullTradeAndTransactions,
  updateMarkToMarketPrice: tradeService.updateMarkToMarketPrice,
  getAutocompleteData: tradeService.getAutocompleteData,
  // _recalculateTradeState is likely internal to tradeService or called by transactionService
  // calculateTradePnlFifoEnhanced is used by tradeService and analyticsService

  // Transaction Service
  logTransaction: transactionService.addTransactionAndManageTrade, // Alias
  addTransactionAndManageTrade: transactionService.addTransactionAndManageTrade,
  addCSVTransactionAndManageTrade: transactionService.addCSVTransactionAndManageTrade,
  updateSingleTransaction: transactionService.updateSingleTransaction,
  deleteSingleTransaction: transactionService.deleteSingleTransaction,

  // Emotion Service
  getEmotions: emotionService.getEmotions,
  getEmotionsForTrade: emotionService.getEmotionsForTrade,
  saveTradeEmotions: emotionService.saveTradeEmotions,

  // Analytics Service
  calculateAnalyticsData: analyticsService.calculateAnalyticsData,

  // Account Service
  createAccount: accountService.createAccount,
  renameAccount: accountService.renameAccount,
  archiveAccount: accountService.archiveAccount,
  unarchiveAccount: accountService.unarchiveAccount,
  deleteAccount: accountService.deleteAccount,
  getAccounts: accountService.getAccounts,
  getAccountById: accountService.getAccountById,
  addAccountTransaction: accountService.addAccountTransaction,
  getAccountTransactions: accountService.getAccountTransactions,
  getAccountBalance: accountService.getAccountBalance,
  getAccountTimeSeries: accountService.getAccountTimeSeries,
};