import { ArrowRightLeft, CircleX, ScanSearch, TriangleAlert, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/shared/Badge';
import { DECISION_COPY, type DecisionKind } from '@/lib/content/worked-example';

const ICONS: Record<DecisionKind, LucideIcon> = {
  detected: ScanSearch,
  normalised: ArrowRightLeft,
  needs_review: TriangleAlert,
  rejected: CircleX,
};

/** One of the four worked-example outcomes. The icon and the word carry the meaning, not colour. */
export function DecisionBadge({ kind, label }: { kind: DecisionKind; label?: string }) {
  const Icon = ICONS[kind];
  return (
    <Badge
      tone={DECISION_COPY[kind].tone}
      icon={<Icon aria-hidden="true" className="size-4 shrink-0" />}
    >
      {label ?? DECISION_COPY[kind].label}
    </Badge>
  );
}
