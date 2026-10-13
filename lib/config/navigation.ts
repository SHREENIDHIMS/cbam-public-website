import { z } from 'zod';
import { PUBLIC_PATHS, type PublicPath } from './routes';

/** Header, mobile and footer navigation. Labels and order live here only. */

export const PRIMARY_CTA_LABEL = 'Check my exposure';
export const PRIMARY_CTA_HREF: PublicPath = '/exposure-check';
export const SIGN_IN_LABEL = 'Sign in';

export interface NavItem {
  label: string;
  href: PublicPath;
}

export interface FooterGroup {
  title: string;
  items: readonly NavItem[];
}

export const CENTRE_NAV: readonly NavItem[] = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Check exposure', href: '/exposure-check' },
  { label: 'Sectors', href: '/sectors' },
  { label: 'Guides', href: '/guides' },
  { label: 'Rate watch', href: '/rate-watch' },
];

export const RIGHT_NAV: readonly NavItem[] = [
  { label: 'For brokers', href: '/for-brokers' },
  { label: 'Pricing', href: '/pricing' },
];

export const FOOTER_GROUPS: readonly FooterGroup[] = [
  {
    title: 'Tools',
    items: [
      { label: 'Exposure check', href: '/exposure-check' },
      { label: 'Quick estimate', href: '/quick-estimate' },
      { label: 'Threshold checker', href: '/threshold-checker' },
      { label: 'Liability preview', href: '/liability-preview' },
      { label: 'Worked example', href: '/worked-example' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Guides', href: '/guides' },
      { label: 'Sectors', href: '/sectors' },
      { label: 'Carbon price relief', href: '/carbon-price-relief' },
      { label: 'Rate watch', href: '/rate-watch' },
      { label: 'Rules changelog', href: '/rules-changelog' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'For brokers', href: '/for-brokers' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Security', href: '/security' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Data processing', href: '/data-processing' },
    ],
  },
];

export const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.enum(PUBLIC_PATHS),
});
