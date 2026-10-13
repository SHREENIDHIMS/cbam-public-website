/** Single source of design tokens (DECISIONS 3 and 37). Hex values only; oklch derivation in DECISIONS 37. */

export type Ramp = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

/** Neutral paper to deep-navy ink (CargoFlow system): #FAFAFA canvas, #060517 ink. */
export const zinc: Ramp = [
  '#FFFFFF',
  '#FAFAFA',
  '#F3F3F4',
  '#E5E5E5',
  '#CFD0D4',
  '#B0B3B9',
  '#7C7C7C',
  '#666D78',
  '#4B4F5C',
  '#060517',
];

/**
 * Brand orange. Shade 5 is the exact brand fill (#FF5D18, always carries navy text). Shade 7 is
 * the text-safe orange for links, icons and small marks on light grounds (white text on it 5:1).
 */
export const ember: Ramp = [
  '#FFF1EA',
  '#FFDCCB',
  '#FFC0A3',
  '#FF9E70',
  '#FF7B42',
  '#FF5D18',
  '#E84A06',
  '#C2410C',
  '#9A3412',
  '#7C2D12',
];

export const steel: Ramp = [
  '#EEF2F6',
  '#DCE4EC',
  '#B9C9D8',
  '#95ADC3',
  '#7592AE',
  '#5C7C9A',
  '#4A6B85',
  '#3C586E',
  '#2E4557',
  '#203140',
];

export const green: Ramp = [
  '#EDF5F0',
  '#D6E9DD',
  '#ADD3BC',
  '#84BC9A',
  '#5FA47B',
  '#458B63',
  '#357553',
  '#2B6246',
  '#214D37',
  '#173828',
];

export const amber: Ramp = [
  '#FDF6E7',
  '#FAEBC6',
  '#F4D68E',
  '#EDBF57',
  '#E2A82E',
  '#C98E16',
  '#A6730C',
  '#855C0A',
  '#6E4C08',
  '#4A3307',
];

export const red: Ramp = [
  '#FBEFEE',
  '#F5D9D7',
  '#EAB2AE',
  '#DD8A84',
  '#CE635C',
  '#BC463F',
  '#A3362F',
  '#872B26',
  '#6B221E',
  '#4F1916',
];

export const semantic = {
  canvas: zinc[1],
  surface: zinc[0],
  surfaceAlt: zinc[2],
  surfaceInverse: '#00101A',
  ink: zinc[9],
  inkMuted: zinc[8],
  inkSubtle: zinc[7],
  inkInverse: '#FFFFFF',
  inkInverseMuted: '#B8C0C8',
  line: zinc[3],
  lineStrong: zinc[6],
  lineInverse: '#2A3A46',
  primary: ember[7],
  primaryHover: ember[8],
  primaryTint: ember[0],
  onPrimary: zinc[0],
  brand: ember[5],
  brandHover: ember[6],
  onBrand: zinc[9],
  secondary: '#405D7B',
  focus: zinc[9],
  focusInverse: '#FFFFFF',
  positiveFg: green[7],
  positiveBg: green[0],
  watchFg: amber[8],
  watchBg: amber[0],
  criticalFg: red[7],
  criticalBg: red[0],
  infoFg: steel[7],
  infoBg: steel[0],
  neutralFg: zinc[8],
  neutralBg: zinc[2],
} as const;

export type SemanticToken = keyof typeof semantic;

/**
 * Role re-pointing for dark sections (`data-tone="inverse"`, footer-navy ground). Components keep
 * using the same role names; inside an inverse section ink becomes light, lines become navy-grey,
 * and the primary action is the brand orange with navy text. `data-tone="paper"` restores the
 * light roles for a white card placed inside a dark or orange section.
 */
export const inverseRoles: Partial<Record<SemanticToken, string>> = {
  ink: semantic.inkInverse,
  inkMuted: semantic.inkInverseMuted,
  inkSubtle: semantic.inkInverseMuted,
  line: semantic.lineInverse,
  lineStrong: '#8C98A3',
  surface: '#0B1B27',
  surfaceAlt: '#10202D',
  primary: ember[5],
  primaryHover: ember[4],
  primaryTint: '#1A2A36',
  onPrimary: zinc[9],
  secondary: semantic.inkInverseMuted,
  focus: semantic.focusInverse,
};

