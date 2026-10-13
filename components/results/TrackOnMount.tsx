'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import type { AnalyticsEvent } from '@/lib/analytics/events';

/** Fires one analytics event when the result is first shown. Renders nothing. */
export function TrackOnMount({ event }: { event: AnalyticsEvent }) {
  const key = JSON.stringify(event);
  useEffect(() => {
    track(JSON.parse(key) as AnalyticsEvent);
  }, [key]);
  return null;
}
