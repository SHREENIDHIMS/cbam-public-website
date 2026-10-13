import { getAdapter } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { guardRequest, jsonError, jsonOk, readLimitedText } from '@/lib/api/route-helpers';
import { createLiabilityPreviewInputSchema } from '@/lib/api/schemas';
import { toolsConfig } from '@/lib/config/tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Creates a liability preview from mapped, validated rows. The request body holds business data,
 * so it is never logged: failures record an error code and nothing else.
 */
export async function POST(request: Request): Promise<Response> {
  const blocked = guardRequest(request, 'liabilityPreview');
  if (blocked) return blocked;

  const { maxJsonBodyBytes } = toolsConfig.upload;
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > maxJsonBodyBytes) return jsonError('rejected', 413);

  let text: string | null;
  try {
    text = await readLimitedText(request, maxJsonBodyBytes);
  } catch {
    return jsonError('rejected', 400);
  }
  if (text === null) return jsonError('rejected', 413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return jsonError('rejected', 400);
  }
  const parsed = createLiabilityPreviewInputSchema.safeParse(body);
  if (!parsed.success) return jsonError('rejected', 400);

  try {
    return jsonOk(await getAdapter().createLiabilityPreview(parsed.data));
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('liability-preview POST failed', error.code);
      return jsonError(error.code);
    }
    console.error('liability-preview POST failed', 'invalid_response');
    return jsonError('invalid_response');
  }
}
