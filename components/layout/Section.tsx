import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { PageContainer } from './PageContainer';

type Tone = 'canvas' | 'alt' | 'inverse' | 'brand';
type Spacing = 'chapter' | 'compact';

const TONES: Record<Tone, string> = {
  canvas: 'bg-canvas text-ink',
  alt: 'bg-surface-alt text-ink',
  inverse: 'bg-inverse text-ink',
  brand: 'bg-brand text-ink',
};

// One vertical rhythm token for every chapter (styles/base.css --section-gap).
const SPACING: Record<Spacing, string> = {
  chapter: 'py-[var(--section-gap)]',
  compact: 'py-[calc(var(--section-gap)/2)]',
};

export function Section({
  tone = 'canvas',
  spacing = 'chapter',
  id,
  labelledBy,
  wide = false,
  className,
  children,
}: {
  tone?: Tone;
  spacing?: Spacing;
  id?: string;
  labelledBy?: string;
  /** Wider container for evidence sections (ledgers, tables). */
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      {...(id ? { id } : {})}
      {...(labelledBy ? { 'aria-labelledby': labelledBy } : {})}
      {...(tone === 'inverse' || tone === 'brand' ? { 'data-tone': tone } : {})}
      className={cn(TONES[tone], SPACING[spacing], className)}
    >
      <PageContainer className={wide ? 'max-w-wide' : undefined}>{children}</PageContainer>
    </section>
  );
}
