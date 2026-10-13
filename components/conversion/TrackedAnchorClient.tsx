'use client';

import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';
import type { AnalyticsEvent } from '@/lib/analytics/events';

type CtaProps = Extract<AnalyticsEvent, { name: 'cta_click' }>['properties'];

/** An external link that reports one cta_click event. Opens in the same tab: it is the next step. */
export function TrackedAnchorClient({
  href,
  location,
  cta,
  className,
  children,
}: CtaProps & { href: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => track({ name: 'cta_click', properties: { location, cta } })}
    >
      {children}
    </a>
  );
}
