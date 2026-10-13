import { z } from 'zod';
import './zod-browser';
import {
  CONTACT_FIELD_IDS,
  CONTACT_LIMITS,
  HONEYPOT_FIELD,
  readContactForm,
  type ContactFieldErrors,
  type ContactFormField,
  type FormDataLike,
} from './contact-fields';

export {
  CONTACT_FIELD_IDS,
  CONTACT_LIMITS,
  HONEYPOT_FIELD,
  readContactForm,
  type ContactFieldErrors,
  type ContactFormField,
};

/**
 * The broker and contact request form. One schema, used by the browser for instant feedback and
 * again by the server action, so the two can never disagree (MASTER_PROMPT 24.2).
 * Marketing consent is its own field and is never implied by sending a request.
 */

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter your name.')
    .max(CONTACT_LIMITS.name, `Use ${CONTACT_LIMITS.name} characters or fewer for your name.`),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .max(254, 'That email address is too long.')
    .pipe(z.email('Enter a valid email address, for example name@company.co.uk.')),
  company: z
    .string()
    .trim()
    .max(CONTACT_LIMITS.company, `Use ${CONTACT_LIMITS.company} characters or fewer.`)
    .optional(),
  message: z
    .string()
    .trim()
    .max(CONTACT_LIMITS.message, `Use ${CONTACT_LIMITS.message} characters or fewer.`)
    .optional(),
  marketingConsent: z.boolean(),
});
export type ContactFormValues = z.infer<typeof contactFormSchema>;

export type ContactParseResult =
  { success: true; data: ContactFormValues } | { success: false; errors: ContactFieldErrors };

export function parseContactForm(data: FormDataLike): ContactParseResult {
  const result = contactFormSchema.safeParse(readContactForm(data));
  if (result.success) return { success: true, data: result.data };
  const errors: ContactFieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && key in CONTACT_FIELD_IDS && !(key in errors)) {
      errors[key as ContactFormField] = issue.message;
    }
  }
  return { success: false, errors };
}
