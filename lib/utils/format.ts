/**
 * All money, mass, date and percentage formatting for the site (locale en-GB).
 * This is the only module allowed to use Intl number/date formatting.
 */

const LOCALE = 'en-GB';

const gbp = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

const gbpPence = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const tonnes = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });
const twoDecimals = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 0 });

const longDate = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const shortDate = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const londonParts = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Europe/London',
});

function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  // Date-only strings are treated as UTC calendar dates.
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value);
}

export function formatGBP(amount: number, options: { pence?: boolean } = {}): string {
  return (options.pence ? gbpPence : gbp).format(amount);
}

export function formatGBPRange(low: number, high: number): string {
  return `${gbp.format(low)} to ${gbp.format(high)}`;
}

export function formatTonnes(value: number): string {
  return `${tonnes.format(value)} t`;
}

/** Emissions in tonnes of CO2e, one decimal place: "100.8 tCO2e". */
export function formatEmissions(value: number): string {
  return `${tonnes.format(value)} tCO2e`;
}

/** Emissions intensity, two decimal places: "2.10 tCO2e per tonne". */
export function formatIntensity(value: number): string {
  return `${twoDecimals.format(value)} tCO2e per tonne`;
}

export function formatInteger(value: number): string {
  return integer.format(value);
}

/** Takes a fraction (0.6 becomes "60%"). */
export function formatPercent(fraction: number): string {
  return percent.format(fraction);
}

/** "1 January 2027" */
export function formatDate(value: string | Date): string {
  return longDate.format(toDate(value));
}

/** "1 Jan 2027" */
export function formatDateShort(value: string | Date): string {
  return shortDate.format(toDate(value));
}

/** The calendar date in London for an instant, as YYYY-MM-DD. */
export function toLondonIsoDate(now: Date): string {
  return londonParts.format(now);
}

/** A plain two-decimal number: "85.44". */
export function formatDecimal2(value: number): string {
  return twoDecimals.format(value);
}

/** Emissions with the exact two decimals used in line workings: "85.44 tCO2e". */
export function formatEmissionsExact(value: number): string {
  return `${twoDecimals.format(value)} tCO2e`;
}

/** Whole pounds when the amount is whole, otherwise pounds and pence: "£71,750" or "£40,614.50". */
export function formatGBPExact(amount: number): string {
  return Number.isInteger(amount) ? gbp.format(amount) : gbpPence.format(amount);
}

const tonnesPrecise = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 3 });

/** Tonnes to up to three decimals, for line workings that must be checkable: "12.5 t". */
export function formatTonnesPrecise(value: number): string {
  return `${tonnesPrecise.format(value)} t`;
}
