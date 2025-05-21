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
  strategy_id?: number | null;
  market_conditions?: string | null;
  setup_description?: string | null;
  reasoning?: string | null;
  lessons_learned?: string | null;
  r_multiple_initial_risk?: number | null;
  emotion_ids?: number[];
  created_at?: string;
}

export interface LogTransactionPayload {
  instrument_ticker: string;
  asset_class: 'Stock' | 'Cryptocurrency' | null;
  exchange: string;
  action: 'Buy' | 'Sell';
  datetime: string;
  quantity: number;
  price: number;
  fees_for_transaction: number;
  notes_for_transaction: string | null;
  strategy_id?: number;
  market_conditions?: string;
  setup_description?: string;
  reasoning?: string;
  lessons_learned?: string;
  r_multiple_initial_risk?: number;
  emotion_ids: number[];
}

export interface UpdateTransactionPayload {
  transaction_id: number;
  quantity: number;
  price: number;
  datetime: string;
  fees: number;
  notes: string | null;
  strategy_id?: number;
  market_conditions?: string;
  setup_description?: string;
  reasoning?: string;
  lessons_learned?: string;
  r_multiple_initial_risk?: number;
  emotion_ids: number[];
}

// Placeholder for EditTradeDetailsFormData
export interface EditTradeDetailsFormData {
  trade_id: number;
  strategy_id?: number | null;
  market_conditions?: string;
  setup_description?: string;
  reasoning?: string;
  lessons_learned?: string;
  r_multiple_initial_risk?: number;
  emotion_ids?: number[];
}

export interface EditTransactionFormData {
  transaction_id: number;
  trade_id: number;
  action: 'Buy' | 'Sell';
  quantity: string;
  price: string;
  datetime: string;
  fees: string;
  notes: string;
  strategy_id?: string;
  market_conditions?: string;
  setup_description?: string;
  reasoning?: string;
  lessons_learned?: string;
  r_multiple_initial_risk?: string;
  emotion_ids?: number[];
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

  current_market_price?: number | null;
  unrealized_pnl?: number | null;
  average_open_price?: number | null;
  current_open_quantity?: number | null;
  realized_pnl_for_trade?: number | null;

  calculated_pnl_gross?: number;
  calculated_pnl_net?: number;
  outcome?: 'Win' | 'Loss' | 'Break Even' | null;
  r_multiple_actual?: number | null;
  duration_ms?: number | null;

  created_at?: string;
  updated_at?: string;
  transactions?: TransactionRecord[];
  emotion_ids?: number[];
}

export interface TradeListView extends Omit<Trade, 'transactions' | 'calculated_pnl_gross' | 'calculated_pnl_net' | 'outcome' | 'market_conditions' | 'setup_description' | 'reasoning' | 'lessons_learned' | 'r_multiple_initial_risk' | 'strategy_id' | 'r_multiple_actual' | 'duration_ms' | 'emotion_ids' | 'average_open_price' | 'realized_pnl_for_trade'> {
  current_market_price?: number | null;
  unrealized_pnl?: number | null;
  current_open_quantity?: number | null;
}

export interface LogTransactionFormData {
  instrument_ticker: string;
  asset_class: 'Stock' | 'Cryptocurrency' | null;
  exchange: string;
  action: 'Buy' | 'Sell';
  datetime: string;
  quantity: string;
  price: string;
  fees: string;
  notes: string;
  strategy_id?: string;
  market_conditions?: string;
  setup_description?: string;
  reasoning?: string;
  lessons_learned?: string;
  r_multiple_initial_risk?: string;
  emotion_ids: number[];
}

export interface UpdateTradeDetailsPayload {
  trade_id: number;
  strategy_id?: number;
  market_conditions?: string;
  setup_description?: string;
  reasoning?: string;
  lessons_learned?: string;
  r_multiple_initial_risk?: number;
  emotion_ids: number[];
}

export interface EmotionRecord {
  emotion_id: number;
  emotion_name: string;
}

