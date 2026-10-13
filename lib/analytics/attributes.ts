import type { AnalyticsEvent } from './events';

type CtaProperties = Extract<AnalyticsEvent, { name: 'cta_click' }>['properties'];
type SignInProperties = Extract<AnalyticsEvent, { name: 'sign_in_click' }>['properties'];

/**
 * Data attributes that mark a link as a tracked call to action. One delegated listener
 * (CtaTracker) reads them, so server-rendered links need no client component of their own.
 */
export function ctaAttributes({ location, cta }: CtaProperties) {
  return { 'data-cta': cta, 'data-cta-location': location } as const;
}

export function signInAttributes({ location }: SignInProperties) {
  return { 'data-cta-event': 'sign_in_click', 'data-cta-location': location } as const;
}
