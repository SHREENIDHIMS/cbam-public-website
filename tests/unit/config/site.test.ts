import { describe, expect, it } from 'vitest';
import { buildHandOffLink, siteConfig, siteConfigSchema } from '@/lib/config/site';

describe('site config', () => {
  it('validates and keeps placeholders flagged', () => {
    expect(siteConfigSchema.parse(siteConfig).brandName).toBe('CBAM Control');
    expect(siteConfig.isPlaceholder).toBe(true);
    expect(siteConfig.legalEntity.name).toContain('to confirm');
  });

  it('keeps every legal page unapproved', () => {
    expect(Object.values(siteConfig.legal).every((page) => page.approved === false)).toBe(true);
  });
});

describe('buildHandOffLink', () => {
  const paths = { signIn: '/login', createWorkspace: '/signup', dashboard: '/app' };

  it('is not configured without an app URL', () => {
    const link = buildHandOffLink('signIn', undefined, paths);
    expect(link.configured).toBe(false);
    expect(link.href).toBeNull();
  });

  it('builds URLs from the configured origin and path', () => {
    const link = buildHandOffLink('createWorkspace', 'https://app.example.test', paths);
    expect(link).toEqual({ configured: true, href: 'https://app.example.test/signup' });
  });
});
