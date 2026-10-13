'use client';

import { useId } from 'react';

/** A native select listing every sheet. Changing it re-runs heading discovery. */
export function SheetPicker({
  sheets,
  value,
  onChange,
}: {
  sheets: readonly string[];
  value: number;
  onChange: (index: number) => void;
}) {
  const id = useId();
  if (sheets.length < 2) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        Sheet to read
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 w-full max-w-sm rounded-sm border border-line-strong bg-surface px-3 text-base text-ink"
      >
        {sheets.map((name, index) => (
          <option key={index} value={index}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
