import { TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/shared/Badge';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import type { SupplierExposure } from '@/lib/api/schemas';
import { formatGBPExact, formatPercent } from '@/lib/utils/format';
import { pence } from './money';

function BasisBadge({ basis }: { basis: SupplierExposure['basis'] }) {
  switch (basis) {
    case 'supplier_actual':
      return <ProvenanceBadge provenance="supplier_actual" />;
    case 'default_value':
      return (
        <span className="inline-flex items-center gap-1.5">
          <ProvenanceBadge provenance="scenario" />
          <span className="text-xs text-ink-subtle">Default intensity</span>
        </span>
      );
    case 'mixed':
      return <Badge tone="info">Mixed basis</Badge>;
    case 'none':
      return <Badge tone="neutral">No covered lines</Badge>;
  }
}

/** Suppliers ranked by their share of the indicative position; missing data is called out. */
export function SupplierExposureList({ suppliers }: { suppliers: readonly SupplierExposure[] }) {
  return (
    <section aria-labelledby="suppliers-title" className="flex flex-col gap-3">
      <h2 id="suppliers-title" className="t-title">
        Supplier exposure
      </h2>
      <p className="max-w-prose text-ink-muted">
        Ranked by their share of the indicative net position. Suppliers without emissions data are
        flagged, because real data could change their number.
      </p>
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {suppliers.map((supplier) => (
          <li
            key={supplier.supplier}
            data-print-card=""
            className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 rounded-sm border border-line bg-surface p-4 md:p-5"
          >
            <span aria-hidden="true" className="box-no size-8 text-sm text-primary">
              {supplier.rank}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-base font-semibold text-ink">
                  <span className="sr-only">Rank {supplier.rank}: </span>
                  {supplier.supplier}
                </h3>
                <p className="t-figure text-lg font-semibold text-ink">
                  {pence(supplier.netGbp)}
                  <span className="ml-1 text-xs font-normal text-ink-subtle">net</span>
                </p>
              </div>
              <p className="mt-0.5 text-sm text-ink-muted tabular-nums">
                {formatGBPExact(supplier.coveredValueGbp)} covered import value ·{' '}
                {supplier.coveredLines} covered {supplier.coveredLines === 1 ? 'line' : 'lines'}
                {supplier.otherLines > 0
                  ? ` · ${supplier.otherLines} other ${supplier.otherLines === 1 ? 'line' : 'lines'}`
                  : ''}
              </p>
            </div>
            <div className="col-span-2 flex flex-col gap-2 sm:col-span-1 sm:col-start-2">
              <div className="flex items-center gap-3">
                <div aria-hidden="true" className="h-2 flex-1 overflow-hidden bg-surface-alt">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.round(supplier.shareOfNet * 100)}%` }}
                  />
                </div>
                <p className="w-24 text-right text-sm text-ink tabular-nums">
                  {formatPercent(supplier.shareOfNet)} of net
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <BasisBadge basis={supplier.basis} />
                {supplier.missingData ? (
                  <p className="flex items-center gap-1.5 text-sm font-medium text-watch-fg">
                    <TriangleAlert aria-hidden="true" className="size-4" />
                    Supplier data missing: default values used
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
