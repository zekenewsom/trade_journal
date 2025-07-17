// packages/electron-app/src/database/positionTracker.js
const { decimal, toNumber, add, subtract, multiply, divide, isEqual, isGreaterThan } = require('./financialUtils');

/**
 * Enhanced Position Lifecycle Management
 * Handles complex order types and position states for accurate trade tracking
 */

/**
 * Standardizes various order types into basic Buy/Sell actions
 * and determines if this should open a new trade or continue existing
 */
function normalizeOrderType(directionOrAction) {
  const dir = directionOrAction.toLowerCase().trim();
  
  // Map all possible order types to standard actions
  const orderTypeMapping = {
    // Long positions
    'open long': { action: 'Buy', isOpening: true, direction: 'Long' },
    'buy': { action: 'Buy', isOpening: true, direction: 'Long' },
    'close long': { action: 'Sell', isOpening: false, direction: 'Long' },
    
    // Short positions  
    'open short': { action: 'Sell', isOpening: true, direction: 'Short' },
    'close short': { action: 'Buy', isOpening: false, direction: 'Short' },
    
    // Liquidations
    'market order liquidation: close long': { action: 'Sell', isOpening: false, direction: 'Long', isLiquidation: true },
    'market order liquidation: close short': { action: 'Buy', isOpening: false, direction: 'Short', isLiquidation: true },
    'liquidation: close long': { action: 'Sell', isOpening: false, direction: 'Long', isLiquidation: true },
    'liquidation: close short': { action: 'Buy', isOpening: false, direction: 'Short', isLiquidation: true },
    'liquidation close long': { action: 'Sell', isOpening: false, direction: 'Long', isLiquidation: true },
    'liquidation close short': { action: 'Buy', isOpening: false, direction: 'Short', isLiquidation: true },
    
    // Generic liquidations
    'liquidation': { action: null, isOpening: false, isLiquidation: true }, // Need context
    'market order liquidation': { action: null, isOpening: false, isLiquidation: true } // Need context
  };
  
  // Direct mapping
  if (orderTypeMapping[dir]) {
    return orderTypeMapping[dir];
  }
  
  // Partial matching for complex order types
  if (dir.includes('open') && dir.includes('long')) {
    return { action: 'Buy', isOpening: true, direction: 'Long' };
  }
  if (dir.includes('open') && dir.includes('short')) {
    return { action: 'Sell', isOpening: true, direction: 'Short' };
  }
  if (dir.includes('close') && dir.includes('long')) {
    return { action: 'Sell', isOpening: false, direction: 'Long' };
  }
  if (dir.includes('close') && dir.includes('short')) {
    return { action: 'Buy', isOpening: false, direction: 'Short' };
  }
  if (dir.includes('liquidation')) {
    return { action: null, isOpening: false, isLiquidation: true };
  }
  
  // Fallback to basic buy/sell - need context to determine opening/closing
  if (dir.includes('buy')) {
    return { action: 'Buy' }; // Direction will be determined by context
  }
  if (dir.includes('sell')) {
    return { action: 'Sell' }; // Direction will be determined by context
  }
  
  // Default fallback - minimal assumptions
  return { action: directionOrAction };
}

/**
 * Calculates current position size for a given instrument using precise decimal arithmetic
 */
