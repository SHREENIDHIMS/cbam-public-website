import { rules as defaultRules } from '@/lib/config/rules';
import type { Rules } from '@/lib/config/rules-schema';
import { formatDateShort, toLondonIsoDate } from './format';

export type StartPhase = 'before' | 'in_force' | 'unknown';

export interface StartDateStatus {
  phase: StartPhase;
  phrase: 'starts' | 'in force since' | 'start date to be confirmed';
  date: string | null;
}

/**
 * The only place that compares the current date with the CBAM start date.
 * Pages that use it set `export const revalidate = 86400` so the phrase flips within a day.
 */
export function getStartDateStatus(
  now: Date = new Date(),
  source: Pick<Rules, 'startDate'> = defaultRules,
): StartDateStatus {
  const date = source.startDate.value;
  if (!date) {
    return { phase: 'unknown', phrase: 'start date to be confirmed', date: null };
  }
  const today = toLondonIsoDate(now);
  return today >= date
    ? { phase: 'in_force', phrase: 'in force since', date }
    : { phase: 'before', phrase: 'starts', date };
}

/** "UK CBAM · live 1 Jan 2027" before the start date, "UK CBAM · in force since 1 Jan 2027" after. */
export function formatStartEyebrow(
  now: Date = new Date(),
  source: Pick<Rules, 'startDate'> = defaultRules,
): string {
  const status = getStartDateStatus(now, source);
  if (!status.date) return 'UK CBAM · start date to be confirmed';
  const date = formatDateShort(status.date);
  return status.phase === 'before' ? `UK CBAM · live ${date}` : `UK CBAM · in force since ${date}`;
}
