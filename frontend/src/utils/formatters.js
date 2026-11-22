/**
 * Utility functions for formatting currencies, numbers, and dates
 */

/**
 * Formats monetary amounts with standard financial digits (en-US format: 3,434.32)
 * using comma for thousands and dot for piasters, preventing any confusion in currency reading.
 * @param {number|string} amount
 * @returns {string} e.g. "3,434.32"
 */
export function formatMoney(amount) {
  const num = Number(amount) || 0;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats a numeric amount to Egyptian Pounds string
 * @param {number|string} amount
 * @param {boolean} includeDecimals
 * @returns {string}
 */
export function formatCurrency(amount, includeDecimals = false) {
  const num = Number(amount) || 0;
  if (includeDecimals) {
    return `${num.toFixed(2)} ج.م`;
  }
  return `${num.toLocaleString('ar-EG')} ج.م`;
}

/**
 * Formats an ISO date string to a human-readable Arabic localized date
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}
