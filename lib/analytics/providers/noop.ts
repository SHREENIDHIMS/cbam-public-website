import type { AnalyticsProvider } from '../index';

/** Default provider. Does nothing, stores nothing. */
export const noopProvider: AnalyticsProvider = { track() {} };