function calculateCurrentPosition(db, instrument_ticker, asset_class, exchange) {
  const query = `
    SELECT 
      t.trade_id,
      t.trade_direction,
      t.status,
      tr.action,
      tr.quantity,
      tr.datetime
    FROM trades t
    LEFT JOIN transactions tr ON t.trade_id = tr.trade_id
    WHERE t.instrument_ticker = ? 
      AND t.asset_class = ? 
      AND t.exchange = ?
      AND t.status = 'Open'
    ORDER BY t.trade_id, tr.datetime ASC
  `;
  
  const results = db.prepare(query).all(instrument_ticker, asset_class, exchange);
  
  if (results.length === 0) {
    return { netPosition: 0, openTrades: [] };
  }
  
  // Group by trade_id
  const tradeGroups = {};
  results.forEach(row => {
    if (!tradeGroups[row.trade_id]) {
      tradeGroups[row.trade_id] = {
        trade_id: row.trade_id,
        trade_direction: row.trade_direction,
        status: row.status,
        transactions: []
      };
    }
    
    if (row.action) { // Only add if transaction exists
      tradeGroups[row.trade_id].transactions.push({
        action: row.action,
        quantity: row.quantity,
        datetime: row.datetime
      });
    }
  });
  
  let netPositionDecimal = decimal(0);
  const openTrades = [];
  
  Object.values(tradeGroups).forEach(trade => {
    let tradePositionDecimal = decimal(0);
    
    trade.transactions.forEach(tx => {
      const qty = decimal(tx.quantity);
      if (trade.trade_direction === 'Long') {
        tradePositionDecimal = tx.action === 'Buy' ? tradePositionDecimal.plus(qty) : tradePositionDecimal.minus(qty);
      } else {
        tradePositionDecimal = tx.action === 'Sell' ? tradePositionDecimal.plus(qty) : tradePositionDecimal.minus(qty);
      }
    });
    
    const tradePosition = toNumber(tradePositionDecimal);
    if (tradePosition > 0) {
      const positionContribution = trade.trade_direction === 'Long' ? tradePositionDecimal : tradePositionDecimal.negated();
      netPositionDecimal = netPositionDecimal.plus(positionContribution);
      
      openTrades.push({
        trade_id: trade.trade_id,
        trade_direction: trade.trade_direction,
        position_size: tradePosition
      });
    }
  });
  
  return { netPosition: toNumber(netPositionDecimal), openTrades };
}

/**
 * Determines if a new trade should be created or if this transaction
 * should be added to an existing trade
 */
function shouldCreateNewTrade(db, transactionData, normalizedOrder) {
  const { instrument_ticker, asset_class, exchange, quantity } = transactionData;
  const { action, isOpening, direction, isLiquidation } = normalizedOrder;
  
  // Get current position
  const position = calculateCurrentPosition(db, instrument_ticker, asset_class, exchange);
  
  // If no open trades, this is definitely a new trade
  if (position.openTrades.length === 0) {
    return {
      shouldCreate: true,
      trade_direction: direction || (action === 'Buy' ? 'Long' : 'Short'),
      reason: 'No open trades exist'
    };
  }
  
  // If this is explicitly an opening order, create new trade
  if (isOpening) {
    return {
      shouldCreate: true,
      trade_direction: direction || (action === 'Buy' ? 'Long' : 'Short'),
      reason: 'Opening order type'
    };
  }
  
  // For liquidations, we need to determine direction from existing position
  if (isLiquidation && !direction) {
    // Liquidation should close existing position
    if (position.netPosition > 0) {
      // We have a net long position, liquidation should be a sell
      return {
        shouldCreate: false,
        trade_direction: 'Long',
        action: 'Sell',
        reason: 'Liquidation of long position'
      };
    } else if (position.netPosition < 0) {
      // We have a net short position, liquidation should be a buy
      return {
        shouldCreate: false,
        trade_direction: 'Short',
        action: 'Buy',
        reason: 'Liquidation of short position'
      };
    }
  }
  
  // For closing orders, add to existing trade if compatible
  if (!isOpening) {
    // Find compatible open trade - prioritize by trade size to close largest positions first
    const compatibleTrades = position.openTrades.filter(trade => {
      const isCompatible = (
        (trade.trade_direction === 'Long' && action === 'Sell') ||
        (trade.trade_direction === 'Short' && action === 'Buy')
      );
      return isCompatible;
    }).sort((a, b) => b.position_size - a.position_size); // Largest first
    
    // Find trade with sufficient size, or use the largest available
    const exactMatch = compatibleTrades.find(trade => trade.position_size >= quantity);
    const bestMatch = exactMatch || compatibleTrades[0];
    
    if (bestMatch) {
      return {
        shouldCreate: false,
        trade_id: bestMatch.trade_id,
        trade_direction: bestMatch.trade_direction,
        reason: 'Adding to existing compatible trade'
      };
    }
  }
  
  // Check if this would reverse the position (create opposite trade)
  const netPositionAfterTx = position.netPosition + (action === 'Buy' ? quantity : -quantity);
  
  if (Math.sign(netPositionAfterTx) !== Math.sign(position.netPosition) && position.netPosition !== 0) {
    // This would reverse the position, create a new trade
    return {
      shouldCreate: true,
      trade_direction: action === 'Buy' ? 'Long' : 'Short',
      reason: 'Position reversal detected'
    };
  }
  
  // Default: add to existing trade or create new based on direction
  const existingTrade = position.openTrades.find(trade => 
    trade.trade_direction === (action === 'Buy' ? 'Long' : 'Short')
  );
  
  if (existingTrade) {
    return {
      shouldCreate: false,
      trade_id: existingTrade.trade_id,
      trade_direction: existingTrade.trade_direction,
      reason: 'Adding to existing trade with same direction'
    };
  }
  
  // No existing compatible trade, create new
  return {
    shouldCreate: true,
    trade_direction: action === 'Buy' ? 'Long' : 'Short',
    reason: 'No compatible existing trade found'
  };
}

