// packages/react-app/src/types/index.ts

// Base Transaction Record
export interface TransactionRecord {
  ticker?: string;
  exchange?: string;
  transaction_id?: number;
  trade_id: number; // [cite: 1368]
  action: 'Buy' | 'Sell'; // [cite: 1368]
  quantity: number; // [cite: 1368]
  price: number; // [cite: 1368]
  datetime: string; // [cite: 1368]
  fees?: number; // [cite: 1368]
  notes?: string | null; // [cite: 1368]
  strategy_id?: number | null; // [cite: 1369]
  market_conditions?: string | null; // [cite: 1369]
  setup_description?: string | null; // [cite: 1369]
  reasoning?: string | null; // [cite: 1369]
  lessons_learned?: string | null; // [cite: 1369]
  r_multiple_initial_risk?: number | null; // [cite: 1370]
  emotion_ids?: number[]; // [cite: 1370]
  created_at?: string; // [cite: 1370]
}

// Payload for logging a new transaction
export interface LogTransactionPayload {
  instrument_ticker: string; // [cite: 1370]
  asset_class: 'Stock' | 'Cryptocurrency' | null; // [cite: 1370]
  exchange: string; // [cite: 1371]
  action: 'Buy' | 'Sell'; // [cite: 1371]
  datetime: string; // [cite: 1371]
  quantity: number; // [cite: 1371]
  price: number; // [cite: 1371]
  fees_for_transaction: number; // [cite: 1371]
  notes_for_transaction: string | null; // [cite: 1371]
  account_id: number; // [added for account selection]
  strategy_id?: number; // [cite: 1372]
  market_conditions?: string; // [cite: 1372]
  setup_description?: string; // [cite: 1372]
  reasoning?: string; // Trade Thesis Summary
  lessons_learned?: string; // [cite: 1372]
  r_multiple_initial_risk?: number; // [cite: 1372]
  emotion_ids: number[]; // [cite: 1372]
}

// Payload for updating an existing transaction
export interface UpdateTransactionPayload {
  transaction_id: number; // [cite: 1373]
  quantity: number; // [cite: 1373]
  price: number; // [cite: 1373]
  datetime: string; // [cite: 1373]
  fees: number; // [cite: 1373]
  notes: string | null; // [cite: 1373]
  strategy_id?: number; // [cite: 1374]
  market_conditions?: string; // [cite: 1374]
  setup_description?: string; // [cite: 1374]
  reasoning?: string; // Trade Thesis Summary
  lessons_learned?: string; // [cite: 1374]
  r_multiple_initial_risk?: number; // [cite: 1374]
  emotion_ids: number[]; // [cite: 1374]
}

// Form data for editing trade-level details
export interface EditTradeDetailsFormData {
  trade_id: number;
  strategy_id?: number | null;
  market_conditions?: string;
  setup_description?: string;
  reasoning?: string;
  lessons_learned?: string;
  r_multiple_initial_risk?: number;
  conviction_score?: number; // New: 1-10 confidence
  thesis_validation?: 'Correct' | 'Partially Correct' | 'Incorrect'; // New
  adherence_to_plan?: 'High' | 'Medium' | 'Low'; // New
  unforeseen_events?: string; // New
  overall_trade_rating?: number; // New: 1-10 rating
  emotion_ids?: number[];
}

// Form data for editing a single transaction (usually in a modal)
export interface EditTransactionFormData {
  transaction_id: number; // [cite: 1376]
  trade_id: number; // [cite: 1376]
  action: 'Buy' | 'Sell'; // [cite: 1376]
  quantity: string; // [cite: 1377]
  price: string; // [cite: 1377]
  datetime: string; // [cite: 1377]
  fees: string; // [cite: 1377]
  notes: string; // [cite: 1377]
  strategy_id?: string; // [cite: 1377]
  market_conditions?: string; // [cite: 1377]
  setup_description?: string; // [cite: 1377]
  reasoning?: string; // [cite: 1377]
  lessons_learned?: string; // [cite: 1377]
  r_multiple_initial_risk?: string; // [cite: 1378]
  emotion_ids?: number[]; // [cite: 1378]
}

