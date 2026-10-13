'use client';

import { Check, CircleAlert, RotateCcw } from 'lucide-react';
import { useId } from 'react';
import { UPLOAD_FIELDS, type UploadFieldKey } from '@/lib/config/upload-fields';
import { toFieldColumns, type MappingSuggestion } from '@/lib/upload/column-matching';
import { cellText, isEmptyCell } from '@/lib/upload/normalise';
import type { Cell, ColumnChoice, MassUnit } from '@/lib/upload/types';
import { ConfidenceBadge } from './ConfidenceBadge';

export const MAPPER_ID = 'column-mapper';

interface ColumnMapperProps {
  mapping: readonly MappingSuggestion[];
  rows: ReadonlyArray<{ rowNumber: number; cells: readonly Cell[] }>;
  onChange: (columnIndex: number, choice: ColumnChoice) => void;
  onReset: () => void;
  massUnit: MassUnit;
  onMassUnit: (unit: MassUnit) => void;
  /** Shown when the Net mass heading does not name a unit. */
  askMassUnit: boolean;
  /** Spoken by the live region after a field moves between columns. */
  announcement: string;
}

const SAMPLE_COUNT = 3;
const MAX_SAMPLE_CHARS = 28;

function columnLetter(index: number): string {
  let letter = '';
  let n = index;
  do {
    letter = String.fromCharCode(65 + (n % 26)) + letter;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return letter;
}

function samplesFor(rows: ColumnMapperProps['rows'], columnIndex: number): string[] {
  const samples: string[] = [];
  for (const row of rows) {
    const cell = row.cells[columnIndex];
    if (isEmptyCell(cell)) continue;
    const text = cellText(cell);
    samples.push(text.length > MAX_SAMPLE_CHARS ? `${text.slice(0, MAX_SAMPLE_CHARS - 1)}…` : text);
    if (samples.length === SAMPLE_COUNT) break;
  }
  return samples;
}

/**
 * Lets the visitor check and correct every column. One table on wide screens that reads as a stack
 * of cards on narrow ones. Selects are native, so they work with any keyboard or screen reader.
 */
export function ColumnMapper({
  mapping,
  rows,
  onChange,
  onReset,
  massUnit,
  onMassUnit,
  askMassUnit,
  announcement,
}: ColumnMapperProps) {
  const unitId = useId();
  const columns = toFieldColumns(mapping);
  const netMassHeader = mapping.find((entry) => entry.field === 'netMass')?.header;
  const required = UPLOAD_FIELDS.filter((field) => field.requirement === 'required');
  const optionalGroups = [
    { label: 'Recommended', fields: UPLOAD_FIELDS.filter((f) => f.requirement === 'recommended') },
    { label: 'Optional', fields: UPLOAD_FIELDS.filter((f) => f.requirement === 'optional') },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-ink">Needed for every line</h3>
        <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
          {required.map((field) => {
            const mapped = columns[field.key as UploadFieldKey] !== undefined;
            return (
              <li
                key={field.key}
                className={`tag ${
                  mapped ? 'bg-positive-bg text-positive-fg' : 'bg-critical-bg text-critical-fg'
                }`}
              >
                {mapped ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  <CircleAlert aria-hidden="true" className="size-4" />
                )}
                {field.label}
                <span className="sr-only">{mapped ? ' is mapped' : ' still needs a column'}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div id={MAPPER_ID} tabIndex={-1} className="max-w-full outline-none">
        <table className="stack-table w-full border-collapse text-left text-sm">
          <caption className="sr-only">Map each column in your file to a field</caption>
          <thead>
            <tr className="t-label border-b border-line-strong text-ink-subtle">
              <th scope="col" className="py-2 pr-4 font-medium">
                Your column
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Sample values
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Read as
              </th>
              <th scope="col" className="py-2 font-medium">
                Match
              </th>
            </tr>
          </thead>
          <tbody>
            {mapping.map((entry) => {
              const selectId = `map-select-${entry.columnIndex}`;
              const samples = samplesFor(rows, entry.columnIndex);
              return (
                <tr key={entry.columnIndex} className="border-b border-line align-top">
                  <th scope="row" data-label="Your column" className="py-3 pr-4 font-normal">
                    <span className="block font-semibold text-ink">
                      {entry.header || <span className="text-ink-subtle">(no heading)</span>}
                    </span>
                    <span className="text-xs text-ink-subtle">
                      Column {columnLetter(entry.columnIndex)}
                    </span>
                  </th>
                  <td data-label="Sample values" className="py-3 pr-4">
                    {samples.length === 0 ? (
                      <span className="text-ink-subtle">Empty</span>
                    ) : (
                      <ul className="m-0 flex list-none flex-col gap-0.5 p-0 text-ink-muted">
                        {samples.map((sample, index) => (
                          <li key={index} className="truncate">
                            {sample}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td data-label="Read as" className="py-3 pr-4">
                    <select
                      id={selectId}
                      aria-label={`Read column "${entry.header || columnLetter(entry.columnIndex)}" as`}
                      value={entry.field}
                      onChange={(event) =>
                        onChange(entry.columnIndex, event.target.value as ColumnChoice)
                      }
                      className="h-11 w-full min-w-44 rounded-sm border border-line-strong bg-surface px-3 text-base text-ink"
                    >
                      <option value="ignore">Don&apos;t use this column</option>
                      <optgroup label="Needed">
                        {required.map((field) => (
                          <option key={field.key} value={field.key}>
                            {field.label}
                          </option>
                        ))}
                      </optgroup>
                      {optionalGroups.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.fields.map((field) => (
                            <option key={field.key} value={field.key}>
                              {field.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </td>
                  <td data-label="Match" className="py-3">
                    <ConfidenceBadge confidence={entry.confidence} />
                    {entry.reason ? (
                      <p className="mt-1.5 max-w-[26ch] text-xs text-ink-muted">{entry.reason}</p>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {askMassUnit && netMassHeader ? (
        <fieldset className="m-0 rounded-md border border-line bg-surface p-4">
          <legend className="px-1 text-sm font-semibold text-ink">
            Unit for &ldquo;{netMassHeader}&rdquo;
          </legend>
          <p id={`${unitId}-hint`} className="text-sm text-ink-muted">
            We&apos;ll read {netMassHeader} as {massUnit === 'kg' ? 'kilograms' : 'tonnes'} unless a
            cell says otherwise.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {(
              [
                ['kg', 'Kilograms'],
                ['tonnes', 'Tonnes'],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex min-h-11 items-center gap-2 text-ink">
                <input
                  type="radio"
                  name={`${unitId}-unit`}
                  value={value}
                  checked={massUnit === value}
                  onChange={() => onMassUnit(value)}
                  aria-describedby={`${unitId}-hint`}
                  className="size-5 accent-[var(--cc-primary)]"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center gap-2 rounded-sm px-2 font-medium text-primary underline underline-offset-4 hover:bg-primary-tint"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Reset to suggestions
        </button>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
