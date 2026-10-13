import { z } from 'zod';

/**
 * Single list of public routes, used by the sitemap, navigation tests and E2E.
 * `available` is false while a route is only a holding page; those routes are
 * noindex and are left out of the sitemap until their phase ships.
 */

export const routeSchema = z.object({
  path: z.string().regex(/^\/[a-z0-9\-/]*$/),
  title: z.string().min(1),
  description: z.string().min(1),
  available: z.boolean(),
  noindex: z.boolean(),
  changeFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  priority: z.number().min(0).max(1),
});
export type PublicRoute = z.infer<typeof routeSchema> & { path: PublicPath };

export const PUBLIC_PATHS = [
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
  '/for-brokers',
  '/pricing',
  '/security',
  '/privacy',
  '/terms',
  '/data-processing',
  '/rules-changelog',
] as const;
export type PublicPath = (typeof PUBLIC_PATHS)[number];

type RouteSeed = Omit<PublicRoute, 'path'>;

const SEEDS: Record<PublicPath, RouteSeed> = {
  '/': {
    title: 'Home',
    description: 'Understand your UK CBAM exposure and see where you stand.',
    available: true,
    noindex: false,
    changeFrequency: 'weekly',
    priority: 1,
  },
  '/exposure-check': {
    title: 'Check exposure',
    description: 'Choose a quick estimate or upload customs data to see your CBAM position.',
    available: true,
    noindex: false,
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  '/quick-estimate': {
    title: 'Quick estimate',
    description: 'A five-step estimate of where you stand against the registration threshold.',
    available: true,
    noindex: false,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  '/liability-preview': {
    title: 'Liability preview',
    description: 'Upload customs data and preview scope, exposure and supplier coverage.',
    available: true,
    noindex: false,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  '/threshold-checker': {
    title: 'Threshold checker',
    description: 'Test your imports against the look-back and forward-looking registration tests.',
    available: true,
    noindex: false,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  '/how-it-works': {
    title: 'How it works',
    description: 'How customs data and supplier emissions data become a clear CBAM position.',
    available: true,
    noindex: false,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  '/sectors': {
    title: 'Sectors',
    description: 'The sectors in scope for UK CBAM and what each one needs.',
    available: true,
    noindex: false,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  '/carbon-price-relief': {
    title: 'Carbon price relief',
    description: 'How relief for a carbon price already paid is intended to work.',
    available: true,
    noindex: false,
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  '/rate-watch': {
    title: 'Rate watch',
    description: 'Official and scenario carbon rates, with sources and dates.',
    available: true,
    noindex: false,
    changeFrequency: 'weekly',
    priority: 0.6,
  },
  '/guides': {
    title: 'Guides',
    description: 'Sourced guides to UK CBAM for importers and brokers.',
    available: true,
    noindex: false,
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  '/worked-example': {
    title: 'Worked example',
    description: 'A fictional importer taken from ledger to preview, step by step.',
    available: true,
    noindex: false,
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  '/for-brokers': {
    title: 'For brokers',
    description: 'A portfolio view for brokers and partners supporting several importers.',
    available: true,
    noindex: false,
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  '/pricing': {
    title: 'Pricing',
    description: 'Plans for importers and for brokers and partners.',
    available: true,
    noindex: false,
    changeFrequency: 'monthly',
    priority: 0.5,
  },
  '/security': {
    title: 'Security',
    description: 'How the public tools handle your data and what stays in your browser.',
    available: true,
    noindex: false,
    changeFrequency: 'yearly',
    priority: 0.4,
  },
  '/privacy': {
    title: 'Privacy',
    description: 'Privacy notice for the public website and tools.',
    available: true,
    noindex: false,
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  '/terms': {
    title: 'Terms',
    description: 'Terms of use for the public website and tools.',
    available: true,
    noindex: false,
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  '/data-processing': {
    title: 'Data processing',
    description: 'What happens to data you provide to the public tools.',
    available: true,
    noindex: false,
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  '/rules-changelog': {
    title: 'Rules changelog',
    description: 'Every change to the public rules snapshot, with dates and affected values.',
    available: true,
    noindex: false,
    changeFrequency: 'weekly',
    priority: 0.5,
  },
};

export const PUBLIC_ROUTES: readonly PublicRoute[] = PUBLIC_PATHS.map((path) => ({
  path,
  ...SEEDS[path],
}));

export function getRoute(path: PublicPath): PublicRoute {
  const route = PUBLIC_ROUTES.find((candidate) => candidate.path === path);
  if (!route) throw new Error(`Unknown route ${path}`);
  return route;
}

/** Routes that appear in the sitemap: built and indexable. */
export const SITEMAP_ROUTES: readonly PublicRoute[] = PUBLIC_ROUTES.filter(
  (route) => route.available && !route.noindex,
);
