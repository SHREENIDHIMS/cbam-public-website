/** API error codes and the user-facing messages from MASTER_PROMPT 34. Never generic. */

export const API_ERROR_CODES = [
  'timeout',
  'unavailable',
  'invalid_response',
  'rejected',
  'rate_limited',
  'not_found',
  'not_configured',
  'not_implemented_fixture',
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export const USER_MESSAGES: Readonly<Record<ApiErrorCode, string>> = {
  timeout:
    'The check took longer than expected and was stopped. Your uploaded file has not been changed. Please try again.',
  unavailable:
    'We could not reach the calculation service. Your uploaded file has not been changed. Please try again in a few minutes.',
  invalid_response:
    'We could not complete the preview because the service returned an unexpected response. Your uploaded file has not been changed.',
  rejected:
    'We could not complete the preview. Your uploaded file has not been changed. Check the file against the requirements and try again.',
  rate_limited:
    'You have made several requests in a short time. Please wait a few minutes and try again.',
  not_found:
    'We could not find that result. It may have expired. Run the check again to get a new one.',
  not_configured:
    'The live calculation service is not connected yet, so this check is unavailable. Nothing has been calculated.',
  not_implemented_fixture:
    'This check is not available in demo mode yet. Nothing has been calculated.',
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly method: string | undefined;

  constructor(code: ApiErrorCode, method?: string) {
    super(method ? `${code} (${method})` : code);
    this.name = 'ApiError';
    this.code = code;
    this.method = method;
  }

  get userMessage(): string {
    return USER_MESSAGES[this.code];
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) return error.userMessage;
  return 'We could not complete that request. Nothing has been changed. Please try again.';
}

/** Page-level copy for server-rendered pages that need the service just to render (not an upload). */
const PAGE_MESSAGES: Readonly<Record<ApiErrorCode, string>> = {
  ...USER_MESSAGES,
  timeout:
    'The service took longer than expected to respond, so this page could not load its data. Nothing you entered has been changed. Please try again.',
  unavailable:
    'We could not reach the service that supplies this page. Nothing you entered has been changed. Please try again in a few minutes.',
  invalid_response:
    'The service returned an unexpected response, so this page could not load its data. Nothing has been calculated. Please try again later.',
  rejected:
    'The service did not accept the request for this page. Nothing has been calculated. Please try again later.',
  not_found:
    'We could not find the data for this page. Nothing has been calculated. Please try again later.',
};

export function toPageMessage(error: unknown): string {
  if (error instanceof ApiError) return PAGE_MESSAGES[error.code];
  return 'We could not load the data for this page. Nothing you entered has been changed. Please try again.';
}
