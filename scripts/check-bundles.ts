/**
 * Reads .next/diagnostics/route-bundle-stats.json after `npm run build`, prints first-load JS per
 * route (uncompressed and gzip) and fails if a heavy dependency leaks into the wrong routes:
 * the file parsers must be lazy everywhere, and TanStack Query belongs to /liability-preview only.
 *
 * It also fails if a server-only environment variable name appears anywhere in .next/static.
 *
 * Budgets (gzip, first load): content, form and marketing routes may not load the Mantine runtime
 * or the full Zod library and stay under CONTENT_BUDGET; each tool route has its own budget, and
 * /quick-estimate and /threshold-checker are held to the same no-Mantine, no-Zod rule.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

interface RouteStat {
  route: string;
  firstLoadUncompressedJsBytes: number;
  firstLoadChunkPaths: string[];
}

const ROOT = process.cwd();
const stats = JSON.parse(
  readFileSync(join(ROOT, '.next', 'diagnostics', 'route-bundle-stats.json'), 'utf8'),
) as RouteStat[];

const MARKERS = {
  papaparse: ['UndetectableDelimiter'],
  xlsxParser: ['sharedStrings.xml'],
  queryClient: ['No QueryClient set'],
  heavyOnContent: [
    { name: 'the Mantine runtime', text: 'MantineProvider was not found' },
    { name: 'the full Zod library', text: 'ZodError' },
  ],
} as const;

/** Framework floor (React, Next client) is about 140 KB gzip; this leaves about 7 KB of headroom. */
const CONTENT_BUDGET_GZIP = 150_000;
/**
 * Tool routes, each a few KB above its measured first-load size. The quick estimate and the
 * threshold checker use native fields and carry neither Mantine nor Zod; the others keep the
 * Mantine runtime (and, for the liability preview, form libraries and TanStack Query).
 */
const TOOL_BUDGETS_GZIP: Record<string, number> = {
  '/quick-estimate': 152_000,
  '/threshold-checker': 157_000,
  '/quick-estimate/result': 180_000,
  '/liability-preview': 163_000,
  '/liability-preview/result/[sessionId]': 188_000,
};
/** Tool routes that must stay free of the Mantine runtime and the full Zod library, like content routes. */
const LIGHT_TOOL_ROUTES = new Set(['/quick-estimate', '/threshold-checker']);

const chunkCache = new Map<string, Buffer>();
const read = (path: string) => {
  let buffer = chunkCache.get(path);
  if (!buffer) {
    buffer = readFileSync(join(ROOT, path));
    chunkCache.set(path, buffer);
  }
  return buffer;
};

/** Server-only environment variable names must never appear in anything served to the browser. */
const SERVER_ENV_NAMES = [
  'CBAM_API_KEY',
  'CBAM_API_URL',
  'CBAM_API_TIMEOUT_MS',
  'RATE_LIMIT_DISABLED',
  'PUBLIC_API_MODE',
];

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

const failures: string[] = [];

for (const file of listFiles(join(ROOT, '.next', 'static'))) {
  if (!/\.(js|css|html|json|map)$/.test(file)) continue;
  const text = readFileSync(file, 'utf8');
  for (const name of SERVER_ENV_NAMES) {
    if (text.includes(name)) failures.push(`${file.slice(ROOT.length + 1)}: contains ${name}`);
  }
}

const rows: string[] = [];

for (const stat of [...stats].sort((a, b) => a.route.localeCompare(b.route))) {
  const buffers = stat.firstLoadChunkPaths.map(read);
  const gzip = buffers.reduce((total, buffer) => total + gzipSync(buffer).length, 0);
  const text = buffers.map((buffer) => buffer.toString('utf8')).join('\n');
  rows.push(
    `${stat.route.padEnd(42)} ${String(stat.firstLoadUncompressedJsBytes).padStart(10)} B  ${String(gzip).padStart(8)} B gzip`,
  );
  const budget = TOOL_BUDGETS_GZIP[stat.route] ?? CONTENT_BUDGET_GZIP;
  const mustBeLight = !(stat.route in TOOL_BUDGETS_GZIP) || LIGHT_TOOL_ROUTES.has(stat.route);
  if (gzip > budget) {
    failures.push(`${stat.route}: ${gzip} B gzip first-load JS exceeds the ${budget} B budget`);
  }
  if (mustBeLight) {
    for (const marker of MARKERS.heavyOnContent) {
      if (text.includes(marker.text)) {
        failures.push(
          `${stat.route}: ${marker.name} is in the first load of a route that must stay light`,
        );
      }
    }
  }
  for (const marker of [...MARKERS.papaparse, ...MARKERS.xlsxParser]) {
    if (text.includes(marker))
      failures.push(`${stat.route}: parser code ("${marker}") is in the first load`);
  }
  if (stat.route !== '/liability-preview' && MARKERS.queryClient.some((m) => text.includes(m))) {
    failures.push(`${stat.route}: TanStack Query is in the first load`);
  }
}

console.log('Route'.padEnd(42), 'First-load JS'.padStart(12), '  gzip');
console.log(rows.join('\n'));
if (failures.length > 0) {
  console.error(`\nBundle check failed:\n${failures.map((line) => `  - ${line}`).join('\n')}`);
  process.exit(1);
}
console.log(
  '\nBundle check passed: budgets met, content routes and the two light tools carry no Mantine or Zod, no server env name in .next/static, parsers are lazy, TanStack Query is confined to /liability-preview.',
);
