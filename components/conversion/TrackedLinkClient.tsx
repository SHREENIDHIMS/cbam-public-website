'use client';

import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';
import type { AnalyticsEvent } from '@/lib/analytics/events';

type CtaProps = Extract<AnalyticsEvent, { name: 'cta_click' }>['properties'];

/** A next/link that reports one cta_click event. Everything else is a plain internal link. */
export function TrackedLinkClient({
  href,
  location,
  cta,
  className,
  children,
}: CtaProps & { href: Route; className?: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => track({ name: 'cta_click', properties: { location, cta } })}
    >
      {children}
    </Link>
  );
}
