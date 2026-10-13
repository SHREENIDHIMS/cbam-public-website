import '@/lib/validation/zod-browser';
import { z } from 'zod';
import { publicEnv } from './public-env';

/** Single home for brand, legal and contact placeholders (MASTER_PROMPT 0.2). */

const LEGAL_PLACEHOLDER = '[Legal entity — to confirm]';
const EMAIL_PLACEHOLDER = '[contact email — to confirm]';

export const siteConfigSchema = z.object({
  brandName: z.string().min(1),
  isPlaceholder: z.boolean(),
  tagline: z.string().min(1),
  description: z.string().min(1),
  legalEntity: z.object({
    name: z.string(),
    companyNumber: z.string(),
    registeredAddress: z.string(),
  }),
  contact: z.object({
    general: z.string(),
    support: z.string(),
    privacy: z.string(),
  }),
  legal: z.object({
    privacy: z.object({ approved: z.boolean() }),
    terms: z.object({ approved: z.boolean() }),
    dataProcessing: z.object({ approved: z.boolean() }),
  }),
  previewClaimSupported: z.boolean(),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

export const siteConfig: SiteConfig = siteConfigSchema.parse({
  brandName: 'CBAM Control',
  isPlaceholder: true,
  tagline: 'Know where you stand on UK CBAM.',
  description:
    'Check your UK CBAM exposure, understand the registration threshold and see how an upload becomes a clear position.',
  legalEntity: {
    name: LEGAL_PLACEHOLDER,
    companyNumber: '[Company number — to confirm]',
    registeredAddress: '[Registered address — to confirm]',
  },
  contact: {
    general: EMAIL_PLACEHOLDER,
    support: EMAIL_PLACEHOLDER,
    privacy: EMAIL_PLACEHOLDER,
  },
  legal: {
    privacy: { approved: false },
    terms: { approved: false },
    dataProcessing: { approved: false },
  },
  // Unresolved: assumed that a public preview cannot be claimed into a workspace.
  previewClaimSupported: false,
});

export type HandOffKind = 'signIn' | 'createWorkspace' | 'dashboard';

export type HandOffLink =
  { configured: true; href: string } | { configured: false; href: null; label: string };

const HAND_OFF_PATHS: Record<HandOffKind, string> = {
  signIn: publicEnv.NEXT_PUBLIC_CBAM_SIGN_IN_PATH,
  createWorkspace: publicEnv.NEXT_PUBLIC_CBAM_CREATE_WORKSPACE_PATH,
  dashboard: publicEnv.NEXT_PUBLIC_CBAM_DASHBOARD_PATH,
};

/** Builds a hand-off URL to the existing application, never hard-coding its host. */
export function buildHandOffLink(
  kind: HandOffKind,
  appUrl: string | undefined = publicEnv.NEXT_PUBLIC_CBAM_APP_URL,
  paths: Record<HandOffKind, string> = HAND_OFF_PATHS,
): HandOffLink {
  if (!appUrl) {
    return { configured: false, href: null, label: 'Workspace link to be confirmed' };
  }
  const href = new URL(paths[kind], appUrl).toString();
  return { configured: true, href };
}
