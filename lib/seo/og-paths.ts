/** Open Graph image sizes, paths and tool copy, without the image renderer. */

export const OG_SIZE = { width: 1200, height: 630 } as const;

/** Tool pages that have their own Open Graph image, keyed by the last path segment. */
export const TOOL_OG = {
  'exposure-check': {
    title: 'Check your UK CBAM exposure',
    subtitle: 'Choose a quick estimate or upload customs data.',
  },
  'quick-estimate': {
    title: 'UK CBAM quick estimate',
    subtitle: 'Five questions to see where you stand against the registration threshold.',
  },
  'threshold-checker': {
    title: 'UK CBAM threshold checker',
    subtitle: 'Test your imports against the look-back and forward-looking tests.',
  },
  'liability-preview': {
    title: 'UK CBAM liability preview',
    subtitle: 'Upload customs data and see scope, exposure and supplier coverage.',
  },
} as const;
export type OgToolKey = keyof typeof TOOL_OG;

export const OG_IMAGE_PATHS = {
  site: '/og/site',
  tool: (key: OgToolKey) => `/og/tool/${key}`,
  guide: (slug: string) => `/og/guide/${slug}`,
} as const;
