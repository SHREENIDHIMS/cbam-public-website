'use server';

import type { ContactFormState } from '@/lib/forms/contact-state';
import { handleContactSubmission } from '@/lib/forms/submit-contact';

/** General pricing enquiry. The shared handler does the honeypot, rate limit and validation. */
export async function submitPricingContact(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  return handleContactSubmission('general', formData);
}
