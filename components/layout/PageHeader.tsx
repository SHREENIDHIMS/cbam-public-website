import type { ReactNode } from 'react';
import { rules } from '@/lib/config/rules';
import { formatDateShort } from '@/lib/utils/format';
import { PageContainer } from './PageContainer';

/**
 * Interior page header, set like the top of a declaration form: the title and lead on the left,
 * a small reference box on the right naming the form and the rules snapshot it reads from.
 */
export function PageHeader({
  formLabel,
  title,
  lead,
  titleId = 'page-title',
  children,
}: {
  /** Short name of the page, shown in the reference box (not above the heading). */
  formLabel: string;
  title: ReactNode;
  lead?: string;
  titleId?: string;
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby={titleId} className="border-b border-line bg-canvas">
      <PageContainer className="grid grid-cols-1 gap-8 pt-12 pb-12 md:pt-16 md:pb-16 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="min-w-0 lg:col-span-8">
          <h1 id={titleId} className="t-chapter max-w-[18ch]">
            {title}
          </h1>
          {lead ? <p className="t-lead mt-6">{lead}</p> : null}
          {children ? <div className="mt-6">{children}</div> : null}
        </div>
        <dl className="box m-0 hidden min-w-0 grid-cols-[auto_1fr] text-sm md:grid lg:col-span-4 lg:max-w-xs lg:justify-self-end">
          <dt className="t-label border-r border-b border-line px-3 py-2 text-ink-subtle">Form</dt>
          <dd className="m-0 border-b border-line px-3 py-2 font-semibold text-ink">{formLabel}</dd>
          <dt className="t-label border-r border-line px-3 py-2 text-ink-subtle">Rules</dt>
          <dd className="t-figure m-0 px-3 py-2 text-ink-muted">
            {formatDateShort(rules.reviewedAt)}
          </dd>
        </dl>
      </PageContainer>
    </section>
  );
}
