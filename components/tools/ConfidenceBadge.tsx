import { Check, Minus, Pencil, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/shared/Badge';
import type { Tone } from '@/lib/config/status';
import { CONFIDENCE_LABELS } from '@/lib/upload/column-matching';
import type { Confidence } from '@/lib/upload/types';
import { cn } from '@/lib/utils/cn';

const TONE: Record<Confidence, Tone> = {
  high: 'positive',
  medium: 'watch',
  low: 'watch',
  none: 'neutral',
  manual: 'info',
};

const BARS: Record<Confidence, number> = { high: 3, medium: 2, low: 1, none: 0, manual: 3 };

/** Match strength as bars, an icon and text, so it never depends on colour alone. */
export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const Icon =
    confidence === 'high'
      ? Check
      : confidence === 'manual'
        ? Pencil
        : confidence === 'none'
          ? Minus
          : TriangleAlert;
  return (
    <Badge tone={TONE[confidence]} icon={<Icon aria-hidden="true" className="size-3.5" />}>
      {CONFIDENCE_LABELS[confidence]}
      <span aria-hidden="true" className="ml-1 flex items-end gap-0.5">
        {[1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={cn(
              'w-1 rounded-[1px] bg-current',
              bar === 1 ? 'h-1.5' : bar === 2 ? 'h-2.5' : 'h-3.5',
              bar > BARS[confidence] && 'opacity-25',
            )}
          />
        ))}
      </span>
    </Badge>
  );
}
