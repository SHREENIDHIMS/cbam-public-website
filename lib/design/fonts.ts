import localFont from 'next/font/local';

/**
 * Display and label face: Archivo variable (weight axis, Latin subset, OFL-1.1). Used for
 * headings, box labels and table heads through the type tiers in styles/type.css.
 */
export const archivo = localFont({
  src: '../../styles/fonts/archivo/archivo-latin-wght-normal.woff2',
  variable: '--ff-display',
  weight: '100 900',
  display: 'swap',
  adjustFontFallback: 'Arial',
});

/** Body and UI face: Atkinson Hyperlegible Next variable (Latin subset, OFL-1.1). */
export const atkinson = localFont({
  src: '../../styles/fonts/atkinson-hyperlegible-next/atkinson-hyperlegible-next-latin-wght-normal.woff2',
  variable: '--ff-sans',
  weight: '200 800',
  display: 'swap',
  adjustFontFallback: 'Arial',
});

/**
 * Figures face: Atkinson Hyperlegible Mono variable (Latin subset, OFL-1.1). Money, mass, dates
 * and commodity codes only. Not preloaded: it is never the largest element above the fold.
 */
export const atkinsonMono = localFont({
  src: '../../styles/fonts/atkinson-hyperlegible-mono/atkinson-hyperlegible-mono-latin-wght-normal.woff2',
  variable: '--ff-mono',
  weight: '200 800',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  fallback: ['Consolas', 'ui-monospace', 'monospace'],
});

export const fontClassNames = `${archivo.variable} ${atkinson.variable} ${atkinsonMono.variable}`;
