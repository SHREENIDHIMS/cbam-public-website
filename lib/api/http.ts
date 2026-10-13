import 'server-only';
import type { z } from 'zod';
import { env } from '@/lib/config/env';
import { ApiError } from './errors';

interface RequestOptions<S extends z.ZodType> {
  method: string;
  path: string;
  schema: S;
  body?: unknown;
}

/**
 * Live fetch wrapper: explicit timeout, optional bearer credential, error mapping and schema parse.
 * No endpoint paths are defined in Phase 1; mapping happens in Phase 6.
 */
export async function liveRequest<S extends z.ZodType>({
  method,
  path,
  schema,
  body,
}: RequestOptions<S>): Promise<z.infer<S>> {
  if (!env.CBAM_API_URL) throw new ApiError('not_configured', path);

  let response: Response;
  try {
    response = await fetch(new URL(path, env.CBAM_API_URL), {
      method,
      cache: 'no-store',
      signal: AbortSignal.timeout(env.CBAM_API_TIMEOUT_MS),
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(env.CBAM_API_KEY ? { Authorization: `Bearer ${env.CBAM_API_KEY}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new ApiError('timeout', path);
    }
    throw new ApiError('unavailable', path);
  }

  if (response.status === 404) throw new ApiError('not_found', path);
  if (response.status === 429) throw new ApiError('rate_limited', path);
  if (response.status >= 500) throw new ApiError('unavailable', path);
  if (!response.ok) throw new ApiError('rejected', path);

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ApiError('invalid_response', path);
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) throw new ApiError('invalid_response', path);
  return parsed.data;
}
