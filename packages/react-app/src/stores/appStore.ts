import { create } from 'zustand';
import type {
  TradeListView,
  EmotionRecord,
  ElectronAPIDefinition,
} from '../types';

declare global {
  interface Window {
    electronAPI: ElectronAPIDefinition;
  }
}

type View =
  | 'dashboard'
  | 'tradesList'
  | 'logTransactionForm'
  | 'editTradeDetailsForm'
  | 'analyticsPage';

interface AppViewParams {
  initialValues?: {
    instrument_ticker: string;
    asset_class: 'Stock' | 'Cryptocurrency';
    exchange: string;
  };
  navTimestamp?: number;
}

import type { AnalyticsData } from '../types';

interface AppState {
  currentView: View;
  editingTradeId: number | null;
  trades: TradeListView[];
  availableEmotions: EmotionRecord[];
  appVersion: string | null;
  dbStatus: string | null;
  currentViewParams?: AppViewParams;
  isLoadingInitialData: boolean;
  errorLoadingInitialData: string | null;

  // Dashboard analytics state
  analytics: AnalyticsData | null;
  isLoadingAnalytics: boolean;
  analyticsError: string | null;
  fetchAnalyticsData: (filters?: Record<string, unknown>) => Promise<void>;

  // Trades loading/error state
  isLoadingTrades: boolean;
  errorLoadingTrades: string | null;

  // Trade mutation/refresh actions
  handleTradeDataChange: () => Promise<void>;
  deleteFullTradeInStore: (tradeId: number) => Promise<{ success: boolean; message: string }>;

  navigateTo: (view: View, params?: AppViewParams) => void;
  setEditingTradeId: (id: number | null) => void;
  fetchInitialAppData: () => Promise<void>;
  refreshTrades: () => Promise<void>;
  updateMarkPriceInStore: (
    tradeId: number,
    marketPrice: number,
    unrealized_pnl?: number,
    current_open_quantity?: number
  ) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
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
      } else {
        throw new Error('getAnalyticsData API not available.');
      }
    } catch (err) {
      console.error('Error fetching dashboard analytics:', err);
      set({ analyticsError: (err as Error).message, analytics: null });
    } finally {
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
        window.electronAPI.getAppVersion(),
      ]);

      let dbStatusMessage = 'DB status response not recognized.';
      if (typeof dbTestResult === 'string') {
        dbStatusMessage = dbTestResult;
      } else if (dbTestResult && 'error' in dbTestResult && dbTestResult.error) {
        dbStatusMessage = `Error: ${dbTestResult.error}`;
      } else if (dbTestResult && 'status' in dbTestResult && 'message' in dbTestResult) {
        dbStatusMessage = dbTestResult.message;
      }

      set({
        trades: trades || [],
        availableEmotions: emotions || [],
        appVersion: appVersion || 'N/A',
        dbStatus: dbStatusMessage,
        isLoadingInitialData: false,
      });
    } catch (error) {
      console.error('Error fetching initial app data:', error);
      set({
        errorLoadingInitialData: (error as Error).message,
        isLoadingInitialData: false,
        dbStatus: `Error: ${(error as Error).message}`,
      });
    }
  },

  refreshTrades: async () => {
    set({ isLoadingTrades: true, errorLoadingTrades: null });
    try {
      const trades = await window.electronAPI.getTrades();
      console.log('[refreshTrades] Fetched trades:', trades);
      set({ trades: trades || [], isLoadingTrades: false });
    } catch (error) {
      set({ errorLoadingTrades: (error as Error).message, isLoadingTrades: false });
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
  deleteFullTradeInStore: async (tradeId: number) => {
    try {
      const result = await window.electronAPI.deleteFullTrade(tradeId);
      if (result.success) {
        await get().refreshTrades();
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  },

  updateMarkPriceInStore: (
    tradeId,
    marketPrice,
    unrealized_pnl,
    current_open_quantity
  ) => {
    set(state => ({
      trades: state.trades.map(trade =>
        trade.trade_id === tradeId
          ? {
              ...trade,
              current_market_price: marketPrice ?? trade.current_market_price,
              unrealized_pnl: unrealized_pnl ?? trade.unrealized_pnl,
              current_open_quantity: current_open_quantity ?? trade.current_open_quantity
            }
          : trade
      )
    }));
  },
}));
