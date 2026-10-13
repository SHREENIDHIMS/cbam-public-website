/** State returned by a form server action. Plain data so it crosses the server/client boundary. */

export interface FormState {
  status: 'idle' | 'success' | 'error';
  /** Message to show for success or a form-level error. */
  message?: string;
  /** Field name to message, set on validation failure. */
  fieldErrors?: Partial<Record<string, string>>;
  /** Non-sensitive values to put back in the form after an error, because React resets it. */
  values?: Partial<Record<string, string>>;
  /** True when the adapter is in demo (fixture) mode, so the page can say nothing was sent. */
  demo?: boolean;
}

export const INITIAL_FORM_STATE: FormState = { status: 'idle' };
