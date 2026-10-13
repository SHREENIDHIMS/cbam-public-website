import type { ReactNode } from 'react';
import { CtaTracker } from '@/components/conversion/CtaTracker';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SkipLink } from '@/components/layout/SkipLink';
import { tokensCss } from '@/lib/design/css-variables';
import { fontClassNames } from '@/lib/design/fonts';
import { rootMetadata } from '@/lib/seo/metadata';
import '@/styles/globals.css';

export const metadata = rootMetadata;

/**
 * Visual direction contract (DECISIONS 37). Emitted as an HTML comment so it survives the build
 * and can be audited against the rendered site.
 */
const DIRECTION_CONTRACT = `<!--
THESIS: A light editorial logistics look (the CargoFlow system): large type on white space, one loud orange (#FF5D18) used for whole-section colour blocks and pill buttons, navy ink, scroll-driven motion.
OWN-WORLD: #FAFAFA paper, #060517 navy ink, #00101A footer navy, brand orange #FF5D18 with navy text on it; Archivo (Aspekta once licensed files are in place) for headings, Atkinson Hyperlegible Next for body; pill buttons with a sliding arrow, 4px cards, 24px photo panels.
STORY: A full-height navy hero with the goods journey and three tool tabs, then the facts, a pinned crane scene for the four stages, stacked fact cards, an orange tools band, sources, guides, FAQ and an orange closing band.
MOTION: count-up numbers, grey-to-ink scroll words, sliding marquees, pinned scroll scene, hero tab autoplay. All CSS or small scripts, no libraries; reduced motion switches every one off.
-->`;

export default function RootLayout({ children }: { children: ReactNode }) {
  // The site is light-only; Mantine's styles on the routes that load them read this attribute.
  return (
    <html lang="en-GB" className={fontClassNames} data-mantine-color-scheme="light">
      <head>
        <style id="cc-tokens" dangerouslySetInnerHTML={{ __html: tokensCss() }} />
      </head>
      <body>
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        <CtaTracker />
        <SkipLink />
        <SiteHeader />
        <main
          id="main"
          tabIndex={-1}
          className="min-h-[60vh] pt-[4.5rem] outline-none has-[[data-hero]]:pt-0"
        >
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
