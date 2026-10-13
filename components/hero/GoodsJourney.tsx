import { rules } from '@/lib/config/rules';
import { JourneyBackground } from './journey/background';
import { JourneyCrane } from './journey/crane';
import { JourneyDefs } from './journey/defs';
import {
  FIRST_WAGON_X,
  VIEW_H,
  VIEW_W,
  WAGON_STEP,
  WAGON_W,
  ink,
  primary,
} from './journey/geometry';
import { JourneyWater } from './journey/quay';
import { JourneyShip } from './journey/ship';
import { CARGO, FALLBACK_CARGO, Locomotive, Track, Wagon } from './journey/train';

/**
 * "The journey of the goods": an original engraving-style drawing under the hero. A freight train
 * carries one wagon per CBAM sector group (read from the rules config) past a tank farm and
 * steelworks to a container ship working at a ship-to-shore crane. A data line rises from each
 * wagon's load and leaves the top edge towards the compliance snapshot above: customs lines
 * becoming an explained position. Decorative; the caption carries the facts in text.
 */

function joinLabels(labels: readonly string[]): string {
  if (labels.length < 2) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} and ${labels.at(-1)}`.toLowerCase();
}

function journeyData() {
  const sectors = rules.sectors.value ?? [];
  const wagons = sectors.map((sector, index) => ({
    key: sector.key,
    x: FIRST_WAGON_X + index * WAGON_STEP,
    cargo: CARGO[sector.key] ?? FALLBACK_CARGO,
  }));
  const trainEnd = (wagons.at(-1)?.x ?? FIRST_WAGON_X) + WAGON_W + 24;
  return { sectors, wagons, trainEnd };
}

/** The drawing alone (decorative SVG), sized by its parent. Used by the hero and by GoodsJourney. */
export function JourneyArt({ className }: { className?: string }) {
  const { wagons, trainEnd } = journeyData();
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={className ?? 'absolute inset-0 h-full w-full'}
      fill="none"
      stroke={ink}
      strokeWidth={1}
      strokeLinejoin="round"
    >
      <JourneyDefs />
      <JourneyBackground />
      <JourneyShip />
      <JourneyCrane />
      <JourneyWater from={trainEnd - 10} />
      <Track to={trainEnd} />
      <Locomotive />
      {wagons.map((wagon) => (
        <Wagon key={wagon.key} x={wagon.x} cargo={wagon.cargo} />
      ))}

      {/* Data lines: from each wagon's load up and out. */}
      <g stroke={primary} strokeWidth={1.2}>
        {wagons.map((wagon, index) => {
          const startX = wagon.x + WAGON_W / 2;
          const startY = wagon.cargo.top - 6;
          const endX = 900 + index * 50;
          return (
            <g key={wagon.key}>
              <path
                pathLength={1}
                className="journey-line"
                style={{ animationDelay: `${300 + index * 140}ms` }}
                d={`M${startX} ${startY}C${startX} ${150 - index * 8} ${endX} ${170 - index * 10} ${endX} 0`}
              />
              <rect
                x={startX - 3}
                y={startY - 3}
                width={6}
                height={6}
                fill={primary}
                stroke="none"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export function GoodsJourney() {
  const { sectors } = journeyData();
  return (
    <figure aria-labelledby="journey-caption" className="m-0 bg-canvas">
      <div className="relative h-44 overflow-hidden sm:h-56 md:aspect-[1440/360] md:h-auto">
        <JourneyArt />
      </div>
      <figcaption
        id="journey-caption"
        className="mx-auto w-full max-w-site px-5 pt-3 text-sm text-ink-subtle md:px-10"
      >
        Illustration: goods in each sector group ({joinLabels(sectors.map((s) => s.label))})
        arriving as customs lines, each one traced into the position above.
      </figcaption>
    </figure>
  );
}
