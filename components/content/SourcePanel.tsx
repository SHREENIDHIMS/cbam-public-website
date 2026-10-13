import { ExternalLink } from '@/components/shared/ExternalLink';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import type { GuideSource } from '@/lib/content/guide-schema';
import { formatDate } from '@/lib/utils/format';

/** The official sources a guide was written from, with the date each was read. */
export function SourcePanel({
  sources,
  rulesBasis,
  headingId = 'sources-title',
}: {
  sources: readonly GuideSource[];
  rulesBasis: string;
  headingId?: string;
}) {
  return (
    <section aria-labelledby={headingId} className="rounded-sm border border-line bg-surface p-5">
      <h2 id={headingId} className="t-label text-ink-subtle">
        Official sources
      </h2>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        <ProvenanceBadge provenance="official" />
        <span>Rules basis {rulesBasis}</span>
      </p>
      <ul className="m-0 mt-4 flex list-none flex-col gap-4 p-0">
        {sources.map((source) => (
          <li key={source.url} className="text-sm">
            <ExternalLink href={source.url}>{source.title}</ExternalLink>
            <p className="mt-1 text-ink-subtle">Read on {formatDate(source.accessedAt)}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-line pt-4 text-sm text-ink-subtle">
        Guidance changes. Check the source before relying on a date or figure. This guide is not
        legal or tax advice.
      </p>
    </section>
  );
}
