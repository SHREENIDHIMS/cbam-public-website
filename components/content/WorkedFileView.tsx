import { ConfidenceBadge } from '@/components/tools/ConfidenceBadge';
import type { WorkedFile } from '@/lib/content/worked-example';
import { formatInteger } from '@/lib/utils/format';
import { DecisionBadge } from './DecisionBadge';

/** One supplier file as received: the column matches, then every row with what the engine did. */
export function WorkedFileView({ file }: { file: WorkedFile }) {
  const { counts } = file;
  const stats = [
    { label: 'Rows found', value: counts.rowsFound },
    { label: 'Ready', value: counts.included - counts.normalised },
    { label: 'Normalised', value: counts.normalised },
    { label: 'Needs review', value: counts.needsReview + counts.duplicates },
    { label: 'Rejected', value: counts.rejected },
    { label: 'Total rows left out', value: counts.totalRowsExcluded },
  ];
  const fieldByColumn = file.mapping.map((entry) => entry.fieldLabel);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="max-w-3xl text-lg text-ink-muted">{file.blurb}</p>
        <p className="mt-3 text-sm text-ink-subtle">
          {file.format}. Headings found at row {file.headerRowNumber}
          {file.skippedAbove > 0 ? `, after ${file.skippedAbove} rows above them` : ''}.
          {file.sheetNote ? ` ${file.sheetNote}` : ''}
        </p>
      </div>

      <dl className="m-0 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-sm border border-line bg-surface p-4">
            <dt className="text-sm text-ink-subtle">{stat.label}</dt>
            <dd className="t-figure-lg m-0 mt-1">{formatInteger(stat.value)}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby={`${file.id}-mapping-title`}>
        <h3 id={`${file.id}-mapping-title`} className="t-title">
          What each column was matched to
        </h3>
        <div
          className="relative mt-4 overflow-x-auto rounded-sm border border-line"
          role="region"
          aria-label={`Column matches for ${file.title}`}
          tabIndex={0}
        >
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <caption className="sr-only">Column headings and the field each was matched to</caption>
            <thead className="bg-surface-alt text-sm text-ink">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Heading in the file
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Matched to
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Confidence
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Why
                </th>
              </tr>
            </thead>
            <tbody>
              {file.mapping.map((entry) => (
                <tr key={entry.header} className="border-t border-line align-top">
                  <th scope="row" className="px-4 py-3 font-medium text-ink">
                    {entry.header}
                  </th>
                  <td className="px-4 py-3 text-ink-muted">{entry.fieldLabel ?? 'Not used'}</td>
                  <td className="px-4 py-3">
                    <ConfidenceBadge confidence={entry.confidence} />
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-muted">{entry.reason || 'No match'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby={`${file.id}-rows-title`}>
        <h3 id={`${file.id}-rows-title`} className="t-title">
          Every row, as received
        </h3>
        <p className="mt-2 max-w-3xl text-ink-muted">
          Cells the engine changed or questioned show what it did underneath the original text.
        </p>
        <div
          className="relative mt-4 overflow-x-auto rounded-sm border border-line"
          role="region"
          aria-label={`Rows of ${file.title}`}
          tabIndex={0}
        >
          <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
            <caption className="sr-only">Rows of {file.title} with the outcome for each</caption>
            <thead className="bg-surface-alt text-ink">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Row
                </th>
                {file.headers.map((header) => (
                  <th key={header} scope="col" className="px-3 py-3 font-semibold">
                    {header}
                  </th>
                ))}
                <th scope="col" className="px-3 py-3 font-semibold">
                  Outcome
                </th>
              </tr>
            </thead>
            <tbody>
              {file.rows.map((row) => (
                <tr key={row.rowNumber} className="border-t border-line align-top">
                  <th scope="row" className="px-3 py-3 font-medium text-ink tabular-nums">
                    {row.rowNumber}
                  </th>
                  {row.cells.map((cell, index) => {
                    const issues = row.issues.filter(
                      (issue) => issue.field === fieldByColumn[index],
                    );
                    return (
                      <td key={`${row.rowNumber}-${index}`} className="px-3 py-3 text-ink-muted">
                        <span className={cell === '' ? 'text-ink-subtle italic' : undefined}>
                          {cell === '' ? 'Empty' : cell}
                        </span>
                        {issues.map((issue) => (
                          <span
                            key={issue.message}
                            className="mt-1.5 flex flex-col items-start gap-1"
                          >
                            <DecisionBadge kind={issue.kind} />
                            {issue.normalised ? (
                              <span className="font-medium text-ink">
                                Read as {issue.normalised}
                              </span>
                            ) : null}
                          </span>
                        ))}
                      </td>
                    );
                  })}
                  <td className="px-3 py-3">
                    <DecisionBadge kind={row.kind} label={row.outcomeLabel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {file.columnNotes.length > 0 ? (
          <ul className="m-0 mt-4 flex list-disc flex-col gap-1 pl-5 text-sm text-ink-muted">
            {file.columnNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
