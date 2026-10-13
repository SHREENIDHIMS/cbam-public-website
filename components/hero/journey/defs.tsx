import { WATER_Y, faint, ink, paper } from './geometry';

/**
 * Engraving shading and the reflection mask. Ids are prefixed gj- and the figure appears once per
 * page, so they never collide.
 */
export function JourneyDefs() {
  return (
    <defs>
      <pattern id="gj-hatch" width="4" height="4" patternUnits="userSpaceOnUse">
        <path d="M0 4L4 0" stroke={ink} strokeWidth="0.5" strokeOpacity="0.55" />
      </pattern>
      <pattern id="gj-hatch-paper" width="3.5" height="3.5" patternUnits="userSpaceOnUse">
        <path d="M0 3.5L3.5 0" stroke={paper} strokeWidth="0.45" strokeOpacity="0.5" />
      </pattern>
      <pattern id="gj-hatch-light" width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M0 6L6 0" stroke={faint} strokeWidth="0.5" />
      </pattern>
      <pattern id="gj-corrugate" width="3" height="10" patternUnits="userSpaceOnUse">
        <path d="M1.5 0V10" stroke={ink} strokeWidth="0.4" strokeOpacity="0.22" />
      </pattern>
      <pattern id="gj-stipple" width="5" height="4" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.55" fill={faint} />
        <circle cx="3.5" cy="3" r="0.45" fill={faint} />
      </pattern>
      <linearGradient
        id="gj-fade"
        x1="0"
        y1={WATER_Y}
        x2="0"
        y2={WATER_Y + 46}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="white" stopOpacity="0.55" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <mask id="gj-reflect" maskUnits="userSpaceOnUse" x="0" y={WATER_Y} width="1440" height="60">
        <rect x="0" y={WATER_Y} width="1440" height="60" fill="url(#gj-fade)" />
      </mask>
    </defs>
  );
}
