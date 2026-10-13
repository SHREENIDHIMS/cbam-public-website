import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { liveAdapter } from '@/lib/api/live-adapter';
import { USER_MESSAGES } from '@/lib/api/errors';

// Live mode with no backend connected: every adapter method throws not_configured.
vi.mock('@/lib/api/client', () => ({ getAdapter: () => liveAdapter }));
vi.mock('next/cache', () => ({ unstable_noStore: vi.fn() }));

const NOT_CONFIGURED = USER_MESSAGES.not_configured;

describe('live mode without a connected service', () => {
  it('rate watch shows an error state with the not-connected message, not demo data', async () => {
    const { default: RateWatchPage } = await import('@/app/(marketing)/rate-watch/page');
    render(await RateWatchPage());
    expect(screen.getByRole('alert')).toHaveTextContent(NOT_CONFIGURED);
    expect(
      screen.getByRole('heading', { level: 1, name: /Rate watch could not load/ }),
    ).toBeVisible();
    expect(screen.queryByText(/Demo data/i)).toBeNull();
  });

  it('quick estimate shows an error state', async () => {
    const { default: Page } = await import('@/app/(marketing)/quick-estimate/page');
    render(await Page({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole('alert')).toHaveTextContent(NOT_CONFIGURED);
  });

  it('threshold checker shows an error state', async () => {
    const { default: Page } = await import('@/app/(marketing)/threshold-checker/page');
    render(await Page());
    expect(screen.getByRole('alert')).toHaveTextContent(NOT_CONFIGURED);
  });

  it('liability preview shows an error state', async () => {
    const { default: Page } = await import('@/app/(marketing)/liability-preview/page');
    render(await Page());
    expect(screen.getByRole('alert')).toHaveTextContent(NOT_CONFIGURED);
  });

  it('worked example shows an error state', async () => {
    const { default: Page } = await import('@/app/(marketing)/worked-example/page');
    render(await Page());
    expect(screen.getByRole('alert')).toHaveTextContent(NOT_CONFIGURED);
  });

  it('the liability result page shows an error state for an unknown preview', async () => {
    const { default: Page } =
      await import('@/app/(marketing)/liability-preview/result/[sessionId]/page');
    render(await Page({ params: Promise.resolve({ sessionId: 'abc' }) }));
    expect(screen.getByRole('alert')).toHaveTextContent(NOT_CONFIGURED);
  });
});
