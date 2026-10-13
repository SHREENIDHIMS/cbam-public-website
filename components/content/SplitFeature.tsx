import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/** Asymmetric two-column layout: narrative on one side, a visual on the other. */
export function SplitFeature({
  copy,
  visual,
  reverse = false,
  even = false,
  className,
}: {
  copy: ReactNode;
  visual: ReactNode;
  reverse?: boolean;
  /** Give the copy and the visual six columns each, for longer headings. */
  even?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16', className)}>
      <div
        className={cn(
          'min-w-0',
          even ? 'lg:col-span-6' : 'lg:col-span-5',
          reverse && 'lg:order-2 lg:col-start-8',
        )}
      >
        {copy}
      </div>
      <div
        className={cn(
          'min-w-0',
          even ? 'lg:col-span-6' : 'lg:col-span-7',
          reverse && 'lg:order-1 lg:col-start-1',
        )}
      >
        {visual}
      </div>
    </div>
  );
}
