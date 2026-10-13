import { rules } from '@/lib/config/rules';
import { formatDate } from '@/lib/utils/format';

/** The shared "indicative, not legal advice" sentence naming the rules snapshot, as a ruled note. */
export function ResultNotice({ rulesVersion = rules.rulesVersion }: { rulesVersion?: string }) {
  return (
    <div role="status" className="border-t-2 border-ink pt-4 text-[0.9375rem] text-ink-muted">
      <p className="t-label text-ink">Indicative result</p>
      <p className="mt-2 max-w-[70ch]">
        This result is indicative and is not legal or tax advice. It uses public rules snapshot{' '}
        <span className="t-figure font-semibold whitespace-nowrap text-ink">{rulesVersion}</span>,
        reviewed on {formatDate(rules.reviewedAt)}.
      </p>
    </div>
  );
}
