import { getAdapter } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { guardRequest, jsonError, jsonOk } from '@/lib/api/route-helpers';
import { previewSessionIdSchema } from '@/lib/api/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
): Promise<Response> {
  const blocked = guardRequest(request, 'toolCalls');
  if (blocked) return blocked;

  const { sessionId } = await context.params;
  if (!previewSessionIdSchema.safeParse(sessionId).success) return jsonError('not_found');

  try {
    return jsonOk(await getAdapter().getLiabilityPreview(sessionId));
  } catch (error) {
    const code = error instanceof ApiError ? error.code : 'invalid_response';
    console.error('liability-preview GET failed', code);
    return jsonError(code);
  }
}
