'use client';

import { useActionState, useEffect, useId, useRef, useState } from 'react';
import { BellRing, CircleCheck } from 'lucide-react';
import { track } from '@/lib/analytics';
import { subscribeRateAlertAction } from '@/app/(marketing)/rate-watch/actions';
import { Alert } from '@/components/shared/Alert';
import { ErrorSummary, type FieldIssue } from '@/components/shared/ErrorSummary';
import { Honeypot } from '@/components/shared/Honeypot';
import { InlineFieldError } from '@/components/shared/InlineFieldError';
import { INITIAL_FORM_STATE } from '@/lib/forms/state';
import { readRateAlertFormData } from '@/lib/validation/forms-fields';

type Validation = typeof import('@/lib/validation/forms');

type Errors = Partial<Record<string, string>>;

const checkboxClass = 'mt-1 size-5 shrink-0 accent-[var(--cc-primary)]';

/**
 * Email alert sign-up. A server action with progressive enhancement: it works as a plain form post,
 * and with JavaScript the same Zod schema validates before submit. The alerts tick box and the
 * marketing tick box are separate and both start unticked.
 */
export function RateAlertForm({ brandName, demo = false }: { brandName: string; demo?: boolean }) {
  const [state, formAction, pending] = useActionState(subscribeRateAlertAction, INITIAL_FORM_STATE);
  const [clientErrors, setClientErrors] = useState<Errors>({});
  const summaryRef = useRef<HTMLDivElement>(null);
  const validation = useRef<Validation | null>(null);

  // The schema library loads after the page is interactive. Until then the server action validates.
  useEffect(() => {
    void import('@/lib/validation/forms').then((module) => {
      validation.current = module;
    });
  }, []);
  const baseId = useId();
  const emailId = `${baseId}-email`;
  const alertsId = `${baseId}-alerts`;
  const marketingId = `${baseId}-marketing`;

  const errors: Errors =
    Object.keys(clientErrors).length > 0 ? clientErrors : (state.fieldErrors ?? {});
  const issues: FieldIssue[] = [
    errors.email ? { fieldId: emailId, message: errors.email } : null,
    errors.alertsConsent ? { fieldId: alertsId, message: errors.alertsConsent } : null,
  ].filter((issue): issue is FieldIssue => issue !== null);

  useEffect(() => {
    if (state.status === 'success') track({ name: 'rate_alert_subscribed', properties: {} });
  }, [state.status]);

  useEffect(() => {
    if (issues.length > 0)
      summaryRef.current?.querySelector<HTMLElement>('#rate-alert-errors')?.focus();
    // Focus the summary only when a new set of errors appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientErrors, state.fieldErrors]);

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className="rounded-sm border border-positive-fg/30 bg-positive-bg p-6 text-positive-fg"
      >
        <p className="flex items-center gap-2 text-lg font-semibold">
          <CircleCheck aria-hidden="true" className="size-6 shrink-0" />
          Request received
        </p>
        <p className="mt-3 text-base">{state.message}</p>
        {state.demo ? (
          <p className="mt-3 text-sm">
            This is a demonstration site. In the live service you would be asked to confirm your
            address by email before any alert is sent.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      aria-label="Rate and rules alerts"
      onSubmit={(event) => {
        const loaded = validation.current;
        const parsed = loaded?.rateAlertFormSchema.safeParse(
          readRateAlertFormData(new FormData(event.currentTarget)),
        );
        if (loaded && parsed && !parsed.success) {
          event.preventDefault();
          setClientErrors(loaded.fieldErrorsFrom(parsed.error));
          return;
        }
        setClientErrors({});
      }}
      className="relative flex flex-col gap-6"
    >
      <div ref={summaryRef}>
        <ErrorSummary id="rate-alert-errors" title="Check these details" issues={issues} />
      </div>

      {state.status === 'error' && issues.length === 0 && state.message ? (
        <Alert tone="critical" role="alert">
          {state.message}
        </Alert>
      ) : null}

      <div>
        <label htmlFor={emailId} className="mb-1.5 block font-semibold text-ink">
          Email address
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state.values?.email ?? ''}
          aria-required="true"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          className="h-12 w-full rounded-sm border border-line-strong bg-surface px-3 text-base text-ink"
        />
        <InlineFieldError id={`${emailId}-error`} message={errors.email} />
      </div>

      <fieldset className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
        <legend className="sr-only">Consent</legend>
        <div>
          <label htmlFor={alertsId} className="flex cursor-pointer items-start gap-3 text-ink">
            <input
              id={alertsId}
              name="alertsConsent"
              type="checkbox"
              aria-invalid={errors.alertsConsent ? true : undefined}
              aria-describedby={errors.alertsConsent ? `${alertsId}-error` : undefined}
              className={checkboxClass}
            />
            <span>
              Email me when an official rate is published or the rules in this snapshot change.
              <span className="block text-sm text-ink-subtle">
                Required. We use your address only for these alerts.
              </span>
            </span>
          </label>
          <InlineFieldError id={`${alertsId}-error`} message={errors.alertsConsent} />
        </div>
        <label htmlFor={marketingId} className="flex cursor-pointer items-start gap-3 text-ink">
          <input
            id={marketingId}
            name="marketingConsent"
            type="checkbox"
            className={checkboxClass}
          />
          <span>
            Also send me occasional product news from {brandName}.
            <span className="block text-sm text-ink-subtle">
              Optional, and separate from rate alerts. You can say no and still get alerts.
            </span>
          </span>
        </label>
      </fieldset>

      <Honeypot name="website" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary btn-lg disabled:cursor-wait"
        >
          <BellRing aria-hidden="true" className="size-5" />
          {pending ? 'Sending' : 'Get alerts'}
        </button>
        <p className="text-sm text-ink-subtle">
          {demo
            ? 'Demo mode: no email is sent and your address is not stored.'
            : 'Next you will be asked to confirm your address from an email.'}
        </p>
      </div>
    </form>
  );
}
