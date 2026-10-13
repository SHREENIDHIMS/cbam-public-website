import Link from 'next/link';
import { siteConfig } from '@/lib/config/site';
import { cn } from '@/lib/utils/cn';

/**
 * Wordmark: a double-ruled declaration box with two ledger lines and one filled cell, followed by
 * the brand name from site config. Drawn in currentColor so it follows the section tone.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-2.5 font-display text-[1.25rem] leading-none font-medium tracking-[-0.03em] text-ink no-underline',
        className,
      )}
    >
      <BrandGlyph className="size-8 shrink-0" />
      <span className="whitespace-nowrap">{siteConfig.brandName}</span>
    </Link>
  );
}

export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" className={className}>
      <rect width="32" height="32" rx="10" fill="var(--cc-brand)" />
      <path
        d="M9 11.5h14M9 16h14M9 20.5h8"
        stroke="#060517"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
