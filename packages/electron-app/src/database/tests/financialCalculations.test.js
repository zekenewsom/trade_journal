const { calculateLeveragedPnl } = require('../financialCalculations');

describe('financialCalculations', () => {
  describe('calculateLeveragedPnl', () => {
    it('should return 0 for a trade with no transactions', () => {
      const trade = { trade_direction: 'Long', is_leveraged: true };
      const transactions = [];
      const result = calculateLeveragedPnl(trade, transactions);
      expect(result.realizedGrossPnl).toBe(0);
      expect(result.realizedNetPnl).toBe(0);
      expect(result.openQuantity).toBe(0);
    });

    it('should correctly calculate P&L for a simple long trade', () => {
      const trade = { trade_direction: 'Long', is_leveraged: true };
      const transactions = [
        { action: 'Buy', quantity: 1, price: 100, fees: 1 },
        { action: 'Sell', quantity: 1, price: 110, fees: 1 },
      ];
      const result = calculateLeveragedPnl(trade, transactions);
      expect(result.realizedGrossPnl).toBe(10);
      expect(result.realizedNetPnl).toBe(8);
      expect(result.openQuantity).toBe(0);
    });

    it('should correctly calculate P&L for a simple short trade', () => {
      const trade = { trade_direction: 'Short', is_leveraged: true };
      const transactions = [
        { action: 'Sell', quantity: 1, price: 100, fees: 1 },
        { action: 'Buy', quantity: 1, price: 90, fees: 1 },
      ];
      const result = calculateLeveragedPnl(trade, transactions);
      expect(result.realizedGrossPnl).toBe(10);
      expect(result.realizedNetPnl).toBe(8);
      expect(result.openQuantity).toBe(0);
    });

    it('should correctly calculate unrealized P&L for an open long trade', () => {
      const trade = { trade_direction: 'Long', is_leveraged: true, current_market_price: 120 };
      const transactions = [
        { action: 'Buy', quantity: 1, price: 100, fees: 1 },
      ];
      const result = calculateLeveragedPnl(trade, transactions);
      expect(result.realizedGrossPnl).toBe(0);
      expect(result.openQuantity).toBe(1);
      expect(result.averageOpenPrice).toBe(100);
      expect(result.unrealizedGrossPnlOnOpenPortion).toBe(20);
    });

    it('should correctly calculate unrealized P&L for an open short trade', () => {
      const trade = { trade_direction: 'Short', is_leveraged: true, current_market_price: 80 };
      const transactions = [
        { action: 'Sell', quantity: 1, price: 100, fees: 1 },
      ];
      const result = calculateLeveragedPnl(trade, transactions);
      expect(result.realizedGrossPnl).toBe(0);
      expect(result.openQuantity).toBe(1);
      expect(result.averageOpenPrice).toBe(100);
      expect(result.unrealizedGrossPnlOnOpenPortion).toBe(20);
    });

    it('should use closed_pnl when available', () => {
      const trade = { trade_direction: 'Long', is_leveraged: true };
      const transactions = [
        { action: 'Buy', quantity: 1, price: 100, fees: 1 },
        { action: 'Sell', quantity: 1, price: 110, fees: 1, closed_pnl: 10 },
      ];
      const result = calculateLeveragedPnl(trade, transactions);
      expect(result.realizedGrossPnl).toBe(10);
      expect(result.realizedNetPnl).toBe(8);
      expect(result.openQuantity).toBe(0);
    });
  });
});