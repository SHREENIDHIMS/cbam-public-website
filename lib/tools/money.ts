/** Rounds to pennies. Epsilon avoids 1.005 style binary rounding surprises. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Rounds emissions to two decimal places. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
