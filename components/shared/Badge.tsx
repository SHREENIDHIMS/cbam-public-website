import type { ReactNode } from 'react';
import type { Tone } from '@/lib/config/status';
import { cn } from '@/lib/utils/cn';
import { TONE_CLASSES } from './tone';

type BadgeVariant = 'tag' | 'stamp';

interface BadgeProps {
  tone?: Tone;
  icon?: ReactNode;
  /** `tag` for result statuses, `stamp` for value provenance (DECISIONS 37). */
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

export function Badge({
  tone = 'neutral',
  icon,
  variant = 'tag',
  className,
  children,
}: BadgeProps) {
  return (
    <span className={cn(variant, 'whitespace-nowrap', TONE_CLASSES[tone], className)}>
      {icon}
      {children}
    </span>
  );
}
