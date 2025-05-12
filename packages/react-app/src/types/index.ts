// File: zekenewsom-trade_journal/packages/react-app/src/types/index.ts
// New file for shared TypeScript types

export interface TradeLeg {
    leg_id?: number; // Optional: only present for existing legs from the DB
    trade_id?: number; // Optional: set when associating with a trade
    leg_type: 'Entry' | 'Exit';
    datetime: string; // ISO 8601 format
    price: number;
    size: number;
    // Client-side temporary ID for managing new legs in the UI before saving
    temp_id?: string;
}

    
export interface Trade {
    trade_id?: number; // Optional: only present for existing trades
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
    r_multiple_actual?: number | null;
    outcome?: 'Win' | 'Loss' | 'Break Even' | null;
    created_at?: string;
    updated_at?: string;
    legs: TradeLeg[]; // Array of legs associated with the trade
}

    
// For the data structure sent from the form or used to display in table
// This can evolve. For the table, we might flatten some leg data.
export interface TradeTableDisplay extends Omit<Trade, 'legs'> {
    // Example of flattened/aggregated data for display - will be refined
    first_entry_datetime?: string;
    total_entry_size?: number;
    average_entry_price?: number;
    // ... other display-specific fields
    }
    
    // For form data, it's similar to Trade but prices/sizes might be strings initially
    export interface TradeFormData extends Omit<Trade, 'legs' | 'trade_id' | 'created_at' | 'updated_at' | 'r_multiple_actual' | 'outcome' > {
    trade_id?: number; // Keep for editing
    instrumentTicker: string;
    assetClass: 'Stock' | 'Cryptocurrency' | '';
    direction: 'Long' | 'Short' | '';
    feesCommissionsTotal: string; // string for form input
    initialStopLossPrice: string;
    initialTakeProfitPrice: string;
    marketConditions: string;
    setupDescription: string;
    reasoning: string;
    lessonsLearned: string;
    rMultipleInitialRisk: string;
    legs: Array<Omit<TradeLeg, 'price' | 'size'> & { price: string; size: string; }>; // Legs with string prices/sizes for form
    }
    
export interface SaveTradePayload extends Omit<Trade, 'legs'> {
    legs: TradeLeg[]; // Ensure legs are properly typed with numbers for DB
}

export interface UpdateTradePayload extends Trade {
    trade_id: number; // trade_id is mandatory for updates
    legs: TradeLeg[];
}