'use client';

import { useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';
import type { SectorKey } from '@/lib/config/rules-schema';
import {
  EMPTY_ANSWERS,
  completeAnswers,
  toSearchParams,
  validateStep,
  type QuickEstimateAnswers,
} from '@/lib/validation/quick-estimate-fields';
import { NativeButton } from '@/components/shared/NativeButton';
import { ErrorSummary, type FieldIssue } from '@/components/shared/ErrorSummary';
import { EstimateForm, STEP_COPY, STEP_FIELD_IDS } from './EstimateForm';
import { WizardShell } from './WizardShell';

const TOTAL = STEP_COPY.length;
const STEP_KEYS = ['value', 'sectors', 'origins', 'suppliers', 'large'] as const;
const SUMMARY_ID = 'qe-error-summary';

interface QuickEstimateWizardProps {
  sectors: ReadonlyArray<{ key: SectorKey; label: string }>;
  defaultAnswers?: QuickEstimateAnswers | undefined;
}

/** Five-step quick estimate. Answers live in component state; the URL carries the bands only. */
export function QuickEstimateWizard({ sectors, defaultAnswers }: QuickEstimateWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuickEstimateAnswers>(defaultAnswers ?? EMPTY_ANSWERS);
  const [errors, setErrors] = useState<Partial<Record<keyof QuickEstimateAnswers, string>>>({});
  const started = useRef(false);

  const key = STEP_KEYS[step] ?? 'value';
  const issues: FieldIssue[] = Object.entries(errors).map(([field, message]) => ({
    fieldId: STEP_FIELD_IDS[STEP_KEYS.indexOf(field as (typeof STEP_KEYS)[number])] ?? SUMMARY_ID,
    message,
  }));

  function update(patch: Partial<QuickEstimateAnswers>) {
    if (!started.current) {
      started.current = true;
      track({ name: 'wizard_start', properties: {} });
    }
    setAnswers((current) => ({ ...current, ...patch }));
    setErrors({});
  }

  function focusSummary() {
    // Wait for the summary to mount before moving focus to it.
    requestAnimationFrame(() => document.getElementById(SUMMARY_ID)?.focus());
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const problem = validateStep(step, answers);
    if (problem) {
      setErrors({ [key]: problem });
      focusSummary();
      return;
    }
    track({
      name: 'wizard_step',
      properties: { step: String(step + 1) as '1' | '2' | '3' | '4' | '5' },
    });
    if (step < TOTAL - 1) {
      setStep(step + 1);
      return;
    }
    const complete = completeAnswers(answers);
    if (!complete) {
      setErrors({ [key]: 'Check your answers and try again' });
      focusSummary();
      return;
    }
    router.push(`/quick-estimate/result?${toSearchParams(complete)}` as Route);
  }

  const last = step === TOTAL - 1;
  const copy = STEP_COPY[step];

  return (
    <form noValidate onSubmit={onSubmit} aria-label="Quick estimate">
      <WizardShell
        step={step + 1}
        total={TOTAL}
        title={copy?.title ?? ''}
        description={copy?.description ?? ''}
        eyebrow="Quick estimate"
      >
        <div className="flex flex-col gap-6">
          <ErrorSummary id={SUMMARY_ID} title="There is a problem" issues={issues} />
          <EstimateForm
            step={step}
            answers={answers}
            onChange={update}
            errors={errors}
            sectors={sectors}
          />
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <NativeButton
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            rightSection={<ArrowRight aria-hidden="true" className="size-5" />}
          >
            {last ? 'See my estimate' : 'Continue'}
          </NativeButton>
          {step > 0 ? (
            <NativeButton
              type="button"
              variant="subtle"
              size="lg"
              className="w-full sm:w-auto"
              leftSection={<ArrowLeft aria-hidden="true" className="size-5" />}
              onClick={() => {
                setErrors({});
                setStep(step - 1);
              }}
            >
              Back
            </NativeButton>
          ) : null}
        </div>
      </WizardShell>
    </form>
  );
}
