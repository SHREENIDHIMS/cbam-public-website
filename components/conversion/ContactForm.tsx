'use client';

import { useActionState, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { Alert } from '@/components/shared/Alert';
import { ErrorSummary, type FieldIssue } from '@/components/shared/ErrorSummary';
import { Honeypot } from '@/components/shared/Honeypot';
import { CheckboxField, TextAreaField, TextField } from '@/components/shared/NativeFields';
import { track } from '@/lib/analytics';
import { INITIAL_CONTACT_STATE, type ContactFormState } from '@/lib/forms/contact-state';
import {
  CONTACT_FIELD_IDS,
  CONTACT_LIMITS,
  HONEYPOT_FIELD,
  type ContactFieldErrors,
  type ContactFormField,
} from '@/lib/validation/contact-fields';

type Validator = typeof import('@/lib/validation/contact').parseContactForm;

type Submit = (previous: ContactFormState, formData: FormData) => Promise<ContactFormState>;

const FIELD_ORDER: readonly ContactFormField[] = ['name', 'email', 'company', 'message'];

function issuesFrom(errors: ContactFieldErrors): FieldIssue[] {
  return FIELD_ORDER.flatMap((field) => {
    const message = errors[field];
    return message ? [{ fieldId: CONTACT_FIELD_IDS[field], message }] : [];
  });
}

/**
 * Broker contact form. It posts to a server action (so it also works before scripts load) and the
 * browser validates with the same Zod schema first. Marketing consent is a separate, unticked box.
 */
export function ContactForm({
  action,
  kind,
  label,
}: {
  action: Submit;
  kind: 'broker' | 'general';
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL_CONTACT_STATE);
  const [clientErrors, setClientErrors] = useState<ContactFieldErrors | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const validator = useRef<Validator | null>(null);

  // The schema library loads after the page is interactive. Until then the server action validates.
  useEffect(() => {
    void import('@/lib/validation/contact').then((module) => {
      validator.current = module.parseContactForm;
    });
  }, []);

  const serverErrors = state.status === 'error' ? state.fieldErrors : {};
  const errors = clientErrors ?? serverErrors;
  const issues = issuesFrom(errors);
  const formMessage = clientErrors === null && state.status === 'error' ? state.message : undefined;
  const values = state.status === 'error' ? state.values : null;

  useEffect(() => {
    if (state.status === 'success') {
      track({ name: 'contact_submitted', properties: { kind } });
      confirmationRef.current?.focus();
    }
    if (state.status === 'error')
      summaryRef.current?.querySelector<HTMLElement>('[role="alert"]')?.focus();
  }, [state, kind]);

  useEffect(() => {
    if (clientErrors) summaryRef.current?.querySelector<HTMLElement>('[role="alert"]')?.focus();
  }, [clientErrors]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const result = validator.current?.(new FormData(event.currentTarget));
    if (!result || result.success) {
      setClientErrors(null);
      return;
    }
    event.preventDefault();
    setClientErrors(result.errors);
  }

  if (state.status === 'success') {
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        role="status"
        data-testid="contact-confirmation"
        className="rounded-sm border border-positive-fg/30 bg-positive-bg p-6 outline-none md:p-8"
      >
        <p className="t-title flex items-center gap-3">
          <CircleCheck aria-hidden="true" className="size-6 shrink-0 text-positive-fg" />
          Thank you, we have your request.
        </p>
        <p className="mt-4 text-ink-muted">
          {state.demo
            ? 'This website is running in demo mode, so nothing was sent or stored and nobody will reply. In the live site, a member of the team will reply to the email address you gave.'
            : 'A member of the team will reply to the email address you gave. We use your details only to respond to this request.'}
        </p>
        <p className="mt-3 text-ink-muted">
          You will not receive marketing emails unless you ticked the separate box.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      aria-label={label}
      className="relative flex flex-col gap-5"
    >
      <div ref={summaryRef}>
        <ErrorSummary title="Please check the form" issues={issues} id="contact-error-summary" />
      </div>
      {formMessage ? (
        <Alert tone="critical" role="alert">
          {formMessage}
        </Alert>
      ) : null}

      <TextField
        id={CONTACT_FIELD_IDS.name}
        name="name"
        label="Your name"
        autoComplete="name"
        required
        maxLength={CONTACT_LIMITS.name + 20}
        defaultValue={values?.name ?? ''}
        error={errors.name}
      />
      <TextField
        id={CONTACT_FIELD_IDS.email}
        name="email"
        type="email"
        label="Work email"
        description="We reply here. We do not publish or share it."
        autoComplete="email"
        required
        defaultValue={values?.email ?? ''}
        error={errors.email}
      />
      <TextField
        id={CONTACT_FIELD_IDS.company}
        name="company"
        label="Organisation (optional)"
        autoComplete="organization"
        defaultValue={values?.company ?? ''}
        error={errors.company}
      />
      <TextAreaField
        id={CONTACT_FIELD_IDS.message}
        name="message"
        label="Anything we should know? (optional)"
        description="For example, roughly how many importers you support. Please do not include customs data or supplier names."
        rows={4}
        defaultValue={values?.message ?? ''}
        error={errors.message}
      />

      <Honeypot name={HONEYPOT_FIELD} />

      <CheckboxField
        id={CONTACT_FIELD_IDS.marketingConsent}
        name="marketingConsent"
        label="Email me occasional updates about UK CBAM and this product (optional)"
        description="Separate from your request. Leave it unticked and we will only reply to what you sent."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary btn-lg w-full disabled:cursor-wait sm:w-auto"
        >
          {pending ? 'Sending' : 'Send request'}
        </button>
        <p className="text-sm text-ink-subtle">
          Read how we handle your details in the{' '}
          <Link href="/privacy" className="text-primary underline underline-offset-4">
            privacy notice
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
