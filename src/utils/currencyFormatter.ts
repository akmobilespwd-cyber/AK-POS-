import { CurrencySettings, WorkshopSettings } from '../types';

export const DEFAULT_PKR_CURRENCY: CurrencySettings = {
  name: 'Pakistani Rupee',
  code: 'PKR',
  symbol: 'Rs',
  position: 'before',
  decimalPlaces: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.',
};

export const CURRENCY_PRESETS: Record<string, CurrencySettings> = {
  PKR: DEFAULT_PKR_CURRENCY,
  USD: {
    name: 'US Dollar',
    code: 'USD',
    symbol: '$',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  AED: {
    name: 'UAE Dirham',
    code: 'AED',
    symbol: 'د.إ',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  SAR: {
    name: 'Saudi Riyal',
    code: 'SAR',
    symbol: '﷼',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  GBP: {
    name: 'British Pound',
    code: 'GBP',
    symbol: '£',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  EUR: {
    name: 'Euro',
    code: 'EUR',
    symbol: '€',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
};

/**
 * Resolves active currency configuration from settings or default PKR.
 */
export const resolveCurrencySettings = (
  settings?: WorkshopSettings | CurrencySettings | null
): CurrencySettings => {
  if (!settings) return DEFAULT_PKR_CURRENCY;
  if ('currencySettings' in settings && settings.currencySettings) {
    return settings.currencySettings;
  }
  if ('symbol' in settings && settings.symbol) {
    return settings as CurrencySettings;
  }
  return DEFAULT_PKR_CURRENCY;
};

/**
 * Universal Currency Formatter for Advance Auto Workshop.
 * Ensures 100% consistent formatting across POS, Reports, Invoices, PDFs, etc.
 *
 * Example: formatCurrency(25500) => "Rs 25,500.00"
 */
export const formatCurrency = (
  amount: number | string | undefined | null,
  settings?: WorkshopSettings | CurrencySettings | null
): string => {
  const cfg = resolveCurrencySettings(settings);
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  const safeNum = isNaN(num) ? 0 : num;
  const isNegative = safeNum < 0;
  const absNum = Math.abs(safeNum);

  // Format decimal precision
  const fixedStr = absNum.toFixed(cfg.decimalPlaces);
  const [intPart, decPart] = fixedStr.split('.');

  // Insert thousands separator
  const formattedInt = intPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    cfg.thousandsSeparator || ','
  );

  const formattedNum = cfg.decimalPlaces > 0 && decPart !== undefined
    ? `${formattedInt}${cfg.decimalSeparator || '.'}${decPart}`
    : formattedInt;

  const sign = isNegative ? '-' : '';

  if (cfg.position === 'after') {
    return `${sign}${formattedNum} ${cfg.symbol}`;
  }

  // Default 'before' position: e.g. "Rs 25,500.00" or "$1,250.00"
  return `${sign}${cfg.symbol} ${formattedNum}`;
};

/**
 * Gets symbol of currently active currency (e.g. "Rs", "$", "د.إ")
 */
export const getCurrencySymbol = (
  settings?: WorkshopSettings | CurrencySettings | null
): string => {
  return resolveCurrencySettings(settings).symbol;
};
