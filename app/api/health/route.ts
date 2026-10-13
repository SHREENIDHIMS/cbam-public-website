import { env } from '@/lib/config/env';
import { rules } from '@/lib/config/rules';

export const dynamic = 'force-dynamic';

/** Liveness check. Reports the adapter mode and the rules snapshot, never any visitor data. */
export function GET() {
  return Response.json(
    { mode: env.PUBLIC_API_MODE, rulesVersion: rules.rulesVersion },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
