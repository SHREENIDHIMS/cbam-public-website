import type { ReactNode } from 'react';
import { HULL_PATH } from './ship';
import { WATER_Y, faint, primary, steps } from './geometry';

/** Water with graded hairlines (denser near the hull) and a faded reflection of hull and crane legs. */
export function JourneyWater({ from }: { from: number }) {
  const lines: ReactNode[] = [];
  const rows = [3, 7, 11, 16, 22, 29, 37, 46, 56];
  rows.forEach((offset, row) => {
    const y = WATER_Y + offset;
    let x = from + ((row * 37) % 50);
    let i = 0;
    while (x < 1440) {
      const length = 26 + ((row * 53 + i * 71) % (90 + row * 12));
      lines.push(
        <path
          key={`${row}-${i}`}
          d={`M${x} ${y}h${Math.min(length, 1440 - x)}`}
          strokeOpacity={1 - row * 0.09}
        />,
      );
      x += length + 12 + ((i * 29) % (30 + row * 6));
      i += 1;
    }
  });

  return (
    <g>
      {/* Reflection: the hull and crane legs mirrored about the waterline, faded by the mask */}
      <g mask="url(#gj-reflect)">
        <g transform={`translate(0 ${WATER_Y * 2}) scale(1 -1)`}>
          <path d={HULL_PATH} fill={primary} fillOpacity={0.5} stroke="none" />
        </g>
        <path
          d={`M1320 ${WATER_Y + 18}V340M1396 ${WATER_Y + 18}V340`}
          stroke={faint}
          strokeWidth={2}
        />
      </g>
      <g stroke={faint} strokeWidth={0.7}>
        {lines}
      </g>
      {steps(812, 70, 6).map((x) => (
        <path
          key={x}
          d={`M${x} ${WATER_Y + 5}h22`}
          stroke={primary}
          strokeOpacity={0.3}
          strokeWidth={0.8}
        />
      ))}
    </g>
  );
}
