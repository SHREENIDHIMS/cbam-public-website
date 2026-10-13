/** Form constants and FormData reading without a schema library (see contact-fields.ts). */

export const HONEYPOT_FIELD = 'website';

/** Reads the form fields from FormData. A checkbox is present as "on" only when ticked. */
export function readRateAlertFormData(formData: FormData): Record<string, unknown> {
  const text = (name: string): string => {
    const value = formData.get(name);
    return typeof value === 'string' ? value : '';
  };
  return {
    email: text('email'),
    alertsConsent: formData.get('alertsConsent') === 'on' ? true : false,
    marketingConsent: formData.get('marketingConsent') === 'on',
  };
}