/**
 * Validates that a transaction is valid given current position using precise arithmetic
 */
function validateTransaction(db, transactionData, normalizedOrder) {
  const { instrument_ticker, asset_class, exchange, quantity } = transactionData;
  const { action, isOpening, isLiquidation } = normalizedOrder;
  
  // Get current position
  const position = calculateCurrentPosition(db, instrument_ticker, asset_class, exchange);
  
  const quantityDecimal = decimal(quantity);
  
  // For closing orders, ensure we have enough position to close
  if (!isOpening && !isLiquidation) {
    let availableToCloseDecimal = decimal(0);
    
    position.openTrades.forEach(trade => {
      if (trade.trade_direction === 'Long' && action === 'Sell') {
        availableToCloseDecimal = availableToCloseDecimal.plus(trade.position_size);
      } else if (trade.trade_direction === 'Short' && action === 'Buy') {
        availableToCloseDecimal = availableToCloseDecimal.plus(trade.position_size);
      }
    });
    
    // Use decimal comparison with small tolerance for floating point errors
    const tolerance = decimal(0.00000001);
    if (quantityDecimal.gt(availableToCloseDecimal.plus(tolerance))) {
      return {
        isValid: false,
        error: `Cannot ${action.toLowerCase()} ${quantity}. Only ${toNumber(availableToCloseDecimal)} available to close.`
      };
    }
  }
  
  // For liquidations, validate against net position
  if (isLiquidation) {
    const absNetPositionDecimal = decimal(Math.abs(position.netPosition));
    const tolerance = decimal(0.00000001);
    if (quantityDecimal.gt(absNetPositionDecimal.plus(tolerance))) {
      return {
        isValid: false,
        error: `Cannot liquidate ${quantity}. Net position is only ${toNumber(absNetPositionDecimal)}.`
      };
    }
  }
  
  return { isValid: true };
}

/**
 * CSV Import-specific transaction processing
 * Groups transactions into proper trade lifecycles based on opening/closing actions
 */
