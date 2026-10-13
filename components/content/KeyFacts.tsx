import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import type { GuideKeyFact } from '@/lib/content/guide-schema';
import { getRuleDisplay, isRuleDisplayKey } from '@/lib/utils/rules-display';

/** Key facts for a guide. Facts that name a rules key are interpolated, never typed. */
export function KeyFacts({
  facts,
  headingId = 'key-facts-title',
}: {
  facts: readonly GuideKeyFact[];
  headingId?: string;
}) {
  if (facts.length === 0) return null;
  return (
    <section aria-labelledby={headingId} className="rounded-sm border border-line bg-surface p-5">
      <h2 id={headingId} className="t-label text-ink-subtle">
        Key facts
      </h2>
      <dl className="m-0 mt-4 flex flex-col gap-4">
        {facts.map((fact) => {
          const display =
            fact.rule && isRuleDisplayKey(fact.rule) ? getRuleDisplay(fact.rule) : null;
          if (fact.rule && !display) throw new Error(`Unknown rule key in key facts: ${fact.rule}`);
          return (
            <div key={fact.label} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
              <dt className="text-sm text-ink-subtle">{fact.label}</dt>
              <dd className="m-0 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-ink">
                <span>{display ? display.text : fact.text}</span>
                {display && display.status !== 'official' ? (
                  <ProvenanceBadge provenance={display.status} className="text-xs" />
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
