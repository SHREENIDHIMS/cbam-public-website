import { Ban, CalendarClock, CircleCheck, type LucideIcon } from 'lucide-react';
import type { Route } from 'next';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import type { LiabilityLine } from '@/lib/api/schemas';
import { formatGBPExact, formatTonnesPrecise } from '@/lib/utils/format';
import { pence } from './money';

type Scope = LiabilityLine['scope'];

const GROUPS: ReadonlyArray<{ scope: Scope; label: string; icon: LucideIcon }> = [
  { scope: 'in_scope', label: 'In scope', icon: CircleCheck },
  { scope: 'out_of_scope', label: 'Out of scope', icon: Ban },
  { scope: 'before_start', label: 'Before start date', icon: CalendarClock },
];

const COLUMN_COUNT = 11;
const HEAD = 'border-b-2 border-ink bg-surface px-3 py-2.5 t-label text-ink';
const NET = 'sticky right-0 border-l border-line bg-surface';

function NotCalculated() {
  return (
    <>
      <span aria-hidden="true" className="text-ink-subtle">
        –
      </span>
      <span className="sr-only">not calculated</span>
    </>
  );
}

function Money({ value }: { value: number | null }) {
  return value === null ? <NotCalculated /> : <>{pence(value)}</>;
}

/**
 * Line-level preview. Server rendered with no client code: the region scrolls both ways, the
 * heading row sticks to the top and the commodity code column sticks to the left.
 */
export function LiabilityTable({
  lines,
  sectors,
}: {
  lines: readonly LiabilityLine[];
  sectors: ReadonlyArray<{ key: string; label: string }>;
}) {
  const sectorLabel = (key: string | null) =>
    key === null ? null : (sectors.find((sector) => sector.key === key)?.label ?? key);

  return (
    <section aria-labelledby="table-title" className="flex flex-col gap-3">
      <h2 id="table-title" className="t-title">
        Line-by-line preview
      </h2>
      <p className="text-sm text-ink-muted">
        The net position stays pinned on the right. Scroll sideways inside the table for every other
        column.
      </p>
      <div
        role="region"
        aria-labelledby="table-caption"
        tabIndex={0}
        data-testid="liability-table-region"
        className="relative max-h-[70vh] overflow-auto rounded-sm border border-line bg-surface"
      >
        <table className="w-max min-w-full border-collapse text-left text-sm">
          <caption
            id="table-caption"
            className="sticky left-0 px-4 py-3 text-left text-sm font-semibold text-ink"
          >
            Line-level preview, {lines.length} {lines.length === 1 ? 'line' : 'lines'}
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className={`${HEAD} sticky top-0 left-0 z-30 border-r border-line-strong`}
              >
                Commodity code
              </th>
              {['Description', 'Sector', 'Origin', 'Supplier'].map((heading) => (
                <th key={heading} scope="col" className={`${HEAD} sticky top-0 z-20`}>
                  {heading}
                </th>
              ))}
              <th scope="col" className={`${HEAD} sticky top-0 z-20 text-right`}>
                Quantity
                <span className="block text-[11px] font-normal tracking-normal normal-case">
                  tonnes
                </span>
              </th>
              <th scope="col" className={`${HEAD} sticky top-0 z-20`}>
                Emissions basis
              </th>
              {['Gross liability', 'Relief'].map((heading) => (
                <th key={heading} scope="col" className={`${HEAD} sticky top-0 z-20 text-right`}>
                  {heading}
                  <span className="block text-[11px] font-normal tracking-normal normal-case">
                    scenario rate
                  </span>
                </th>
              ))}
              <th scope="col" className={`${HEAD} ${NET} top-0 z-30 text-right`}>
                Net position
                <span className="block text-[11px] font-normal tracking-normal normal-case">
                  scenario rate
                </span>
              </th>
              <th scope="col" className={`${HEAD} sticky top-0 z-20`}>
                Status
              </th>
            </tr>
          </thead>
          {GROUPS.map((group) => {
            const rows = lines.filter((line) => line.scope === group.scope);
            if (rows.length === 0) return null;
            const Icon = group.icon;
            return (
              <tbody key={group.scope} data-scope={group.scope}>
                <tr>
                  <th
                    scope="rowgroup"
                    colSpan={COLUMN_COUNT}
                    className="sticky left-0 border-y border-line bg-surface-alt/70 px-4 py-2 text-left text-sm font-semibold text-ink"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon aria-hidden="true" className="size-4 text-ink-subtle" />
                      {group.label}
                      <span className="font-normal text-ink-subtle">({rows.length})</span>
                    </span>
                  </th>
                </tr>
                {rows.map((line) => (
                  <tr key={line.lineId} className="border-b border-line align-top">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border-r border-line bg-surface px-3 py-3 font-medium whitespace-nowrap tabular-nums"
                    >
                      <a
                        href={`#line-${line.lineId}` as Route}
                        className="text-primary underline underline-offset-2"
                      >
                        {line.commodityCode}
                      </a>
                    </th>
                    <td className="max-w-[16rem] min-w-44 px-3 py-3 text-ink">
                      {line.description ?? <span className="text-ink-subtle">–</span>}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-ink-muted">
                      {sectorLabel(line.sector) ?? <span className="text-ink-subtle">–</span>}
                    </td>
                    <td className="px-3 py-3 text-ink-muted">{line.originCountry ?? '–'}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-ink-muted">
                      {line.supplier ?? '–'}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatTonnesPrecise(line.massTonnes)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {line.emissionsBasis === null || line.intensityProvenance === null ? (
                        <NotCalculated />
                      ) : (
                        <span className="flex flex-col items-start gap-1">
                          <ProvenanceBadge provenance={line.intensityProvenance} />
                          <span className="text-xs text-ink-subtle">
                            {line.emissionsBasis === 'supplier_actual'
                              ? 'Supplier data'
                              : 'Default intensity'}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <Money value={line.grossGbp} />
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <Money value={line.reliefGbp} />
                    </td>
                    <td
                      className={`${NET} z-10 px-3 py-3 text-right font-semibold text-ink tabular-nums`}
                    >
                      <Money value={line.netGbp} />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-ink">
                        <Icon aria-hidden="true" className="size-4 text-ink-subtle" />
                        {group.label === 'Before start date' ? 'Before start' : group.label}
                      </span>
                      <span className="block text-xs text-ink-subtle tabular-nums">
                        {formatGBPExact(line.customsValueGbp)} customs value
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            );
          })}
        </table>
      </div>
    </section>
  );
}
