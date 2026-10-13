/** Drawing maths for the semicircular threshold gauge on the threshold checker. */

export interface GaugeGeometry {
  cx: number;
  cy: number;
  radius: number;
}

export const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

/** Point on the arc at a fraction (0 = left end, 1 = right end) of the half circle. */
export function pointAt(
  fraction: number,
  radius: number,
  { cx, cy }: Pick<GaugeGeometry, 'cx' | 'cy'>,
): [number, number] {
  const angle = Math.PI * fraction;
  return [cx - radius * Math.cos(angle), cy - radius * Math.sin(angle)];
}

export function arcPath({ cx, cy, radius }: GaugeGeometry): string {
  return `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;
}

export function arcLength({ radius }: GaugeGeometry): number {
  return Math.PI * radius;
}