/** Full-bleed orange sections (`data-tone="brand"`): navy ink, navy buttons with white text. */
export const brandRoles: Partial<Record<SemanticToken, string>> = {
  ink: zinc[9],
  inkMuted: '#2E1204',
  inkSubtle: '#2E1204',
  line: '#7C2D12',
  lineStrong: zinc[9],
  primary: zinc[9],
  primaryHover: '#1B1A33',
  primaryTint: ember[4],
  onPrimary: '#FFFFFF',
  secondary: zinc[9],
  focus: zinc[9],
};

export const paperRoles: Partial<Record<SemanticToken, string>> = Object.fromEntries(
  [...new Set([...Object.keys(inverseRoles), ...Object.keys(brandRoles)])].map((key) => [
    key,
    semantic[key as SemanticToken],
  ]),
);

/** Foreground/background pairs checked by the contrast unit test. */
export const TEXT_PAIRS: ReadonlyArray<readonly [string, string, string]> = [
  ['ink on canvas', semantic.ink, semantic.canvas],
  ['ink on surface', semantic.ink, semantic.surface],
  ['ink-muted on canvas', semantic.inkMuted, semantic.canvas],
  ['ink-subtle on canvas', semantic.inkSubtle, semantic.canvas],
  ['ink-subtle on surface', semantic.inkSubtle, semantic.surface],
  ['ink-subtle on surface-alt', semantic.inkSubtle, semantic.surfaceAlt],
  ['primary on canvas', semantic.primary, semantic.canvas],
  ['primary on surface-alt', semantic.primary, semantic.surfaceAlt],
  ['primary on primary-tint', semantic.primary, semantic.primaryTint],
  ['on-primary on primary', semantic.onPrimary, semantic.primary],
  ['on-primary on primary-hover', semantic.onPrimary, semantic.primaryHover],
  ['on-brand on brand', semantic.onBrand, semantic.brand],
  ['on-brand on brand-hover', semantic.onBrand, semantic.brandHover],
  ['inverse primary on inverse', ember[5], semantic.surfaceInverse],
  ['inverse on-primary on inverse primary', zinc[9], ember[5]],
  ['inverse on-primary on inverse primary-hover', zinc[9], ember[4]],
  ['inverse primary on inverse primary-tint', ember[5], '#1A2A36'],
  ['ink-inverse on inverse', semantic.inkInverse, semantic.surfaceInverse],
  ['ink-inverse-muted on inverse', semantic.inkInverseMuted, semantic.surfaceInverse],
  ['brand-section ink on brand', zinc[9], semantic.brand],
  ['brand-section ink-muted on brand', '#2E1204', semantic.brand],
  ['brand-section on-primary on navy button', '#FFFFFF', zinc[9]],
  ['brand-section ink on primary-tint', zinc[9], ember[4]],
  ['secondary on canvas', semantic.secondary, semantic.canvas],
  ['secondary on surface-alt', semantic.secondary, semantic.surfaceAlt],
  ['positive-fg on positive-bg', semantic.positiveFg, semantic.positiveBg],
  ['watch-fg on watch-bg', semantic.watchFg, semantic.watchBg],
  ['critical-fg on critical-bg', semantic.criticalFg, semantic.criticalBg],
  ['info-fg on info-bg', semantic.infoFg, semantic.infoBg],
  ['neutral-fg on neutral-bg', semantic.neutralFg, semantic.neutralBg],
];

/** Non-text pairs (control borders, focus ring) need 3:1. */
export const NON_TEXT_PAIRS: ReadonlyArray<readonly [string, string, string]> = [
  ['control border on canvas', semantic.lineStrong, semantic.canvas],
  ['control border on surface', semantic.lineStrong, semantic.surface],
  ['focus ring on canvas', semantic.focus, semantic.canvas],
  ['focus ring on inverse', semantic.focusInverse, semantic.surfaceInverse],
  ['focus ring on brand', zinc[9], semantic.brand],
  ['inverse control border on inverse', '#8C98A3', semantic.surfaceInverse],
  ['primary selection border on surface', semantic.primary, semantic.surface],
];

/** Pill buttons (xl), 4 px cards, 24 px photo cards (CargoFlow shapes). */
export const radius = { xs: '4px', sm: '4px', md: '8px', lg: '24px', xl: '80px' } as const;

export const shadow = {
  /** No offset underprint any more; kept as a key so Mantine's Button style still resolves. */
  print: 'none',
  sm: '0 1px 2px rgb(6 5 23 / 0.06)',
  md: '0 24px 48px -28px rgb(6 5 23 / 0.28)',
} as const;

export function cssVarName(token: string): string {
  return `--cc-${token.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}