function processCSVTransactionForImport(db, transactionData) {
  const { instrument_ticker, asset_class, exchange, action: rawAction, quantity } = transactionData;
  
  // Normalize the order type to understand the intent
  const normalizedOrder = normalizeOrderType(rawAction);
  let finalAction = normalizedOrder.action || rawAction;
  
  // Get current position for context
  const position = calculateCurrentPosition(db, instrument_ticker, asset_class, exchange);
  
  // Determine trade direction from the action and context
  let tradeDirection;
  
  if (normalizedOrder.direction) {
    // If direction is explicitly specified (e.g., "Open Long", "Close Short")
    tradeDirection = normalizedOrder.direction;
  } else {
    // For simple Buy/Sell, we need to determine the intent based on context and position
    if (finalAction === 'Buy') {
      tradeDirection = 'Long';
    } else if (finalAction === 'Sell') {
      // For Sell actions, check if we have existing Long positions to close
      const hasLongPositions = position.openTrades.some(trade => trade.trade_direction === 'Long');
      if (hasLongPositions) {
        tradeDirection = 'Long'; // This Sell is closing a Long position
      } else {
        tradeDirection = 'Short'; // This Sell is opening a Short position
      }
    } else {
      // Fallback
      tradeDirection = finalAction === 'Buy' ? 'Long' : 'Short';
    }
  }
  
  // Check if this is an opening action
  const isOpeningAction = normalizedOrder.isOpening === true || 
                         rawAction.toLowerCase().includes('open');
  
  // Check if this is a closing action  
  const isClosingAction = normalizedOrder.isOpening === false ||
                         rawAction.toLowerCase().includes('close') ||
                         rawAction.toLowerCase().includes('liquidation');
  
  // If this is a closing action, try to find an existing trade to close
  if (isClosingAction) {
    const compatibleTrades = position.openTrades.filter(trade => {
      const isCompatible = (
        (trade.trade_direction === 'Long' && finalAction === 'Sell') ||
        (trade.trade_direction === 'Short' && finalAction === 'Buy')
      );
      return isCompatible;
    }).sort((a, b) => a.trade_id - b.trade_id); // FIFO - oldest first
    
    if (compatibleTrades.length > 0) {
      return {
        action: finalAction,
        shouldCreateNewTrade: false,
        trade_id: compatibleTrades[0].trade_id,
        trade_direction: compatibleTrades[0].trade_direction,
        isLiquidation: normalizedOrder.isLiquidation || false,
        processingReason: `CSV Import: ${rawAction} (Closing existing ${compatibleTrades[0].trade_direction} trade)`,
        positionInfo: position
      };
    }
  }
  
  // If this is an opening action, check if we should add to existing trade or create new
  if (isOpeningAction) {
    // For opening actions, look for existing open trades in the same direction
    const sameDirectionTrades = position.openTrades.filter(trade => 
      trade.trade_direction === tradeDirection
    ).sort((a, b) => b.trade_id - a.trade_id); // Most recent first
    
    if (sameDirectionTrades.length > 0) {
      // Add to the most recent trade in the same direction
      return {
        action: finalAction,
        shouldCreateNewTrade: false,
        trade_id: sameDirectionTrades[0].trade_id,
        trade_direction: tradeDirection,
        isLiquidation: normalizedOrder.isLiquidation || false,
        processingReason: `CSV Import: ${rawAction} (Adding to existing ${tradeDirection} trade)`,
        positionInfo: position
      };
    }
  }
  
  // Default: Create new trade
  return {
    action: finalAction,
    shouldCreateNewTrade: true,
    trade_id: null,
    trade_direction: tradeDirection,
    isLiquidation: normalizedOrder.isLiquidation || false,
    processingReason: `CSV Import: ${rawAction} (New ${tradeDirection} trade)`,
    positionInfo: position
  };
}

/**
 * Enhanced transaction processing with position lifecycle management
 * For manual transaction entry (not CSV imports)
 */
function processTransactionWithPositionTracking(db, transactionData) {
  const { instrument_ticker, asset_class, exchange, action: rawAction, quantity } = transactionData;
  
  // Normalize the order type
  const normalizedOrder = normalizeOrderType(rawAction);
  
  // Use the normalized action if available
  const finalAction = normalizedOrder.action || rawAction;
  
  // Validate the transaction
  const validation = validateTransaction(db, { ...transactionData, action: finalAction }, normalizedOrder);
  if (!validation.isValid) {
    throw new Error(`[POSITION_TRACKER] ${validation.error}`);
  }
  
  // Determine if we should create a new trade
  const tradeDecision = shouldCreateNewTrade(db, { ...transactionData, action: finalAction }, normalizedOrder);
  
  // Override action if liquidation provided direction
  let processedAction = finalAction;
  if (tradeDecision.action) {
    processedAction = tradeDecision.action;
  }
  
  return {
    action: processedAction,
    shouldCreateNewTrade: tradeDecision.shouldCreate,
    trade_id: tradeDecision.trade_id,
    trade_direction: tradeDecision.trade_direction,
    isLiquidation: normalizedOrder.isLiquidation || false,
    processingReason: tradeDecision.reason,
    positionInfo: calculateCurrentPosition(db, instrument_ticker, asset_class, exchange)
  };
}

module.exports = {
  normalizeOrderType,
  calculateCurrentPosition,
  shouldCreateNewTrade,
  validateTransaction,
  processTransactionWithPositionTracking,
  processCSVTransactionForImport
};