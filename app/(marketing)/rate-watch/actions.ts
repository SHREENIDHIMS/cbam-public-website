'use server';

import { submitRateAlert } from '@/lib/forms/submit';
import type { FormState } from '@/lib/forms/state';

/** Server action for the rate-watch alert form. Next checks Origin against Host for CSRF. */
export async function subscribeRateAlertAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return submitRateAlert(formData);
}
