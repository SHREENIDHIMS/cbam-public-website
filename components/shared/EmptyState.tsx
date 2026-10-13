import type { ReactNode } from 'react';

/** Default copy follows the no-data message in MASTER_PROMPT 34. */
export function EmptyState({
  title = 'No result yet',
  description = 'Upload a customs file or run the quick estimate.',
  action,
  headingLevel = 2,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  /** Use 1 when the state is the whole page and there is no other heading. */
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <div className="rounded-sm border border-dashed border-line-strong bg-surface p-8 text-center">
      <Heading className="t-title">{title}</Heading>
      <p className="mx-auto mt-2 max-w-prose text-ink-muted">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
