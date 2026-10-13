import { z } from 'zod';
import './zod-browser';
import { HONEYPOT_FIELD, readRateAlertFormData } from './forms-fields';

export { HONEYPOT_FIELD, readRateAlertFormData };

/**
 * Shared form schemas (DECISIONS 11). The client validates with these before submitting and the
 * server action parses the same schema again. Messages are written for the visitor.
 */

const email = z
  .string()
  .trim()
  .min(1, 'Enter your email address.')
  .max(254, 'That email address is too long.')
  .pipe(z.email('Enter a valid email address, such as name@example.com.'));

export const rateAlertFormSchema = z.object({
  email,
  /** Required: the visitor asks for rate and rules alerts. Not marketing consent. */
  alertsConsent: z.literal(true, {
    error: 'Tick the box to confirm you would like rate and rules alerts.',
  }),
  /** Separate and optional. Defaults to unticked. */
  marketingConsent: z.boolean(),
});
export type RateAlertFormValues = z.infer<typeof rateAlertFormSchema>;

export type RateAlertFieldName = keyof RateAlertFormValues;

export function fieldErrorsFrom(error: z.ZodError): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
