import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CtaTracker } from '@/components/conversion/CtaTracker';
import { setAnalyticsProvider } from '@/lib/analytics';
import { ctaAttributes, signInAttributes } from '@/lib/analytics/attributes';
import { noopProvider } from '@/lib/analytics/providers/noop';

afterEach(() => setAnalyticsProvider(noopProvider));

describe('CtaTracker', () => {
  it('reports a CTA click with only its location and name', async () => {
    const provider = { track: vi.fn() };
    setAnalyticsProvider(provider);
    render(
      <>
        <CtaTracker />
        <a href="#x" {...ctaAttributes({ location: 'hero', cta: 'check_exposure' })}>
          <span>Check my exposure</span>
        </a>
      </>,
    );
    await userEvent.click(screen.getByText('Check my exposure'));
    expect(provider.track).toHaveBeenCalledOnce();
    expect(provider.track).toHaveBeenCalledWith({
      name: 'cta_click',
      properties: { location: 'hero', cta: 'check_exposure' },
    });
  });

  it('reports sign-in clicks as their own event', async () => {
    const provider = { track: vi.fn() };
    setAnalyticsProvider(provider);
    render(
      <>
        <CtaTracker />
        <a href="#x" {...signInAttributes({ location: 'header' })}>
          Sign in
        </a>
      </>,
    );
    await userEvent.click(screen.getByText('Sign in'));
    expect(provider.track).toHaveBeenCalledWith({
      name: 'sign_in_click',
      properties: { location: 'header' },
    });
  });

  it('drops marked links whose attributes are outside the allowed lists, and ignores other links', async () => {
    const provider = { track: vi.fn() };
    setAnalyticsProvider(provider);
    render(
      <>
        <CtaTracker />
        <a href="#x" data-cta="jane@example.test" data-cta-location="hero">
          Bad
        </a>
        <a href="#y">Plain</a>
      </>,
    );
    await userEvent.click(screen.getByText('Bad'));
    await userEvent.click(screen.getByText('Plain'));
    expect(provider.track).not.toHaveBeenCalled();
  });
});
