/**
 * Rejects cross-origin POSTs. A request passes when Origin is absent, or when it matches
 * the configured site origin or the request host.
 */
export function isSameOrigin(headers: Pick<Headers, 'get'>, siteUrl: string): boolean {
  const origin = headers.get('origin');
  if (!origin) return true;

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  if (originUrl.origin === new URL(siteUrl).origin) return true;

  const host = headers.get('x-forwarded-host') ?? headers.get('host');
  return host !== null && originUrl.host === host;
}
