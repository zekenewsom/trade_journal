const { decimal, toNumber, multiply, add, subtract, divide } = require('./financialUtils');

function calculateLeveragedPnl(trade, transactions) {
  let totalRealizedPnl = decimal(0);
  let totalFees = decimal(0);
  let totalQuantity = decimal(0);
  let weightedAvgEntryPrice = decimal(0);

  for (const tx of transactions) {
    const quantity = decimal(tx.quantity);
    const price = decimal(tx.price);
    const fees = decimal(tx.fees || 0);

    if (tx.closed_pnl) {
      totalRealizedPnl = totalRealizedPnl.plus(decimal(tx.closed_pnl));
      totalQuantity = totalQuantity.minus(quantity);
    } else {
      if (trade.trade_direction === 'Long') {
        if (tx.action === 'Buy') {
          const currentTotalValue = weightedAvgEntryPrice.times(totalQuantity);
          const newTotalValue = currentTotalValue.plus(quantity.times(price));
          totalQuantity = totalQuantity.plus(quantity);
          weightedAvgEntryPrice = totalQuantity.isZero() ? decimal(0) : newTotalValue.dividedBy(totalQuantity);
        } else if (tx.action === 'Sell') {
          const pnl = quantity.times(price.minus(weightedAvgEntryPrice));
          totalRealizedPnl = totalRealizedPnl.plus(pnl);
          totalQuantity = totalQuantity.minus(quantity);
        }
      } else if (trade.trade_direction === 'Short') {
        if (tx.action === 'Sell') {
          const currentTotalValue = weightedAvgEntryPrice.times(totalQuantity);
          const newTotalValue = currentTotalValue.plus(quantity.times(price));
          totalQuantity = totalQuantity.plus(quantity);
          weightedAvgEntryPrice = totalQuantity.isZero() ? decimal(0) : newTotalValue.dividedBy(totalQuantity);
        } else if (tx.action === 'Buy') {
          const pnl = quantity.times(weightedAvgEntryPrice.minus(price));
          totalRealizedPnl = totalRealizedPnl.plus(pnl);
          totalQuantity = totalQuantity.minus(quantity);
        }
      }
    }

    totalFees = totalFees.plus(fees);
  }

  const openQuantity = toNumber(totalQuantity);
  const averageOpenPrice = openQuantity > 0 ? toNumber(weightedAvgEntryPrice) : null;
  let unrealizedGrossPnlOnOpenPortion = null;

  if (openQuantity > 0 && averageOpenPrice !== null && trade.current_market_price !== null && trade.current_market_price !== undefined) {
    const currentMarketPrice = decimal(trade.current_market_price);
    if (trade.trade_direction === 'Long') {
      unrealizedGrossPnlOnOpenPortion = currentMarketPrice.minus(averageOpenPrice).times(openQuantity);
    } else {
      unrealizedGrossPnlOnOpenPortion = decimal(averageOpenPrice).minus(currentMarketPrice).times(openQuantity);
    }
  }

  const realizedGrossPnl = toNumber(totalRealizedPnl);
  const realizedNetPnl = toNumber(totalRealizedPnl.minus(totalFees));
  const isFullyClosed = trade.status === 'Closed' && openQuantity === 0;

  return {
    realizedGrossPnl,
    realizedNetPnl,
    feesAttributableToClosedPortion: toNumber(totalFees),
    isFullyClosed,
    closedQuantity: 0, // This needs to be calculated properly
    openQuantity,
    averageOpenPrice,
    unrealizedGrossPnlOnOpenPortion: unrealizedGrossPnlOnOpenPortion ? toNumber(unrealizedGrossPnlOnOpenPortion) : null,
    rMultipleActual: null, // This needs to be calculated properly
    durationMs: null, // This needs to be calculated properly
    outcome: null, // This needs to be calculated properly
  };
}

module.exports = {
  calculateLeveragedPnl,
};