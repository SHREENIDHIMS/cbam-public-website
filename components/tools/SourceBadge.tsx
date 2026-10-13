import type { Provenance } from '@/lib/config/provenance';
import { formatDateShort } from '@/lib/utils/format';
import { ExternalLink } from '@/components/shared/ExternalLink';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';

interface SourceBadgeProps {
  provenance: Provenance;
  sourceTitle: string;
  sourceUrl: string;
  sourceDate?: string | null;
}

/** Provenance badge with the source title, date and an external link. */
export function SourceBadge({ provenance, sourceTitle, sourceUrl, sourceDate }: SourceBadgeProps) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-subtle">
      <ProvenanceBadge provenance={provenance} />
      <ExternalLink href={sourceUrl}>{sourceTitle}</ExternalLink>
      {sourceDate ? <span>{formatDateShort(sourceDate)}</span> : null}
    </span>
  );
}
