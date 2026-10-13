import type { ReactNode } from 'react';
import {
  HATCH,
  HATCH_PAPER,
  RAIL_Y,
  STIPPLE,
  WAGON_W,
  alt,
  faint,
  paper,
  primary,
  steps,
  tint,
} from './geometry';

/**
 * Freight train in the foreground: a diesel-electric locomotive and one wagon per sector group,
 * each on two bogies, on ballasted track.
 */

const FRAME_Y = 282;
const WHEEL_R = 5.5;
const WHEEL_Y = RAIL_Y - WHEEL_R;

interface Cargo {
  /** Where the data line leaves the wagon (top of the load). */
  top: number;
  draw: (x: number) => ReactNode;
}

function Bogie({ x }: { x: number }) {
  return (
    <g>
      <path d={`M${x} ${FRAME_Y + 9}h26v-3h-26z`} fill={paper} strokeWidth={0.8} />
      <circle cx={x + 6} cy={WHEEL_Y} r={WHEEL_R} fill={paper} />
      <circle cx={x + 20} cy={WHEEL_Y} r={WHEEL_R} fill={paper} />
      <circle cx={x + 6} cy={WHEEL_Y} r={1.4} />
      <circle cx={x + 20} cy={WHEEL_Y} r={1.4} />
    </g>
  );
}

/** Loads keyed by rules.sectors keys. */
export const CARGO: Record<string, Cargo> = {
  iron_steel: {
    top: 251,
    draw: (x) => (
      <g>
        {/* Coils in cradles; the hood is slid back over the last one */}
        {[24, 52].map((dx) => (
          <g key={dx}>
            <circle cx={x + dx} cy={267} r={14} fill={paper} />
            <path d={`M${x + dx} 253a14 14 0 0 1 0 28z`} fill={HATCH} stroke="none" />
            <circle cx={x + dx} cy={267} r={5} fill={paper} />
            <circle cx={x + dx} cy={267} r={9.5} strokeWidth={0.5} />
          </g>
        ))}
        <path d={`M${x + 70} ${FRAME_Y}V260q15 -16 30 0V${FRAME_Y}z`} fill={tint} />
        {steps(x + 76, 6, 4).map((rx) => (
          <path key={rx} d={`M${rx} ${FRAME_Y}V257`} strokeWidth={0.5} />
        ))}
        <path d={`M${x + 8} ${FRAME_Y}l6 -4h52l6 4`} strokeWidth={0.7} />
      </g>
    ),
  },
  aluminium: {
    top: 262,
    draw: (x) => (
      <g>
        {[8, 38, 68].map((dx, index) => (
          <g key={dx}>
            <rect x={x + dx} y={264} width={27} height={18} fill={index === 1 ? tint : paper} />
            {steps(268.5, 4.5, 3).map((y) => (
              <path key={y} d={`M${x + dx} ${y}h27`} strokeWidth={0.45} />
            ))}
            <path d={`M${x + dx + 7} 264v18M${x + dx + 20} 264v18`} strokeWidth={1.1} />
          </g>
        ))}
      </g>
    ),
  },
  cement: {
    top: 238,
    draw: (x) => (
      <g>
        <path
          d={`M${x + 3} ${FRAME_Y - 6}V246Q${x + 52} 234 ${x + 101} 246V${FRAME_Y - 6}L${x + 88} ${FRAME_Y}H${x + 16}Z`}
          fill={paper}
        />
        <rect x={x + 84} y={244} width={17} height={FRAME_Y - 250} fill={HATCH} stroke="none" />
        {steps(x + 15, 12, 7).map((rx) => (
          <path key={rx} d={`M${rx} 242V${FRAME_Y - 4}`} strokeWidth={0.5} />
        ))}
        {[22, 46, 70].map((dx) => (
          <rect key={dx} x={x + dx} y={236} width={12} height={3} fill={paper} strokeWidth={0.7} />
        ))}
        {[40, 58].map((dx) => (
          <path
            key={dx}
            d={`M${x + dx} ${FRAME_Y + 6}l3 5h6l3 -5`}
            fill={paper}
            strokeWidth={0.7}
          />
        ))}
      </g>
    ),
  },
  fertilisers: {
    top: 242,
    draw: (x) => (
      <g>
        <path
          d={`M${x + 3} ${FRAME_Y}V246Q${x + 52} 240 ${x + 101} 246V${FRAME_Y}Z`}
          fill={paper}
        />
        {/* Open doorway with bagged product on a pallet */}
        <rect x={x + 30} y={250} width={30} height={FRAME_Y - 250} fill={alt} />
        {[0, 1, 2].map((col) => (
          <rect
            key={`a${col}`}
            x={x + 32 + col * 9}
            y={270}
            width={8}
            height={9}
            rx={2.5}
            fill={col === 1 ? tint : paper}
            strokeWidth={0.6}
          />
        ))}
        {[0, 1].map((col) => (
          <rect
            key={`b${col}`}
            x={x + 36 + col * 9}
            y={262}
            width={8}
            height={8}
            rx={2.5}
            fill={paper}
            strokeWidth={0.6}
          />
        ))}
        <path d={`M${x + 31} ${FRAME_Y - 2}h28`} strokeWidth={1} />
        {/* Sliding door pushed back */}
        <rect x={x + 62} y={249} width={30} height={FRAME_Y - 249} fill={paper} />
        {steps(x + 68, 6, 4).map((rx) => (
          <path key={rx} d={`M${rx} 251V${FRAME_Y - 2}`} strokeWidth={0.45} />
        ))}
        <path d={`M${x + 8} 252V${FRAME_Y - 4}M${x + 18} 252V${FRAME_Y - 4}`} strokeWidth={0.45} />
      </g>
    ),
  },
  hydrogen: {
    top: 243,
    draw: (x) => (
      <g>
        {/* Saddles, walkway and a pressure tank with its valve dome */}
        {[22, 82].map((dx) => (
          <path
            key={dx}
            d={`M${x + dx - 8} ${FRAME_Y}l4 -8h8l4 8`}
            fill={paper}
            strokeWidth={0.7}
          />
        ))}
        <rect x={x + 4} y={250} width={96} height={26} rx={13} fill={paper} />
        <path
          d={`M${x + 17} 263h70a13 13 0 0 1 -13 13h-44a13 13 0 0 1 -13 -13z`}
          fill={HATCH}
          stroke="none"
        />
        {[30, 52, 74].map((dx) => (
          <path key={dx} d={`M${x + dx} 251v24`} strokeWidth={0.5} />
        ))}
        <rect x={x + 47} y={244} width={10} height={6} fill={tint} strokeWidth={0.8} />
        <path d={`M${x + 4} ${FRAME_Y - 3}h96`} strokeWidth={0.6} strokeDasharray="2 1.5" />
      </g>
    ),
  },
};

