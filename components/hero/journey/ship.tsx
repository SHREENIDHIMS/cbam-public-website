import type { ReactNode } from 'react';
import {
  CORRUGATE,
  HATCH_PAPER,
  WATER_Y,
  alt,
  line,
  paper,
  primary,
  primaryDeep,
  steps,
  tint,
} from './geometry';

/**
 * Container ship moored bow-left: hull with sheer, flared bow and raked stern, boot-top band,
 * stacked 20 ft and 40 ft boxes in bays with lashing bridges, accommodation block and funnel aft.
 */

const DECK = 248;
const TIER = 13;
const BOX_20 = 18;
const BOX_40 = 37;

/** Hull outline, also reused (mirrored) for the reflection. */
export const HULL_PATH = `M760 236Q768 268 792 ${WATER_Y}H1258L1268 262L1274 246Q1010 252 760 236Z`;

const FILLS = [tint, alt, paper, line, alt, tint, paper];

/** Bays from bow to stern: box length per bay and stack height in tiers. */
const BAYS: ReadonlyArray<{ length: number; tiers: number }> = [
  { length: BOX_20, tiers: 3 },
  { length: BOX_40, tiers: 4 },
  { length: BOX_40, tiers: 5 },
  { length: BOX_40, tiers: 5 },
  { length: BOX_40, tiers: 6 },
  { length: BOX_40, tiers: 6 },
  { length: BOX_40, tiers: 5 },
  { length: BOX_40, tiers: 5 },
  { length: BOX_40, tiers: 4 },
  { length: BOX_20, tiers: 4 },
];

function Containers() {
  const boxes: ReactNode[] = [];
  const bridges: ReactNode[] = [];
  let x = 806;
  BAYS.forEach((bay, bayIndex) => {
    for (let tier = 0; tier < bay.tiers; tier += 1) {
      const y = DECK - 2 - (tier + 1) * TIER;
      boxes.push(
        <rect
          key={`${bayIndex}-${tier}`}
          x={x}
          y={y}
          width={bay.length}
          height={TIER - 0.6}
          fill={FILLS[(bayIndex * 3 + tier * 5) % FILLS.length]}
          strokeWidth={0.6}
        />,
      );
    }
    if (bayIndex > 0) {
      bridges.push(
        <path
          key={`b${bayIndex}`}
          d={`M${x - 1.5} ${DECK - 2}V${DECK - 2 - TIER * 2}`}
          strokeWidth={0.5}
        />,
      );
    }
    x += bay.length + 3;
  });
  const top = DECK - 2 - 6 * TIER;
  return (
    <g>
      {/* Hatch covers */}
      <path d={`M804 ${DECK}h${x - 806}v-3h-${x - 806}z`} fill={paper} strokeWidth={0.6} />
      {boxes}
      <rect
        x={806}
        y={top}
        width={x - 806}
        height={DECK - 2 - top}
        fill={CORRUGATE}
        stroke="none"
      />
      {bridges}
    </g>
  );
}

function Accommodation() {
  const windowRows = steps(196, 10, 5);
  return (
    <g>
      {/* Funnel behind the block */}
      <path d="M1238 246L1240 192h20l4 54z" fill={paper} />
      <path d="M1239.6 200h21.2v7h-21.2z" fill={primary} stroke="none" />
      <path d="M1241 192v-5h18v5" fill={paper} strokeWidth={0.7} />
      {/* Superstructure */}
      <rect x={1180} y={186} width={56} height={60} fill={paper} />
      <rect x={1170} y={176} width={76} height={10} fill={paper} />
      <path d="M1170 181h76" strokeWidth={0.5} />
      {windowRows.map((y) => (
        <path
          key={y}
          d={`M1186 ${y}h44`}
          strokeWidth={2.2}
          strokeDasharray="3 2.4"
          stroke={primary}
        />
      ))}
      <rect x={1226} y={186} width={10} height={60} fill={HATCH_PAPER} stroke="none" />
      {/* Mast and radar */}
      <path d="M1208 176V150M1200 156h16M1204 162h8" />
      <path d="M1196 146h24" strokeWidth={1.6} />
    </g>
  );
}

export function JourneyShip() {
  return (
    <g>
      <Containers />
      <Accommodation />
      {/* Hull */}
      <path d={HULL_PATH} fill={primary} stroke={primary} />
      <path d={`M788 290H1260L1258 ${WATER_Y}H792Z`} fill={primaryDeep} stroke="none" />
      <path
        d="M764 242Q1010 258 1272 252L1271 260Q1010 266 768 250Z"
        fill={HATCH_PAPER}
        stroke="none"
      />
      <path d="M766 240Q1010 255 1272 249" stroke={paper} strokeWidth={0.9} />
      {/* Hawse pipe and draft marks */}
      <ellipse cx={782} cy={256} rx={4} ry={2.6} stroke={paper} strokeWidth={0.9} />
      {steps(266, 6, 4).map((y) => (
        <path key={y} d={`M${800 + (y - 266) * 0.2} ${y}h4`} stroke={paper} strokeWidth={0.8} />
      ))}
      {steps(266, 6, 4).map((y) => (
        <path key={`s${y}`} d={`M1258 ${y}h-4`} stroke={paper} strokeWidth={0.8} />
      ))}
      {/* Bulbous bow just under the waterline */}
      <path
        d={`M792 ${WATER_Y}Q774 ${WATER_Y + 3} 778 ${WATER_Y + 10}Q788 ${WATER_Y + 15} 806 ${WATER_Y + 9}`}
        stroke={primary}
        strokeOpacity={0.35}
      />
      {/* Mooring lines to the quay bollards */}
      <path d="M1270 252Q1284 276 1302 292M1270 256Q1290 284 1318 293" strokeWidth={0.6} />
    </g>
  );
}
