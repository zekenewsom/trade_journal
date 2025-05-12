// File: zekenewsom-trade_journal/packages/react-app/src/types/index.ts
// Heavily Modified for Stage 5: Transaction-Centric Model

// Represents a single recorded execution (buy or sell)
export interface TransactionRecord { // Renamed from TradeLeg
    transaction_id?: number; // PK, from DB
    trade_id: number;       // FK to parent Trade (position)
    action: 'Buy' | 'Sell'; // The user's action for this specific transaction
    quantity: number;       // Always positive
    price: number;
    datetime: string;       // ISO 8601 format
    fees?: number;          // Fees for this specific transaction
    notes?: string | null;    // Notes for this specific transaction
    created_at?: string;
}

// Represents an overall trade or position, composed of one or more transactions
export interface Trade {
    trade_id?: number; // PK, from DB
    instrument_ticker: string;
    asset_class: 'Stock' | 'Cryptocurrency';
    exchange: string | null; // Changed from account_id, now text
    trade_direction: 'Long' | 'Short'; // Overall direction of this position
    status: 'Open' | 'Closed'; // Replaces is_open
    open_datetime: string | null; // Datetime of the first transaction that opened this trade
    close_datetime: string | null; // Datetime of the transaction that closed this trade
    
    // Fields for user to edit on the overall trade
    strategy_id?: number | null;
    market_conditions?: string | null;
    setup_description?: string | null;
    reasoning?: string | null;
    lessons_learned?: string | null;
    r_multiple_initial_risk?: number | null;
  
    // Aggregated from transactions by backend
    fees_total?: number; // Sum of fees from all associated transactions
  
    // Fields for UI display or temporary calculation during analytics
    calculated_pnl_gross?: number;
    calculated_pnl_net?: number;
    outcome?: 'Win' | 'Loss' | 'Break Even' | null;
  
    created_at?: string; // DB timestamp
    updated_at?: string; // DB timestamp
  
    // Array of transactions associated with this trade, fetched when viewing details
    transactions?: TransactionRecord[];
}

// For displaying a summary of trades in a list/table (TradesListPage)
export interface TradeListView extends Omit<Trade, 'transactions' | 'calculated_pnl_gross' | 'calculated_pnl_net' | 'outcome' | 'market_conditions' | 'setup_description' | 'reasoning' | 'lessons_learned' | 'r_multiple_initial_risk' | 'strategy_id'> {
    // Add any specific summary fields derived from transactions if needed for the list here
}
  
  // Form data for logging a NEW single transaction
  export interface LogTransactionFormData { // Make sure this export is exactly as named
    instrumentTicker: string;
    assetClass: 'Stock' | 'Cryptocurrency' | '';
    exchange: string;
    action: 'Buy' | 'Sell' | '';
    quantity: string; // String for form input
    price: string;    // String for form input
    datetime: string; // Datetime-local input format
    fees: string;     // String for form input (fees for this transaction)
    notes: string;    // Optional notes for this transaction
}

// Payload for logging a NEW transaction to backend
export interface LogTransactionPayload {
    instrument_ticker: string;
    asset_class: 'Stock' | 'Cryptocurrency';
    exchange: string | null; // Backend handles empty string as null
    action: 'Buy' | 'Sell';
    quantity: number; // Parsed to number
    price: number;    // Parsed to number
    datetime: string; // ISO 8601
    fees_for_transaction: number; // Parsed to number
    notes_for_transaction?: string | null;
}

// Form data for EDITING an EXISTING single transaction (e.g., in a modal)
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
// Payload for UPDATING an existing transaction
export interface UpdateTransactionPayload {
    transaction_id: number;
    quantity: number;
    price: number;
    datetime: string;
    fees: number;
    notes?: string | null;
}

// For editing the metadata of a parent Trade record
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
}
// Payload for UPDATING the metadata of a parent Trade record
export interface UpdateTradeDetailsPayload {
    trade_id: number;
    strategy_id?: number | null;
    market_conditions?: string | null;
    setup_description?: string | null;
    reasoning?: string | null;
    lessons_learned?: string | null;
    r_multiple_initial_risk?: number | null;
}

// Analytics data structure (from Stage 4)
export interface BasicAnalyticsData {
    totalGrossPnl: number;
    totalNetPnl: number;
    totalFees: number;
    winRate: number | null;
    numberOfWinningTrades: number;
    numberOfLosingTrades: number;
    numberOfBreakEvenTrades: number;
    totalClosedTrades: number;
    avgWinPnl: number | null;
    avgLossPnl: number | null;
    longestWinStreak: number;
    longestLossStreak: number;
}

// Defines all functions exposed by Electron's preload script
export interface ElectronAPIDefinition {
    getAppVersion: () => Promise<string>;
    testDbConnection: () => Promise<string | { error: string }>;
    
    logTransaction: (data: LogTransactionPayload) => Promise<{ success: boolean; message: string; tradeId?: number; transactionId?: number }>;
    getTrades: () => Promise<TradeListView[]>; 
    getTradeWithTransactions: (tradeId: number) => Promise<Trade | null>; 
    updateTradeDetails: (data: UpdateTradeDetailsPayload) => Promise<{ success: boolean; message: string }>;
    updateSingleTransaction: (data: UpdateTransactionPayload) => Promise<{ success: boolean; message: string }>;
    deleteSingleTransaction: (transactionId: number) => Promise<{ success: boolean; message: string }>;
    deleteFullTrade: (tradeId: number) => Promise<{ success: boolean; message: string }>;
    getBasicAnalytics: () => Promise<BasicAnalyticsData | { error: string }>;
}