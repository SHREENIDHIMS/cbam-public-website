import { ArrowRight, CircleCheck, CircleDashed, Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import {
  SAMPLE_LINE,
  SAMPLE_SUPPLIERS,
  computeSampleLine,
  sampleBasisDifference,
} from '@/lib/config/home-sample';
import { formatGBP } from '@/lib/utils/format';

function Step({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 border-b border-line py-3 text-ink last:border-b-0">
      {icon}
      <span>{children}</span>
    </li>
  );
}

function SupplierCard({
  id,
  slot,
  stamp,
  name,
  steps,
  provenance,
  net,
}: {
  id: string;
  slot: string;
  stamp: ReactNode;
  name: string;
  steps: ReactNode;
  provenance: ReactNode;
  net: number;
}) {
  return (
    <section aria-labelledby={id} data-tone="paper" className="box text-ink">
      <div className="box-head">
        <span className="t-label">{slot}</span>
        {stamp}
      </div>
      <div className="box-body">
        <h3 id={id} className="t-title">
          {name}
        </h3>
        <ul className="m-0 mt-4 list-none p-0">{steps}</ul>
        <div className="mt-5">{provenance}</div>
        <p className="mt-5 text-sm text-ink-muted">Indicative net on the sample line</p>
        <p className="t-figure-lg mt-1">{formatGBP(net)}</p>
      </div>
    </section>
  );
}

/**
 * Supplier A (complete) against Supplier B (missing data), using the same sample line. Drawn as two
 * paper declaration cards on the dark section, each stamped with its request state.
 */
export function SupplierStoryPreview() {
  const actual = computeSampleLine(SAMPLE_LINE, 'actual');
  const fallback = computeSampleLine(SAMPLE_LINE, 'default');
  const iconClass = 'size-5 shrink-0 text-ink-muted';

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <SupplierCard
          id="supplier-a"
          slot="Supplier A"
          stamp={<span className="stamp text-positive-fg">Received</span>}
          name={SAMPLE_SUPPLIERS.atlas}
          steps={
            <>
              <Step icon={<CircleCheck aria-hidden="true" className={iconClass} />}>
                Data received
              </Step>
              <Step icon={<CircleCheck aria-hidden="true" className={iconClass} />}>Verified</Step>
            </>
          }
          provenance={<ProvenanceBadge provenance="supplier_actual" />}
          net={actual.net}
        />
        <SupplierCard
          id="supplier-b"
          slot="Supplier B"
          stamp={<span className="stamp text-watch-fg">Requested</span>}
          name={SAMPLE_SUPPLIERS.meridian}
          steps={
            <>
              <Step icon={<Clock aria-hidden="true" className={iconClass} />}>
                Requested, awaiting reply
              </Step>
              <Step icon={<CircleDashed aria-hidden="true" className={iconClass} />}>
                Emissions data missing
              </Step>
            </>
          }
          provenance={<ProvenanceBadge provenance="default_value" />}
          net={fallback.net}
        />
      </div>

      <p className="mt-8 flex items-start gap-3 text-lg text-ink">
        <ArrowRight aria-hidden="true" className="mt-1.5 size-5 shrink-0" />
        <span>
          In this sample, the gap between a default value and supplier actual data is{' '}
          <strong className="t-figure font-semibold">{formatGBP(sampleBasisDifference())}</strong>{' '}
          on a single line. Across a portfolio of suppliers it adds up.
        </span>
      </p>
      <p className="mt-3 text-sm text-ink-muted">
        Sample data, fictional suppliers. The rate and emissions values are scenario assumptions.
      </p>
    </div>
  );
}
