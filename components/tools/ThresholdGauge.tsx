import type { CSSProperties } from 'react';
import type { ThresholdStatus } from '@/lib/config/status';
import { arcLength, arcPath, clamp01, pointAt, type GaugeGeometry } from '@/lib/design/gauge';

const GEOMETRY: GaugeGeometry = { cx: 120, cy: 112, radius: 92 };
const STROKE = 16;
const ARC = arcPath(GEOMETRY);
const LENGTH = arcLength(GEOMETRY);

/** Fill colours are paired with a status badge and the percentage in text, never colour alone. */
const FILL: Record<ThresholdStatus, string> = {
  below: 'var(--cc-positive-fg)',
  watch: 'var(--cc-info-fg)',
  approaching: 'var(--cc-watch-fg)',
  triggered: 'var(--cc-critical-fg)',
};

export interface ThresholdGaugeProps {
  /** Share of the threshold, 1 = exactly at the threshold. Null draws an empty gauge. */
  ratio: number | null;
  status: ThresholdStatus | null;
  /** The scale runs from zero to this multiple of the threshold. */
  maxRatio: number;
  watchFrom: number;
  approachingFrom: number;
  /** Accessible name stating the amount, its share of the threshold and the status. */
  label: string;
}

/** Semicircular gauge. Static markup with no hooks, so it renders on the server and the client. */
export function ThresholdGauge({
  ratio,
  status,
  maxRatio,
  watchFrom,
  approachingFrom,
  label,
}: ThresholdGaugeProps) {
  const fraction = ratio === null ? 0 : clamp01(ratio / maxRatio);
  const fillStyle = {
    '--gauge-length': LENGTH.toFixed(2),
    '--gauge-fraction': fraction.toFixed(4),
  } as CSSProperties;
  const ticks = [
    { at: watchFrom, strong: false },
    { at: approachingFrom, strong: false },
    { at: 1, strong: true },
  ];

  return (
    <svg
      viewBox="0 0 240 130"
      role="img"
      aria-label={label}
      className="mx-auto h-auto w-full max-w-[320px]"
    >
      <path
        d={ARC}
        fill="none"
        stroke="var(--cc-surface-alt)"
        strokeWidth={STROKE}
        strokeLinecap="butt"
      />
      {status && fraction > 0 ? (
        <path
          d={ARC}
          fill="none"
          stroke={FILL[status]}
          strokeWidth={STROKE}
          strokeLinecap="butt"
          className="gauge-live"
          style={fillStyle}
        />
      ) : null}
      {ticks.map((tick) => {
        const position = tick.at / maxRatio;
        const [x1, y1] = pointAt(position, GEOMETRY.radius - STROKE / 2 - 3, GEOMETRY);
        const [x2, y2] = pointAt(position, GEOMETRY.radius + STROKE / 2 + 3, GEOMETRY);
        return (
          <line
            key={tick.at}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--cc-ink)"
            strokeWidth={tick.strong ? 2.5 : 1.25}
            strokeDasharray={tick.strong ? undefined : '2 2'}
          />
        );
      })}
    </svg>
  );
}
