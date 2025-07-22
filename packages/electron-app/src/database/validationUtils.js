// Comprehensive input validation utilities
// This module provides robust validation for all user inputs to prevent data corruption and security issues

const { isValidFinancialNumber } = require('./financialUtils');

// Shared constant for liquidation action strings
const LIQUIDATION_ACTIONS = [
  'Close Long',
  'Close Short',
  'Market Order Liquidation: Close Long',
  'Market Order Liquidation: Close Short',
  'Liquidation: Close Long',
  'Liquidation: Close Short'
];

/**
 * ValidationError class for consistent error handling
 */
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Validates a string field with comprehensive checks
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether field is required (default: true)
 * @param {number} options.minLength - Minimum length (default: 1)
 * @param {number} options.maxLength - Maximum length (default: 255)
 * @param {RegExp} options.pattern - Pattern to match
 * @param {Array} options.allowedValues - Array of allowed values
 * @returns {string} Trimmed and validated string
 * @throws {ValidationError} If validation fails
 */
function validateString(value, fieldName, options = {}) {
  const {
    required = true,
    minLength = 1,
    maxLength = 255,
    pattern = null,
    allowedValues = null
  } = options;

  // Check if value exists
  if (value === null || value === undefined || value === '') {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    return '';
  }

  // Check type
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }

  // Trim whitespace
  const trimmedValue = value.trim();

  // Check if empty after trimming
  if (required && trimmedValue.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
  }

  // Check length constraints
  if (trimmedValue.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters long`, fieldName);
  }

  if (trimmedValue.length > maxLength) {
    throw new ValidationError(`${fieldName} must be no more than ${maxLength} characters long`, fieldName);
  }

  // Check pattern if provided
  if (pattern && !pattern.test(trimmedValue)) {
    throw new ValidationError(`${fieldName} format is invalid`, fieldName);
  }

  // Check allowed values if provided
  if (allowedValues && !allowedValues.includes(trimmedValue)) {
    throw new ValidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}`, fieldName);
  }

  return trimmedValue;
}

/**
 * Validates an integer field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether field is required (default: true)
 * @param {number} options.min - Minimum value (default: null)
 * @param {number} options.max - Maximum value (default: null)
 * @param {boolean} options.positive - Must be positive (default: false)
 * @returns {number} Validated integer
 * @throws {ValidationError} If validation fails
 */
