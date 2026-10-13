import 'server-only';
import { ApiError } from './errors';
import { buildGuideMethods } from './guide-methods';
import { ADAPTER_METHODS, type PublicApiAdapter } from './types';

/**
 * Live adapter. Every method throws `not_configured` until Phase 6 maps the real backend contract.
 * No endpoint is invented here, and live mode never falls back to fixtures.
 */
const notConfigured = (method: string) => async (): Promise<never> => {
  throw new ApiError('not_configured', method);
};

const unconfigured = Object.fromEntries(
  ADAPTER_METHODS.map((method) => [method, notConfigured(method)]),
) as unknown as PublicApiAdapter;

/**
 * Guides are local content and are served in live mode too (MASTER_PROMPT 18) unless the existing
 * backend is confirmed to own them. Every other method stays unconfigured until Phase 6.
 */
export const liveAdapter: PublicApiAdapter = {
  ...unconfigured,
  ...buildGuideMethods('live'),
};
