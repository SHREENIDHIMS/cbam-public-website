'use client';

import type { ReactNode } from 'react';

import { Drawer } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { SourceBadge } from '@/components/tools/SourceBadge';
import type { LiabilityPreview } from '@/lib/api/schemas';
import { PROVENANCE, type Provenance } from '@/lib/config/provenance';
import { formatAssumption } from './money';

interface Props {
  opened: boolean;
  onClose: () => void;
  methodology: LiabilityPreview['methodology'];
  rulesVersion: string;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = `method-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <section aria-labelledby={id} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
      <h3 id={id} className="text-base font-semibold text-ink">
        {title}
      </h3>
      <div className="mt-3 text-sm text-ink-muted">{children}</div>
    </section>
  );
}

/** Mantine drawer with the five methodology sections. Loaded on first open only. */
export default function MethodologyDrawerContent({
  opened,
  onClose,
  methodology,
  rulesVersion,
}: Props) {
  const small = useMediaQuery('(max-width: 47.99em)');
  const used = new Set<Provenance>([
    ...methodology.assumptions.map((entry) => entry.provenance),
    ...methodology.sources.map((entry) => entry.provenance),
  ]);
  const legend = (
    ['official', 'supplier_actual', 'scenario', 'unverified', 'proposed'] as const
  ).filter((key) => key === 'official' || used.has(key));

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position={small ? 'bottom' : 'right'}
      size={small ? '85%' : 'min(34rem, 100%)'}
      title="How these numbers are worked out"
      closeButtonProps={{ 'aria-label': 'Close' }}
      styles={{ title: { fontWeight: 600, fontSize: '1.125rem' } }}
    >
      <div className="flex flex-col gap-6 pb-6">
        <Section title="Inputs">
          <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5">
            {methodology.inputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section title="Formula concept">
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {methodology.formula.map((step, index) => (
              <li key={step.step} className="flex gap-3">
                <span aria-hidden="true" className="box-no shrink-0 text-primary">
                  {index + 1}
                </span>
                <span>
                  <strong className="text-ink">{step.step}.</strong> {step.text}
                </span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Ruleset and sources">
          <p>
            Rules snapshot <span className="font-medium text-ink">{rulesVersion}</span>.
          </p>
          <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
            {methodology.sources.map((source) => (
              <li key={source.url + source.title}>
                <SourceBadge
                  provenance={source.provenance}
                  sourceTitle={source.title}
                  sourceUrl={source.url}
                  sourceDate={source.date}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Official vs scenario">
          <p>
            Every figure carries a badge. Only a value checked against a primary source can be
            Official. Scenario figures are illustrative assumptions.
          </p>
          <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
            {legend.map((key) => (
              <li key={key} className="flex flex-wrap items-center gap-2">
                <ProvenanceBadge provenance={key} />
                <span>{PROVENANCE[key].meaning}.</span>
              </li>
            ))}
          </ul>
          <h4 className="mt-5 text-sm font-semibold text-ink">Assumptions used in this preview</h4>
          <ul className="m-0 mt-2 flex list-none flex-col gap-3 p-0">
            {methodology.assumptions.map((assumption) => (
              <li key={assumption.key} className="rounded-md border border-line bg-surface p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-ink">{assumption.label}</span>
                  <ProvenanceBadge provenance={assumption.provenance} />
                </div>
                <p className="mt-1 text-ink tabular-nums">
                  {formatAssumption(assumption.value, assumption.unit)}
                </p>
                <p className="mt-0.5 text-xs">{assumption.note}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Missing information">
          <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5">
            {methodology.missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      </div>
    </Drawer>
  );
}
