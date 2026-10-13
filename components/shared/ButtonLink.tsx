import type { ReactNode } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ctaAttributes } from '@/lib/analytics/attributes';
import type { AnalyticsEvent } from '@/lib/analytics/events';
import { cn } from '@/lib/utils/cn';
import { ExternalLink } from './ExternalLink';

export type ExternalHref = `https://${string}` | `http://${string}` | `mailto:${string}`;
export type ButtonLinkHref = Route | ExternalHref;

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse';
type Size = 'md' | 'lg';

// Inside a data-tone="inverse" section the role variables flip, so `primary` renders as a light
// chip with dark text; `inverse` is kept as an alias for call sites that predate the tone system.
const VARIANTS: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  inverse: 'btn-primary',
};

const SIZES: Record<Size, string> = {
  md: 'btn-md',
  lg: 'btn-lg',
};

type CtaTrack = Extract<AnalyticsEvent, { name: 'cta_click' }>['properties'];

interface ButtonLinkProps {
  href: ButtonLinkHref;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Sliding arrow after the label. Default on, except for the ghost variant. */
  arrow?: boolean;
  /** Reports one cta_click event when the link is used. */
  track?: CtaTrack;
  children: ReactNode;
}

export function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:)/.test(href);
}

/** Server-rendered CTA. Internal hrefs use next/link; external hrefs use ExternalLink rules. */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className,
  arrow = variant !== 'ghost',
  track,
  children,
}: ButtonLinkProps) {
  const attributes = track ? ctaAttributes(track) : {};
  const classes = cn('btn', VARIANTS[variant], SIZES[size], className);
  const arrowMark = arrow ? (
    <span aria-hidden="true" className="btn-arrow">
      <ArrowRight className="size-full" strokeWidth={2.25} />
      <ArrowRight className="size-full" strokeWidth={2.25} />
    </span>
  ) : null;
  if (isExternalHref(href)) {
    return (
      <ExternalLink
        href={href}
        newTab={!href.startsWith('mailto:')}
        className={cn(classes, 'no-underline')}
        {...attributes}
      >
        {children}
        {arrowMark}
      </ExternalLink>
    );
  }
  return (
    <Link href={href as Route} className={classes} {...attributes}>
      {children}
      {arrowMark}
    </Link>
  );
}
