import { HATCH, alt, paper, steps, tint } from './geometry';

/**
 * Ship-to-shore gantry crane on the quay: portal legs on rail bogies, sill beam, lattice bracing,
 * A-frame apex with forestays and backstays, box-girder boom over the ship, trolley and cab, and a
 * spreader lowering a 40 ft box on its hoist ropes.
 */

const QUAY = 296;
const LEG_WATER = 1320;
const LEG_LAND = 1396;
const SILL = 208;
const BOOM_TOP = 114;
const BOOM_BOTTOM = 124;
const BOOM_TIP = 1056;
const BACKREACH = 1440;
const APEX: readonly [number, number] = [1382, 40];
const TROLLEY_X = 1118;

function Lattice({ from, to }: { from: number; to: number }) {
  const panels = steps(from, 22, Math.floor((to - from) / 22));
  return (
    <g strokeWidth={0.55}>
      {panels.map((y) => (
        <path
          key={y}
          d={`M${LEG_WATER} ${y}L${LEG_LAND} ${y + 22}M${LEG_LAND} ${y}L${LEG_WATER} ${y + 22}`}
        />
      ))}
    </g>
  );
}

function BoomGirder() {
  const panels = steps(BOOM_TIP + 6, 16, Math.floor((BACKREACH - BOOM_TIP - 6) / 16));
  return (
    <g>
      <path
        d={`M${BOOM_TIP} ${BOOM_TOP + 2}L${BOOM_TIP + 6} ${BOOM_TOP}H${BACKREACH}V${BOOM_BOTTOM}H${BOOM_TIP}Z`}
        fill={paper}
        strokeWidth={1.1}
      />
      {panels.map((x, index) => (
        <path
          key={x}
          d={
            index % 2 === 0
              ? `M${x} ${BOOM_BOTTOM}L${x + 16} ${BOOM_TOP}`
              : `M${x} ${BOOM_TOP}L${x + 16} ${BOOM_BOTTOM}`
          }
          strokeWidth={0.5}
        />
      ))}
    </g>
  );
}

export function JourneyCrane() {
  const [ax, ay] = APEX;
  return (
    <g>
      {/* Quay block with fenders and bollards */}
      <path d={`M1292 ${QUAY}H1440V318H1296Z`} fill={paper} />
      <rect x={1292} y={QUAY + 6} width={4} height={14} fill={alt} />
      {steps(1300, 34, 4).map((x) => (
        <path key={x} d={`M${x} ${QUAY}v-4h5v4`} fill={paper} strokeWidth={0.8} />
      ))}
      {steps(QUAY + 6, 6, 3).map((y) => (
        <path key={y} d={`M1298 ${y}H1440`} strokeWidth={0.4} />
      ))}

      {/* Stays from the apex */}
      <path
        d={`M${ax} ${ay}L${BOOM_TIP + 4} ${BOOM_TOP}M${ax} ${ay}L${TROLLEY_X + 90} ${BOOM_TOP}M${ax} ${ay}L${BACKREACH} ${BOOM_TOP - 6}`}
        strokeWidth={0.8}
      />
      {/* A-frame */}
      <path
        d={`M${LEG_WATER + 30} ${BOOM_TOP}L${ax - 2} ${ay}M${ax + 2} ${ay}L${LEG_LAND + 22} ${BOOM_TOP}`}
        strokeWidth={2}
      />
      <path
        d={`M${(LEG_WATER + 30 + ax) / 2} ${(BOOM_TOP + ay) / 2}H${(LEG_LAND + 22 + ax) / 2}`}
        strokeWidth={0.8}
      />
      <path d={`M${ax - 4} ${ay}h8v-6h-8z`} fill={paper} strokeWidth={0.8} />

      <BoomGirder />

      {/* Trolley, machinery house and operator cab */}
      <rect x={TROLLEY_X - 4} y={BOOM_BOTTOM} width={30} height={8} fill={paper} />
      <rect x={TROLLEY_X + 2} y={BOOM_BOTTOM + 8} width={14} height={11} fill={tint} />
      <path d={`M${TROLLEY_X + 4} ${BOOM_BOTTOM + 12}h10`} strokeWidth={1.6} />
      <rect x={1350} y={BOOM_TOP - 12} width={34} height={12} fill={paper} />
      <path d={`M1354 ${BOOM_TOP - 6}h26`} strokeWidth={0.4} strokeDasharray="2 2" />

      {/* Hoist ropes, spreader and the box being landed */}
      <path
        d={`M${TROLLEY_X + 2} ${BOOM_BOTTOM + 8}V172M${TROLLEY_X + 20} ${BOOM_BOTTOM + 8}V172`}
        strokeWidth={0.6}
      />
      <path d={`M${TROLLEY_X - 10} 172h40v3h-40z`} fill={paper} strokeWidth={0.8} />
      <rect x={TROLLEY_X - 9} y={175} width={38} height={12.5} fill={tint} strokeWidth={0.7} />

      {/* Portal legs, sill beam and bracing */}
      <path d={`M${LEG_WATER} ${QUAY - 6}V${BOOM_BOTTOM}h6V${QUAY - 6}`} fill={paper} />
      <path d={`M${LEG_LAND} ${QUAY - 6}V${BOOM_BOTTOM}h6V${QUAY - 6}`} fill={paper} />
      <rect
        x={LEG_LAND + 2}
        y={BOOM_BOTTOM}
        width={4}
        height={QUAY - 6 - BOOM_BOTTOM}
        fill={HATCH}
        stroke="none"
      />
      <path d={`M${LEG_WATER} ${SILL}H${LEG_LAND + 6}v6H${LEG_WATER}z`} fill={paper} />
      <Lattice from={BOOM_BOTTOM + 4} to={SILL - 4} />
      <path d={`M${LEG_WATER + 6} 252H${LEG_LAND}`} strokeWidth={0.6} />

      {/* Rail bogies */}
      {[LEG_WATER - 6, LEG_LAND - 6].map((x) => (
        <g key={x}>
          <rect x={x} y={QUAY - 7} width={18} height={4} fill={paper} />
          <circle cx={x + 4} cy={QUAY - 1.5} r={2} fill={paper} />
          <circle cx={x + 14} cy={QUAY - 1.5} r={2} fill={paper} />
        </g>
      ))}
    </g>
  );
}
