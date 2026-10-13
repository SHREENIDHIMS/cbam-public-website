import { getProvenance, type Provenance } from '@/lib/config/provenance';
import { Badge } from './Badge';
import { PROVENANCE_ICONS } from './icons';

export function ProvenanceBadge({
  provenance,
  className,
}: {
  provenance: Provenance;
  className?: string;
}) {
  const definition = getProvenance(provenance);
  const Icon = PROVENANCE_ICONS[definition.icon];
  return (
    <Badge
      tone={definition.tone}
      variant="stamp"
      className={className}
      icon={<Icon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2.25} />}
    >
      {definition.label}
    </Badge>
  );
}
