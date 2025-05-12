// File: zekenewsom-trade_journal/packages/react-app/src/types/index.ts
// Modified to include types for BasicAnalytics

export interface TradeLeg {
    leg_id?: number;
    trade_id?: number;
    leg_type: 'Entry' | 'Exit';
    datetime: string;
    price: number;
    size: number;
    temp_id?: string;
    }
    
    export interface Trade {
    trade_id?: number;
    instrument_ticker: string;
    asset_class: 'Stock' | 'Cryptocurrency';
    trade_direction: 'Long' | 'Short';
    account_id?: number | null;
    strategy_id?: number | null;
    fees_commissions_total?: number;
    initial_stop_loss_price?: number | null;
    initial_take_profit_price?: number | null;
    market_conditions?: string | null;
    setup_description?: string | null;
    reasoning?: string | null;
    lessons_learned?: string | null;
    r_multiple_initial_risk?: number | null;
    // Calculated fields (might be added in memory or persisted later)
    calculated_pnl_gross?: number;
    calculated_pnl_net?: number;
    is_closed?: boolean;
    outcome?: 'Win' | 'Loss' | 'Break Even' | null;
    created_at?: string;
    updated_at?: string;
    legs: TradeLeg[];
    }
    
    export interface TradeTableDisplay extends Omit<Trade, 'legs'> {
    first_entry_datetime?: string;
    total_entry_size?: number; // Will be more relevant with complex trades
    average_entry_price?: number; // Will be more relevant with complex trades
    }
    
    export interface TradeFormData extends Omit<Trade, 'legs' | 'trade_id' | 'created_at' | 'updated_at' | 'r_multiple_actual' | 'outcome' | 'calculated_pnl_gross' | 'calculated_pnl_net' | 'is_closed' > {
    trade_id?: number;
    instrumentTicker: string;
    assetClass: 'Stock' | 'Cryptocurrency' | '';
    direction: 'Long' | 'Short' | '';
    feesCommissionsTotal: string;
    initialStopLossPrice: string;
    initialTakeProfitPrice: string;
    marketConditions: string;
    setupDescription: string;
    reasoning: string;
    lessonsLearned: string;
    rMultipleInitialRisk: string;
    legs: Array<Omit<TradeLeg, 'price' | 'size'> & { price: string; size: string; }>;
    }
    
    export interface SaveTradePayload extends Omit<Trade, 'legs' | 'trade_id' | 'created_at' | 'updated_at' | 'r_multiple_actual' | 'outcome' | 'calculated_pnl_gross' | 'calculated_pnl_net' | 'is_closed'> {
    legs: TradeLeg[];
    }
    
    export interface UpdateTradePayload extends SaveTradePayload { // Similar to Save, but must include trade_id
    trade_id: number;
    }
    
    // --- Added for Stage 4 ---
    export interface BasicAnalyticsData {
    totalGrossPnl: number;
    totalNetPnl: number;
    totalFees: number;
    winRate: number | null; // Can be null if no closed trades
    numberOfWinningTrades: number;
    numberOfLosingTrades: number;
    numberOfBreakEvenTrades: number;
    totalClosedTrades: number;
    avgWinPnl: number | null; // Can be null if no winning trades
    avgLossPnl: number | null; // Can be null if no losing trades
    longestWinStreak: number;
    longestLossStreak: number;
    currentWinStreak: number;
    currentLossStreak: number;
    // Potentially add:
    // largestWinPnl: number | null;
    // largestLossPnl: number | null;
    // averageTradeDurationMs: number | null;
    }
    // --- End Stage 4 ---