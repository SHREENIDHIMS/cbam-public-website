'use server';

import type { ContactFormState } from '@/lib/forms/contact-state';
import { handleContactSubmission } from '@/lib/forms/submit-contact';

/** Broker and partner request. The shared handler does the honeypot, rate limit and validation. */
export async function submitBrokerContact(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  return handleContactSubmission('broker', formData);
}