function validateInteger(value, fieldName, options = {}) {
  const {
    required = true,
    min = null,
    max = null,
    positive = false
  } = options;

  // Check if value exists
  if (value === null || value === undefined || value === '') {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    return null;
  }

  // Convert to number and check if it's a valid integer
  const intValue = Number(value);
  if (!Number.isInteger(intValue) || isNaN(intValue)) {
    throw new ValidationError(`${fieldName} must be an integer`, fieldName);
  }

  // Check positive constraint
  if (positive && intValue <= 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`, fieldName);
  }

  // Check min/max constraints
  if (min !== null && intValue < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName);
  }

  if (max !== null && intValue > max) {
    throw new ValidationError(`${fieldName} must be no more than ${max}`, fieldName);
  }

  return intValue;
}

/**
 * Validates a financial number (price, quantity, fees, etc.)
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether field is required (default: true)
 * @param {number} options.min - Minimum value (default: 0)
 * @param {number} options.max - Maximum value (default: null)
 * @param {boolean} options.allowZero - Allow zero values (default: false)
 * @returns {number} Validated financial number
 * @throws {ValidationError} If validation fails
 */
function validateFinancialNumber(value, fieldName, options = {}) {
  const {
    required = true,
    min = 0,
    max = null,
    allowZero = false
  } = options;

  // Check if value exists
  if (value === null || value === undefined || value === '') {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    return null;
  }

  // Use our financial validation utility
  if (!isValidFinancialNumber(value)) {
    throw new ValidationError(`${fieldName} must be a valid financial number`, fieldName);
  }

  const numValue = Number(value);

  // Check zero constraint
  if (!allowZero && numValue === 0) {
    throw new ValidationError(`${fieldName} must be greater than zero`, fieldName);
  }

  // Check min/max constraints
  if (min !== null && numValue < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName);
  }

  if (max !== null && numValue > max) {
    throw new ValidationError(`${fieldName} must be no more than ${max}`, fieldName);
  }

  return numValue;
}

/**
 * Validates a datetime string or Date object
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether field is required (default: true)
 * @param {Date} options.minDate - Minimum allowed date
 * @param {Date} options.maxDate - Maximum allowed date
 * @returns {string} ISO string representation of the date
 * @throws {ValidationError} If validation fails
 */
function validateDateTime(value, fieldName, options = {}) {
  const {
    required = true,
    minDate = null,
    maxDate = null
  } = options;

  // Check if value exists
  if (value === null || value === undefined || value === '') {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    return null;
  }

  // Try to parse the date
  let dateValue;
  if (value instanceof Date) {
    dateValue = value;
  } else if (typeof value === 'string') {
    dateValue = new Date(value);
  } else {
    throw new ValidationError(`${fieldName} must be a valid date`, fieldName);
  }

  // Check if the date is valid
  if (isNaN(dateValue.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date`, fieldName);
  }

  // Check date range constraints
  if (minDate && dateValue < minDate) {
    throw new ValidationError(`${fieldName} must be after ${minDate.toISOString()}`, fieldName);
  }

  if (maxDate && dateValue > maxDate) {
    throw new ValidationError(`${fieldName} must be before ${maxDate.toISOString()}`, fieldName);
  }

  return dateValue.toISOString();
}

/**
 * Validates an array field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether field is required (default: true)
 * @param {number} options.minLength - Minimum array length
 * @param {number} options.maxLength - Maximum array length
 * @param {Function} options.itemValidator - Function to validate each item
 * @returns {Array} Validated array
 * @throws {ValidationError} If validation fails
 */
