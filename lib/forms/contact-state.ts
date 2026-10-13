import type { ContactFieldErrors } from '@/lib/validation/contact';

/** State returned by the contact server action. Plain data so it can cross the server boundary. */
export type ContactFormState =
  | { status: 'idle' }
  | { status: 'success'; demo: boolean }
  | {
      status: 'error';
      /** Field problems the visitor can fix. Empty when the failure is not about a field. */
      fieldErrors: ContactFieldErrors;
      /** A form-level message, for example when the service is unavailable or rate limited. */
      message?: string;
      /** The values that were typed, so a failed submit does not clear the form. */
      values: { name: string; email: string; company: string; message: string };
    };

export const INITIAL_CONTACT_STATE: ContactFormState = { status: 'idle' };
