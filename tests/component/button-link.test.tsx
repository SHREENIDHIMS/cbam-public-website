import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ButtonLink, isExternalHref } from '@/components/shared/ButtonLink';

describe('ButtonLink', () => {
  it('renders an internal link without target or external hint', () => {
    render(<ButtonLink href="/exposure-check">Check my exposure</ButtonLink>);
    const link = screen.getByRole('link', { name: 'Check my exposure' });
    expect(link).toHaveAttribute('href', '/exposure-check');
    expect(link).not.toHaveAttribute('target');
  });

  it('opens external links in a new tab with safe rel and a hidden hint', () => {
    render(<ButtonLink href="https://www.gov.uk/example">GOV.UK</ButtonLink>);
    const link = screen.getByRole('link', { name: /GOV\.UK/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent('(opens in new tab)');
  });

  it('treats mailto links as external without a new tab', () => {
    render(<ButtonLink href="mailto:someone@example.test">Email</ButtonLink>);
    expect(screen.getByRole('link', { name: /Email/ })).not.toHaveAttribute('target');
    expect(isExternalHref('mailto:a@b.test')).toBe(true);
    expect(isExternalHref('/guides')).toBe(false);
  });
});
