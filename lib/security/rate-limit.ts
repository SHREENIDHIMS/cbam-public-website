import { createHash } from 'node:crypto';

/** In-memory fixed-window limiter. Per instance only; live mode relies on backend limits too. */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  max: number;
  windowMs: number;
  now?: number;
  disabled?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimitKey(ip: string, route: string): string {
  return createHash('sha256').update(`${ip}|${route}`).digest('hex');
}

export function checkRateLimit(
  ip: string,
  route: string,
  { max, windowMs, now = Date.now(), disabled = false }: RateLimitOptions,
): RateLimitResult {
  if (disabled) return { allowed: true, remaining: max, retryAfterSeconds: 0 };

  const key = rateLimitKey(ip, route);
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { allowed: true, remaining: max - existing.count, retryAfterSeconds: 0 };
}

export function resetRateLimits() {
  buckets.clear();
}
