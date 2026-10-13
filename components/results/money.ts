import { formatDecimal2, formatGBP } from '@/lib/utils/format';

/** Liability amounts always show pence so columns line up and totals can be checked. */
export const pence = (amount: number) => formatGBP(amount, { pence: true });

/** Joins a value and a unit such as "£ per tCO2e" into "£ amount per tCO2e". */
export function formatAssumption(value: number, unit: string): string {
  return unit.startsWith('£')
    ? `${formatGBP(value, { pence: !Number.isInteger(value) })}${unit.slice(1)}`
    : `${formatDecimal2(value)} ${unit}`;
}