export interface AnalyticsFilters {
  dateRange?: {
    startDate: string | null;
    endDate: string | null;
  };
  assetClasses?: string[];
  exchanges?: string[];
  strategies?: number[];
}

export interface PnlEvent {
  date: string;
  netPnlRealized: number;
}

export interface TimePerformanceData {
  period: string;
  totalNetPnl: number;
  tradeCount: number;
  winRate: number | null;
  wins?: number;
  losses?: number;
  breakEvens?: number;
}

export interface DurationPerformanceData {
  durationHours: number;
  netPnl: number;
  rMultiple?: number | null;
  trade_id: number;
  instrument_ticker: string;
}

export interface GroupedPerformance {
  name: string;
  totalNetPnl: number;
  winRate: number | null;
  tradeCount: number;
  wins: number;
  losses: number;
  breakEvens: number;
}

export interface PnlPerTradePoint {
  date: number;
  pnl: number;
  isFullyClosed: boolean;
}

export interface EquityCurvePoint {
  date: number;
  equity: number;
}

export interface AnalyticsData {
  totalRealizedNetPnl: number;
  totalRealizedGrossPnl: number;
  totalFeesPaidOnClosedPortions: number;
  totalUnrealizedPnl: number | null;

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
  avgRMultiple: number | null;

  equityCurve: { date: number; equity: number }[];
  pnlPerTradeSeries: PnlPerTradePoint[];
  winLossBreakEvenCounts: { name: string; value: number }[];
  rMultipleDistribution: { range: string; count: number }[];

  pnlByMonth: TimePerformanceData[];
  pnlByDayOfWeek: TimePerformanceData[];
  pnlVsDurationSeries: DurationPerformanceData[];

  pnlByAssetClass: GroupedPerformance[];
  pnlByExchange: GroupedPerformance[];
  pnlByStrategy: GroupedPerformance[];
  pnlByEmotion: GroupedPerformance[];

  maxDrawdownPercentage: number | null;

  availableStrategies?: { strategy_id: number; strategy_name: string }[];
  availableExchanges?: string[];
  availableAssetClasses?: string[];
  availableEmotions?: EmotionRecord[];
  availableTickers?: string[];
}

export interface ElectronAPIDefinition {
  backupDatabase: () => Promise<{ success: boolean; message: string }>;
  restoreDatabase: () => Promise<{ success: boolean; message: string }>;

  getAppVersion: () => Promise<string>;
  testDbConnection: () => Promise<{ status: 'ok' | 'error'; message: string } | string>;
  logTransaction: (data: LogTransactionPayload) => Promise<{ success: boolean; message: string; tradeId?: number; transactionId?: number; unrealized_pnl?: number; current_open_quantity?: number; average_open_price?: number }>;
  getTrades: () => Promise<TradeListView[]>;
  getTradeWithTransactions: (tradeId: number) => Promise<Trade | null>;
  updateTradeDetails: (data: UpdateTradeDetailsPayload) => Promise<{ success: boolean; message: string }>;
  updateSingleTransaction: (data: UpdateTransactionPayload) => Promise<{ success: boolean; message: string }>;
  deleteSingleTransaction: (transactionId: number) => Promise<{ success: boolean; message: string }>;
  deleteFullTrade: (tradeId: number) => Promise<{ success: boolean; message: string }>;
  getAnalyticsData: (filters?: AnalyticsFilters) => Promise<AnalyticsData | { error: string }>;
  getEmotions: () => Promise<EmotionRecord[]>;
  getTradeEmotions: (tradeId: number) => Promise<number[]>;
  saveTradeEmotions: (payload: { tradeId: number; emotionIds: number[] }) => Promise<{ success: boolean; message: string }>;
  updateMarkPrice: (payload: { tradeId: number; marketPrice: number }) => Promise<{
    success: boolean;
    message: string;
    unrealized_pnl?: number;
    current_open_quantity?: number;
    average_open_price?: number;
    trade_id?: number;
  }>;
}