// Full Trade object including transactions and all calculated fields
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
  conviction_score?: number; // New: 1-10 confidence
  market_conditions?: string | null;
  setup_description?: string | null;
  reasoning?: string | null;
  lessons_learned?: string | null;
  r_multiple_initial_risk?: number | null;
  thesis_validation?: 'Correct' | 'Partially Correct' | 'Incorrect'; // New
  adherence_to_plan?: 'High' | 'Medium' | 'Low'; // New
  unforeseen_events?: string; // New
  overall_trade_rating?: number; // New: 1-10 rating
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
  latest_trade?: string | null;
}

// Simplified Trade object for list views
// [TradeListView interface and related comments removed]


// Form data for logging a new transaction from the UI
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
  account_id: number;
  strategy_id?: string;
  market_conditions?: string;
  setup_description?: string;
  reasoning?: string;
  lessons_learned?: string;
  r_multiple_initial_risk?: string;
  emotion_ids: number[];
}

// Payload for updating trade-level details (metadata, emotions)
export interface UpdateTradeDetailsPayload {
  trade_id: number;
  strategy_id?: number;
  market_conditions?: string;
  setup_description?: string;
  reasoning?: string;
  lessons_learned?: string;
  r_multiple_initial_risk?: number;
  conviction_score?: number; // New: 1-10 confidence
  thesis_validation?: 'Correct' | 'Partially Correct' | 'Incorrect'; // New
  adherence_to_plan?: 'High' | 'Medium' | 'Low'; // New
  unforeseen_events?: string; // New
  overall_trade_rating?: number; // New: 1-10 rating
  emotion_ids: number[];
}

// Emotion record structure
export interface EmotionRecord {
  emotion_id: number; // [cite: 1389]
  emotion_name: string; // [cite: 1389]
}

// Filters for fetching analytics data
export interface AnalyticsFilters {
  dateRange?: {
    startDate: string | null; // [cite: 1390]
    endDate: string | null; // [cite: 1390]
  };
  assetClasses?: string[]; // [cite: 1391]
  exchanges?: string[]; // [cite: 1391]
  strategies?: number[]; // [cite: 1391]
  tickers?: string[]; // Added based on AnalyticsPage.tsx filters
}

// For P&L events over time (could be daily, weekly, etc.)
export interface PnlEvent {
  date: string; // [cite: 1391]
  netPnlRealized: number; // [cite: 1391]
}

// For performance grouped by time periods (month, day of week)
export interface TimePerformanceData {
  period: string; // [cite: 1392]
  totalNetPnl: number; // [cite: 1392]
  tradeCount: number; // [cite: 1392]
  winRate: number | null; // [cite: 1392]
  wins?: number; // [cite: 1392]
  losses?: number; // [cite: 1392]
  breakEvens?: number; // [cite: 1393]
}

// For P&L vs. Duration scatter plot
export interface DurationPerformanceData {
  durationHours: number; // [cite: 1393]
  netPnl: number; // [cite: 1393]
  rMultiple?: number | null; // [cite: 1393]
  trade_id: number; // [cite: 1393]
  instrument_ticker: string; // [cite: 1393]
  isFullyClosed?: boolean; // Added from analyticsService logic
}

// For performance grouped by categories (strategy, asset class, etc.)
export interface GroupedPerformance {
  name: string; // [cite: 1394]
  totalNetPnl: number; // [cite: 1394]
  winRate: number | null; // [cite: 1394]
  tradeCount: number; // [cite: 1394]
  wins: number; // [cite: 1394]
  losses: number; // [cite: 1394]
  breakEvens: number; // [cite: 1395]
}

// For individual points in the P&L per trade series
export interface PnlPerTradePoint {
  date: number; // Timestamp [cite: 1395]
  pnl: number; // [cite: 1395]
  isFullyClosed: boolean; // [cite: 1395]
}

// For individual points in the equity curve
export interface EquityCurvePoint {
  date: number; // Timestamp [cite: 1395]
  equity: number; // [cite: 1396]
}

// --- New supporting types for updated AnalyticsData ---
export interface HeatmapDataPoint {
  date: string; // Format: "YYYY-MM-DD"
  pnl: number;
  dayOfMonth?: number;
}

export interface RiskReturnScatterPoint {
  trade_id: number;
  ticker: string;
  risk: number | null;
  returnPercent: number | null;
  tradeVolume?: number;
}
// --- End new supporting types ---


