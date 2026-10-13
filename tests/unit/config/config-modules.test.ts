import { describe, expect, it } from 'vitest';
import { getFaqEntries } from '@/lib/config/faq';
import {
  CENTRE_NAV,
  FOOTER_GROUPS,
  PRIMARY_CTA_LABEL,
  RIGHT_NAV,
  navItemSchema,
} from '@/lib/config/navigation';
import { PRICING_PLANS, priceLabel } from '@/lib/config/pricing';
import { rules } from '@/lib/config/rules';
import { PUBLIC_PATHS, PUBLIC_ROUTES, SITEMAP_ROUTES, routeSchema } from '@/lib/config/routes';
import { SECTOR_CONTENT, sectorContentSchema } from '@/lib/config/sectors';
import { toolsConfig, toolsConfigSchema } from '@/lib/config/tools';

describe('navigation', () => {
  it('uses one primary CTA label', () => {
    expect(PRIMARY_CTA_LABEL).toBe('Check my exposure');
  });

  it('only links to known public routes', () => {
    const all = [...CENTRE_NAV, ...RIGHT_NAV, ...FOOTER_GROUPS.flatMap((group) => group.items)];
    for (const item of all) expect(navItemSchema.parse(item).href).toBeDefined();
  });

  it('orders the centre items as specified', () => {
    expect(CENTRE_NAV.map((item) => item.label)).toEqual([
      'How it works',
      'Check exposure',
      'Sectors',
      'Guides',
      'Rate watch',
    ]);
  });
});

describe('routes', () => {
  it('lists every public path once and validates entries', () => {
    expect(PUBLIC_ROUTES.map((route) => route.path)).toEqual([...PUBLIC_PATHS]);
    expect(new Set(PUBLIC_PATHS).size).toBe(PUBLIC_PATHS.length);
    for (const route of PUBLIC_ROUTES) routeSchema.parse(route);
  });

  it('keeps holding pages out of the sitemap', () => {
    const paths = SITEMAP_ROUTES.map((route) => route.path);
    for (const route of PUBLIC_ROUTES) {
      expect(paths.includes(route.path), route.path).toBe(route.available && !route.noindex);
    }
    for (const built of [
      '/',
      '/exposure-check',
      '/quick-estimate',
      '/liability-preview',
      '/threshold-checker',
      '/how-it-works',
      '/sectors',
      '/carbon-price-relief',
      '/rate-watch',
      '/guides',
      '/worked-example',
      '/rules-changelog',
      '/for-brokers',
      '/pricing',
      '/security',
      '/privacy',
      '/terms',
      '/data-processing',
    ]) {
      expect(paths).toContain(built);
    }
  });
});

describe('pricing', () => {
  it('has importer and broker plans with no approved price', () => {
    expect(PRICING_PLANS.map((plan) => plan.key)).toEqual(['importer', 'broker_partner']);
    for (const plan of PRICING_PLANS) {
      expect(plan.price).toBeNull();
      expect(priceLabel(plan)).toBe('Talk to us');
    }
  });
});

describe('tools config', () => {
  it('validates and labels guidance bands as non-statutory', () => {
    toolsConfigSchema.parse(toolsConfig);
    expect(toolsConfig.thresholdGuidanceBands.label).toMatch(/not a statutory value/);
    expect(toolsConfig.upload.maxFileBytes).toBe(10 * 1024 * 1024);
    expect(toolsConfig.upload.maxDataRows).toBe(5000);
    expect(toolsConfig.quickEstimate.valueBands).toHaveLength(7);
  });
});

describe('sectors', () => {
  it('has content for every sector in rules', () => {
    for (const sector of rules.sectors.value ?? []) {
      expect(sectorContentSchema.parse(SECTOR_CONTENT[sector.key]).key).toBe(sector.key);
    }
  });
});

describe('faq', () => {
  it('interpolates the threshold and start date from rules', () => {
    const entries = getFaqEntries();
    const threshold = entries.find((entry) => entry.question.includes('threshold'));
    expect(threshold?.answer).toContain('£50,000');
    expect(entries[0]?.answer).toContain('1 January 2027');
  });

  it('falls back to "to be confirmed" when a value is missing', () => {
    const entries = getFaqEntries({
      ...rules,
      registrationThreshold: { ...rules.registrationThreshold, value: null },
      startDate: { ...rules.startDate, value: null },
    });
    expect(entries[1]?.answer).toContain('to be confirmed');
    expect(entries[1]?.answer).not.toContain('£');
  });
});

describe('faq sources', () => {
  it('attaches the rules source and status to answers that rely on a rules value', () => {
    const entries = getFaqEntries();
    const withSource = entries.filter((entry) => entry.source);
    expect(withSource.map((entry) => entry.question)).toEqual([
      'What is UK CBAM?',
      'Does the registration threshold apply to every import?',
      'Which goods are covered?',
      'What is carbon price relief?',
    ]);
    for (const entry of withSource) {
      expect(entry.source?.status).toBe('official');
      expect(entry.source?.url).toMatch(/^https:\/\//);
    }
  });
});
