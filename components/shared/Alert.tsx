import type { ReactNode } from 'react';
import type { Tone } from '@/lib/config/status';
import { cn } from '@/lib/utils/cn';
import { TONE_CLASSES } from './tone';

interface AlertProps {
  tone?: Tone;
  title?: string;
  /** Use role "alert" for blocking errors, "status" otherwise. */
  role?: 'alert' | 'status';
  className?: string;
  children: ReactNode;
}

export function Alert({ tone = 'info', title, role = 'status', className, children }: AlertProps) {
  return (
    <div
      role={role}
      className={cn(
        'rounded-sm border border-current/30 p-4 text-[0.9375rem]',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {title ? <p className="mb-1 font-display font-[680]">{title}</p> : null}
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
