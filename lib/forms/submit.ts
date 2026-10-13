import 'server-only';
import { headers } from 'next/headers';
import { getAdapter } from '@/lib/api/client';
import { ApiError, USER_MESSAGES } from '@/lib/api/errors';
import { env } from '@/lib/config/env';
import { toolsConfig } from '@/lib/config/tools';
import { getClientIp } from '@/lib/security/client-ip';
import { checkRateLimit } from '@/lib/security/rate-limit';
import {
  fieldErrorsFrom,
  HONEYPOT_FIELD,
  rateAlertFormSchema,
  readRateAlertFormData,
} from '@/lib/validation/forms';
import type { FormState } from './state';

/** Shared server-side steps for form submissions: honeypot, rate limit, parse, adapter call. */

/** A filled honeypot means a bot. Callers return the normal success state and do nothing. */
export function honeypotTripped(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD);
  return typeof value === 'string' && value.trim() !== '';
}

/** True when this client has used up its form submissions for the window. */
export async function formRateLimited(route: string): Promise<boolean> {
  const requestHeaders = await headers();
  const { max, windowMs } = toolsConfig.rateLimits.forms;
  const result = checkRateLimit(getClientIp(requestHeaders), `form:${route}`, {
    max,
    windowMs,
    disabled: env.RATE_LIMIT_DISABLED,
  });
  return !result.allowed;
}

const RATE_ALERT_SUCCESS =
  'Thank you. Check your inbox for a message asking you to confirm your address. You will not receive alerts until you do.';

export async function submitRateAlert(formData: FormData): Promise<FormState> {
  // Same success state as a real submission, so a bot learns nothing.
  if (honeypotTripped(formData)) return { status: 'success', message: RATE_ALERT_SUCCESS };

  if (await formRateLimited('rate-alert')) {
    return { status: 'error', message: USER_MESSAGES.rate_limited };
  }

  const parsed = rateAlertFormSchema.safeParse(readRateAlertFormData(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: fieldErrorsFrom(parsed.error),
      values: { email: String(formData.get('email') ?? '') },
    };
  }

  try {
    const acknowledgement = await getAdapter().subscribeRateAlert({
      email: parsed.data.email,
      consent: parsed.data.alertsConsent,
      marketingConsent: parsed.data.marketingConsent,
    });
    const demo = acknowledgement.dataSource === 'fixture';
    return {
      status: 'success',
      demo,
      message: demo ? acknowledgement.message : RATE_ALERT_SUCCESS,
    };
  } catch (error) {
    const code = error instanceof ApiError ? error.code : 'unavailable';
    return {
      status: 'error',
      message:
        code === 'not_configured' || code === 'not_implemented_fixture'
          ? 'Rate alerts are not switched on yet, so nothing was saved.'
          : 'We could not save your request. Please try again in a few minutes.',
    };
  }
}
