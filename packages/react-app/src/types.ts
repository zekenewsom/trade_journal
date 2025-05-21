export * from './types/index';
import type { Trade } from './types/index';

export interface TradeListView extends Omit<Trade, 'transactions' | 'average_open_price'> {
  current_market_price?: number | null;
  unrealized_pnl?: number | null;
  current_open_quantity?: number | null;
  latest_trade?: string | null;
}
