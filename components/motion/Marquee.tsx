import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Endless horizontal strip, pure CSS. The items are rendered twice; the copy is hidden from
 * assistive technology. With reduced motion the strip stops and wraps instead of sliding.
 */
export function Marquee({
  children,
  direction = 'rtl',
  seconds = 24,
  className,
}: {
  children: ReactNode;
  direction?: 'rtl' | 'ltr';
  seconds?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('marquee', className)}
      data-direction={direction}
      style={{ '--marquee-seconds': `${seconds}s` } as CSSProperties}
    >
      <div className="marquee-track">
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
