import { describe, expect, it } from 'vitest';
import { getFaqEntries } from '@/lib/config/faq';
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
  serialiseJsonLd,
} from '@/lib/seo/structured-data';

describe('FAQPage structured data', () => {
  it('is built from the same entries the page renders', () => {
    const entries = getFaqEntries();
    const data = faqPageJsonLd(entries);
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toHaveLength(entries.length);
    expect(data.mainEntity[1]?.acceptedAnswer.text).toBe(entries[1]?.answer);
    expect(data.mainEntity[1]?.acceptedAnswer.text).toContain('£50,000');
  });

  it('escapes characters that could close the script tag', () => {
    const output = serialiseJsonLd({ text: '</script><b>' });
    expect(output).not.toContain('<');
    expect(JSON.parse(output)).toEqual({ text: '</script><b>' });
  });
});

describe('Organization, Article and BreadcrumbList structured data', () => {
  it('builds an Organization with only confirmed fields', () => {
    const data = organizationJsonLd({
      name: 'CBAM Control',
      url: 'https://example.test/',
      description: 'A description.',
    });
    expect(data).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'CBAM Control',
      url: 'https://example.test/',
      description: 'A description.',
    });
    expect(JSON.stringify(data)).not.toContain('to confirm');
  });

  it('builds an Article whose date modified is the reviewed date', () => {
    const data = articleJsonLd({
      title: 'T',
      description: 'D',
      url: 'https://example.test/guides/t',
      reviewedAt: '2026-10-06',
      publisherName: 'CBAM Control',
      sources: [{ title: 'GOV.UK', url: 'https://www.gov.uk/x' }],
    });
    expect(data['@type']).toBe('Article');
    expect(data.dateModified).toBe('2026-10-06');
    expect(data.headline).toBe('T');
    expect(data.citation[0]?.url).toBe('https://www.gov.uk/x');
  });

  it('numbers breadcrumb items from 1', () => {
    const data = breadcrumbJsonLd([
      { name: 'Guides', url: 'https://example.test/guides' },
      { name: 'T', url: 'https://example.test/guides/t' },
    ]);
    expect(data['@type']).toBe('BreadcrumbList');
    expect(data.itemListElement.map((item) => item.position)).toEqual([1, 2]);
  });
});