export const FALLBACK_CARGO: Cargo = {
  top: 246,
  draw: (x) => <rect x={x + 4} y={246} width={96} height={FRAME_Y - 246} fill={paper} />,
};

export function Wagon({ x, cargo }: { x: number; cargo: Cargo }) {
  return (
    <g>
      {cargo.draw(x)}
      <rect x={x} y={FRAME_Y} width={WAGON_W} height={6} fill={paper} />
      <path d={`M${x - 8} ${FRAME_Y + 3}h8`} strokeWidth={1.4} />
      <Bogie x={x + 8} />
      <Bogie x={x + 70} />
    </g>
  );
}

export function Locomotive() {
  return (
    <g>
      {/* Body with a sloped nose and hatched skirt */}
      <path d={`M26 ${FRAME_Y}V254L40 236H156V${FRAME_Y}Z`} fill={primary} stroke={primary} />
      <rect x={30} y={272} width={126} height={10} fill={HATCH_PAPER} stroke="none" />
      <path d={`M44 248L50 241H68V256H44Z`} fill={paper} stroke="none" />
      <path d="M74 242V276" stroke={paper} strokeWidth={0.7} />
      {steps(96, 4, 12).map((gx) => (
        <path key={gx} d={`M${gx} 246v20`} stroke={paper} strokeWidth={0.6} />
      ))}
      <rect x={84} y={230} width={46} height={6} fill={paper} strokeWidth={0.8} />
      <path d="M40 236h116" stroke={paper} strokeWidth={0.8} />
      {/* Frame, buffers and three-axle bogies */}
      <rect x={24} y={FRAME_Y} width={134} height={6} fill={paper} />
      <path d={`M18 ${FRAME_Y + 3}h6M158 ${FRAME_Y + 3}h8`} strokeWidth={1.4} />
      {[34, 110].map((bx) => (
        <g key={bx}>
          <path d={`M${bx} ${FRAME_Y + 9}h40v-3h-40z`} fill={paper} strokeWidth={0.8} />
          {[6, 20, 34].map((dx) => (
            <g key={dx}>
              <circle cx={bx + dx} cy={WHEEL_Y} r={WHEEL_R} fill={paper} />
              <circle cx={bx + dx} cy={WHEEL_Y} r={1.4} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}

/** Ballast shoulder, sleepers and the near rail. */
export function Track({ to }: { to: number }) {
  return (
    <g>
      <path
        d={`M0 ${RAIL_Y + 3}H${to}L${to + 14} ${RAIL_Y + 12}H0Z`}
        fill={STIPPLE}
        stroke="none"
      />
      {steps(6, 11, Math.floor(to / 11)).map((sx) => (
        <path
          key={sx}
          d={`M${sx} ${RAIL_Y + 1}h6v3h-6z`}
          fill={paper}
          stroke={faint}
          strokeWidth={0.6}
        />
      ))}
      <path d={`M0 ${RAIL_Y}H${to}`} strokeWidth={1.6} />
    </g>
  );
}