function validateArray(value, fieldName, options = {}) {
  const {
    required = true,
    minLength = 0,
    maxLength = null,
    itemValidator = null
  } = options;

  // Check if value exists
  if (value === null || value === undefined) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    return [];
  }

  // Check if it's an array
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`, fieldName);
  }

  // Check length constraints
  if (value.length < minLength) {
    throw new ValidationError(`${fieldName} must contain at least ${minLength} items`, fieldName);
  }

  if (maxLength !== null && value.length > maxLength) {
    throw new ValidationError(`${fieldName} must contain no more than ${maxLength} items`, fieldName);
  }

  // Validate each item if validator provided
  if (itemValidator) {
    const validatedItems = [];
    for (let i = 0; i < value.length; i++) {
      try {
        validatedItems.push(itemValidator(value[i], `${fieldName}[${i}]`));
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(`${fieldName}[${i}]: ${error.message}`, fieldName);
        }
        throw error;
      }
    }
    return validatedItems;
  }

  return value;
}

/**
 * Validates account data for creation/updates
 * @param {Object} data - Account data to validate
 * @returns {Object} Validated account data
 * @throws {ValidationError} If validation fails
 */
function validateAccountData(data) {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Account data must be an object');
  }

  return {
    name: validateString(data.name, 'Account name', { maxLength: 100 }),
    type: validateString(data.type, 'Account type', { 
      allowedValues: ['cash', 'margin'],
      required: false 
    }) || 'cash'
  };
}

/**
 * Validates transaction data for logging
 * @param {Object} data - Transaction data to validate
 * @returns {Object} Validated transaction data
 * @throws {ValidationError} If validation fails
 */
function validateTransactionData(data) {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Transaction data must be an object');
  }

  const validated = {
    instrument_ticker: validateString(data.instrument_ticker, 'Instrument ticker', { maxLength: 20 }),
    asset_class: validateString(data.asset_class, 'Asset class', { 
      allowedValues: ['Stock', 'Cryptocurrency'] 
    }),
    exchange: validateString(data.exchange, 'Exchange', { maxLength: 50 }),
    action: validateString(data.action, 'Action', { 
      allowedValues: [
        'Buy', 'Sell', 
        'Open Long', 'Open Short', 
        'Close Long', 'Close Short',
        ...LIQUIDATION_ACTIONS
      ] 
    }),
    datetime: validateDateTime(data.datetime, 'Transaction datetime'),
    quantity: validateFinancialNumber(data.quantity, 'Quantity'),
    price: validateFinancialNumber(data.price, 'Price'),
    fees_for_transaction: validateFinancialNumber(data.fees_for_transaction, 'Fees', { allowZero: true }),
    account_id: validateInteger(data.account_id, 'Account ID', { positive: true })
  };

  // Optional fields
  if (data.notes_for_transaction !== undefined) {
    validated.notes_for_transaction = validateString(data.notes_for_transaction, 'Notes', { 
      required: false, 
      maxLength: 1000 
    });
  }

  if (data.strategy_id !== undefined) {
    validated.strategy_id = validateInteger(data.strategy_id, 'Strategy ID', { 
      required: false, 
      positive: true 
    });
  }

  if (data.r_multiple_initial_risk !== undefined) {
    validated.r_multiple_initial_risk = validateFinancialNumber(data.r_multiple_initial_risk, 'R-Multiple', { 
      required: false,
      min: -1000,
      max: 1000,
      allowZero: true
    });
  }

  if (data.emotion_ids !== undefined) {
    validated.emotion_ids = validateArray(data.emotion_ids, 'Emotion IDs', {
      required: false,
      itemValidator: (item) => validateInteger(item, 'Emotion ID', { positive: true })
    });
  }

  return validated;
}

/**
 * Validates trade metadata for updates
 * @param {Object} data - Trade metadata to validate
 * @returns {Object} Validated trade data
 * @throws {ValidationError} If validation fails
 */
function validateTradeData(data) {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Trade data must be an object');
  }

  const validated = {};

  // Required field: trade_id
  validated.trade_id = validateInteger(data.trade_id, 'Trade ID', { positive: true });

  // Optional fields with validation
  if (data.initial_stop_loss_price !== undefined) {
    validated.initial_stop_loss_price = validateFinancialNumber(data.initial_stop_loss_price, 'Stop loss price', { 
      required: false,
      allowZero: true 
    });
  }

  if (data.initial_take_profit_price !== undefined) {
    validated.initial_take_profit_price = validateFinancialNumber(data.initial_take_profit_price, 'Take profit price', { 
      required: false,
      allowZero: true 
    });
  }

  if (data.conviction_score !== undefined) {
    validated.conviction_score = validateInteger(data.conviction_score, 'Conviction score', { 
      required: false,
      min: 1,
      max: 10 
    });
  }

  if (data.thesis_validation !== undefined) {
    validated.thesis_validation = validateString(data.thesis_validation, 'Thesis validation', { 
      required: false,
      allowedValues: ['Correct', 'Partially Correct', 'Incorrect'] 
    });
  }

  if (data.adherence_to_plan !== undefined) {
    validated.adherence_to_plan = validateString(data.adherence_to_plan, 'Adherence to plan', { 
      required: false,
      allowedValues: ['High', 'Medium', 'Low'] 
    });
  }

  if (data.unforeseen_events !== undefined) {
    validated.unforeseen_events = validateString(data.unforeseen_events, 'Unforeseen events', { 
      required: false,
      maxLength: 1000 
    });
  }

  if (data.overall_trade_rating !== undefined) {
    validated.overall_trade_rating = validateInteger(data.overall_trade_rating, 'Overall trade rating', { 
      required: false,
      min: 1,
      max: 10 
    });
  }

  return validated;
}

module.exports = {
  ValidationError,
  validateString,
  validateInteger,
  validateFinancialNumber,
  validateDateTime,
  validateArray,
  validateAccountData,
  validateTransactionData,
  validateTradeData
};