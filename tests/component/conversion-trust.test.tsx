import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/components/conversion/ContactForm';
import { DraftNotice } from '@/components/legal/LegalPage';
import DataProcessingPage from '@/app/(marketing)/data-processing/page';
import PricingPage from '@/app/(marketing)/pricing/page';
import PrivacyPage from '@/app/(marketing)/privacy/page';
import TermsPage from '@/app/(marketing)/terms/page';
import SecurityPage from '@/app/(marketing)/security/page';
import { siteConfig } from '@/lib/config/site';
import { renderWithMantine } from '../utils/render';

vi.mock('@/app/(marketing)/pricing/actions', () => ({ submitPricingContact: vi.fn() }));
vi.mock('@/app/(marketing)/for-brokers/actions', () => ({ submitBrokerContact: vi.fn() }));

describe('contact form', () => {
  it('shows field errors and does not call the action when invalid', async () => {
    const action = vi.fn();
    renderWithMantine(<ContactForm action={action} kind="broker" label="Talk to us" />);
    // The validator loads after hydration; wait for it, as a visitor's first click would.
    await import('@/lib/validation/contact');
    await new Promise((resolve) => setTimeout(resolve, 0));
    await userEvent.click(screen.getByRole('button', { name: 'Send request' }));
    expect(await screen.findByText('Please check the form')).toBeInTheDocument();
    expect(screen.getAllByText('Enter your name.').length).toBeGreaterThan(0);
    expect(action).not.toHaveBeenCalled();
  });

  it('keeps marketing consent unticked and separate', () => {
    renderWithMantine(<ContactForm action={vi.fn()} kind="broker" label="Talk to us" />);
    expect(screen.getByRole('checkbox', { name: /occasional updates/ })).not.toBeChecked();
  });

  it('includes a hidden honeypot field', () => {
    const { container } = renderWithMantine(
      <ContactForm action={vi.fn()} kind="broker" label="Talk to us" />,
    );
    const trap = container.querySelector('input[name="website"]');
    expect(trap).not.toBeNull();
    expect(trap).toHaveAttribute('tabindex', '-1');
  });
});

describe('pricing page', () => {
  it('shows "Talk to us" for every unpriced plan and no scarcity language', () => {
    const { container } = renderWithMantine(<PricingPage />);
    const prices = screen.getAllByTestId('plan-price');
    expect(prices).toHaveLength(2);
    for (const price of prices) expect(price).toHaveTextContent('Talk to us');
    expect(container.textContent).not.toMatch(/limited time|only \d+ left|hurry|countdown ends/i);
  });
});

describe('legal pages', () => {
  it('show the draft notice while site.ts has not approved them', () => {
    expect(siteConfig.legal.privacy.approved).toBe(false);
    for (const Page of [PrivacyPage, TermsPage, DataProcessingPage]) {
      const { unmount } = renderWithMantine(<Page />);
      expect(screen.getByText('Draft — pending legal review')).toBeInTheDocument();
      unmount();
    }
  });

  it('hides the notice for an approved page', () => {
    const original = siteConfig.legal.terms.approved;
    siteConfig.legal.terms.approved = true;
    const { container } = renderWithMantine(<DraftNotice legalKey="terms" />);
    expect(container.querySelector('[role="status"]')).toBeNull();
    siteConfig.legal.terms.approved = original;
  });

  it('claims no certification or approval', () => {
    const forbidden =
      /GDPR[- ]certified|HMRC[- ]approved|guaranteed compliant|ISO ?27001 certified|SOC ?2 (certified|compliant)/i;
    for (const Page of [PrivacyPage, TermsPage, DataProcessingPage, SecurityPage, PricingPage]) {
      const { container, unmount } = renderWithMantine(<Page />);
      expect(container.textContent).not.toMatch(forbidden);
      unmount();
    }
  });

  it('data-processing states the actual upload behaviour', () => {
    const { container } = renderWithMantine(<DataProcessingPage />);
    const text = container.textContent ?? '';
    expect(text).toMatch(/file itself is not sent/);
    expect(text).toMatch(/only the mapped columns of the rows that passed the checks/);
    expect(text).toMatch(/retention[^.]*to be confirmed/i);
  });
});
