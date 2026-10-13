import { StatusBadge } from '@/components/shared/StatusBadge';
import type { ResultStatus } from '@/lib/config/status';
import { formatGBP, formatPercent } from '@/lib/utils/format';

/** Fictional client portfolio for the broker section. Sample figures only. */
const CLIENTS: ReadonlyArray<{
  name: string;
  status: ResultStatus;
  exposure: number | null;
  coverage: number;
}> = [
  { name: 'Northstar Steel Imports Ltd', status: 'approaching', exposure: 17_500, coverage: 0.58 },
  { name: 'Meridian Aluminium Trading Ltd', status: 'below', exposure: 3_900, coverage: 0.81 },
  {
    name: 'Greenfield Building Materials Ltd',
    status: 'needs_data',
    exposure: null,
    coverage: 0.12,
  },
];

export function BrokerPortfolioPreview() {
  return (
    <div className="box overflow-hidden">
      <div className="box-head">
        <p className="t-label text-ink">Client portfolio</p>
        <p className="t-label">Sample, illustrative</p>
      </div>
      <div
        className="overflow-x-auto"
        role="region"
        aria-label="Sample client portfolio"
        tabIndex={0}
      >
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Three fictional clients with threshold position, indicative exposure and supplier data
            coverage
          </caption>
          <thead>
            <tr className="t-label border-b border-line text-ink-subtle">
              <th scope="col" className="px-5 py-3 font-[650]">
                Client
              </th>
              <th scope="col" className="px-3 py-3 font-[650]">
                Position
              </th>
              <th scope="col" className="px-3 py-3 text-right font-[650]">
                Indicative exposure
              </th>
              <th scope="col" className="px-5 py-3 text-right font-[650]">
                Supplier data
              </th>
            </tr>
          </thead>
          <tbody>
            {CLIENTS.map((client) => (
              <tr key={client.name} className="border-b border-line last:border-b-0">
                <th scope="row" className="px-5 py-4 font-semibold text-ink">
                  {client.name}
                </th>
                <td className="px-3 py-4">
                  <StatusBadge status={client.status} />
                </td>
                <td className="t-figure px-3 py-4 text-right text-ink">
                  {client.exposure === null ? 'Needs data' : formatGBP(client.exposure)}
                </td>
                <td className="t-figure px-5 py-4 text-right text-ink">
                  {formatPercent(client.coverage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
