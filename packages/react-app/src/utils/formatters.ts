// Shared formatters for currency, percentage, and numbers

export const formatCurrency = (value: number | null | undefined, showSign = false): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const sign = value > 0 && showSign ? '+' : '';
  return `${sign}${value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
};

export const formatPercentage = (value: number | null | undefined, decimals = 1): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number | null | undefined, decimals = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return value.toFixed(decimals);
}; 