// Comprehensive Analytics Data structure
export interface AnalyticsData {
  // Core Performance Metrics
  totalRealizedNetPnl: number;
  totalRealizedGrossPnl: number;
  totalFeesPaidOnClosedPortions: number;
  totalUnrealizedPnl: number | null;

  // Basic Trade Statistics
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

  // Time Series Data
  equityCurve: EquityCurvePoint[];
  pnlPerTradeSeries: PnlPerTradePoint[];
  winLossBreakEvenCounts: { name: string; value: number }[];
  rMultipleDistribution: { range: string; count: number }[];
  pnlByMonth: TimePerformanceData[];
  pnlByDayOfWeek: TimePerformanceData[];
  pnlVsDurationSeries: DurationPerformanceData[];

  // Performance Groupings
  pnlByAssetClass: GroupedPerformance[];
  pnlByExchange: GroupedPerformance[];
  pnlByStrategy: GroupedPerformance[];
  pnlByEmotion: GroupedPerformance[];
  pnlByAsset?: GroupedPerformance[];

  // Basic Risk Metrics
  maxDrawdownPercentage: number | null;
  kellyCriterion?: number | null;

  // Chart Data
  netAccountBalanceTrend?: EquityCurvePoint[];
  dailyPnlForHeatmap?: HeatmapDataPoint[];
  riskReturnScatterData?: RiskReturnScatterPoint[];

  // --- INSTITUTIONAL-LEVEL RISK METRICS ---
  // Risk-Adjusted Performance Ratios
  sharpeRatio?: number | null;
  sortinoRatio?: number | null;
  calmarRatio?: number | null;
  informationRatio?: number | null;
  treynorRatio?: number | null;
  omega?: number | null;
  gainToPainRatio?: number | null;
  sterlingRatio?: number | null;
  burkeRatio?: number | null;
  ulcerIndex?: number | null;

  // Statistical Measures
  skewness?: number | null;
  kurtosis?: number | null;
  annualizedReturn?: number | null;
  annualizedVolatility?: number | null;
  downDeviationAnnualized?: number | null;

  // Value at Risk Metrics
  valueAtRisk95?: number | null;
  valueAtRisk99?: number | null;
  conditionalVaR95?: number | null;
  conditionalVaR99?: number | null;

  // Drawdown Analysis
  maxDrawdownDuration?: number | null;
  averageDrawdown?: number | null;

  // Portfolio Concentration Metrics
  herfindahlIndex?: number | null;
  concentrationRatio?: number | null;
  numberOfPositions?: number | null;
  averagePositionSize?: number | null;
  largestPositionPercent?: number | null;
  diversificationRatio?: number | null;

  // Attribution Analysis
  sectorBreakdown?: GroupedPerformance[];
  industryBreakdown?: GroupedPerformance[];
  marketCapBreakdown?: GroupedPerformance[];
  geographicBreakdown?: GroupedPerformance[];

  // Rolling Window Metrics
  rollingSharpe?: { date: number; value: number | null }[];
  rollingVolatility?: { date: number; value: number | null }[];
  rollingDrawdown?: { date: number; value: number | null }[];

  // Benchmark Comparison (requires benchmark data)
  alpha?: number | null;
  beta?: number | null;
  trackingError?: number | null;
  upCaptureRatio?: number | null;
  downCaptureRatio?: number | null;
  correlation?: number | null;

  // Filter Options
  availableStrategies?: { strategy_id: number; strategy_name: string }[];
  availableExchanges?: string[];
  availableAssetClasses?: string[];
  availableEmotions?: EmotionRecord[];
  availableTickers?: string[];
}

// Defines the contract for IPC communication with Electron main process
export interface AccountRecord {
  account_id: number;
  name: string;
  type: string;
  is_archived: 0 | 1;
  is_deleted: 0 | 1;
  created_at: string;
  updated_at: string;
  balance?: number; // Optional: present if fetched with balance aggregation
}

