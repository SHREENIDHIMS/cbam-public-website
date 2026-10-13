import type { AnalyticsProvider } from '../index';

/** Logs validated events to the console in development. */
export const debugProvider: AnalyticsProvider = {
  track(event) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[analytics]', event.name, event.properties);
    }
  },
};
