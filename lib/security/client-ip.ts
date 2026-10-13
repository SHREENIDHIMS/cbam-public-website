/** First hop of x-forwarded-for, falling back to x-real-ip, then "unknown". */
export function getClientIp(headers: Pick<Headers, 'get'>): string {
  const forwarded = headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  if (first) return first;
  return headers.get('x-real-ip')?.trim() || 'unknown';
}
