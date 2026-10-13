'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ProgressBar } from './ProgressBar';

interface WizardShellProps {
  step: number;
  total: number;
  title: string;
  /** Short reassurance under the title, for example why the question is asked. */
  description?: string;
  eyebrow: string;
  children: ReactNode;
}

/**
 * Frame for one wizard step. The step heading takes focus on every step change so keyboard and
 * screen reader users land on the new question; the first render leaves focus alone.
 */
export function WizardShell({
  step,
  total,
  title,
  description,
  eyebrow,
  children,
}: WizardShellProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  return (
    <div className="box">
      <div className="border-b-2 border-ink px-5 pt-4 pb-4 md:px-8">
        <div className="flex items-baseline justify-between gap-4">
          <p className="t-label text-ink-subtle">{eyebrow}</p>
          <p className="t-figure text-[0.8125rem] font-semibold text-ink" aria-hidden="true">
            Step {step} / {total}
          </p>
        </div>
        <div className="mt-3">
          <ProgressBar current={step} total={total} label={`${eyebrow} progress`} />
        </div>
      </div>
      <div className="px-5 py-6 md:px-8 md:py-8">
        <h2 ref={headingRef} tabIndex={-1} className="flex items-start gap-4 outline-none">
          <span aria-hidden="true" className="box-no mt-1 text-primary">
            {step}
          </span>
          <span className="t-title">{title}</span>
        </h2>
        {description ? (
          <p className="mt-3 max-w-prose pl-10 text-ink-muted">{description}</p>
        ) : null}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
