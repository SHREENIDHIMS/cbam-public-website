/** Shared geometry and paint for the goods-journey illustration (viewBox 1440 × 360). */

export const VIEW_W = 1440;
export const VIEW_H = 360;

/** Top of the running rail; wheels sit on it. */
export const RAIL_Y = 300;
/** Ship waterline. */
export const WATER_Y = 300;

export const WAGON_W = 104;
export const WAGON_STEP = 112;
export const FIRST_WAGON_X = 166;

export const ink = 'var(--cc-ink)';
export const faint = 'var(--cc-line-strong)';
export const paper = 'var(--cc-surface)';
export const primary = 'var(--cc-primary)';
export const primaryDeep = 'var(--cc-primary-hover)';
export const tint = 'var(--cc-primary-tint)';
export const alt = 'var(--cc-surface-alt)';
export const line = 'var(--cc-line)';

/** Pattern and mask references defined in JourneyDefs. */
export const HATCH = 'url(#gj-hatch)';
export const HATCH_PAPER = 'url(#gj-hatch-paper)';
export const HATCH_LIGHT = 'url(#gj-hatch-light)';
export const CORRUGATE = 'url(#gj-corrugate)';
export const STIPPLE = 'url(#gj-stipple)';

/** Evenly spaced numbers from start (inclusive) by step, count items. */
export function steps(start: number, step: number, count: number): number[] {
  return Array.from({ length: count }, (_, index) => start + index * step);
}
