import type { FaqEntry } from '@/lib/config/faq';

/** JSON-LD builders. The FAQPage is generated from the same entries the page renders. */

export function faqPageJsonLd(entries: readonly FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

export interface OrganizationJsonLdInput {
  name: string;
  url: string;
  description: string;
}

/** schema.org Organization. Only the brand, URL and description: no unconfirmed legal details. */
export function organizationJsonLd(input: OrganizationJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name,
    url: input.url,
    description: input.description,
  };
}

export interface ArticleJsonLdInput {
  title: string;
  description: string;
  url: string;
  reviewedAt: string;
  publisherName: string;
  sources: readonly { title: string; url: string }[];
}

/** schema.org Article for a guide. The reviewed date is the date modified. */
export function articleJsonLd(input: ArticleJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: input.url,
    mainEntityOfPage: input.url,
    dateModified: input.reviewedAt,
    inLanguage: 'en-GB',
    author: { '@type': 'Organization', name: input.publisherName },
    publisher: { '@type': 'Organization', name: input.publisherName },
    citation: input.sources.map((source) => ({
      '@type': 'CreativeWork',
      name: source.title,
      url: source.url,
    })),
  };
}

export function breadcrumbJsonLd(items: readonly { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Serialises JSON-LD safely for an inline script tag. */
export function serialiseJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
