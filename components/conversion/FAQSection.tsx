import { Plus } from 'lucide-react';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { ExternalLink } from '@/components/shared/ExternalLink';
import type { FaqEntry } from '@/lib/config/faq';

/**
 * FAQ as native disclosure elements: keyboard operable (Tab, Enter, Space) and server rendered.
 * Figures in the answers are interpolated from the rules config by getFaqEntries.
 */
export function FAQSection({ entries }: { entries: readonly FaqEntry[] }) {
  return (
    <div className="border-t border-line">
      {entries.map((entry) => (
        <details key={entry.question} className="faq-item group border-b border-line">
          <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-6 py-5 font-display text-lg font-medium tracking-[-0.02em] text-ink group-open:text-primary hover:text-primary md:text-xl">
            <span>{entry.question}</span>
            <Plus
              aria-hidden="true"
              className="faq-icon size-5 shrink-0 text-primary"
              strokeWidth={2}
            />
          </summary>
          <div className="pr-10 pb-7">
            <p className="max-w-2xl text-ink-muted">{entry.answer}</p>
            {entry.source ? (
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-subtle">
                <ProvenanceBadge provenance={entry.source.status} />
                <span>Source:</span>
                <ExternalLink href={entry.source.url}>{entry.source.title}</ExternalLink>
              </p>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}