export interface ElectronAPIDefinition {
  // --- Account Management ---
  createAccount: (opts: { name: string; type?: string }) => Promise<{ success: boolean; id?: number; message?: string }>;
  renameAccount: (opts: { accountId: number; newName: string }) => Promise<{ success: boolean; message?: string }>;
  archiveAccount: (opts: { accountId: number }) => Promise<{ success: boolean; message?: string }>;
  unarchiveAccount: (opts: { accountId: number }) => Promise<{ success: boolean; message?: string }>;
  deleteAccount: (opts: { accountId: number }) => Promise<{ success: boolean; message?: string }>;
  getAccounts: (opts?: { includeArchived?: boolean; includeDeleted?: boolean }) => Promise<unknown>;
  getAccountById: (accountId: number) => Promise<unknown>;
  addAccountTransaction: (opts: { accountId: number; type: string; amount: number; relatedTradeId?: number | null; memo?: string | null }) => Promise<{ success: boolean; id?: number; message?: string }>;
  getAccountTransactions: (opts: { accountId: number; limit?: number; offset?: number }) => Promise<unknown>;
  getAccountBalance: (accountId: number) => Promise<unknown>;
  getAccountTimeSeries: (accountId: number) => Promise<unknown>;

  exportDataCSV: (opts: { includeTransactions: boolean }) => Promise<unknown>; // [cite: 1402]
  exportDataJSON: (opts: { includeTransactions: boolean }) => Promise<unknown>; // [cite: 1403]
  exportDataXLSX: (opts: { includeTransactions: boolean }) => Promise<unknown>; // [cite: 1403]
  backupDatabase: () => Promise<{ success: boolean; message: string }>; // [cite: 1404]
  restoreDatabase: () => Promise<{ success: boolean; message: string }>; // [cite: 1404]
  getAppVersion: () => Promise<string>; // [cite: 1405]
  testDbConnection: () => Promise<{ status: 'ok' | 'error'; message: string } | string>; // [cite: 1405]
  logTransaction: (data: LogTransactionPayload) => Promise<{ // [cite: 1406]
    success: boolean; // [cite: 1406]
    message: string; // [cite: 1406]
    tradeId?: number; // [cite: 1406]
    transactionId?: number; // [cite: 1406]
    unrealized_pnl?: number; // [cite: 1406]
  }>;
  logCSVTransaction: (data: LogTransactionPayload) => Promise<{
    success: boolean;
    message: string;
    tradeId?: number;
    transactionId?: number;
    unrealized_pnl?: number;
    current_open_quantity?: number; // [cite: 1406]
    average_open_price?: number; // [cite: 1406]
  }>;
  getTrades: () => Promise<Trade[]>; // [cite: 1407]
  getTradeWithTransactions: (tradeId: number) => Promise<Trade | null>; // [cite: 1407]
  updateTradeDetails: (data: UpdateTradeDetailsPayload) => Promise<{ success: boolean; message: string }>; // [cite: 1407]
  updateSingleTransaction: (data: UpdateTransactionPayload) => Promise<{ success: boolean; message: string }>; // [cite: 1408]
  deleteSingleTransaction: (transactionId: number) => Promise<{ success: boolean; message: string }>; // [cite: 1408]
  deleteFullTrade: (tradeId: number) => Promise<{ success: boolean; message: string }>; // [cite: 1409]
  getAnalyticsData: (filters?: AnalyticsFilters) => Promise<AnalyticsData | { error: string }>; // [cite: 1409] Use AnalyticsFilters here, not StoreAnalyticsFilters unless it's defined elsewhere
  getEmotions: () => Promise<EmotionRecord[]>; // [cite: 1410]
  getTradeEmotions: (tradeId: number) => Promise<number[]>; // [cite: 1410]
  saveTradeEmotions: (payload: { tradeId: number; emotionIds: number[] }) => Promise<{ success: boolean; message: string }>; // [cite: 1411]
  updateMarkPrice: (payload: { tradeId: number; marketPrice: number }) => Promise<{ // [cite: 1412]
    success: boolean; // [cite: 1412]
    message: string; // [cite: 1412]
    unrealized_pnl?: number; // [cite: 1412]
    current_open_quantity?: number; // [cite: 1413]
    average_open_price?: number; // [cite: 1413]
    trade_id?: number; // [cite: 1413]
  }>;
  getAutocompleteData: (field: string) => Promise<{ success: boolean; data: string[]; message?: string }>;
}