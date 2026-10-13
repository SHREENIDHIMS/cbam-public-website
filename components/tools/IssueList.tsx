'use client';

import { useId, useMemo, useState } from 'react';
import { Badge } from '@/components/shared/Badge';
import type { Tone } from '@/lib/config/status';
import { toolsConfig } from '@/lib/config/tools';
import { getUploadField } from '@/lib/config/upload-fields';
import type { RowIssue } from '@/lib/upload/validate-rows';
import { formatInteger } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

type Filter = 'all' | 'review' | 'rejected' | 'normalised';

const FILTERS: ReadonlyArray<{ key: Filter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'review', label: 'Needs review' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'normalised', label: 'Normalised' },
];

function outcomeOf(issue: RowIssue): { label: string; tone: Tone; filter: Filter | null } {
  if (issue.code === 'duplicate_row')
    return { label: 'Duplicate', tone: 'watch', filter: 'review' };
  switch (issue.severity) {
    case 'error':
      return { label: 'Rejected', tone: 'critical', filter: 'rejected' };
    case 'review':
      return { label: 'Needs review', tone: 'watch', filter: 'review' };
    case 'fixed':
      return { label: 'Normalised', tone: 'positive', filter: 'normalised' };
    case 'note':
      return { label: 'Note', tone: 'neutral', filter: null };
  }
}

const MAX_RAW_CHARS = 40;

/** Every row and cell issue, with the value as it appears in the file. On screen only. */
export function IssueList({ issues }: { issues: readonly RowIssue[] }) {
  const groupId = useId();
  const [filter, setFilter] = useState<Filter>('all');
  const [showAll, setShowAll] = useState(false);
  const pageSize = toolsConfig.upload.issuePageSize;

  const visible = useMemo(
    () => issues.filter((issue) => filter === 'all' || outcomeOf(issue).filter === filter),
    [issues, filter],
  );
  const shown = showAll ? visible : visible.slice(0, pageSize);

  if (issues.length === 0) {
    return <p className="text-ink-muted">No row or cell issues were found.</p>;
  }

  return (
    <section aria-labelledby={`${groupId}-title`} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={`${groupId}-title`} className="t-title">
          Row and cell issues
        </h3>
        <fieldset className="m-0 border-0 p-0">
          <legend className="sr-only">Filter issues</legend>
          <div className="inline-flex overflow-hidden rounded-sm border border-line-strong">
            {FILTERS.map((option) => (
              <label
                key={option.key}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center px-3.5 text-sm font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-focus',
                  filter === option.key
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface text-ink hover:bg-surface-alt',
                )}
              >
                <input
                  type="radio"
                  name={`${groupId}-filter`}
                  value={option.key}
                  checked={filter === option.key}
                  onChange={() => {
                    setFilter(option.key);
                    setShowAll(false);
                  }}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {visible.length === 0 ? (
        <p className="text-ink-muted">Nothing to show for this filter.</p>
      ) : (
        <table className="stack-table w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            {formatInteger(visible.length)} issues, with the row and column of each
          </caption>
          <thead>
            <tr className="t-label border-b border-line-strong text-ink-subtle">
              <th scope="col" className="py-2 pr-3 font-medium">
                Row
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Column
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Value in your file
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                What we found
              </th>
              <th scope="col" className="py-2 font-medium">
                Outcome
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((issue, index) => {
              const outcome = outcomeOf(issue);
              const raw =
                issue.raw.length > MAX_RAW_CHARS
                  ? `${issue.raw.slice(0, MAX_RAW_CHARS - 1)}…`
                  : issue.raw;
              return (
                <tr
                  key={`${issue.rowNumber}-${issue.code}-${issue.field}-${index}`}
                  className="border-b border-line align-top"
                >
                  <th
                    scope="row"
                    data-label="Row"
                    className="py-3 pr-3 font-semibold text-ink tabular-nums"
                  >
                    <span className="sr-only">Row </span>
                    {issue.rowNumber}
                  </th>
                  <td data-label="Column" className="py-3 pr-3 text-ink">
                    {issue.field ? getUploadField(issue.field).label : 'Whole row'}
                  </td>
                  <td data-label="Value in your file" className="py-3 pr-3">
                    {raw === '' ? (
                      <span className="text-ink-subtle">(empty)</span>
                    ) : (
                      <code className="rounded-xs bg-surface-alt px-1.5 py-0.5 break-all text-ink">
                        {raw}
                      </code>
                    )}
                  </td>
                  <td data-label="What we found" className="max-w-prose py-3 pr-3 text-ink-muted">
                    {issue.message}
                  </td>
                  <td data-label="Outcome" className="py-3">
                    <Badge tone={outcome.tone}>{outcome.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {!showAll && visible.length > pageSize ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="min-h-11 self-start rounded-sm px-2 font-medium text-primary underline underline-offset-4 hover:bg-primary-tint"
        >
          Show all {formatInteger(visible.length)} issues
        </button>
      ) : null}
    </section>
  );
}
