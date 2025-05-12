// File: zekenewsom-trade_journal/packages/react-app/src/types/index.ts
// Modified for Stage 6: Add types for chart data and more detailed analytics results

// Existing types (TransactionRecord, Trade, TradeListView, LogTransactionFormData, etc.)
// ... (Keep all types from Stage 5 as they are, including ElectronAPIDefinition)

export interface TransactionRecord {
    transaction_id?: number;
    trade_id: number;
    action: 'Buy' | 'Sell';
    quantity: number;
    price: number;
    datetime: string;
    fees?: number;
    notes?: string | null;
    created_at?: string;
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
    calculated_pnl_gross?: number; // Realized P\&L from (partially) closed portions
    calculated_pnl_net?: number;  // Realized P\&L from (partially) closed portions
    outcome?: 'Win' | 'Loss' | 'Break Even' | null; // For fully closed trades
    created_at?: string;
    updated_at?: string;
    transactions?: TransactionRecord[];
    // --- Stage 6 additions for detailed trade analytics ---
    r_multiple_actual?: number | null; // For fully closed trades
    duration_ms?: number | null; // For fully closed trades
    emotion_ids?: number[]; // For emotion tagging
    }
    
    export interface TradeListView extends Omit<Trade, 'transactions' | 'calculated_pnl_gross' | 'calculated_pnl_net' | 'outcome' | 'market_conditions' | 'setup_description' | 'reasoning' | 'lessons_learned' | 'r_multiple_initial_risk' | 'strategy_id' | 'r_multiple_actual' | 'duration_ms' | 'emotion_ids'> {
    // any summary fields for list view
    }
    
    export interface LogTransactionFormData {
    instrumentTicker: string;
    assetClass: 'Stock' | 'Cryptocurrency' | '';
    exchange: string;
    action: 'Buy' | 'Sell' | '';
    quantity: string;
    price: string;
    datetime: string;
    fees: string;
    notes: string;
    }
    
    export interface LogTransactionPayload {
    instrument_ticker: string;
    asset_class: 'Stock' | 'Cryptocurrency';
    exchange: string | null;
    action: 'Buy' | 'Sell';
    quantity: number;
    price: number;
    datetime: string;
    fees_for_transaction: number;
    notes_for_transaction?: string | null;
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
    }
    export interface UpdateTransactionPayload {
    transaction_id: number;
    quantity: number;
    price: number;
    datetime: string;
    fees: number;
    notes?: string | null;
    }
    
    export interface EditTradeDetailsFormData {
    trade_id: number;
    instrument_ticker: string;
    asset_class: 'Stock' | 'Cryptocurrency';
    exchange: string | null;
    trade_direction: 'Long' | 'Short';
    status: 'Open' | 'Closed';
    open_datetime: string | null;
    close_datetime: string | null;
    fees_total?: number;
    strategy_id: string;
    market_conditions: string;
    setup_description: string;
    reasoning: string;
    lessons_learned: string;
    r_multiple_initial_risk: string;
    emotion_ids?: number[]; // For managing emotions
    }
    export interface UpdateTradeDetailsPayload {
    trade_id: number;
    strategy_id?: number | null;
    market_conditions?: string | null;
    setup_description?: string | null;
    reasoning?: string | null;
    lessons_learned?: string | null;
    r_multiple_initial_risk?: number | null;
    emotion_ids?: number[]; // For saving emotions
    }
    
    // --- Modified for Stage 6: More comprehensive analytics data ---
    export interface AnalyticsData {
    // Basic Metrics (from Stage 4, now more clearly defined)
    totalRealizedNetPnl: number;        // Sum of net P\&L from all closed portions of all trades
    totalRealizedGrossPnl: number;      // Sum of gross P\&L from all closed portions
    totalFeesPaidOnClosedPortions: number; // Sum of fees associated with closed portions
    
    // Metrics based on *fully closed* trades
    winRateOverall: number | null;
    avgWinPnlOverall: number | null;
    avgLossPnlOverall: number | null;
    largestWinPnl: number | null;
    largestLossPnl: number | null;
    longestWinStreak: number;
    longestLossStreak: number;
    numberOfWinningTrades: number; // Count of fully closed winning trades
    numberOfLosingTrades: number;  // Count of fully closed losing trades
    numberOfBreakEvenTrades: number; // Count of fully closed break-even trades
    totalFullyClosedTrades: number;

    // Data for Charts
    cumulativePnlSeries: { date: string; cumulativeNetPnl: number }[]; // Based on all realized P&L events
    pnlPerTradeSeries: { name: string; netPnl: number; trade_id: number }[]; // For fully closed trades
    winLossBreakEvenCounts: { name: string; value: number }[]; // For pie chart, based on fully closed trades

    // --- Stage 6 New Analytics ---
    rMultipleDistribution: { range: string; count: number }[]; // Data for histogram
    avgRMultiple: number | null; // For fully closed trades with risk defined

    // Grouped Performance (based on fully closed trades)
    pnlByAssetClass?: { name: string; totalNetPnl: number; winRate: number | null; tradeCount: number }[];
    pnlByExchange?: { name: string; totalNetPnl: number; winRate: number | null; tradeCount: number }[];
    pnlByStrategy?: { name: string; totalNetPnl: number; winRate: number | null; tradeCount: number }[];

    // Max Drawdown related
    maxDrawdownPercentage?: number | null; // Max % drawdown on realized equity curve
}

export interface EmotionRecord {
    emotion_id: number;
    emotion_name: string;
}

// --- End Stage 6 ---

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
    // --- Modified for Stage 6 ---
    getAnalyticsData: (filters?: any) => Promise<AnalyticsData | { error: string }>;
    // --- Emotion Tagging IPC ---
    getEmotions: () => Promise<EmotionRecord[]>;
    getTradeEmotions: (tradeId: number) => Promise<number[]>; // Returns array of emotion_ids
    saveTradeEmotions: (payload: { tradeId: number; emotionIds: number[] }) => Promise<{ success: boolean; message: string }>;
    }