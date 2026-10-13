'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import type { AnalyticsEvent } from '@/lib/analytics/events';

/**
 * Reports clicks on links marked with the data attributes from lib/analytics/attributes.ts. It
 * reads only the cta, location and event names; track() drops anything outside the allowed lists.
 */
export function CtaTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;
      const element = target?.closest('[data-cta], [data-cta-event]');
      if (!element) return;
      const location = element.getAttribute('data-cta-location');
      if (element.getAttribute('data-cta-event') === 'sign_in_click') {
        track({ name: 'sign_in_click', properties: { location } } as AnalyticsEvent);
        return;
      }
      track({
        name: 'cta_click',
        properties: { location, cta: element.getAttribute('data-cta') },
      } as AnalyticsEvent);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
