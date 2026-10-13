import type { ReactNode } from 'react';

export function ErrorState({
  title,
  description,
  action,
  headingLevel = 2,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  /** Use 1 when the state is the whole page and there is no other heading. */
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <div role="alert" className="rounded-sm border border-critical-fg/40 bg-critical-bg p-6">
      <Heading className="t-title text-critical-fg">{title}</Heading>
      <p className="mt-2 max-w-prose text-ink-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
