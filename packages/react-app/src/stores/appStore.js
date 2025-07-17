import { create } from 'zustand';
export const useAppStore = create((set, get) => ({
    // --- Settings ---
    riskFreeRate: 4.5, // Annual risk-free rate (percent)
    setRiskFreeRate: (rate) => set({ riskFreeRate: rate }),
    // --- Account state ---
    accounts: [],
    // --- Derived selectors ---
    getTotalBuyingPower: () => {
        const { accounts } = get();
        // Match the Accounts section: sum balances of all non-archived, non-deleted accounts
        return accounts
            .filter(acc => !acc.is_archived && !acc.is_deleted)
            .reduce((sum, acc) => sum + (typeof acc.balance === 'number' ? acc.balance : 0), 0);
    },
    accountTransactions: [],
    selectedAccountId: null,
    isLoadingAccounts: false,
    errorLoadingAccounts: null,
    isLoadingAccountTransactions: false,
    errorLoadingAccountTransactions: null,
    fetchAccounts: async () => {
        set({ isLoadingAccounts: true, errorLoadingAccounts: null });
        try {
            const result = await window.electronAPI.getAccounts();
            const accounts = Array.isArray(result) ? result : [];
            // Fetch balances for each account in parallel
            const accountsWithBalances = await Promise.all(accounts.map(async (acc) => {
                try {
                    const balance = await window.electronAPI.getAccountBalance(acc.account_id);
                    return { ...acc, balance: typeof balance === 'number' ? balance : 0 };
                }
                catch {
                    return { ...acc, balance: 0 };
                }
            }));
            set({ accounts: accountsWithBalances });
        }
        catch (error) {
            set({ errorLoadingAccounts: error.message, accounts: [] });
        }
        finally {
            set({ isLoadingAccounts: false });
        }
    },
    selectAccount: (accountId) => {
        set({ selectedAccountId: accountId });
        get().fetchAccountTransactions(accountId);
    },
    fetchAccountTransactions: async (accountId) => {
        set({ isLoadingAccountTransactions: true, errorLoadingAccountTransactions: null });
        try {
            const result = await window.electronAPI.getAccountTransactions({ accountId });
            if (Array.isArray(result)) {
                set({ accountTransactions: result });
            }
            else {
                set({ accountTransactions: [] });
            }
        }
        catch (error) {
            set({ errorLoadingAccountTransactions: error.message, accountTransactions: [] });
        }
        finally {
            set({ isLoadingAccountTransactions: false });
        }
    },
    createAccount: async (opts) => {
        const result = await window.electronAPI.createAccount(opts);
        if (result.success)
            await get().fetchAccounts();
        return result;
    },
    renameAccount: async (opts) => {
        const result = await window.electronAPI.renameAccount(opts);
        if (result.success)
            await get().fetchAccounts();
        return result;
    },
    archiveAccount: async (opts) => {
        const result = await window.electronAPI.archiveAccount(opts);
        if (result.success)
            await get().fetchAccounts();
        return result;
    },
    unarchiveAccount: async (opts) => {
        const result = await window.electronAPI.unarchiveAccount(opts);
        if (result.success)
            await get().fetchAccounts();
        return result;
    },
    deleteAccount: async (opts) => {
        const result = await window.electronAPI.deleteAccount(opts);
        if (result.success)
            await get().fetchAccounts();
        return result;
    },
    addAccountTransaction: async (opts) => {
        const result = await window.electronAPI.addAccountTransaction(opts);
        if (result.success) {
            // Always refresh accounts (and thus balances) after deposit/withdrawal/transaction
            await get().fetchAccounts();
            if (opts.accountId)
                await get().fetchAccountTransactions(opts.accountId);
        }
        return result;
    },
    getAccountBalance: async (accountId) => {
        return window.electronAPI.getAccountBalance(accountId);
    },
    getAccountTimeSeries: async (accountId) => {
        return window.electronAPI.getAccountTimeSeries(accountId);
    },
    // --- Loading/Error states for trades ---
    isLoadingTrades: false,
    errorLoadingTrades: null,
    currentView: 'dashboard',
    editingTradeId: null,
    trades: [],
    availableEmotions: [],
    appVersion: null,
    dbStatus: null,
    currentViewParams: undefined,
    isLoadingInitialData: true,
    errorLoadingInitialData: null,
    // Dashboard analytics state
    analytics: null,
    isLoadingAnalytics: false,
    analyticsError: null,
    fetchAnalyticsData: async (filters = {}) => {
        set({ isLoadingAnalytics: true, analyticsError: null });
        try {
            if (window.electronAPI && window.electronAPI.getAnalyticsData) {
                const data = await window.electronAPI.getAnalyticsData(filters);
                if (data == null) {
                    throw new Error('No analytics data returned from backend.');
                }
                if ('error' in data) {
                    throw new Error(data.error);
                }
                set({ analytics: data });
            }
            else {
                throw new Error('getAnalyticsData API not available.');
            }
        }
        catch (err) {
            console.error('Error fetching dashboard analytics:', err);
            set({ analyticsError: err.message, analytics: null });
        }
        finally {
            set({ isLoadingAnalytics: false });
        }
    },
    navigateTo: (view, params) => set({
        currentView: view,
        currentViewParams: params,
        editingTradeId: view === 'editTradeDetailsForm' ? get().editingTradeId : null
    }),
    setEditingTradeId: (id) => set({ editingTradeId: id }),
    fetchInitialAppData: async () => {
        set({ isLoadingInitialData: true, errorLoadingInitialData: null });
        try {
            const [dbTestResult, trades, emotions, appVersion] = await Promise.all([
                window.electronAPI.testDbConnection(),
                window.electronAPI.getTrades(),
                window.electronAPI.getEmotions(),
                window.electronAPI.getAppVersion()
            ]);
            // Always call fetchAccounts so the store is updated the same way everywhere
            const accounts = await get().fetchAccounts();
            let dbStatusMessage = 'DB status response not recognized.';
            if (typeof dbTestResult === 'string') {
                dbStatusMessage = dbTestResult;
            }
            else if (dbTestResult && 'error' in dbTestResult && dbTestResult.error) {
                dbStatusMessage = `Error: ${dbTestResult.error}`;
            }
            else if (dbTestResult && 'status' in dbTestResult && 'message' in dbTestResult) {
                dbStatusMessage = dbTestResult.message;
            }
            set({
                trades: trades || [],
                availableEmotions: emotions || [],
                appVersion: appVersion || 'N/A',
                dbStatus: dbStatusMessage,
                accounts: Array.isArray(accounts) ? accounts : [],
                isLoadingInitialData: false,
            });
        }
        catch (error) {
            console.error('Error fetching initial app data:', error);
            set({
                errorLoadingInitialData: error.message,
                isLoadingInitialData: false,
                dbStatus: `Error: ${error.message}`,
            });
        }
    },
    refreshTrades: async () => {
        set({ isLoadingTrades: true, errorLoadingTrades: null });
        try {
            const trades = await window.electronAPI.getTrades();
            console.log('[refreshTrades] Fetched trades:', trades);
            set({ trades: trades || [], isLoadingTrades: false });
        }
        catch (error) {
            set({ errorLoadingTrades: error.message, isLoadingTrades: false });
            console.error('Error refreshing trades:', error);
        }
    },
    /**
     * Call after trade create/delete/transaction to ensure trades list is up-to-date.
     * Optionally refresh analytics if needed.
     */
    handleTradeDataChange: async () => {
        await get().refreshTrades();
        // Optionally: await get().fetchAnalyticsData();
    },
    /**
     * Delete a trade by id, then refresh the trades list.
     * Returns a result object with success/message.
     */
    deleteFullTradeInStore: async (tradeId) => {
        try {
            const result = await window.electronAPI.deleteFullTrade(tradeId);
            if (result.success) {
                await get().refreshTrades();
                return { success: true, message: result.message };
            }
            else {
                return { success: false, message: result.message };
            }
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    },
    updateMarkPriceInStore: (tradeId, marketPrice, unrealized_pnl, current_open_quantity) => {
        set(state => ({
            trades: state.trades.map(trade => trade.trade_id === tradeId
                ? {
                    ...trade,
                    current_market_price: marketPrice ?? trade.current_market_price,
                    unrealized_pnl: unrealized_pnl ?? trade.unrealized_pnl,
                    current_open_quantity: current_open_quantity ?? trade.current_open_quantity
                }
                : trade)
        }));
    },
}));
