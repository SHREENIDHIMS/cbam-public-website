import { HATCH_LIGHT, faint, paper, steps } from './geometry';

/** Far layer, drawn faint and thin for depth: tank farm, steelworks and a distant crane pair. */

const GROUND = 288;

function Tank({ x, w, top }: { x: number; w: number; top: number }) {
  const rings = steps(top + 12, 12, Math.floor((GROUND - top - 12) / 12));
  return (
    <g>
      <path d={`M${x} ${GROUND}V${top}h${w}V${GROUND}`} fill={paper} />
      <path d={`M${x} ${top}q${w / 2} -9 ${w} 0`} fill={paper} />
      <rect
        x={x + w - 10}
        y={top}
        width={10}
        height={GROUND - top}
        fill={HATCH_LIGHT}
        stroke="none"
      />
      {rings.map((y) => (
        <path key={y} d={`M${x} ${y}h${w}`} strokeWidth={0.4} />
      ))}
      <path
        d={`M${x + 6} ${GROUND}L${x + w * 0.6} ${top + 2}`}
        strokeWidth={0.5}
        strokeDasharray="1.5 2"
      />
    </g>
  );
}

function Stove({ x }: { x: number }) {
  return (
    <g>
      <path d={`M${x} ${GROUND}V184q9 -12 18 0V${GROUND}`} fill={paper} />
      <path d={`M${x} 204h18M${x} 230h18M${x} 256h18`} strokeWidth={0.4} />
    </g>
  );
}

function Chimney({ x, w, top }: { x: number; w: number; top: number }) {
  return (
    <g>
      <path d={`M${x} ${GROUND}L${x + 2} ${top}h${w - 4}L${x + w} ${GROUND}`} fill={paper} />
      <path d={`M${x + 1} ${top + 6}h${w - 2}M${x + 1} ${top + 14}h${w - 2}`} strokeWidth={0.5} />
      <rect
        x={x + w - 4}
        y={top}
        width={3}
        height={GROUND - top}
        fill={HATCH_LIGHT}
        stroke="none"
      />
    </g>
  );
}

/** A ship-to-shore crane drawn small for the far quay. */
function DistantCrane({ x }: { x: number }) {
  return (
    <g strokeWidth={0.6}>
      <path d={`M${x} ${GROUND}V206M${x + 34} ${GROUND}V206M${x - 2} 206h38`} />
      <path
        d={`M${x} 236l34 -30M${x + 34} 236l-34 -30M${x} 262l34 -26M${x + 34} 262l-34 -26`}
        strokeWidth={0.4}
      />
      <path d={`M${x - 64} 202h132v4h-132z`} fill={paper} />
      <path d={`M${x + 22} 202V170M${x + 22} 170L${x - 64} 202M${x + 22} 170L${x + 68} 202`} />
    </g>
  );
}

export function JourneyBackground() {
  return (
    <g stroke={faint} strokeWidth={0.7} fill="none">
      {/* Skyline rule */}
      <path d={`M0 ${GROUND}H780`} />

      {/* Tank farm */}
      <Tank x={34} w={52} top={236} />
      <Tank x={92} w={64} top={224} />
      <Tank x={162} w={44} top={244} />

      {/* Conveyor gantry into the works */}
      <path d="M214 286L292 196M222 286L300 196" />
      {steps(0, 1, 8).map((i) => (
        <path key={i} d={`M${216 + i * 10} ${283 - i * 11.5}l8 0`} strokeWidth={0.4} />
      ))}

      {/* Blast furnace with downcomer and hot stoves */}
      <path d="M300 288V214l10 -30h30l10 30V288" fill={paper} />
      <rect x={340} y={186} width={9} height={102} fill={HATCH_LIGHT} stroke="none" />
      <path d="M314 184V146h22v38M318 146V118h14v28" fill={paper} />
      <path d="M332 128q34 -6 48 40V188" />
      <path d="M300 236h50M300 260h50" strokeWidth={0.4} />
      <Stove x={362} />
      <Stove x={386} />
      <Stove x={410} />

      {/* Chimneys */}
      <Chimney x={448} w={14} top={92} />
      <Chimney x={474} w={11} top={128} />

      {/* Distant cranes on the far quay */}
      <DistantCrane x={560} />
      <DistantCrane x={668} />
    </g>
  );
}
