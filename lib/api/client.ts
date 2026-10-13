import 'server-only';
import { env } from '@/lib/config/env';
import { fixtureAdapter } from './fixture-adapter';
import { liveAdapter } from './live-adapter';
import type { PublicApiAdapter } from './types';

/** The single switch point between fixture and live adapters. */
export function getAdapter(mode: 'fixture' | 'live' = env.PUBLIC_API_MODE): PublicApiAdapter {
  return mode === 'live' ? liveAdapter : fixtureAdapter;
}
