import 'server-only';
import { headers } from 'next/headers';
import { getAdapter } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { ContactRequestInput } from '@/lib/api/schemas';
import { env } from '@/lib/config/env';
import { toolsConfig } from '@/lib/config/tools';
import type { ContactFormState } from '@/lib/forms/contact-state';
import { getClientIp } from '@/lib/security/client-ip';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { HONEYPOT_FIELD, parseContactForm } from '@/lib/validation/contact';

type ContactRequestKind = ContactRequestInput['kind'];

const RATE_LIMITED_MESSAGE =
  'You have sent several requests in a short time. Please wait a few minutes and try again.';
const UNAVAILABLE_MESSAGE =
  'We could not send your request just now, so nothing has been sent. Please try again later.';

function typedValues(data: FormData): Extract<ContactFormState, { status: 'error' }>['values'] {
  const read = (name: string) => {
    const value = data.get(name);
    return typeof value === 'string' ? value.slice(0, 2000) : '';
  };
  return {
    name: read('name'),
    email: read('email'),
    company: read('company'),
    message: read('message'),
  };
}

/**
 * Handles a contact request from any public form. Next.js checks the Origin header for server
 * actions, so no separate token is needed. Order: honeypot, rate limit, schema (the same one the
 * browser uses), then the adapter. Nothing the visitor typed is logged.
 */
export async function handleContactSubmission(
  kind: ContactRequestKind,
  formData: FormData,
): Promise<ContactFormState> {
  // A filled honeypot gets the normal success state so bots learn nothing. Nothing is sent.
  const trap = formData.get(HONEYPOT_FIELD);
  if (typeof trap === 'string' && trap.trim() !== '') {
    return { status: 'success', demo: env.PUBLIC_API_MODE === 'fixture' };
  }

  const limit = toolsConfig.rateLimits.forms;
  const ip = getClientIp(await headers());
  const allowed = checkRateLimit(ip, 'action:contact', {
    max: limit.max,
    windowMs: limit.windowMs,
    disabled: env.RATE_LIMIT_DISABLED,
  });
  if (!allowed.allowed) {
    return {
      status: 'error',
      fieldErrors: {},
      message: RATE_LIMITED_MESSAGE,
      values: typedValues(formData),
    };
  }

  const parsed = parseContactForm(formData);
  if (!parsed.success) {
    return { status: 'error', fieldErrors: parsed.errors, values: typedValues(formData) };
  }

  try {
    const acknowledgement = await getAdapter().submitContactRequest({ kind, ...parsed.data });
    return { status: 'success', demo: acknowledgement.dataSource === 'fixture' };
  } catch (error) {
    // Error code only, never the request content.
    console.error('contact request failed', error instanceof ApiError ? error.code : 'unknown');
    return {
      status: 'error',
      fieldErrors: {},
      message: UNAVAILABLE_MESSAGE,
      values: typedValues(formData),
    };
  }
}
