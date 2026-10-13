import { isValidEvent, type AnalyticsEvent } from './events';
import { debugProvider } from './providers/debug';
import { noopProvider } from './providers/noop';

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): void;
}

let provider: AnalyticsProvider =
  process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true' ? debugProvider : noopProvider;

export function setAnalyticsProvider(next: AnalyticsProvider) {
  provider = next;
}

/** Drops events that do not match the allowed list, then forwards the rest to the provider. */
export function track(event: AnalyticsEvent): boolean {
  if (!isValidEvent(event.name, event.properties)) return false;
  provider.track({ name: event.name, properties: { ...event.properties } } as AnalyticsEvent);
  return true;
}
