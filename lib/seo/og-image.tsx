import { ImageResponse } from 'next/og';
import { inverseRoles, semantic } from '@/lib/design/tokens';
import { siteConfig } from '@/lib/config/site';

import { OG_SIZE } from './og-paths';

export { OG_SIZE };

export type OgKind = 'site' | 'tool' | 'guide';

const KICKERS: Record<OgKind, string> = {
  site: 'UK CBAM',
  tool: 'Free public tool',
  guide: 'Guide',
};

/**
 * Default Open Graph image for one page type. Text only, set in the site colours, with no
 * regulatory figures: the headline is the page title.
 */
export function renderOgImage(kind: OgKind, title: string, subtitle?: string): ImageResponse {
  const accent = kind === 'site' ? semantic.primary : (inverseRoles.primary ?? semantic.inkInverse);
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: kind === 'site' ? semantic.canvas : semantic.surfaceInverse,
        color: kind === 'site' ? semantic.ink : semantic.inkInverse,
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 32, fontWeight: 700 }}
      >
        <svg width="56" height="56" viewBox="0 0 28 28" fill="none">
          <rect x="1" y="1" width="26" height="26" rx="2" stroke={accent} strokeWidth="2" />
          <rect x="4.5" y="4.5" width="19" height="19" rx="0.5" stroke={accent} strokeWidth="1" />
          <path d="M8 10.5h12M8 14.5h7" stroke={accent} strokeWidth="1.75" />
          <rect x="16" y="16.5" width="5" height="4" fill={accent} />
        </svg>
        <div style={{ display: 'flex' }}>{siteConfig.brandName}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            padding: '6px 14px',
            border: `2px solid ${accent}`,
            boxShadow: `0 0 0 3px ${kind === 'site' ? semantic.canvas : semantic.surfaceInverse}, 0 0 0 5px ${accent}`,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: accent,
          }}
        >
          {KICKERS[kind]}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 60 ? 56 : 72,
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: -1.5,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ display: 'flex', fontSize: 30, opacity: 0.85, lineHeight: 1.3 }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      <div style={{ display: 'flex', fontSize: 24, opacity: 0.75 }}>
        Indicative, based on the information you provide. Not legal or tax advice.
      </div>
    </div>,
    { ...OG_SIZE },
  );
}
