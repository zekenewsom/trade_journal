// File: zekenewsom-trade_journal/packages/react-app/src/types/index.ts
// Modified for Stage 6: Add mark-to-market fields and unrealized P&amp;L

// ... (Keep all existing types from your zekenewsom-trade_journal(4).txt)
// Add/Modify the following within the existing types:

export interface TransactionRecord {
  transaction_id?: number;
  trade_id: number;
  action: 'Buy' | 'Sell';
  quantity: number;
  price: number;
  datetime: string;
  fees?: number;
  notes?: string | null;
}

export interface LogTransactionPayload { [key: string]: any; }
export interface UpdateTradeDetailsPayload { [key: string]: any; }
export interface UpdateTransactionPayload { [key: string]: any; }

// Placeholder for EditTradeDetailsFormData
export interface EditTradeDetailsFormData { [key: string]: any; }

export interface EditTransactionFormData {
  transaction_id: number;
  trade_id: number;
  action: 'Buy' | 'Sell';
  quantity: string;
  price: string;
  datetime: string;
  fees: string;
  notes: string;
}

export interface Trade {
  trade_id?: number;
  instrument_ticker: string;
  asset_class: 'Stock' | 'Cryptocurrency';
  exchange: string | null;
  trade_direction: 'Long' | 'Short';
  status: 'Open' | 'Closed';
  open_datetime: string | null;
  close_datetime: string | null;
  strategy_id?: number | null;
  market_conditions?: string | null;
  setup_description?: string | null;
  reasoning?: string | null;
  lessons_learned?: string | null;
  r_multiple_initial_risk?: number | null;
  fees_total?: number;
  calculated_pnl_gross?: number;
  calculated_pnl_net?: number;
  outcome?: 'Win' | 'Loss' | 'Break Even' | null;
  created_at?: string;
  updated_at?: string;
  transactions?: TransactionRecord[];
  r_multiple_actual?: number | null;
  duration_ms?: number | null;
  emotion_ids?: number[];
  // --- Stage 6: Mark-to-Market & Unrealized P&L ---
  current_market_price?: number | null; // User-inputted mark price for open trades
  unrealized_pnl?: number | null;     // Calculated based on current_market_price
  average_open_price?: number | null; // Weighted average price of the currently open quantity
  current_open_quantity?: number | null; // Current open quantity
  // --- End Stage 6 additions ---
}

export interface TradeListView extends Omit<Trade, 'transactions' | 'calculated_pnl_gross' | 'calculated_pnl_net' | 'outcome' | 'market_conditions' | 'setup_description' | 'reasoning' | 'lessons_learned' | 'r_multiple_initial_risk' | 'strategy_id' | 'r_multiple_actual' | 'duration_ms' | 'emotion_ids'> {
  current_open_quantity?: number | null;
  unrealized_pnl?: number | null;
  average_open_price?: number | null;
}

export interface AnalyticsData {
  totalRealizedNetPnl: number;
  totalRealizedGrossPnl: number;
  totalFeesPaidOnClosedPortions: number;
  winRateOverall: number | null;
  avgWinPnlOverall: number | null;
  avgLossPnlOverall: number | null;
  largestWinPnl: number | null;
  largestLossPnl: number | null;
  longestWinStreak: number;
  longestLossStreak: number;
  numberOfWinningTrades: number;
  numberOfLosingTrades: number;
  numberOfBreakEvenTrades: number;
  totalFullyClosedTrades: number;
  cumulativePnlSeries: { date: string; cumulativeNetPnl: number }[];
  pnlPerTradeSeries: { name: string; netPnl: number; trade_id: number }[];
  winLossBreakEvenCounts: { name: string; value: number }[];
  rMultipleDistribution: { range: string; count: number }[];
  avgRMultiple: number | null;
  pnlByAssetClass?: { name: string; totalNetPnl: number; winRate: number | null; tradeCount: number }[];
  pnlByExchange?: { name: string; totalNetPnl: number; winRate: number | null; tradeCount: number }[];
  pnlByStrategy?: { name: string; totalNetPnl: number; winRate: number | null; tradeCount: number }[];
  maxDrawdownPercentage?: number | null;
  totalUnrealizedPnl?: number | null;
}

export interface EmotionRecord {
  emotion_id: number;
  emotion_name: string;
}

export interface ElectronAPIDefinition {
  getAppVersion: () => Promise<string>;
  testDbConnection: () => Promise<{ status: 'ok' | 'error'; message: string } | string>;
  logTransaction: (data: LogTransactionPayload) => Promise<{ success: boolean; message: string; tradeId?: number; transactionId?: number }>;
  getTrades: () => Promise<TradeListView[]>;
  getTradeWithTransactions: (tradeId: number) => Promise<Trade | null>;
  updateTradeDetails: (data: UpdateTradeDetailsPayload) => Promise<{ success: boolean; message: string }>;
  updateSingleTransaction: (data: UpdateTransactionPayload) => Promise<{ success: boolean; message: string }>;
  deleteSingleTransaction: (transactionId: number) => Promise<{ success: boolean; message: string }>;
  deleteFullTrade: (tradeId: number) => Promise<{ success: boolean; message: string }>;
  getAnalyticsData: (filters?: any) => Promise<AnalyticsData | { error: string }>;
  getEmotions: () => Promise<EmotionRecord[]>;
  getTradeEmotions: (tradeId: number) => Promise<number[]>;
  saveTradeEmotions: (payload: { tradeId: number; emotionIds: number[] }) => Promise<{ success: boolean; message: string }>;
  // --- Stage 6: New IPC for mark-to-market ---
  updateMarkPrice: (payload: { tradeId: number; marketPrice: number }) => Promise<{
    success: boolean;
    message: string;
    unrealized_pnl?: number;
    current_open_quantity?: number;
    average_open_price?: number;
    trade_id?: number;
  }>;
  // --- End Stage 6 ---
}