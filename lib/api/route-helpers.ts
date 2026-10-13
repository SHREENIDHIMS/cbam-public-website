import 'server-only';
import { env } from '@/lib/config/env';
import { publicEnv } from '@/lib/config/public-env';
import { toolsConfig } from '@/lib/config/tools';
import { getClientIp } from '@/lib/security/client-ip';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { isSameOrigin } from '@/lib/security/same-origin';
import { USER_MESSAGES, type ApiErrorCode } from './errors';

const STATUS_FOR_CODE: Record<ApiErrorCode, number> = {
  timeout: 504,
  unavailable: 503,
  invalid_response: 502,
  rejected: 422,
  rate_limited: 429,
  not_found: 404,
  not_configured: 503,
  not_implemented_fixture: 501,
};

export function statusForApiError(code: ApiErrorCode): number {
  return STATUS_FOR_CODE[code];
}

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

export function jsonOk(body: unknown): Response {
  return Response.json(body, { headers: NO_STORE });
}

/** An error body with the user-facing message for the code. Never echoes request content. */
export function jsonError(
  code: ApiErrorCode,
  status: number = statusForApiError(code),
  extraHeaders: Record<string, string> = {},
): Response {
  return Response.json(
    { error: { code, message: USER_MESSAGES[code] } },
    { status, headers: { ...NO_STORE, ...extraHeaders } },
  );
}

/**
 * Reads the request body as text but stops as soon as it passes the limit, so a chunked upload
 * without a content-length cannot make the server buffer an unbounded body. Returns null when over.
 */
export async function readLimitedText(request: Request, maxBytes: number): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let received = 0;
  let text = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

type LimitKey = 'liabilityPreview' | 'toolCalls' | 'forms';

/** Same-origin check (POST only) then the rate limit. Returns a response to send, or null. */
export function guardRequest(request: Request, routeKey: LimitKey): Response | null {
  if (request.method === 'POST' && !isSameOrigin(request.headers, publicEnv.NEXT_PUBLIC_SITE_URL)) {
    return jsonError('rejected', 403);
  }
  const { max, windowMs } = toolsConfig.rateLimits[routeKey];
  const result = checkRateLimit(getClientIp(request.headers), `api:${routeKey}`, {
    max,
    windowMs,
    disabled: env.RATE_LIMIT_DISABLED,
  });
  if (!result.allowed) {
    return jsonError('rate_limited', 429, { 'Retry-After': String(result.retryAfterSeconds) });
  }
  return null;
}
