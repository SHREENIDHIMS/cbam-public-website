'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { track } from '@/lib/analytics';
import type { Provenance } from '@/lib/config/provenance';
import type { SectorKey } from '@/lib/config/rules-schema';
import { getStatus } from '@/lib/config/status';
import { evaluateThreshold, worstStatus } from '@/lib/tools/threshold';
import {
  backwardExplanation,
  forwardExplanation,
  thresholdNextStep,
} from '@/lib/tools/threshold-copy';
import {
  validateThreshold,
  type ThresholdField,
  type ThresholdFormValues,
} from '@/lib/validation/threshold';
import { Alert } from '@/components/shared/Alert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ExternalLink } from '@/components/shared/ExternalLink';
import { MoneyField } from '@/components/shared/MoneyField';
import { CheckboxField } from '@/components/shared/NativeFields';
import { ThresholdResult } from '@/components/results/ThresholdResult';
import { SectorSelector } from './SectorSelector';

interface Source {
  provenance: Provenance;
  title: string;
  url: string;
  date: string | null;
}

export interface ThresholdCheckerClientProps {
  thresholdAmount: number | null;
  sectors: ReadonlyArray<{ key: SectorKey; label: string }>;
  guidance: { watchFrom: number; approachingFrom: number; label: string };
  maxRatio: number;
  tests: ReadonlyArray<{ key: string; title: string; description: string }>;
  testsSource: Source;
  exclusionsSource: { title: string; url: string };
  dataSource: 'fixture' | 'live';
  /** Server-rendered threshold fact with its provenance badge. */
  thresholdFact: ReactNode;
  /** Server-rendered ResultNotice and StaleRulesNotice. */
  notices: ReactNode;
}

const DEBOUNCE_MS = 150;

