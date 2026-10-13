import type { Tone } from '@/lib/config/status';

/** Tailwind class sets per tone. Text and background pairs are contrast-checked in tokens. */
export const TONE_CLASSES: Record<Tone, string> = {
  positive: 'bg-positive-bg text-positive-fg',
  info: 'bg-info-bg text-info-fg',
  watch: 'bg-watch-bg text-watch-fg',
  critical: 'bg-critical-bg text-critical-fg',
  neutral: 'bg-neutral-bg text-neutral-fg',
};
