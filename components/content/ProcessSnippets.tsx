import { CircleCheck, CircleDashed, CircleMinus, Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/shared/Badge';
import { rules } from '@/lib/config/rules';
import {
  SAMPLE_LEDGER,
  SAMPLE_READINESS_ITEMS,
  SAMPLE_SUPPLIER_COVERAGE,
  SAMPLE_THIRTY_DAY_VALUE,
  SAMPLE_TWELVE_MONTH_VALUE,
  type SampleLedgerRow,
} from '@/lib/config/home-sample';
import { cn } from '@/lib/utils/cn';
import { formatGBP, formatPercent } from '@/lib/utils/format';

/** Small, original data visuals for each stage. All figures are fictional samples. */

function SnippetFrame({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('box overflow-hidden', className)}>
      <p className="box-head">
        <span className="t-label text-ink">{title}</span>
        <span className="t-label">Sample</span>
      </p>
      {children}
    </div>
  );
}

const SCOPE: Record<SampleLedgerRow['scope'], { label: string; tone: 'positive' | 'neutral' }> = {
  in_scope: { label: 'In scope', tone: 'positive' },
  out_of_scope: { label: 'Out of scope', tone: 'neutral' },
  before_start: { label: 'Before start date', tone: 'neutral' },
};

export function LedgerSnippet() {
  return (
    <SnippetFrame title="Import ledger, matched and checked">
      <div className="overflow-x-auto" role="region" aria-label="Sample import ledger" tabIndex={0}>
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            Four sample import lines with value and scope result, fictional data
          </caption>
          <thead>
            <tr className="t-label border-b border-line text-ink-subtle">
              <th scope="col" className="px-3 py-2.5 font-[650] sm:px-4">
                Goods
              </th>
              <th scope="col" className="hidden px-3 py-2.5 font-[650] sm:table-cell sm:px-4">
                Supplier
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-[650] sm:px-4">
                Value
              </th>
              <th scope="col" className="px-3 py-2.5 font-[650] sm:px-4">
                Scope
              </th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_LEDGER.map((row) => {
              const scope = SCOPE[row.scope];
              const Icon = row.scope === 'in_scope' ? CircleCheck : CircleMinus;
              return (
                <tr key={row.description} className="border-b border-line last:border-b-0">
                  <th scope="row" className="px-3 py-3 font-medium text-ink sm:px-4">
                    {row.description}
                  </th>
                  <td className="hidden px-4 py-3 text-ink-muted sm:table-cell">{row.supplier}</td>
                  <td className="t-figure px-3 py-3 text-right text-ink sm:px-4">
                    {formatGBP(row.value)}
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <Badge tone={scope.tone} icon={<Icon aria-hidden="true" className="size-4" />}>
                      {scope.label}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SnippetFrame>
  );
}

function TestBar({ title, value, limit }: { title: string; value: number; limit: number | null }) {
  const ratio = limit ? Math.min(value / limit, 1) : 0;
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm">
        <p className="font-medium text-ink">{title}</p>
        <p className="t-figure text-[0.8125rem] text-ink-muted">
          {formatGBP(value)}
          {limit ? ` of ${formatGBP(limit)}` : ''}
          {limit ? ` · ${formatPercent(ratio)}` : ''}
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden bg-surface-alt" aria-hidden="true">
        <div className="bar-grow h-full bg-primary" style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}

export function ThresholdSnippet() {
  const limit = rules.registrationThreshold.value?.amount ?? null;
  const tests = rules.thresholdTests.value ?? [];
  const backward = tests.find((test) => test.key === 'backward')?.title ?? 'Look-back test';
  const forward = tests.find((test) => test.key === 'forward')?.title ?? 'Forward-looking test';
  return (
    <SnippetFrame title="Position against the registration tests">
      <div className="space-y-6 p-5">
        <TestBar title={backward} value={SAMPLE_TWELVE_MONTH_VALUE} limit={limit} />
        <TestBar title={forward} value={SAMPLE_THIRTY_DAY_VALUE} limit={limit} />
        <p className="text-sm text-ink-subtle">
          Illustrative values. The thresholds come from the rules snapshot, which is shown with its
          status in the fact strip above.
        </p>
      </div>
    </SnippetFrame>
  );
}

const SUPPLIER_ROW = {
  verified: { label: 'Data received and verified', icon: CircleCheck },
  requested: { label: 'Request sent, awaiting reply', icon: Clock },
  missing: { label: 'Emissions data missing', icon: CircleDashed },
} as const;

export function SuppliersSnippet() {
  return (
    <SnippetFrame title="Supplier requests">
      <ul className="m-0 list-none p-0">
        {SAMPLE_SUPPLIER_COVERAGE.map((supplier) => {
          const row = SUPPLIER_ROW[supplier.state];
          const Icon = row.icon;
          return (
            <li
              key={supplier.name}
              className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 last:border-b-0"
            >
              <div>
                <p className="font-medium text-ink">{supplier.name}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-ink-muted">
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  {row.label}
                </p>
              </div>
              <p className="t-figure shrink-0 text-[0.8125rem] text-ink-muted">
                {formatPercent(supplier.valueShare)} of value
              </p>
            </li>
          );
        })}
      </ul>
    </SnippetFrame>
  );
}

export function ReadinessSnippet() {
  const done = SAMPLE_READINESS_ITEMS.filter((item) => item.done).length;
  return (
    <SnippetFrame title="Readiness checklist">
      <ul className="m-0 list-none p-0">
        {SAMPLE_READINESS_ITEMS.map((item) => {
          const Icon = item.done ? CircleCheck : CircleDashed;
          return (
            <li
              key={item.label}
              className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 text-sm"
            >
              <span className="flex items-center gap-3 text-ink">
                <Icon aria-hidden="true" className="size-4 shrink-0 text-ink-muted" />
                {item.label}
              </span>
              <span className="shrink-0 text-ink-muted">
                {item.done ? 'Complete' : 'Needs data'}
              </span>
            </li>
          );
        })}
        <li className="t-figure px-5 py-3.5 text-[0.8125rem] font-semibold text-ink">
          {done} of {SAMPLE_READINESS_ITEMS.length} complete
        </li>
      </ul>
    </SnippetFrame>
  );
}
