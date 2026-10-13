import { ApiError } from './errors';

export type Attempt<T> = { ok: true; data: T } | { ok: false; error: ApiError };

/**
 * Runs an adapter call and returns the failure instead of throwing, so a server-rendered page can
 * show an error state in place. Unknown errors are treated as the service being unavailable.
 */
export async function attempt<T>(run: () => Promise<T>): Promise<Attempt<T>> {
  try {
    return { ok: true, data: await run() };
  } catch (error) {
    return { ok: false, error: error instanceof ApiError ? error : new ApiError('unavailable') };
  }
}
