import { describe, expect, it } from 'vitest';
import { readLimitedText } from '@/lib/api/route-helpers';

function request(body: string | ReadableStream<Uint8Array>) {
  return new Request('http://localhost/api/x', {
    method: 'POST',
    body,
    // @ts-expect-error duplex is required by Node for stream bodies
    duplex: 'half',
  });
}

describe('readLimitedText', () => {
  it('returns the text when it is within the limit', async () => {
    expect(await readLimitedText(request('{"a":1}'), 100)).toBe('{"a":1}');
  });

  it('returns null as soon as the body passes the limit, even without a content-length', async () => {
    let pulled = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled += 1;
        controller.enqueue(new Uint8Array(1024).fill(97));
        if (pulled > 1000) controller.close();
      },
    });
    expect(await readLimitedText(request(stream), 4096)).toBeNull();
    expect(pulled).toBeLessThan(50);
  });
});