/** Instant two-view threshold calculator. Values stay in this component; nothing is sent. */
export function ThresholdCheckerClient({
  thresholdAmount,
  sectors,
  guidance,
  maxRatio,
  tests,
  testsSource,
  exclusionsSource,
  dataSource,
  thresholdFact,
  notices,
}: ThresholdCheckerClientProps) {
  const [values, setValues] = useState<ThresholdFormValues>({
    sectors: [],
    annualValue: undefined,
    lumpy: false,
    nextThirtyDays: null,
  });
  const [touched, setTouched] = useState<ReadonlySet<ThresholdField>>(new Set());
  const [settled, setSettled] = useState(values);
  const reported = useRef(false);

  function change<K extends keyof ThresholdFormValues>(
    field: K,
    next: ThresholdFormValues[K],
    marks: ThresholdField,
  ) {
    setValues((current) => ({ ...current, [field]: next }));
    setTouched((current) => new Set(current).add(marks));
  }

  useEffect(() => {
    const timer = setTimeout(() => setSettled(values), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [values]);

  const parsed = useMemo(() => validateThreshold(settled), [settled]);
  const evaluation = useMemo(() => {
    if (!parsed.success) return null;
    return evaluateThreshold(
      {
        annualValue: parsed.data.annualValue,
        nextThirtyDays: parsed.data.nextThirtyDays,
        lumpy: parsed.data.lumpy,
      },
      thresholdAmount,
      guidance,
    );
  }, [parsed, thresholdAmount, guidance]);

  const backwardStatus = evaluation?.backward.status ?? null;
  const forwardStatus = evaluation?.forward.status ?? null;
  const lumpy = parsed.success ? parsed.data.lumpy : false;

  useEffect(() => {
    if (reported.current || !evaluation || !backwardStatus) return;
    const timer = setTimeout(() => {
      reported.current = true;
      track({
        name: 'threshold_checked',
        properties: { backward: backwardStatus, forward: forwardStatus ?? 'not_assessed', lumpy },
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [evaluation, backwardStatus, forwardStatus, lumpy]);

  // Errors appear once a field has been edited, and follow the live values.
  const liveErrors = validateThreshold(values);
  const errors = liveErrors.success
    ? {}
    : Object.fromEntries(
        Object.entries(liveErrors.errors).filter(([field]) => touched.has(field as ThresholdField)),
      );
  const liveSummary =
    evaluation && backwardStatus
      ? `Look-back view: ${getStatus(backwardStatus).label}. Forward-looking view: ${
          forwardStatus ? getStatus(forwardStatus).label : 'not assessed'
        }.`
      : '';

  const backwardTest = tests.find((test) => test.key === 'backward');
  const forwardTest = tests.find((test) => test.key === 'forward');
  const onlyNone =
    parsed.success && parsed.data.sectors.length === 1 && parsed.data.sectors[0] === 'none';

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
      <form
        noValidate
        aria-label="Threshold inputs"
        onSubmit={(event) => event.preventDefault()}
        className="flex min-w-0 flex-col gap-8 lg:col-span-5"
      >
        <div className="rounded-sm border border-line bg-surface p-5 shadow-sm md:p-6">
          <h2 className="t-title">Your imports</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Simple inputs only. Nothing you type here leaves your browser.
          </p>
          <div className="mt-6 flex flex-col gap-7">
            <SectorSelector
              id="tc-sectors"
              legend="Which sectors are your goods in?"
              hint="Optional. It only tailors the suggested next step."
              sectors={sectors}
              extraOptions={[
                {
                  value: 'none',
                  label: 'None of these',
                  description: 'My goods are elsewhere.',
                },
              ]}
              value={values.sectors}
              onChange={(next) =>
                change('sectors', next as ThresholdFormValues['sectors'], 'sectors')
              }
              error={errors.sectors}
            />
            <MoneyField
              id="tc-annual"
              label="Yearly value of covered goods"
              description="The customs value of goods in these sectors over the last 12 months."
              placeholder="45,000"
              prefix="£"
              value={values.annualValue}
              onValueChange={(next) => change('annualValue', next, 'annualValue')}
              error={errors.annualValue}
            />
            <CheckboxField
              id="tc-lumpy"
              label="My imports are lumpy"
              description="Occasional very large shipments rather than steady volumes."
              checked={values.lumpy}
              onChange={(event) => {
                const lumpy = event.currentTarget.checked;
                setValues((current) => ({ ...current, lumpy }));
              }}
            />
            <MoneyField
              id="tc-next30"
              label="Expected value in the next 30 days (optional)"
              description="Leave blank and we will spread your yearly value evenly, unless your imports are lumpy."
              placeholder="60,000"
              prefix="£"
              value={values.nextThirtyDays}
              onValueChange={(next) => change('nextThirtyDays', next ?? null, 'nextThirtyDays')}
              error={errors.nextThirtyDays}
            />
          </div>
        </div>
        <div className="text-sm text-ink-muted">{thresholdFact}</div>
      </form>

      <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24 lg:col-span-7">
        <h2 className="sr-only">Your position</h2>
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveSummary}
        </div>

        {thresholdAmount === null ? (
          <Alert tone="neutral" title="Threshold to be confirmed">
            The registration threshold is to be confirmed, so the two views cannot be assessed yet.
          </Alert>
        ) : !evaluation ? (
          <EmptyState
            title="Enter your yearly value to see both tests"
            description="Add the yearly value of your covered goods. The look-back and forward-looking views appear here as you type."
          />
        ) : (
          <>
            <ThresholdResult
              id="tc-backward"
              title="Backward-looking 12-month view"
              testDescription={backwardTest?.description ?? null}
              source={testsSource}
              thresholdAmount={thresholdAmount}
              dataSource={dataSource}
              gauge={{
                maxRatio,
                watchFrom: guidance.watchFrom,
                approachingFrom: guidance.approachingFrom,
              }}
              view={{
                ...evaluation.backward,
                explanation: backwardExplanation(
                  evaluation.backward.amount ?? 0,
                  evaluation.backward.ratio ?? 0,
                  evaluation.backward.status ?? 'below',
                  thresholdAmount,
                ),
              }}
            />
            <ThresholdResult
              id="tc-forward"
              title="Forward-looking 30-day view"
              testDescription={forwardTest?.description ?? null}
              source={testsSource}
              thresholdAmount={thresholdAmount}
              dataSource={dataSource}
              gauge={{
                maxRatio,
                watchFrom: guidance.watchFrom,
                approachingFrom: guidance.approachingFrom,
              }}
              view={{
                ...evaluation.forward,
                explanation: forwardExplanation(
                  evaluation.forward.basis,
                  evaluation.forward.amount,
                  evaluation.forward.ratio,
                  evaluation.forward.status,
                  thresholdAmount,
                ),
              }}
            />
            <div
              data-print-card=""
              className="rounded-sm border border-line bg-primary-tint p-5 md:p-6"
            >
              <h3 className="font-semibold text-ink">What to do next</h3>
              <p className="mt-2 text-ink-muted">
                {thresholdNextStep(worstStatus(backwardStatus, forwardStatus), { onlyNone })}
              </p>
              {onlyNone ? (
                <p className="mt-3 text-sm">
                  <ExternalLink href={exclusionsSource.url}>{exclusionsSource.title}</ExternalLink>
                </p>
              ) : null}
            </div>
            <p className="text-sm text-ink-muted">
              The gauge runs from zero to {Math.round(maxRatio * 100)}% of the threshold. Ticks mark
              the watch band (from {Math.round(guidance.watchFrom * 100)}%), the approaching band
              (from {Math.round(guidance.approachingFrom * 100)}%) and the threshold itself.{' '}
              <span className="font-medium text-ink">{guidance.label}.</span>
            </p>
          </>
        )}

        {notices}
      </div>
    </div>
  );
}
