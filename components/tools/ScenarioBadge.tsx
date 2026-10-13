import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';

/** Marks an illustrative figure. A scenario value is never an official claim. */
export function ScenarioBadge({ className }: { className?: string }) {
  return <ProvenanceBadge provenance="scenario" {...(className ? { className } : {})} />;
}
