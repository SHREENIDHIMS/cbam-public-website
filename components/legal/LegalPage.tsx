import type { ReactNode } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/shared/Alert';
import {
  DRAFT_NOTICE_BODY,
  DRAFT_NOTICE_TITLE,
  LEGAL_DRAFT_DATE,
  isLegalApproved,
  type LegalKey,
} from '@/lib/config/legal';
import { siteConfig } from '@/lib/config/site';
import { formatDate } from '@/lib/utils/format';

export interface LegalSectionDef {
  id: string;
  title: string;
  body: ReactNode;
}

/** The visible draft notice. Shown until site.ts marks the page approved. */
export function DraftNotice({ legalKey }: { legalKey: LegalKey }) {
  if (isLegalApproved(legalKey)) return null;
  return (
    <Alert tone="watch" title={DRAFT_NOTICE_TITLE} role="status">
      {DRAFT_NOTICE_BODY}
    </Alert>
  );
}

/** Legal entity block, from site.ts placeholders. Never hard-coded here. */
export function LegalEntityBlock() {
  const { legalEntity, contact } = siteConfig;
  return (
    <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 rounded-md border border-line bg-surface-alt p-4 text-sm sm:grid-cols-[max-content_1fr]">
      <dt className="font-medium text-ink">Operator</dt>
      <dd className="text-ink-muted">
        {siteConfig.brandName}, run by {legalEntity.name}
      </dd>
      <dt className="font-medium text-ink">Company number</dt>
      <dd className="text-ink-muted">{legalEntity.companyNumber}</dd>
      <dt className="font-medium text-ink">Registered address</dt>
      <dd className="text-ink-muted">{legalEntity.registeredAddress}</dd>
      <dt className="font-medium text-ink">Contact</dt>
      <dd className="text-ink-muted">{contact.general}</dd>
      <dt className="font-medium text-ink">Privacy contact</dt>
      <dd className="text-ink-muted">{contact.privacy}</dd>
    </dl>
  );
}

/** A scrollable, labelled data table for legal pages. */
export function LegalTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: readonly string[];
  rows: readonly (readonly ReactNode[])[];
}) {
  return (
    <div
      className="mt-4 overflow-x-auto rounded-md border border-line"
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-surface-alt text-ink-subtle">
            {columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-line align-top last:border-b-0">
              {row.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <th key={cellIndex} scope="row" className="px-4 py-3 font-medium text-ink">
                    {cell}
                  </th>
                ) : (
                  <td key={cellIndex} className="px-4 py-3 text-ink-muted">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Shared frame for privacy, terms, data processing and security: header, optional draft notice,
 * a contents list and numbered sections in a readable column.
 */
export function LegalPage({
  formLabel,
  title,
  lead,
  legalKey,
  sections,
  children,
}: {
  formLabel: string;
  title: string;
  lead: string;
  /** Omit for pages that are not legal drafts (security). */
  legalKey?: LegalKey;
  sections: readonly LegalSectionDef[];
  children?: ReactNode;
}) {
  return (
    <>
      <PageHeader formLabel={formLabel} title={title} lead={lead} />
      <PageContainer className="pb-20 md:pb-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:col-span-3">
            <nav aria-label="On this page" className="lg:sticky lg:top-24">
              <p className="t-label text-ink-subtle">On this page</p>
              <ol className="m-0 mt-3 list-none space-y-2 p-0 text-sm">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-ink-muted no-underline hover:text-primary hover:underline hover:underline-offset-4"
                    >
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
          <div className="min-w-0 lg:col-span-8 lg:col-start-5">
            {legalKey ? (
              <div className="mb-10 flex flex-col gap-3">
                <DraftNotice legalKey={legalKey} />
                <p className="text-sm text-ink-subtle">
                  Draft prepared {formatDate(LEGAL_DRAFT_DATE)}.
                </p>
              </div>
            ) : null}
            <div className="flex flex-col gap-12">
              {sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className="scroll-mt-24"
                >
                  <h2 id={`${section.id}-title`} className="t-title">
                    {index + 1}. {section.title}
                  </h2>
                  <div className="mt-4 flex max-w-prose flex-col gap-4 text-ink-muted [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_ul]:m-0 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                    {section.body}
                  </div>
                </section>
              ))}
            </div>
            {children}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
