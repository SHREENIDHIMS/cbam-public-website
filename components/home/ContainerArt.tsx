import { ember } from '@/lib/design/tokens';

/**
 * Decorative container-crane drawing in the brand orange. In the pinned "how it works" scene the
 * hook group lowers and the container piles rise with the scroll progress (--p, see
 * styles/marketing.css); as "still" it is a static picture.
 */

const PILE_ROWS = [
  { y: 488, fill: ember[5] },
  { y: 416, fill: ember[6] },
  { y: 344, fill: ember[4] },
] as const;

function Pile({ x, rows }: { x: number; rows: number }) {
  return (
    <g>
      {PILE_ROWS.slice(0, rows).map((row, index) => (
        <g key={row.y}>
          <rect
            x={x + (index % 2) * 14}
            y={row.y}
            width={188}
            height={70}
            rx={2}
            fill={row.fill}
            stroke="#060517"
            strokeOpacity={0.35}
          />
          {Array.from({ length: 11 }, (_, rib) => (
            <line
              key={rib}
              x1={x + (index % 2) * 14 + 12 + rib * 16}
              x2={x + (index % 2) * 14 + 12 + rib * 16}
              y1={row.y + 6}
              y2={row.y + 64}
              stroke="#060517"
              strokeOpacity={0.18}
            />
          ))}
        </g>
      ))}
    </g>
  );
}

export function ContainerArt({ variant = 'scene' }: { variant?: 'scene' | 'still' }) {
  const scene = variant === 'scene';
  return (
    <svg
      viewBox="0 0 800 560"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
      className="h-full w-full overflow-visible"
    >
      <g className={scene ? 'scene-pile' : undefined}>
        <Pile x={-4} rows={3} />
        <Pile x={616} rows={3} />
        <Pile x={150} rows={1} />
        <Pile x={470} rows={2} />
      </g>
      <g className={scene ? 'scene-hook' : undefined}>
        <g stroke="var(--cc-ink)" strokeWidth={2} strokeOpacity={0.75}>
          <line x1={352} x2={352} y1={-1100} y2={122} />
          <line x1={366} x2={366} y1={-1100} y2={122} />
          <line x1={434} x2={434} y1={-1100} y2={122} />
          <line x1={448} x2={448} y1={-1100} y2={122} />
          <line x1={352} y1={124} x2={308} y2={212} />
          <line x1={448} y1={124} x2={492} y2={212} />
        </g>
        <rect x={330} y={108} width={140} height={16} rx={3} fill="var(--cc-ink)" />
        <rect
          x={306}
          y={200}
          width={188}
          height={92}
          rx={2}
          fill={ember[5]}
          stroke="#060517"
          strokeOpacity={0.5}
        />
        {Array.from({ length: 11 }, (_, rib) => (
          <line
            key={rib}
            x1={318 + rib * 16}
            x2={318 + rib * 16}
            y1={208}
            y2={284}
            stroke="#060517"
            strokeOpacity={0.22}
          />
        ))}
        <rect x={306} y={200} width={14} height={14} fill="#060517" opacity={0.7} />
        <rect x={480} y={200} width={14} height={14} fill="#060517" opacity={0.7} />
      </g>
    </svg>
  );
}
