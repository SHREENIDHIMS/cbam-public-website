import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/** Section opener: optional eyebrow, a chapter-tier heading and an optional lead. */
export function ChapterHeading({
  id,
  eyebrow,
  title,
  lead,
  className,
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('max-w-3xl', className)}>
      {eyebrow ? <p className="t-eyebrow mb-5">{eyebrow}</p> : null}
      <h2 id={id} className="t-chapter max-w-[22ch]">
        {title}
      </h2>
      {lead ? <p className="t-lead mt-6">{lead}</p> : null}
    </div>
  );
}
