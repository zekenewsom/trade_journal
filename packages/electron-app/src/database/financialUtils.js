// Financial utility functions using decimal.js for precise arithmetic
// This module addresses floating point precision issues in financial calculations

const Decimal = require('decimal.js');

// Configure Decimal.js for financial precision
Decimal.config({
  precision: 20,      // 20 decimal places for high precision
  rounding: Decimal.ROUND_HALF_UP,  // Standard financial rounding
  toExpNeg: -7,       // Use exponential notation for very small numbers
  toExpPos: 21,       // Use exponential notation for very large numbers
  minE: -9e15,        // Min exponent
  maxE: 9e15,         // Max exponent
  crypto: false       // Don't use crypto random
});

/**
 * Creates a Decimal instance from a number, handling null/undefined gracefully
 * @param {number|string|null|undefined} value - The value to convert
 * @param {number} defaultValue - Default value if input is null/undefined
 * @returns {Decimal} Decimal instance
 */
function decimal(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') {
    return new Decimal(defaultValue);
  }
  return new Decimal(value);
}

/**
 * Safely converts a Decimal back to a JavaScript number
 * @param {Decimal} decimalValue - The Decimal to convert
 * @returns {number} JavaScript number
 */
function toNumber(decimalValue) {
  if (!decimalValue || typeof decimalValue.toNumber !== 'function') {
    return 0;
  }
  return decimalValue.toNumber();
}

/**
 * Checks if two financial values are equal within a reasonable tolerance
 * @param {number|Decimal} a - First value
 * @param {number|Decimal} b - Second value
 * @param {number} toleranceDigits - Number of decimal places to consider (default 8)
 * @returns {boolean} True if values are equal within tolerance
 */
function isEqual(a, b, toleranceDigits = 8) {
  const decA = decimal(a);
  const decB = decimal(b);
  const tolerance = new Decimal(10).pow(-toleranceDigits);
  return decA.minus(decB).abs().lte(tolerance);
}

/**
 * Checks if value A is greater than value B within financial precision
 * @param {number|Decimal} a - First value
 * @param {number|Decimal} b - Second value
 * @param {number} toleranceDigits - Number of decimal places to consider (default 8)
 * @returns {boolean} True if a > b within tolerance
 */
function isGreaterThan(a, b, toleranceDigits = 8) {
  const decA = decimal(a);
  const decB = decimal(b);
  const tolerance = new Decimal(10).pow(-toleranceDigits);
  return decA.minus(decB).gt(tolerance);
}

/**
 * Checks if value A is less than value B within financial precision
 * @param {number|Decimal} a - First value
 * @param {number|Decimal} b - Second value
 * @param {number} toleranceDigits - Number of decimal places to consider (default 8)
 * @returns {boolean} True if a < b within tolerance
 */
function isLessThan(a, b, toleranceDigits = 8) {
  const decA = decimal(a);
  const decB = decimal(b);
  const tolerance = new Decimal(10).pow(-toleranceDigits);
  return decB.minus(decA).gt(tolerance);
}

/**
 * Checks if a financial value is effectively zero
 * @param {number|Decimal} value - Value to check
 * @param {number} toleranceDigits - Number of decimal places to consider (default 8)
 * @returns {boolean} True if value is effectively zero
 */
function isZero(value, toleranceDigits = 8) {
  return isEqual(value, 0, toleranceDigits);
}

/**
 * Safely adds financial values with precision
 * @param {...(number|Decimal)} values - Values to add
 * @returns {Decimal} Sum as Decimal
 */
function add(...values) {
  return values.reduce((sum, value) => sum.plus(decimal(value)), new Decimal(0));
}

/**
 * Safely subtracts financial values with precision
 * @param {number|Decimal} a - Minuend
 * @param {number|Decimal} b - Subtrahend
 * @returns {Decimal} Difference as Decimal
 */
function subtract(a, b) {
  return decimal(a).minus(decimal(b));
}

/**
 * Safely multiplies financial values with precision
 * @param {...(number|Decimal)} values - Values to multiply
 * @returns {Decimal} Product as Decimal
 */
function multiply(...values) {
  return values.reduce((product, value) => product.times(decimal(value)), new Decimal(1));
}

/**
 * Safely divides financial values with precision
 * @param {number|Decimal} a - Dividend
 * @param {number|Decimal} b - Divisor
 * @returns {Decimal} Quotient as Decimal
 * @throws {Error} If divisor is zero
 */
function divide(a, b) {
  const divisor = decimal(b);
  if (divisor.isZero()) {
    throw new Error('Division by zero in financial calculation');
  }
  return decimal(a).dividedBy(divisor);
}

/**
 * Rounds a financial value to specified decimal places
 * @param {number|Decimal} value - Value to round
 * @param {number} decimalPlaces - Number of decimal places (default 2)
 * @returns {Decimal} Rounded value as Decimal
 */
function round(value, decimalPlaces = 2) {
  return decimal(value).toDecimalPlaces(decimalPlaces);
}

/**
 * Validates that a value is a valid financial number
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid financial number
 */
function isValidFinancialNumber(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  
  try {
    const dec = new Decimal(value);
    return dec.isFinite() && !dec.isNaN();
  } catch (error) {
    return false;
  }
}

/**
 * Determines trade outcome based on P&L with proper precision
 * @param {number|Decimal} pnl - P&L value
 * @param {number} toleranceDigits - Precision for zero comparison (default 6)
 * @returns {string} 'Win', 'Loss', or 'Break Even'
 */
function determineTradeOutcome(pnl, toleranceDigits = 6) {
  const pnlDecimal = decimal(pnl);
  const tolerance = new Decimal(10).pow(-toleranceDigits);
  
  if (pnlDecimal.gt(tolerance)) {
    return 'Win';
  } else if (pnlDecimal.lt(tolerance.neg())) {
    return 'Loss';
  } else {
    return 'Break Even';
  }
}

module.exports = {
  decimal,
  toNumber,
  isEqual,
  isGreaterThan,
  isLessThan,
  isZero,
  add,
  subtract,
  multiply,
  divide,
  round,
  isValidFinancialNumber,
  determineTradeOutcome,
  
  // Export Decimal class for advanced usage
  Decimal
};