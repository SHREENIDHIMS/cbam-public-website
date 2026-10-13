/**
 * Contact form constants and field reading without any schema library, so the browser can render
 * the form without loading the validator up front.
 */

export type ContactFormField = 'name' | 'email' | 'company' | 'message' | 'marketingConsent';

export const CONTACT_LIMITS = { name: 120, company: 120, message: 1000 } as const;

export const CONTACT_FIELD_IDS: Record<ContactFormField, string> = {
  name: 'contact-name',
  email: 'contact-email',
  company: 'contact-company',
  message: 'contact-message',
  marketingConsent: 'contact-marketing',
};

/** Name of the hidden bot-trap field. A non-empty value means the request is ignored. */
export const HONEYPOT_FIELD = 'website';

export interface FormDataLike {
  get(name: string): unknown;
}

function required(data: FormDataLike, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value : '';
}

function optional(data: FormDataLike, name: string): string | undefined {
  const value = data.get(name);
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  return value;
}

/** Reads the raw fields. Blank optional fields become undefined; the checkbox is false unless ticked. */
export function readContactForm(data: FormDataLike): Record<ContactFormField, unknown> {
  return {
    name: required(data, 'name'),
    email: required(data, 'email'),
    company: optional(data, 'company'),
    message: optional(data, 'message'),
    marketingConsent: data.get('marketingConsent') !== null,
  };
}

export type ContactFieldErrors = Partial<Record<ContactFormField, string>>;
