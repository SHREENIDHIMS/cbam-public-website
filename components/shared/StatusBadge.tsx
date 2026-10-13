import { getStatus, type ResultStatus } from '@/lib/config/status';
import { Badge } from './Badge';
import { STATUS_ICONS } from './icons';

/** Renders icon, label text and colour, never colour alone. */
export function StatusBadge({ status, className }: { status: ResultStatus; className?: string }) {
  const definition = getStatus(status);
  const Icon = STATUS_ICONS[definition.icon];
  return (
    <Badge
      tone={definition.tone}
      className={className}
      icon={<Icon aria-hidden="true" className="size-4 shrink-0" />}
    >
      {definition.label}
    </Badge>
  );
}
