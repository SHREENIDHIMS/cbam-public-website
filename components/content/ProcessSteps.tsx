import type { ReactNode } from 'react';
import { PROCESS_STAGES } from '@/lib/config/home-content';
import { Reveal } from './Reveal';
import {
  LedgerSnippet,
  ReadinessSnippet,
  SuppliersSnippet,
  ThresholdSnippet,
} from './ProcessSnippets';

const SNIPPETS: Record<(typeof PROCESS_STAGES)[number]['key'], ReactNode> = {
  import: <LedgerSnippet />,
  scope: <ThresholdSnippet />,
  suppliers: <SuppliersSnippet />,
  return: <ReadinessSnippet />,
};

/**
 * Four stages as ruled rows on the form: stage number and copy on the left, a data snippet on the
 * right. The numbers are a real sequence (the order the work happens in).
 */
export function ProcessSteps() {
  return (
    <ol className="ledger m-0 mt-14 list-none p-0 md:mt-20">
      {PROCESS_STAGES.map((stage) => (
        <li key={stage.key} className="py-10 md:py-14">
          <Reveal className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="min-w-0 lg:col-span-5">
              <h3 className="flex items-start gap-4">
                <span aria-hidden="true" className="box-no mt-1 text-primary">
                  {Number(stage.number)}
                </span>
                <span className="t-title">{stage.title}</span>
              </h3>
              <p className="mt-4 max-w-md pl-10 text-ink-muted">{stage.body}</p>
            </div>
            <div className="min-w-0 lg:col-span-7">{SNIPPETS[stage.key]}</div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
