# Engineering Decisions

Binding decisions for every phase. `MASTER_PROMPT.md` takes precedence; if a decision here conflicts with it, fix this file in the same change. Each entry: decision + one-line reason. Add new entries at the end of the relevant section with the date.

Last updated: 2026-10-06 (Phase 1).

---

## 1. Runtime and versions

All versions below were checked against the npm registry on 2026-10-06. Framework packages are pinned **exactly** (no `^`); everything else uses `^`. `package-lock.json` is committed.

| Package | Version | Pin | Reason |
|---|---|---|---|
| Node.js | 22 LTS (`.nvmrc`: `22`; `engines.node`: `>=22.12.0 <23`) | — | Matches the build machine (22.22.0) and satisfies Next 16 and Vitest 4. Move to 24 LTS in a dedicated change. |
| npm | 10.x | — | Ships with Node 22. |
| next | 16.3.8 | exact | Current stable 16.x; App Router, Turbopack default. |
| react / react-dom | 19.3.0 | exact | Satisfies Mantine 9 (`^19.2.0`) and Next 16 peers. |
| @mantine/core, @mantine/hooks, @mantine/notifications | 9.7.1 | exact | Mantine 9 has had 7 minors since March 2026 and supports React 19.2+. If 9.7.1 shows a regression, drop to 9.6.3 and record it. |
| tailwindcss, @tailwindcss/postcss | 4.3.3 | exact | v4 CSS-first config with `@theme` and layer-aware imports. |
| postcss | ^8 | caret | Required by `@tailwindcss/postcss`. |
| typescript | 5.9.3 | exact | `typescript-eslint` requires `<6.1.0`; TS 7 (native port) is out of range and untested with Next type-checking. |
| zod | ^4.6.5 | caret | Supported by `@hookform/resolvers` 5. |
| react-hook-form | ^7.89.0 | caret | Required by the brief. |
| @hookform/resolvers | ^5.9.1 | caret | Zod 4 resolver. |
| lucide-react | ^1.52.0 | caret | One consistent icon set, tree-shakeable named imports. |
| @tanstack/react-query | ^5.104.1 | caret | Liability-preview island only (§4). |
| next-mdx-remote | ^6.0.0 | caret | Guide rendering via `next-mdx-remote/rsc` (§9). |
| papaparse (+ @types/papaparse ^5.5.2) | ^5.7.0 | caret | CSV parser (§8). |
| read-excel-file | ^9.3.10 | caret | XLSX parser (§8). |
| server-only | ^0.0.1 | caret | Build-time guard for adapter/env modules. |
| geist | ^1.7.2 | caret | Self-hosted Geist Sans via `next/font/local` wrapper. |
| eslint | ^9.39.5 | caret | `eslint-plugin-react` (pulled in by `eslint-config-next`) does not support ESLint 10. |
| eslint-config-next | 16.3.8 | exact | Flat config; must match `next`. |
| eslint-config-prettier | ^10.1.8 | caret | Turns off formatting rules. |
| prettier | ^3.9.9 | caret | Formatting. |
| prettier-plugin-tailwindcss | ^0.8.1 | caret | Stable class ordering. |
| vitest | ^4.1.11 | caret | Stable 4.x line; 5.0 is one month old. |
| @vitejs/plugin-react | ^5.2.0 | caret | Supports the Vite 7 that Vitest 4 uses. |
| jsdom | ^27.4.0 | caret | jsdom 30 requires Node ^22.22.2; the build machine has 22.22.0. |
| @testing-library/react / dom / jest-dom / user-event | ^16.3.3 / ^10.4.2 / ^7.0.1 / ^14.6.7 | caret | Component tests. |
| @playwright/test | **1.56.1** | exact | Must match the preinstalled `chromium-1194` in `/opt/pw-browsers`; 1.57.0 expects revision 1200. |
| @axe-core/playwright | ^4.13.0 | caret | Automated a11y scans (peer: any `playwright-core`). |
| write-excel-file | ^4.1.1 (dev) | caret | Generates committed XLSX fixtures once; never shipped. |
| tsx | ^4.23.15 (dev) | caret | Runs `scripts/*.ts`. |
| @types/node ^22.20.5, @types/react ^19, @types/react-dom ^19 | — | caret | Types. |

**Not added (deliberately):** `@mantine/form` (React Hook Form is the form library), `@mantine/dropzone` (native `<input type="file">` plus drag events is enough), `postcss-preset-mantine` (we write no Mantine-mixin CSS; avoids a second PostCSS transform alongside Tailwind), SheetJS `xlsx` (see §8), `exceljs` (unmaintained since 2024, heavy), animation libraries (CSS transitions only), `@t3-oss/env-nextjs` (plain Zod is enough), `gray-matter` (frontmatter comes from `next-mdx-remote`).

### Next.js 16 specifics agents must respect
- Turbopack is the default for `dev` and `build`; do not add webpack-only config.
- `next lint` no longer exists; `npm run lint` runs `eslint .` directly.
- `params` and `searchParams` are Promises in pages, layouts and route handlers; always `await` them.
- Middleware is now `proxy.ts`. We do not need one: headers are set in `next.config.ts` (§12).
- Enable `typedRoutes: true` in `next.config.ts` so internal links are type-checked.

---

## 2. Mantine + Tailwind integration

### 2.1 Responsibilities
- **Mantine**: interactive components only (inputs, selects, checkbox, radio, dialog/modal, drawer, tooltip, notifications, popover, segmented control, progress). Reason: accessible primitives we should not rebuild.
- **Tailwind**: layout, spacing, grid, typography and colour utilities on plain HTML. Reason: zero runtime JS, so content pages stay server-rendered.
- Never restyle a Mantine component with a pile of Tailwind classes. Use the Mantine theme (`components` overrides) or a CSS module. Reason: one styling path per component.

### 2.2 CSS layers and preflight
Single global stylesheet `styles/globals.css`, imported once in `app/layout.tsx`. Its **first line** is the layer order:

```css
@layer theme, base, mantine, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
/* Tailwind preflight is intentionally NOT imported. */
@import "@mantine/core/styles.layer.css";            /* wraps itself in @layer mantine */
@import "@mantine/notifications/styles.layer.css";   /* @layer mantine */
@import "tailwindcss/utilities.css" layer(utilities);

@import "./tokens-theme.css";   /* @theme inline { … } mapping, see §3 */
@import "./base.css";           /* @layer base { minimal element defaults } */
@import "./prose.css";          /* @layer components { guide typography } */
@import "./print.css";          /* @media print rules for result pages */
```

- **Preflight is disabled.** Reason: it resets button, input and heading styles that Mantine relies on. Mantine's own baseline (inside `styles.layer.css`) provides box-sizing and body reset.
- `styles/base.css` adds only what Mantine's baseline lacks: `img, svg, video { display:block; max-width:100% }`, heading/paragraph margin reset, `:focus-visible` outline using the focus token, `prefers-reduced-motion` override.
- **Layer order rationale:** `base` < `mantine` means Mantine wins over our element defaults. `utilities` is last, so a Tailwind utility on a wrapper (spacing, width) always applies.
- Any CSS module we write wraps its rules in `@layer components { … }`. Reason: unlayered CSS beats every layer and would silently override utilities.
- Do **not** import Mantine CSS from a `.tsx` file. Reason: a layer declared in an earlier stylesheet fixes the order before our `@layer` statement runs.

### 2.3 Where MantineProvider lives
- `app/providers.tsx` (`'use client'`): `MantineProvider` (theme from `lib/design/theme.ts`, `forceColorScheme="light"`, `cssVariablesResolver` from `lib/design/theme.ts`) and `<Notifications />`. Nothing else.
- `app/layout.tsx` (server) renders `<html lang="en-GB" {...mantineHtmlProps}>`, puts `<ColorSchemeScript forceColorScheme="light" />` in `<head>`, and wraps `{children}` in `<Providers>`. Reason: the provider is a client boundary, but server children passed through it stay server components.
- `QueryClientProvider` is **not** global. It is mounted inside the liability-preview client island only. Reason: keeps TanStack Query out of content-page bundles.
- **Light theme only.** No dark mode in v1. Reason: halves the design and test surface; brand direction is a warm light palette.

### 2.4 Server vs client component rules
- Editorial and content components (hero, fact strip, process steps, feature grid, guide pages, FAQ, footer, header shell) are **server components using plain HTML + Tailwind**. They must not import `@mantine/*`.
- FAQ and other disclosure content use native `<details>/<summary>` (server). The Mantine `Accordion` wrapper is for tool screens only.
- CTAs on content pages use `components/shared/ButtonLink.tsx` (server, styled `<a>`/`next/link`), not the Mantine `Button`.
- Client islands are named `*Client.tsx` or live under `components/tools/` and `components/results/`. Each starts with `'use client'`.
- Header: the server `SiteHeader` renders links. `HeaderScrollState` (tiny client island) toggles a `data-scrolled` attribute for the sticky style. `MobileNav` (client, Mantine `Drawer`) is the only Mantine import in the header.

---

## 3. Design tokens

### 3.1 Single source
- `lib/design/tokens.ts` is the single definition of colour, radius, shadow and spacing tokens (plain TS object, hex values).
- `lib/design/theme.ts` builds the Mantine theme (`createTheme`) from it. It also exports a `cssVariablesResolver` that emits every token as a `--cc-*` CSS variable on `:root` (rendered server-side by `MantineProvider`).
- `styles/tokens-theme.css` maps those variables into Tailwind with `@theme inline { --color-primary: var(--cc-primary); … }`. It starts with `--color-*: initial;` so only brand colours exist as Tailwind utilities.
- Reason: Mantine's colour functions (hover shades, alpha, autoContrast) need parseable colour values, not `var()` strings. Emitting CSS variables from the same TS object keeps one definition feeding Mantine, Tailwind, `next/og` images and the contrast unit test.

### 3.2 Palette (hex; all text pairs checked against WCAG 2.2 AA)

> Superseded on 7 October 2026 by §37 (visual redesign). The tables below record the Phase 1 palette for history; `lib/design/tokens.ts` and §37 are current.

**Neutrals: `stone` (Mantine `gray` replacement, also `theme.colors.stone`)**

| Shade | Hex | Use |
|---|---|---|
| 0 | `#FFFDF9` | raised surface (cards, inputs) |
| 1 | `#F7F4EE` | page canvas (warm ivory) |
| 2 | `#EFEAE1` | alternate section background (soft stone) |
| 3 | `#E3DDD2` | hairline dividers |
| 4 | `#D2CABD` | decorative borders, table rules |
| 5 | `#ADA597` | disabled fill |
| 6 | `#8C8478` | input/control borders (3.36:1 on canvas, meets 1.4.11) |
| 7 | `#5E5B55` | subtle text: captions, meta (6.16:1 on canvas) |
| 8 | `#4A4843` | muted body text (8.32:1) |
| 9 | `#1D1F22` | graphite ink, primary text (15.05:1) |

**Primary: `petrol`**: `#EAF3F5, #D3E5E9, #A7CAD3, #77ABB8, #4F8E9E, #2F7385, #1B5E70, #0F4C5C, #0B3B48, #072A34` (`primaryShade: 7`). `#0F4C5C` is 8.66:1 on canvas; white on it is 9.51:1. Hover uses shade 8.

**Deep navy (dark editorial sections, footer):** `#0E2A35`; ivory text on it is 13.65:1.

**Secondary: `steel`**: `#EEF2F6, #DCE4EC, #B9C9D8, #95ADC3, #7592AE, #5C7C9A, #4A6B85, #3C586E, #2E4557, #203140`. Use 6 or darker for text (5.12:1 on canvas). Use 7 on the `stone-2` background (6.23:1).

**Positive: `green`**: `#EDF5F0, #D6E9DD, #ADD3BC, #84BC9A, #5FA47B, #458B63, #357553, #2B6246, #214D37, #173828`. Text uses 7 (6.51:1).

**Watch: `amber`**: `#FDF6E7, #FAEBC6, #F4D68E, #EDBF57, #E2A82E, #C98E16, #A6730C, #855C0A, #6E4C08, #4A3307`. Text uses 8 (7.08:1). Shade 4 is a fill or icon colour only, never text (1.94:1).

**Critical: `red`**: `#FBEFEE, #F5D9D7, #EAB2AE, #DD8A84, #CE635C, #BC463F, #A3362F, #872B26, #6B221E, #4F1916`. Text uses 7 (7.96:1). Use red only for `triggered` / `likely_triggered`, rejected rows and blocking errors.

**Semantic CSS variables (emitted as `--cc-*`; Tailwind names in brackets):**

| Token | Value | Tailwind |
|---|---|---|
| `--cc-canvas` | stone-1 `#F7F4EE` | `bg-canvas` |
| `--cc-surface` | stone-0 `#FFFDF9` | `bg-surface` |
| `--cc-surface-alt` | stone-2 `#EFEAE1` | `bg-surface-alt` |
| `--cc-surface-inverse` | `#0E2A35` | `bg-inverse` |
| `--cc-ink` | `#1D1F22` | `text-ink` |
| `--cc-ink-muted` | `#4A4843` | `text-ink-muted` |
| `--cc-ink-subtle` | `#5E5B55` | `text-ink-subtle` |
| `--cc-ink-inverse` | `#F7F4EE` | `text-ink-inverse` |
| `--cc-line` | `#E3DDD2` | `border-line` |
| `--cc-line-strong` | `#8C8478` | `border-line-strong` |
| `--cc-primary` | `#0F4C5C` | `bg-primary` / `text-primary` |
| `--cc-primary-hover` | `#0B3B48` | `bg-primary-hover` |
| `--cc-primary-tint` | `#EAF3F5` | `bg-primary-tint` |
| `--cc-secondary` | `#4A6B85` | `text-secondary` |
| `--cc-focus` | `#2F7385` (4.89:1 on canvas) | focus ring, 2px outline + 2px offset |
| `--cc-positive-fg` / `-bg` | `#2B6246` / `#EDF5F0` (6.44:1) | status badges |
| `--cc-watch-fg` / `-bg` | `#6E4C08` / `#FDF6E7` (7.23:1) | status badges |
| `--cc-critical-fg` / `-bg` | `#872B26` / `#FBEFEE` (7.77:1) | status badges |
| `--cc-info-fg` / `-bg` | `#3C586E` / `#EEF2F6` (6.64:1) | scenario / neutral info |

A unit test (`tests/unit/design/contrast.test.ts`) recomputes every fg/bg pair listed here and fails below 4.5:1 (text) or 3:1 (control borders, focus ring).

### 3.3 Shape, spacing, layout
- Radius: Mantine `xs 4px, sm 6px, md 8px, lg 12px, xl 12px`, `defaultRadius: 'sm'`. Tailwind `--radius-sm/md/lg` = 6/8/12px. Pills only for status badges and tags.
- Shadows: `--cc-shadow-sm: 0 1px 2px rgb(29 31 34 / 0.06)`, `--cc-shadow-md: 0 4px 16px rgb(29 31 34 / 0.08)`. No glass, no blur.
- Content width: `--container-site: 77.5rem` (1240px) with 24px gutters on mobile and 40px on desktop. `PageContainer` owns this.
- Section rhythm: vertical padding `py-20 md:py-28` for chapters, `py-12` for compact strips.
- Motion: 150–250 ms `ease-out` transitions; section-entry fade/translate via one small `useInView` client hook only where used. Everything is disabled under `prefers-reduced-motion`.

---

## 4. Fonts

> Superseded on 7 October 2026 by §37: Archivo, Atkinson Hyperlegible Next and Atkinson Hyperlegible Mono replace Instrument Serif and Geist. The notes below are kept for history.

- **Display:** Instrument Serif 400 normal + italic (OFL-1.1), loaded with `next/font/local` from committed files in `styles/fonts/instrument-serif/` (woff2 + `OFL.txt`, taken from `@fontsource/instrument-serif@5.3.0`). Variable `--font-display`, `display: 'swap'`, `adjustFontFallback: 'Times New Roman'`. Reason: self-hosted with no build-time network fetch (`next/font/google` downloads at build and breaks offline CI).
- **UI/body:** Geist Sans via the `geist` package (`geist/font/sans`, OFL), variable `--font-geist-sans`. Reason: official package, local files, works with `next/font`.
- Fonts are defined once in `lib/design/fonts.ts` and applied as `className` on `<html>`.
- Tailwind: `--font-display: var(--font-display), Georgia, serif`; `--font-sans: var(--font-geist-sans), Inter, system-ui, sans-serif`. Mantine `fontFamily` and `headings.fontFamily` both use the sans stack (Mantine titles appear only in tools).
- The display face is used only via the `font-display` utility on marketing headlines (`HeroSection`, chapter headings, guide H1). Numbers, tables, forms and tool screens use sans with `tabular-nums`.
- Display type scale (Tailwind `@theme`): `--text-display-xl: clamp(2.75rem, 1.6rem + 4.6vw, 5.5rem)`, `--text-display-lg: clamp(2.25rem, 1.5rem + 3vw, 4rem)`, `--text-display-md: clamp(1.875rem, 1.4rem + 1.8vw, 2.75rem)`; line-height 1.02–1.1, letter-spacing `-0.01em`. Body 16px/1.6, small 14px/1.5.

---

## 5. Request architecture

```
Browser (client island)
  ├─ fetch → app/api/*/route.ts  (JSON tools)
  └─ <form action={serverAction}> (contact, rate alert)
          ↓
     lib/api/client.ts  getAdapter()   ('server-only')
          ↓
  fixture-adapter.ts  |  live-adapter.ts → CBAM backend
```

- The adapter is server-only (`import 'server-only'` in every `lib/api/*` file except `schemas.ts` and `types.ts`, which are shared with the client for types and validation).
- `getAdapter()` reads `env.PUBLIC_API_MODE` once and returns the fixture or live adapter. Reason: one switch point.
- Server components (result pages, rate watch, rules changelog, guides) call the adapter **directly**. Client islands go through route handlers. Route handlers contain no business rules: parse → validate (Zod) → rate-limit → adapter → map errors.
- Every adapter response is parsed with its Zod schema (`lib/api/schemas.ts`) in **both** adapters. Reason: fixtures can't drift from the contract.
- Live adapter: `lib/api/http.ts` wraps `fetch` with an `AbortSignal.timeout(env.CBAM_API_TIMEOUT_MS)` (default 10 000 ms), `Authorization` header from `CBAM_API_KEY` if set, and `cache: 'no-store'` for tool calls. It maps failures to `ApiError` codes (`timeout`, `unavailable`, `invalid_response`, `rejected`, `rate_limited`, `not_found`) in `lib/api/errors.ts`, which also holds the §34 user-facing messages.
- In Phase 1–5, live-adapter methods throw `ApiError('not_configured')` with the method name. **No endpoint paths are invented.** Mapping happens in Phase 6.
- Live mode never falls back to fixtures. Reason: §23 says fail visibly.
- Every result schema has `rulesVersion: string` and `dataSource: 'fixture' | 'live'`. `DemoDataIndicator` renders whenever `dataSource === 'fixture'`. `StaleRulesNotice` renders when `rulesVersion !== currentRules.rulesVersion`.

### 5.1 Environment validation
- `lib/config/env-schema.ts`: pure Zod schemas (no `server-only`), shared by `env.ts` and `next.config.ts`.
- `lib/config/env.ts`: `import 'server-only'`; parses `process.env` once and exports `env`.
- `lib/config/public-env.ts`: parses only `NEXT_PUBLIC_*` (referenced literally so Next inlines them); safe on the client.
- `next.config.ts` imports `env-schema.ts` and calls `serverEnvSchema.parse(process.env)` at config load. An invalid env fails `next build` and `next dev`. Reason: §23 requires live mode without values to fail the build. (`env.ts` itself cannot be imported in `next.config.ts` because `server-only` throws outside the react-server condition.)
- Rule enforced by the schema: `PUBLIC_API_MODE=live` requires `CBAM_API_URL` (https URL in production). `CBAM_API_KEY` is optional and never `NEXT_PUBLIC_`.

| Variable | Scope | Default | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | `http://localhost:3000` | canonical origin, sitemap, OG |
| `NEXT_PUBLIC_SITE_ENV` | public | `development` | `production` \| `preview` \| `development`; non-production ⇒ `noindex` everywhere |
| `NEXT_PUBLIC_CBAM_APP_URL` | public | unset ⇒ hand-off CTAs render as "Workspace link to be confirmed" in dev and fail the build when `NEXT_PUBLIC_SITE_ENV=production` | existing app origin |
| `NEXT_PUBLIC_CBAM_SIGN_IN_PATH` | public | `/` | path unknown until the app contract is confirmed |
| `NEXT_PUBLIC_CBAM_CREATE_WORKSPACE_PATH` | public | `/` | same |
| `NEXT_PUBLIC_CBAM_DASHBOARD_PATH` | public | `/` | same |
| `PUBLIC_API_MODE` | **server** | `fixture` | `fixture` \| `live` (the name says PUBLIC but it is server-only, per INTEGRATION_CONTRACT) |
| `CBAM_API_URL` | server | — | required when live |
| `CBAM_API_KEY` | server | — | optional |
| `CBAM_API_TIMEOUT_MS` | server | `10000` | integer 1000–30000 |
| `RATE_LIMIT_DISABLED` | server | `false` | `true` only in E2E |
| `NEXT_PUBLIC_ANALYTICS_DEBUG` | public | `false` | logs analytics events to the console in dev |

---

## 6. Status vocabulary and provenance (single modules)

### 6.1 `lib/config/status.ts`
Exports `RESULT_STATUSES`, a readonly record keyed by status, validated by a Zod schema in a unit test:

| key | label | short description | tone (colour token set) | lucide icon |
|---|---|---|---|---|
| `below` | Below threshold | Below the threshold on the information supplied | positive | `CircleCheck` |
| `watch` | Watch | Below the threshold, within the configured watch band | info (steel) | `Eye` |
| `approaching` | Approaching threshold | Close to the threshold; real customs data recommended | watch (amber) | `TriangleAlert` |
| `likely_triggered` | Likely triggered | Likely over; confirm using the detailed ledger tests | critical | `CircleAlert` |
| `triggered` | Triggered | Over the threshold on the inputs supplied | critical | `OctagonAlert` |
| `needs_data` | Not enough information | Not enough information for a reliable view | neutral (stone) | `CircleHelp` |

- Exports `type ResultStatus`, `getStatus(key)`, plus per-tool allow-lists: `QUICK_ESTIMATE_STATUSES = ['below','approaching','likely_triggered','needs_data']`, `THRESHOLD_STATUSES = ['below','watch','approaching','triggered']`, `LIABILITY_PREVIEW_STATUSES = ['below','approaching','triggered','needs_data']`.
- Tool-specific headline copy (e.g. "Below threshold: based on the information supplied") lives in a `resultHeadline` field per status, not in components.
- `components/shared/StatusBadge.tsx` renders **icon + label text + colour** and never colour alone.
- §11's "lower range" is the `below` status, labelled "Below threshold" (one label per status, per §31.1).

### 6.2 `lib/config/provenance.ts`
Value-provenance badges, kept separate from result statuses:

| key | label | tone | icon | meaning |
|---|---|---|---|---|
| `official` | Official | positive | `Landmark` | from a cited primary source, verified |
| `default_value` | Default value | info | `Database` | published default emissions value used in place of supplier data |
| `supplier_actual` | Supplier actual | positive | `FileCheck` | actual emissions data from the supplier |
| `scenario` | Scenario | watch | `FlaskConical` | illustrative assumption, not an official figure |
| `unverified` | Unverified | neutral | `CircleDashed` | not yet checked against a primary source |

- Rules-config status `proposed` maps to its own badge label "Proposed" (tone `info`, icon `FileClock`), in the same module.
- `components/shared/ProvenanceBadge.tsx` is the single implementation. `components/tools/ScenarioBadge.tsx` is a preset (`provenance="scenario"`). `components/tools/SourceBadge.tsx` adds the source title, date and external link.

---

## 7. Rules config (`lib/config/rules.ts`)

- Each entry is a `RuleValue<T>` validated by Zod: `{ value: T | null, status: 'official'|'proposed'|'scenario'|'unverified', sourceTitle, sourceUrl, sourceDate, effectiveFrom?, reviewedAt, note? }`. `sourceUrl` must be on `gov.uk`, `legislation.gov.uk` or `assets.publishing.service.gov.uk` unless `status` is `scenario`.
- A `rulesVersion` string (`public-rules-2026-10-06`) and `changelog[]` (date, summary, affected keys) live in the same file. `/rules-changelog` and `/rate-watch` read only from here.
- Display rule: `unverified` values render with the Unverified badge. A `null` value renders "To be confirmed", never a guessed figure.
- **Verification protocol:** an agent may set `status: 'official'` only after opening the primary page in the same working session and confirming the value appears there verbatim. It then sets `sourceDate` to the page's "Last updated" or publication date and `reviewedAt` to today. Record the check (URL + quoted sentence) in `docs/PROGRESS.md`. Memory and search-result snippets do not count.

### 7.1 Seed values (all `unverified` at Phase 0)

| Key | Seed value | Status | Candidate primary sources to verify against |
|---|---|---|---|
| `startDate` | `2027-01-01` (as stated in brief §8) | unverified | "Carbon Border Adjustment Mechanism (CBAM): Policy summary" (GOV.UK); "Introduction of a UK Carbon Border Adjustment Mechanism from January 2027: Government response to the policy design consultation" (GOV.UK PDF); the enacted CBAM legislation on legislation.gov.uk (confirm Act title and section) |
| `registrationThreshold` | `{ amount: 50000, currency: 'GBP', period: '12 months' }` (as stated in brief §8 FAQ) | unverified | "Check if you'll need to register for Carbon Border Adjustment Mechanism (CBAM)" (GOV.UK collection); "Factsheet: Carbon border adjustment mechanism" (GOV.UK) |
| `thresholdTests` | two text entries: **backward-looking** (12-month look-back, said to be applied on the first day of each month) and **forward-looking** (expected value over the next 30 days, said to be applied on any day); plain-English descriptions only, no numbers in the text other than interpolated threshold | unverified | "Work out the date you'll need to register for Carbon Border Adjustment Mechanism (CBAM)" (GOV.UK guidance) |
| `thresholdExclusions` | `null` with note "Some goods may not count towards the threshold; link to guidance" | unverified | "Imported Carbon Border Adjustment (CBAM) goods that may not contribute towards the registration threshold" (GOV.UK guidance) |
| `sectors` | `aluminium`, `cement`, `fertilisers`, `hydrogen`, `iron_steel` (labels: Aluminium, Cement, Fertilisers, Hydrogen, Iron and steel) | unverified | Policy summary (GOV.UK); enacted legislation schedule of CBAM goods (legislation.gov.uk) |
| `commodityScopeBasis` | `null`, note "Scope is defined by commodity code in the legislation; the public site does not resolve scope" | unverified | enacted legislation schedule (legislation.gov.uk) |
| `registrationOpens` | `null` (candidate wording "by 1 January 2028" seen in a search snippet; not verified) | unverified | Policy summary / registration guidance (GOV.UK) |
| `firstReturnDeadline` | `null` | unverified | HMRC CBAM return guidance on GOV.UK (title to confirm) |
| `paymentDeadline` | `null` | unverified | same |
| `rateState` | `{ mechanism: null, currentRate: null, publishedAt: null }`, plus a separate `scenarioRates[]` array whose entries are always `status: 'scenario'` | unverified | HMRC/HM Treasury CBAM rate publication on GOV.UK (title to confirm); "Carbon border adjustment mechanism (CBAM): Policy update" (GOV.UK) |
| `carbonPriceRelief` | concept text only; no figures | unverified | Policy summary; draft legislation and "Draft tax information and impact note" (GOV.UK) |
| `recordRetention` | `null` (do not display a period until verified) | unverified | HMRC CBAM record-keeping guidance (title to confirm) |
| `reviewedAt` (file level) | `2026-10-06` | — | — |

Candidate URLs found during Phase 0 (to open and read, not yet verified):
- https://www.gov.uk/government/publications/carbon-border-adjustment-mechanism-cbam-policy-summary/carbon-border-adjustment-mechanism-cbam-policy-summary
- https://www.gov.uk/government/publications/factsheet-carbon-border-adjustment-mechanism-cbam/factsheet-carbon-border-adjustment-mechanism
- https://www.gov.uk/guidance/work-out-the-date-youll-need-to-register-for-carbon-border-adjustment-mechanism-cbam
- https://www.gov.uk/government/collections/check-if-youll-need-to-register-for-carbon-border-adjustment-mechanism-cbam
- https://www.gov.uk/guidance/imported-carbon-border-adjustment-cbam-goods-that-may-not-contribute-towards-the-registration-threshold
- https://www.gov.uk/government/consultations/draft-legislation-carbon-border-adjustment-mechanism/carbon-border-adjustment-mechanism-cbam-policy-update
- https://www.gov.uk/government/consultations/draft-legislation-carbon-border-adjustment-mechanism/draft-tax-information-and-impact-note

### 7.2 Product guidance (not regulatory): `lib/config/tools.ts`
- Threshold guidance bands as fractions of the threshold: `watch` from 0.60 to <0.80, `approaching` from 0.80 to <1.00, labelled "Product guidance, not a statutory value". Reason: §11.
- Quick-estimate answer bands, upload limits (10 MB, 5,000 data rows, `.csv`/`.xlsx`, first sheet default), and request-body limit (2 MB JSON) all live here.

### 7.3 Start-date helper
`lib/utils/rules-dates.ts` exports `getStartDateStatus(now = new Date())` → `{ phase: 'before' | 'in_force', phrase: 'starts' | 'in force since', date }`. It also exports `formatStartEyebrow()` → "UK CBAM · live 1 Jan 2027" before the start date, and "UK CBAM · in force since 1 Jan 2027" on or after it. It is the only place that compares against the start date. Pages that use it set `export const revalidate = 86400` so the phrase flips within a day.

---

## 8. File parsing (liability preview, steps 1–4 in the browser)

- **CSV: `papaparse`** (`header: false`, then our own heading discovery; `worker: true` for files > 1 MB; delimiter auto-detect for `,` and `;`). Reason: maintained, streaming/worker support, handles quoting and BOM.
- **XLSX: `read-excel-file`** (`read-excel-file/browser`; `readSheetNames` for the sheet picker). Reason: maintained (Aug 2026), read-only, small, no CVE history. SheetJS `xlsx@0.18.5` on npm is stale with known advisories, and newer SheetJS builds are not on the npm registry. `exceljs` is unmaintained since 2024 and too heavy.
- Both are loaded with `await import()` **inside** `lib/upload/parse-file.ts`, called only from the liability-preview island. Reason: they never enter other routes' bundles. Verify with `next build` route sizes.
- Pre-parse checks (`lib/upload/file-checks.ts`): extension in `{.csv,.xlsx}`, MIME in an allow-list (`text/csv`, `application/vnd.ms-excel` for CSV from Windows, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, or empty string with a valid extension), size ≤ 10 MB. `.xlsm`, `.xls`, `.xlsb` and anything else are rejected with a specific message.
- After parsing: rows > 5,000 ⇒ reject with the count. Heading discovery, column-mapping suggestions with confidence (`lib/upload/column-matching.ts`), and row/cell validation (`lib/upload/validate-rows.ts`, Zod per mapped column) are all pure functions with unit tests.
- Only mapped, validated rows (plus `fileSha256` and `sheetName`) are POSTed. The raw file never leaves the browser. Copy on screen states exactly this, and nothing about server retention until the backend contract is known.
- Raw rows are never logged, stored in `localStorage` or sent to analytics.

### 8.1 Fixture-mode upload results
- The browser computes `fileSha256` of the raw file bytes (`crypto.subtle.digest`) and sends it with the mapped rows.
- `lib/api/fixtures/upload-manifest.ts` maps the SHA-256 of each committed file in `tests/fixtures/` to a precomputed, deterministic preview (`lib/api/fixtures/liability-previews.ts`). A unit test recomputes the hashes from disk and fails if any file changes without the manifest being updated (`npm run fixtures:hash` prints the new hashes).
- Unknown files return the fixed **demo preview** (`fixtureKey: 'demo'`): a generic Northstar sample with `isDemo: true`, a prominent "Demo result: not calculated from your file" banner, and the parsed row counts from the visitor's own validation step. Nothing is calculated from their rows.
- Session ids in fixture mode are stateless: `fx_<fixtureKey>`. `getLiabilityPreview(id)` resolves from the manifest, so results survive refresh and serverless instances. Reason: no store needed.
- Keying on the raw file (not the mapped rows) means E2E can change a column mapping and still get the matching fixture result. The result notes "Sample result pre-computed for this sample file."

### 8.2 Committed fixtures (`tests/fixtures/`)
- `northstar-steel-imports.csv`: clean, comma-delimited. Steel (in scope), steel fasteners (in scope), cement line, ferrous scrap (out of scope), a pre-1-Jan-2027 line.
- `meridian-aluminium.xlsx`: two sheets (`Imports`, `Notes`). Aluminium in scope, aluminium scrap out of scope.
- `supplier-b-messy.xlsx`: decimal commas, unit strings in numeric cells ("12,5 t"), header typo ("Comodity code"), reordered columns, a total row, an unverified declaration column.
- `broker-export-messy.csv`: semicolon-delimited, a malformed date, a duplicate row, a missing commodity code, an unsupported value.
- `invalid/report.xlsm`: tiny file used to assert rejection.
- XLSX files are generated once by `scripts/generate-fixtures.ts` (`write-excel-file`), then committed. Regenerating changes hashes, so the manifest test catches it.
- Only fictional companies from §30 appear.

---

## 9. Quick estimate result persistence

**Decision: URL-encoded answer bands; no server-side storage.**
- The wizard holds answers in React state (React Hook Form + Zod, one schema per step in `lib/validation/quick-estimate.ts`). On completion it navigates to `/quick-estimate/result?v=1&value=<band>&sectors=<keys>&origins=<region keys>&suppliers=<band>&large=<yes|no|unsure>`.
- Every parameter is an enum key from `lib/config/tools.ts`. Value bands: `under_25k`, `25k_50k`, `50k_100k`, `100k_500k`, `500k_2m`, `over_2m`, `unknown`. Supplier bands: `1`, `2_5`, `6_20`, `21_plus`, `unknown`. Origins are region groups (e.g. `china`, `india`, `turkey`, `eu_efta`, `other_asia`, `other`), not free text. No exact values and no company or contact data.
- The result page is a server component. It parses `searchParams` with the same Zod schema and calls `adapter.runQuickEstimate()` server-side. Invalid or missing params render the `needs_data` state with a link back to the wizard.
- `robots: { index: false }` on the result page.
- Reason: survives refresh and can be shared, needs no store (fixture mode works on any host), carries no sensitive values, and the result is recomputed against current rules (so it is never stale).

---

## 10. Guide content pipeline

- Files: `content/guides/<slug>.mdx`. Frontmatter is validated by `lib/content/guide-schema.ts` (Zod): `title`, `summary` (≤ 200 chars), `slug` (must equal filename), `sectors[]` (sector keys from rules), `topic` (enum: `basics`, `threshold`, `scope`, `suppliers`, `relief`, `returns`), `tags[]`, `reviewedAt` (ISO date), `rulesBasis` (must equal a `rulesVersion` in `rules.ts` changelog), `sources[]` (≥ 1, each `{ title, url, accessedAt }` with the same primary-domain rule as §7), `featured?`, `keyFacts?[]` (each may reference a rules key so figures are interpolated).
- Rendering: `next-mdx-remote/rsc` `compileMDX({ source, options: { parseFrontmatter: true }, components })` in `lib/content/guides.ts` (`server-only`, `fs` read of `content/guides`). Reason: works with Next 16 RSC and Turbopack without MDX bundler plugins; `@next/mdx` needs extra remark plugins for YAML frontmatter, and Turbopack restricts non-serialisable plugin options.
- Body figures use an MDX component `<Rule k="registrationThreshold" />` that renders the value from `rules.ts` with its provenance badge. Typed numbers for regulatory values in MDX are forbidden (checked by a unit test that scans guide bodies for `£` followed by digits).
- `/guides/[slug]` uses `generateStaticParams` + `dynamicParams = false`. Both adapters' `getGuideIndex`/`getGuide` delegate to `lib/content/guides.ts`.
- Search/filter on `/guides`: the server passes a slim index (title, summary, topic, sectors, tags, reviewedAt, slug) to a small client island (`GuideFilters`) that filters in memory. No search dependency.
- A unit test loads every guide and validates its frontmatter, so bad content fails CI.

---

## 11. Forms

- **Server actions** for rate-alert subscription and contact/broker requests (`app/(marketing)/rate-watch/actions.ts`, `app/(marketing)/for-brokers/actions.ts`, sharing `lib/forms/submit.ts`). Reason: progressive enhancement, and Next's built-in Origin/Host check gives CSRF protection without tokens.
- **Route handlers** for JSON tool calls from client islands: `POST /api/liability-preview`, `GET /api/liability-preview/[sessionId]`. Every `POST` handler runs `lib/security/same-origin.ts` (rejects if `Origin` is present and doesn't match `NEXT_PUBLIC_SITE_URL` or the request host).
- Shared Zod schemas in `lib/validation/forms.ts` are used by React Hook Form (`zodResolver`) on the client and re-parsed in the action.
- Fields kept to the minimum: email (+ optional name/company for contact). Marketing consent is a separate unticked checkbox. Rate-alert subscription is not marketing consent.
- **Honeypot:** a visually hidden field `website` (`components/shared/Honeypot.tsx`; `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`). A non-empty value returns the normal success state and does nothing. Reason: don't tip off bots.
- **Rate limiting:** `lib/security/rate-limit.ts`, an in-memory fixed-window limiter keyed by `sha256(ip + route)` (IP from `x-forwarded-for` first hop, falling back to `x-real-ip`). Defaults: forms 5/10 min, liability preview 10/10 min, threshold/estimate 30/min. It only exists per instance. That's acceptable for fixture mode; in live mode the backend must enforce its own limits (logged as a Phase 6 item). It is disabled when `RATE_LIMIT_DISABLED=true` (E2E only).
- In fixture mode `subscribeRateAlert`/`submitContactRequest` validate and return a fixture acknowledgement. They never send email or log the address. The confirmation copy says "Demo mode: no email was sent."

---

## 12. Security headers (`next.config.ts` `headers()`)

- CSP (production): `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests`. In development, add `'unsafe-eval'` to `script-src` and `ws:` to `connect-src`.
  - Reason: nonce-based CSP forces dynamic rendering of every page, which defeats static generation (§28). `'unsafe-inline'` scripts are the accepted trade-off. `'unsafe-eval'` is never in production. Mantine injects inline styles, which needs `style-src 'unsafe-inline'`. PapaParse workers use `blob:`.
- `Strict-Transport-Security: max-age=63072000; includeSubDomains` (no `preload` until the domain is confirmed).
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()`.
- `poweredByHeader: false`.
- External links go through `components/shared/ExternalLink.tsx` (`rel="noopener noreferrer"`, external icon, visually hidden "(opens in new tab)" when `target="_blank"`).

---

## 13. Analytics

- `lib/analytics/events.ts`: a discriminated union of allowed events, each with a Zod schema whose properties are **enums or booleans only** (no free strings, no numbers derived from user values). Events: `cta_click {location, cta}`, `wizard_start`, `wizard_step {step}`, `wizard_complete {status}`, `upload_start {fileType}`, `upload_complete {rowBand}`, `upload_failed {reason}`, `guide_open {slug}`, `rate_alert_subscribed`, `contact_submitted {kind}`, `sign_in_click {location}`.
- `lib/analytics/index.ts`: `track(event)` validates against the schema (drops invalid events) and forwards to the active provider. Providers: `noop` (default) and `debug` (console, dev only, `NEXT_PUBLIC_ANALYTICS_DEBUG=true`).
- No cookies and no device storage, so **no consent banner** (§24.1). If a provider is ever added, it must be cookieless or arrive with the consent banner described in §24.1. Record that decision here.
- A unit test asserts no event schema contains a free-form string field.

---

## 14. SEO

- `lib/seo/metadata.ts` exports `buildMetadata({ title, description, path, noindex? })`, which builds canonical and OG URLs from `NEXT_PUBLIC_SITE_URL`. Title template `%s | {brandName}`.
- When `NEXT_PUBLIC_SITE_ENV !== 'production'`, every page is `noindex` and `robots.ts` disallows all.
- Tool result routes (`/quick-estimate/result`, any URL with a session id) are `noindex`.
- OG images: `next/og` per page type in Phase 7, colours imported from `lib/design/tokens.ts`.
- JSON-LD helpers in `lib/seo/structured-data.ts` (`Organization`, `FAQPage` from the same FAQ config the page renders, `Article` for guides, `BreadcrumbList`).

---

## 15. Testing

- **Vitest** (`vitest.config.mts`): `environment: 'jsdom'`, `@vitejs/plugin-react`, alias `@/` → repo root, alias `server-only` → `tests/stubs/empty.ts`, `setupFiles: ['tests/setup.ts']` (jest-dom matchers, `MantineProvider` test wrapper in `tests/utils/render.tsx`). Tests live in `tests/unit/**` and `tests/component/**`. Pure-logic tests can opt into `// @vitest-environment node`.
  - jsdom needs `window.matchMedia` and `ResizeObserver` stubs for Mantine (in `tests/setup.ts`).
- **Playwright** (`playwright.config.ts`): `@playwright/test@1.56.1`, `testDir: 'tests/e2e'`. Projects: `desktop-chromium` (1440×900) and `mobile-chromium` (Pixel 7 viewport, Chromium; no WebKit since only Chromium is installed). `webServer: { command: 'npm run build && npm run start -- -p 3100', env: { PUBLIC_API_MODE: 'fixture', RATE_LIMIT_DISABLED: 'true', NEXT_PUBLIC_SITE_ENV: 'development', NEXT_PUBLIC_SITE_URL: 'http://localhost:3100' }, reuseExistingServer: !process.env.CI }`.
  - **Locally and in agent sessions:** `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` is already set. **Never run `playwright install`.**
  - **In GitHub Actions only:** the workflow runs `npx playwright install --with-deps chromium`, because hosted runners have no preinstalled browser.
- **Axe:** `tests/e2e/helpers/axe.ts` wraps `AxeBuilder` with tags `wcag2a, wcag2aa, wcag21aa, wcag22aa`. It fails on `serious`/`critical`. `tests/e2e/a11y.spec.ts` iterates `PUBLIC_ROUTES` from `lib/config/routes.ts`.
- **Screenshots:** `tests/e2e/screenshots.spec.ts` (tagged `@visual`, excluded from CI by `grep-invert`) captures major routes at 375, 768 and 1440 px into `test-results/screenshots/` (gitignored) for phase reviews.
- `lib/config/routes.ts` is the single list of public routes, used by sitemap, E2E and a11y.

---

## 16. Tooling

- `package.json` scripts: `dev` (`next dev`), `build` (`next build`), `start` (`next start`), `typecheck` (`next typegen && tsc --noEmit`, see §20), `lint` (`eslint .`), `format` (`prettier --write .`), `format:check`, `test` (`vitest run`), `test:watch`, `test:e2e` (`playwright test`), `fixtures:generate`, `fixtures:hash`.
- ESLint flat config `eslint.config.mjs`: `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript` + `eslint-config-prettier`. Custom rules:
  - `no-restricted-imports`: blocks `@mantine/*` in `components/{hero,content,layout}/**` except `MobileNav.tsx`; blocks `@/lib/api/*` (except `schemas`, `types`) and `@/lib/config/env` from client files.
  - `no-restricted-syntax`: forbids `toLocaleString`/`Intl.NumberFormat` outside `lib/utils/format.ts`.
- TypeScript: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes: false`, path alias `@/*`.
- CI `.github/workflows/ci.yml`: Node from `.nvmrc`; `npm ci` → `typecheck` → `lint` → `format:check` → `test` → `build` (fixture env) → install Chromium → `test:e2e`. Upload the Playwright report on failure.

---

## 17. Folder and file layout

```
app/
  layout.tsx                 server: html/body, fonts, Providers, SkipLink, SiteHeader, SiteFooter
  providers.tsx              'use client': MantineProvider + Notifications
  not-found.tsx  error.tsx ('use client')  global-error.tsx ('use client')
  sitemap.ts  robots.ts
  (marketing)/page.tsx + one folder per §5 route
  (marketing)/quick-estimate/result/page.tsx
  (marketing)/rate-watch/actions.ts  (marketing)/for-brokers/actions.ts
  api/liability-preview/route.ts
  api/liability-preview/[sessionId]/route.ts
  api/health/route.ts        returns { mode, rulesVersion } (no secrets)

lib/config/
  site.ts            brand name, legal placeholders, contact emails, legal-approval flags, hand-off URL builder
  rules.ts           regulatory values (§7)
  rules-schema.ts    Zod RuleValue + rules file schema
  navigation.ts      header/footer/mobile nav items, primary CTA label "Check my exposure"
  pricing.ts         plans/features; price: null ⇒ "Talk to us"
  status.ts          canonical result statuses (§6.1)
  provenance.ts      provenance badges (§6.2)
  tools.ts           guidance bands, quick-estimate bands, upload limits, rate-limit settings
  routes.ts          PUBLIC_ROUTES list + noindex flags
  faq.ts             homepage FAQ entries (rules-interpolated)
  sectors.ts         sector presentation content keyed by rules sector keys
  env-schema.ts      Zod env schemas (pure)
  env.ts             server-only parsed env
  public-env.ts      NEXT_PUBLIC_* parsed env

lib/api/
  types.ts           PublicApiAdapter interface (12 methods, names per §23)
  schemas.ts         Zod request/response schemas (shared)
  errors.ts          ApiError, codes, §34 user messages
  client.ts          getAdapter() server-only
  http.ts            live fetch wrapper (timeout, auth, error mapping)
  fixture-adapter.ts
  live-adapter.ts    methods throw not_configured until Phase 6
  fixtures/
    rules-summary.ts  quick-estimate.ts  threshold.ts
    liability-previews.ts  upload-manifest.ts
    rate-watch.ts  product-config.ts  acknowledgements.ts

lib/design/          tokens.ts  theme.ts  fonts.ts
lib/content/         guides.ts  guide-schema.ts  mdx-components.tsx
lib/validation/      quick-estimate.ts  threshold.ts  forms.ts  upload.ts
lib/upload/          file-checks.ts  parse-file.ts  column-matching.ts  validate-rows.ts  hash-file.ts
lib/tools/           threshold.ts (pure band classifier used by the instant checker and the fixture adapter)
lib/analytics/       events.ts  index.ts  providers/noop.ts  providers/debug.ts
lib/security/        rate-limit.ts  same-origin.ts  client-ip.ts
lib/seo/             metadata.ts  structured-data.ts
lib/utils/           format.ts (en-GB money, mass, dates, percentages)  rules-dates.ts  cn.ts

components/layout/   SiteHeader  HeaderScrollState (client)  MobileNav (client)  SiteFooter
                     PageContainer  Section  SkipLink  BrandMark  Breadcrumbs
components/hero/     HeroSection  ProductPreview (hero compliance snapshot)  FactStrip
                     CalculationPreview ("why this number")  SupplierStoryPreview
components/content/  ProcessSteps  FeatureGrid  SplitFeature  ChapterHeading
                     GuideCard  GuideFilters (client)  GuideHeader  KeyFacts  RelatedGuides
                     SourcePanel  ChangelogTimeline  Prose  RuleValue (MDX <Rule/>)  DraftLegalNotice
components/conversion/ CTASection  FAQSection (native details)  PrimaryCta  WorkspaceCta
                     RateAlertForm (client)  ContactForm (client)  PortfolioPreview
components/tools/    WizardShell  ProgressBar  EstimateForm  SectorSelector  CountrySelector
                     RangeSelector  FileDropzone  FileRequirements  FilePreview  ColumnDiscovery
                     ColumnMapper  ValidationSummary  ProcessingStatus  ThresholdGauge
                     ThresholdChecker  LiabilityPreviewFlow  ScenarioBadge  SourceBadge   (all client)
components/results/  QuickEstimateResult  ThresholdResult  LiabilitySummary  LiabilityTable
                     SupplierExposureList  MethodologyDrawer (client)  ResultNotice
                     DemoDataIndicator  StaleRulesNotice  PrintButton (client)
components/shared/   Button (client, Mantine)  ButtonLink (server)  Input  Select  Checkbox
                     RadioGroup  Badge  StatusBadge  ProvenanceBadge  Card  Dialog  Drawer
                     Tooltip  Accordion  Toast (notify helper)  Skeleton  Alert  EmptyState
                     ErrorState  InlineFieldError  ErrorSummary  Honeypot  ExternalLink  VisuallyHidden

content/guides/      *.mdx
styles/              globals.css  tokens-theme.css  base.css  prose.css  print.css  fonts/instrument-serif/
types/               global.d.ts (only ambient types; domain types come from Zod via z.infer)
public/images/       CREDITS.md
scripts/             generate-fixtures.ts  hash-fixtures.ts
tests/               setup.ts  stubs/empty.ts  utils/render.tsx  unit/  component/  e2e/  fixtures/
```

---

## 18. Content and formatting rules (enforced in code)

- Brand name only from `site.ts` (`siteConfig.brandName`, default `CBAM Control`, `isPlaceholder: true`).
- All money, mass, dates and percentages go through `lib/utils/format.ts` with locale `en-GB` (`formatGBP`, `formatGBPRange`, `formatTonnes`, `formatDate` → "1 January 2027", `formatDateShort` → "1 Jan 2027").
- Every tool result renders `ResultNotice` (one shared sentence naming the rules snapshot). `DemoDataIndicator` renders in fixture mode.
- Legal pages show `DraftLegalNotice` until `siteConfig.legal.<page>.approved === true`.

---

## 19. Recorded conflicts in the brief (§0.1)

1. **§7 mobile "Check Exposure" vs. "one label everywhere: Check my exposure."** The navigation *link* to `/exposure-check` is labelled "Check exposure". The primary *button* (desktop header, mobile drawer, section CTAs) is always "Check my exposure". Reason: a nav item and a CTA are different elements, and the brief's single-label rule is about the action.
2. **§11 "lower range" vs. §31.1 key `below`.** Use `below` with the single label "Below threshold".
3. **§11 "instant calculator" vs. §3/§23 "no business rules in the frontend".** The threshold checker computes status client-side with `lib/tools/threshold.ts`. That function only compares visitor-entered totals with the published threshold and the product guidance bands; it does no scope resolution or liability maths. The fixture adapter's `runThresholdCheck` uses the same function. In Phase 6, if the backend exposes a threshold endpoint, the checker's "Confirm" step calls it through `/api` and the instant gauge stays as a preview.
4. **`PUBLIC_API_MODE` name looks public, but it is server-only** (INTEGRATION_CONTRACT). Keep the name for contract parity and never prefix with `NEXT_PUBLIC_`.
5. **`/how-it-works` has no phase in §37.** Assigned to Phase 4 alongside content pages.
6. **Brief §6.5, §6.6 and §6.8 vs. the user's redesign instruction (7 October 2026).** The user asked for a site that does not look AI-generated, with uncommon fonts and a new palette, and chose the "Carbon copy" direction. The brief was amended in the same change; see §37.

---

## 20. Phase 1 implementation notes (2026-10-06)

Changes made while building the foundation. None alter a binding decision above except where stated.

1. **`typecheck` runs `next typegen` first.** With `typedRoutes: true`, `next-env.d.ts` imports `.next/types/routes.d.ts`, which only exists after typegen or a build. Without it a clean checkout (CI) fails `tsc`. Script is `next typegen && tsc --noEmit`.
2. **First `npm install` needed `--legacy-peer-deps`.** npm 10.9.4's arborist crashes (`Cannot read properties of null (reading 'edgesOut')`) resolving vitest's peer set from an empty lockfile. After one `--legacy-peer-deps` install, the committed lockfile installs cleanly with plain `npm install` and `npm ci`, and `npm ls` reports no invalid or missing peers. All versions in §1 installed as pinned.
3. **Holding pages for unbuilt routes.** Every route in `PUBLIC_PATHS` has a minimal `HoldingPage` (noindex, "Coming soon") so header and footer links resolve and `typedRoutes` accepts them. `lib/config/routes.ts` has an `available` flag; the sitemap lists only `available && !noindex` routes (currently `/`). Each phase flips the flag when it ships the real page. `/guides/[slug]` has no holding page.
4. **First-load JS is read from `.next/diagnostics/route-bundle-stats.json`.** Next 16 no longer prints per-route sizes in the build table. Figures in `docs/PROGRESS.md` are uncompressed bytes from that file, with gzip computed from the listed chunks.
5. **Mantine theme uses plain component objects, not `Button.extend(...)`.** Importing the component classes into `lib/design/theme.ts` pulled Button, Drawer, Modal and others into every page's bundle through the provider (about 40 KB gzip).
6. **`MobileNav` loads its Drawer on first interaction** (`MobileNavDrawer.tsx` via `next/dynamic`, preloaded on hover/focus). Focus returns to the menu button explicitly on close because the drawer mounts after the trigger was focused. Home first-load JS fell from about 273 KB to about 175 KB gzip.
7. **Sign in link.** When `NEXT_PUBLIC_CBAM_APP_URL` is unset the desktop header omits "Sign in" and the mobile drawer shows "Sign-in link to be confirmed" as plain text. It becomes a real link once the app URL is configured.
8. **Config stores icon names, not components.** `status.ts` and `provenance.ts` hold lucide icon names (validated by Zod); `components/shared/icons.ts` maps names to components. Keeps config pure and unit-testable.
9. **Provenance has six keys.** `proposed` (from §7 rules status) is a sixth entry alongside the five in §6.2.
10. **`guide_open` analytics slug** is a one-value placeholder enum until Phase 4 generates it from the guide index, so no analytics schema holds a free string.
11. **Rules source URLs for unseeded values** point at the GOV.UK CBAM collection page (or the legislation.gov.uk root for scope). They are placeholders to be replaced with the exact page when each value is verified. Every value stays `unverified`.
12. **Prettier ignores** `docs/`, `MASTER_PROMPT.md`, `public/` and `styles/fonts/` so planning documents keep their hand formatting.
13. **ESLint:** the Mantine ban in `components/{hero,content,layout}` exempts `MobileNav.tsx` and `MobileNavDrawer.tsx`. The client-import restriction applies to `*Client.tsx`, `components/tools/**`, `components/results/**`, `app/providers.tsx`, `app/error.tsx` and `app/global-error.tsx`.
14. **Playwright** `grepInvert` for `@visual` applies only when `CI` is set, so local runs also produce screenshots (desktop project only; the spec sets its own viewports).

---

## 21. Phase 2 homepage notes (2026-10-06)

1. **Folder layout follows section 17:** `components/hero/` (HeroSection, ProductPreview, PreviewGauge, FactStrip, CalculationPreview, SupplierStoryPreview), `components/content/` (ChapterHeading, ProcessSteps, FeatureGrid, SplitFeature, GuideCard, GuideTeasers, Reveal), `components/conversion/` (FAQSection, CTASection, BrokerSection).
2. **All homepage components are server components** without Mantine. The only client island is `RevealClient` (IntersectionObserver). Content is visible without JavaScript; below-the-fold blocks fade in once hydrated, and nothing moves under `prefers-reduced-motion`. Gauge and bar draw-ins are CSS animations whose final state is the resting state.
3. **FAQ uses native `<details>`** (keyboard operable). `FaqEntry` gained an optional `source` (title, URL, rules status) shown with a provenance badge. FAQPage JSON-LD comes from `lib/seo/structured-data.ts` using the same entries.
4. **Fact strip values** come from `lib/utils/rules-facts.ts` (`getRuleFacts`), which reads the rules config and the shared start-date helper. Unset values read "To be confirmed"; provenance equals the rules status (currently all Unverified).
5. **Sample figures** live in `lib/config/home-sample.ts` (fictional importer and suppliers from section 30). The registration threshold is read from rules, never stored there. The sample rate, default intensity and relief assumption are labelled Scenario. A unit test checks the sample arithmetic and that components contain no typed threshold, start date or sector list.
6. **Hero gauge is a marketing SVG** (`PreviewGauge`), not the Phase 3 `ThresholdGauge` tool component; Phase 3 may share drawing code.
7. **Featured guides** are placeholders in `lib/config/home-content.ts` marked `coming_soon`, linking to `/guides`.
8. **Process-step numerals** use `text-primary/65` to pass axe colour contrast; scrollable table wrappers have `role="region"`, a label and `tabIndex=0`.
9. **`formatEmissions` and `formatIntensity`** were added to `lib/utils/format.ts`.
10. **Marketing CSS** is in `styles/marketing.css` (components layer): ledger texture, material grid, reveal and draw-in rules, FAQ marker.
11. **Homepage CTA targets `/exposure-check`**, currently a holding page until Phase 3.

---

## 22. Phase 3 notes: Chunk A (exposure check, quick estimate, threshold checker)

Chunks B and C (upload pipeline, liability preview) append further notes below (items 11 onwards).

1. **Quick estimate (amends section 9).** `sectors` and `origins` accept `unsure`, which is exclusive. Value bands in `lib/config/tools.ts` carry `min` and `max`. Classification: `unknown` band or null threshold gives `needs_data`; band minimum at or above the threshold gives `likely_triggered`; band maximum above the approaching ratio times the threshold gives `approaching`; otherwise `below`. A `below` result with `large = yes` becomes `approaching`. Confidence is `medium`, or `low` when sectors are only "not sure", suppliers or large shipments are unknown, or the status is `needs_data`; it never reaches high. No email capture in Phase 3.
2. **Result persistence.** The result page encodes answer bands only (`v=1&value=...&sectors=a,b&origins=...&suppliers=...&large=...`) and recomputes through the adapter on every load. Unknown keys or a missing version render the `needs_data` card without calling the adapter. The result and wizard routes are server-rendered on demand because they read `searchParams`.
3. **Wizard state.** Answers are plain React state with per-step Zod schemas, not React Hook Form (the plan suggested RHF). One form per step added nothing over `safeParse`. RHF is used in the threshold checker. The progress bar is a custom `role="progressbar"` element rather than Mantine `Progress`, to keep the bundle small. Choice cards are native radio and checkbox inputs.
4. **Threshold checker (amends 19.3).** No `/api/threshold-check`. The server page passes rules values as props; the island imports only `lib/tools/threshold*.ts`. "Triggered" means at or above the threshold (corrected in Phase 7: GOV.UK "Work out the date you'll need to register" says "£50,000 or more" for both tests). Forward view: entered amount, else `not_assessed` when lumpy, else an even spread of the annual value over 30/365 labelled as a simplification. Sector choice is optional and only tailors the next-step sentence. `ResultNotice` and `StaleRulesNotice` are server-rendered and passed to the island as slots so `rules.ts` stays out of its bundle.
5. **Scenario assumptions** live in `lib/config/scenario-assumptions.ts`, not in `rules.ts`. `home-sample.ts` reads the rate, relief and steel default intensity from it (values unchanged). The fictional supplier-actual intensities are recorded there with a "fictional sample declaration" note.
6. **Analytics.** `cta_click.location` gains `exposure_check` and `tool`; `cta` gains `threshold_checker` and `print`; new event `threshold_checked` (statuses and a boolean only). A unit test asserts no schema contains a number.
7. **Gauge.** Drawing maths is shared in `lib/design/gauge.ts` by `PreviewGauge` and `ThresholdGauge`. The tool gauge eases between values with a CSS transition; status is always also given as a badge and text. Guidance ticks are described in text under the gauges with the "Product guidance, not a statutory value" label.
8. **Mantine descriptions.** The default dimmed description colour failed axe contrast; `styles/tools.css` sets it to the muted ink token.
9. **Routes.** `/exposure-check`, `/quick-estimate` and `/threshold-checker` are now `available` and in the sitemap; the smoke test expects `/exposure-check` present and `/how-it-works` absent. `app/api/health/route.ts` added.
10. **Exposure check copy.** The privacy line ("Your file is read in your browser...") describes the upload flow built in Chunk B/C; `/liability-preview` is still a holding page until then.

### Chunks B and C: upload pipeline and liability preview

11. **XLSX parser (amends section 8).** `read-excel-file` 9 has no `readSheetNames`. The parser uses `read-excel-file/universal`, whose default export returns every sheet from an `ArrayBuffer`, so the browser and Vitest share one code path. The first sheet is used unless it has no headings; the visitor can pick any sheet.
12. **CSV parsing (amends section 8).** No worker. Files up to 10 MB are parsed on the main thread after one yielded frame so "Checking your file" paints first. Papa's own delimiter guess failed on a semicolon export with commas in free text, so `parse-file.ts` picks the delimiter (comma, semicolon, tab) that splits the most early rows into the same field count. UTF-8 is tried first, then windows-1252; a BOM is stripped. `worker-src blob:` stays in the CSP (harmless) and can be dropped in Phase 7.
13. **Request shape (amends section 8).** `rows` are typed `previewRowSchema` rows (rows with outcome valid or normalised only), plus `fileType`, `sheetName`, `fileSha256` and `clientSummary` counts. Headers, raw cells and file names are never sent. Session ids are `fx_(northstar|meridian|supplier_b|broker_export|demo)`; a demo result echoes the visitor's counts in the POST response only. `/liability-preview/result/[sessionId]` is server rendered, noindex and not in `PUBLIC_PATHS` or the sitemap. `uploadLiabilityPreviewFile` stays in the interface but the fixture throws `not_implemented_fixture` because the raw file never leaves the browser.
14. **Fixtures (amends section 8.2).** `supplier-b-messy.xlsx` has sheets `Cover` and `Lines` with all-string cells. CSVs are hand-written; only the two XLSX files and `invalid/report.xlsm` are generated (`npm run fixtures:generate`, which rewrites the files and so changes their hashes; re-run `fixtures:hash` and update `upload-manifest.ts`). `.gitattributes` marks fixtures binary so line endings never change a hash. A unit test recomputes every hash and a pipeline test checks that the rows the browser would send equal the fixture line definitions.
15. **Overall liability status** maps the threshold status: triggered and approaching carry over, `below` and `watch` become `below`, and no in-scope lines or an unknown threshold gives `needs_data`. The threshold sub-view keeps `watch`.
16. **Matching and validation details.** Header score tiers are exact (1.00), token containment (0.85 minus 0.05 per extra token, floor 0.60), close spelling (0.9 times similarity at 0.80 or more); generic single words are capped at 0.75; a content check adds 0.05 or subtracts 0.25. Total-row detection matches a whole cell ("Total", "Grand total", "Subtotal"), not any cell starting with "total", so a supplier called "Total Energies" is kept. Dates are day-before-month; Excel serial numbers are read and flagged as normalised. A "1 row that needs review" singular form is used.
17. **Mapping controls use native `<select>`**, not Mantine's NativeSelect, to keep the Mantine Combobox out of the route and to give Playwright and screen readers plain controls. Options are grouped Needed, Recommended and Optional. The mapper and the issue list are tables that render as stacked cards below `md` (`.stack-table` in `styles/tools.css`).
18. **Result page.** Rendered by server components with no client code except the print button, the analytics beacon, the methodology drawer trigger and a small script that opens the `<details>` named by the address fragment. The drawer content (Mantine Drawer) loads on first interaction and is a bottom sheet below `md`. Default-intensity lines carry the Scenario badge (the intensities are invented), not "Default value", which is reserved for a published default. The table caption reads "Line-level preview, N lines" and counts every line, grouped under In scope, Out of scope and Before start date.
19. **Privacy copy now matches the implementation.** Upload and exposure-check text says the file is read in the browser and only the mapped columns of rows that passed the checks are sent when the preview runs. In fixture mode it adds that the rows are not saved; in live mode it says retention is not stated until confirmed. The FAQ upload answer was updated to match.
20. **Workspace CTA** links to the configured create-workspace route without the session id, with copy that the file must be uploaded again, and shows "Workspace link to be confirmed" when the app URL is not configured.
21. **Tooling.** `npm run bundles:check` (`scripts/check-bundles.ts`, also in CI after build) prints first-load JS per route and fails if parser code appears in any first-load set or TanStack Query appears outside `/liability-preview`. ESLint now lets client code import `lib/api/errors` (pure message table) as well as schemas and types. Playwright's web server sets `NEXT_PUBLIC_CBAM_APP_URL` and `NEXT_PUBLIC_CBAM_CREATE_WORKSPACE_PATH`, so desktop "Sign in" now renders in E2E. Analytics gained `upload_step`, `mapping_changed`, `preview_viewed`, `methodology_opened` and four `upload_failed` reasons (enums and booleans only).
22. **API route.** `POST /api/liability-preview` checks origin, rate limit, declared and actual body size (2 MB), JSON and schema, then calls the adapter. It never logs the body: failures log an error code only. `GET /api/liability-preview/[sessionId]` uses the `toolCalls` limit. Server-rendered result pages are not rate limited (cheap fixture lookups); revisit in Phase 6.


---

## 23. Phase 5: conversion and trust pages

1. **Contact forms** use a server action per route (`for-brokers/actions.ts`, `pricing/actions.ts`) over one shared handler, `lib/forms/submit-contact.ts`: honeypot (silent success), forms rate limit (5 per 10 minutes), the same Zod schema as the browser (`lib/validation/contact.ts`), then `submitContactRequest`. The form is a plain form post, so it works before scripts load. Marketing consent is a separate unticked field.
2. **Contact schema** gained optional `message` and `marketingConsent` (default false). The fixture adapter now implements `submitContactRequest` (validate and acknowledge; nothing stored, sent or logged). The pricing page has a general enquiry form (`kind: general`).
3. **Pricing** copy, clarifications and plan CTAs live in `lib/config/pricing.ts`; every price is `null`, so "Talk to us" shows. Plan features follow section 20.
4. **Legal pages** share `components/legal/LegalPage.tsx`. The draft notice is driven by `siteConfig.legal.*.approved`. Facts shared by privacy, data processing and security (tool data table, cookie list, draft date) live in `lib/config/legal.ts`. The cookie list is empty because the site sets none; E2E asserts no cookies and no local or session storage.
5. **Security page** lists controls with honest status (CSP still allows inline scripts; rate limits are per instance) and what is unconfirmed for live mode. No certification claims.
6. `ErrorSummary` links now have a 24 px minimum target (axe target-size).

## 24. Phase 4 notes (2026-10-06)

- Rules: values confirmed against primary pages are `official` (record in docs/PROGRESS.md). New key `registrationDeadline`. `rulesVersion` is now `public-rules-2026-10-06` (the `-draft` suffix was dropped). `scenarioRates` holds one scenario rate that reads its number from `scenario-assumptions.ts`.
- Guides: `lib/content/guides.ts` compiles every guide with `compileMDX` (React `cache`d), validates frontmatter, requires `rulesBasis` to equal the current rules version and every `related` slug to exist. `blockJS: false` is set so JSX props can be arrays; content is repo-authored. Tables use the `<DataTable>` component (no remark-gfm dependency). Regulatory figures in bodies use `<Rule k="..." />` (keys in `lib/utils/rules-display.ts`); a unit test forbids typed pound amounts. `featuredRank` orders the featured guides.
- Both adapters serve guides from local content (`lib/api/guide-methods.ts`); the live adapter reports `dataSource: 'live'` for them.
- Rate alert: `RateAlertForm` posts to the server action `app/(marketing)/rate-watch/actions.ts`, which calls `lib/forms/submit.ts` (honeypot, then rate limit, then Zod parse, then `subscribeRateAlert`). The alerts tick box is required; marketing consent is separate and unticked. `RateAlertInput` gained `marketingConsent`. `lib/forms/submit.ts`, `lib/forms/state.ts` and `lib/validation/forms.ts` are shared and may be extended for the contact form.
- Worked example: `lib/content/worked-example.ts` runs inline sample rows through the Phase 3 `pickSheet`, `suggestMapping` and `validateRows`, so outcomes are derived. The page uses British spelling ("Normalised").
- Content pages stay server-rendered. Client islands added: `GuideFilters`, `WorkedExampleTabs`, `ReliefCalculatorClient`, `RateAlertForm`.

## 36. Phase 7 hardening decisions

1. **Mantine only where needed.** The root layout no longer mounts `MantineProvider`. `app/providers.tsx` (provider, notifications, Mantine CSS) is mounted by per-segment layouts for `/quick-estimate/result` and `/liability-preview/result` (item 12: the quick estimate and threshold checker no longer mount it), inside the lazy `LiabilityPreviewIsland`, and inside the lazy mobile drawer. Content, marketing and form routes carry no Mantine runtime. Design tokens (`--cc-*`) are emitted by the root layout from `lib/design/css-variables.ts`; the Mantine resolver emits the same values. The reset the Mantine baseline used to give every page (box-sizing, body margin, form font inheritance) now lives in `styles/base.css`.
2. **Schema libraries stay out of browser first load.** Analytics events are plain data plus a small validator (`lib/analytics/events.ts`, no Zod). Forms load their Zod schema after hydration and fall back to the server action's validation until it arrives. The contact form uses native fields (`components/shared/NativeFields.tsx`). Constants that browser code needs live in schema-free modules (`status-keys`, `guide-topics`, `contact-fields`, `forms-fields`).
3. **Budgets.** `bundles:check` fails above 150 KB gzip first-load JS on any route outside the tool routes, above each tool route's own budget (item 14), if the Mantine runtime or the full Zod library appears in a content route, if a parser or TanStack Query leaks, or if a server-only environment variable name appears in `.next/static`.
4. **Liability preview loads after the shell.** The upload tool is a client-only island (`LiabilityPreviewLoader`) with a same-height placeholder, so the heading and intro paint without waiting for Mantine, TanStack Query and Zod. Without JavaScript the existing `noscript` message applies.
5. **Fonts.** Geist Sans is a Latin subset (32 KB instead of 70 KB, `styles/fonts/geist/`, OFL). The display italic is a separate non-preloaded family used by the home headline. The `geist` package remains installed only as the origin of the subset file.
6. **Zod in the browser** runs jitless (`lib/validation/zod-browser.ts`) because its `new Function` probe is reported by the CSP as an eval violation.
7. **Open Graph images** are route handlers under `app/og/` rendered with `next/og`: one for the site, one per tool page and one per guide. They are referenced explicitly from `buildMetadata`, because a page-level `openGraph` object replaces file-convention images. Twitter cards reuse the same image.
8. **CSP.** A nonce-based `script-src` is not feasible without ending static generation, because Next writes inline bootstrap scripts into every prerendered page. `script-src` keeps `'unsafe-inline'`; the rest is closed (`frame-src 'none'`, `object-src 'none'`, `base-uri`, `form-action` and `frame-ancestors` restricted), plus `Cross-Origin-Opener-Policy: same-origin`. JSON-LD is escaped by `serialiseJsonLd`. Revisit if the content routes ever become dynamic.
9. **Analytics coverage.** Added `guide_open` (guide page), `rate_alert_subscribed` (rate alert success) and delegated `cta_click` / `sign_in_click` tracking through `data-cta*` attributes read by one `CtaTracker` (`lib/analytics/attributes.ts`). Guide slugs are a closed list checked against `content/guides`.
10. **Live mode failures.** Pages that call the adapter use `attempt()` and render `AdapterUnavailable` (an `ErrorState` with the user message) instead of the generic route error. The page still answers HTTP 200 because the App Router cannot set a status from a page; `/rate-watch` calls `noStore()` on failure so the error is not cached for the revalidation period.
11. **Threshold boundary.** Corrected: exactly £50,000 is "triggered", because GOV.UK words both tests as "£50,000 or more".
12. **Light tool routes (final hardening pass).** `/quick-estimate` and `/threshold-checker` mount no `MantineProvider`. The wizard buttons use `NativeButton`; the threshold inputs use `MoneyField` (a text input with `inputmode="decimal"`, a visual `£` prefix, thousand separators and caret preservation while typing) and `CheckboxField`; labels, descriptions and errors keep the same ids and `aria-describedby`/`aria-invalid` wiring as the contact form fields. The result segment (`/quick-estimate/result`) keeps its own `Providers` layout for the methodology drawer.
13. **No schema library in light-tool browser code.** The wizard validates with plain functions (`lib/validation/quick-estimate-fields.ts`) and the threshold checker with `lib/validation/threshold.ts`; react-hook-form and `@hookform/resolvers` were removed. The Zod schemas stay for the server (URL parsing, API contracts), and `tests/unit/validation/client-validation.test.ts` asserts that the browser checks give the same verdicts and wording. To keep Zod out of the client graph, plain data moved to schema-free modules (`lib/config/quick-estimate-options.ts`, `lib/config/sector-keys.ts`, the status and provenance tables) and the Zod checks for the status and provenance tables moved to `lib/config/definition-schemas.ts`. `lib/config/tools.ts` imports the plain option lists, so labels have one definition.
14. **Per-route budgets.** `bundles:check` replaced the single tool budget with one per tool route (a few KB above the measured size), and holds `/quick-estimate` and `/threshold-checker` to the same no-Mantine, no-Zod rule as content routes.
15. **LCP stays above 2.5 s in Lighthouse's simulation.** The analysis and the experiments that did not help are in `docs/PROGRESS.md` (Lighthouse). The root layout no longer renders Mantine's `ColorSchemeScript`; it sets `data-mantine-color-scheme="light"` directly.

## 37. Visual redesign: "Carbon copy" (2026-10-07)

The user asked for a UI and UX pass so the site does not look AI-generated, with fonts that are not common and a new palette. The Phase 1 look (cream ground, Instrument Serif with one italic phrase, petrol blue, a dashed eyebrow above every heading, faded ghost numerals, icon-card grids, grid textures) is the cluster AI tools produce by default, and the two competitors own the neighbouring lanes (white, navy, Fraunces and Inter; cream, oxblood, Spectral and IBM Plex). The user chose "Carbon copy" from three options in a structured question (the alternatives were a Besley slab-serif variant and the category standard played straight); that choice stands in for a concept roll.

1. **Thesis.** The site is laid out like the artefact it produces: a customs declaration. Sections are labelled boxes on ruled paper; figures sit in a mono column; value provenance is an ink stamp. The contract is also emitted as an HTML comment at the top of `<body>` (`app/layout.tsx`).
2. **Palette** (`lib/design/tokens.ts`; derived in oklch, hue held per family; every pair in `TEXT_PAIRS` and `NON_TEXT_PAIRS` is checked by `tests/unit/design/contrast.test.ts`):

| Role | Hex | oklch | Note |
|---|---|---|---|
| canvas | `#F0F4F9` | 96.5% 0.008 255 | zinc-white ground |
| surface | `#FAFCFE` | 99% 0.003 255 | boxes, inputs |
| surface-alt | `#E3E8F0` | 93% 0.012 255 | alternate bands |
| surface-inverse | `#3A1734` | 27% 0.07 335 | dark sections, footer |
| ink | `#231521` | 22% 0.03 330 | 15.8:1 on canvas |
| ink-muted | `#554857` | 42% 0.03 320 | 7.8:1 |
| ink-subtle | `#706472` | 52% 0.025 320 | 5.1:1 (4.55:1 on surface-alt) |
| line / line-strong | `#CDD1DB` / `#818693` | 86% / 62% | line-strong 3.3:1 for control borders |
| primary / hover / tint | `#5E2154` / `#4A1541` / `#F6E5F2` | 36% / 30% / 94%, hue 335 | 10.4:1 on canvas |
| on-primary | `#FAFCFE` | | 11.2:1 on primary |
| secondary | `#405D7B` | 47% 0.06 250 | 6.2:1 |

Status pairs (positive, watch, critical, info) are unchanged from §3.2. Ramps renamed: `stone` became `zinc`, `petrol` became `plum`; Mantine's `primaryColor` is `plum`.

3. **Tone system.** `data-tone="inverse"` re-points the role variables (ink, muted ink, lines, primary, on-primary, focus) from `inverseRoles` in tokens; `data-tone="paper"` restores the light roles for a paper box inside a dark section. `tokensCss()` emits both blocks. Components never use opacity hacks such as `text-ink-inverse/80`, and a primary button inside a dark section flips to a light chip by itself. The `inverse` ButtonLink variant is now an alias of `primary`.
4. **Fonts** (`lib/design/fonts.ts`, files in `styles/fonts/`, OFL, copied from fontsource 5.3.0): Archivo variable weight, Latin (34.9 KB, preloaded, `--ff-display`); Atkinson Hyperlegible Next variable, Latin (34.0 KB, preloaded, `--ff-sans`); Atkinson Hyperlegible Mono variable, Latin (17.8 KB, not preloaded, `--ff-mono`). The Archivo width-axis file is 90 KB, above the 60 KB limit set in the plan, so the weight-only file is used and the "expanded" display width was dropped. The next/font variables use the `--ff-` prefix so they never collide with Tailwind's `--font-*` theme names. The `geist` package and the Instrument Serif and Geist files were removed.
5. **Type tiers** (`styles/type.css`): `.t-display` (home headline and closing call to action), `.t-chapter` (every section heading and interior page title), `.t-title` (box and card titles), `.t-label` (box labels, table heads), plus `.t-lead`, `.t-figure` (mono, tabular, slashed zero) and `.t-figure-lg` (large figures in boxes). Headings never set their own size.
6. **Element language** (`styles/elements.css`): `.box`, `.box-head`, `.box-body`, `.box-no` (only for real sequences: wizard steps, process stages, calculation lines), `.rule`, `.ledger` (2px ink top rule, hairlines between rows), `.stamp` (double rule; `.stamp-tilt` for the one "Sample, illustrative" stamp per artefact), `.tag` (flat status), `.btn` with `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-md`, `.btn-lg`, and `.link`. Radius is 3px for boxes and buttons, 6px for inputs.
7. **Rhythm and motion** (`styles/base.css`): one `--section-gap` for every chapter (used by `Section`), one curve `--ease: cubic-bezier(0.2, 0.7, 0.1, 1)` and three durations (`--dur-1` 160 ms, `--dur-2` 320 ms, `--dur-3` 560 ms). The reveal is a "settle" (opacity and a 1.5% scale, no vertical drift); the hero sample stamp lands once. The global reduced-motion block is unchanged.
8. **Removed patterns.** The eyebrow above every heading (`ChapterHeading` lost its `eyebrow` prop; `PageHeader`'s label moved into a reference box beside the title as `formLabel`), ghost numerals, `.ledger-texture`, `.material-grid`, icon tiles, the italic display phrase, every "heading plus three cards" grid (sectors, carbon price relief, rate watch sources), pill badges and rounded-12 cards.
9. **Wordmark.** `BrandMark` draws a double-ruled declaration box with two ledger lines and a filled cell, in `currentColor`, next to the name from `site.ts`. The favicon and Open Graph images use the same glyph. Open Graph images keep the default `next/og` font, because Satori cannot read the variable `.woff2` files.
10. **Dead code removed.** `components/shared/Card.tsx` and ten unused Mantine wrappers (Accordion, Checkbox, Dialog, Drawer, Input, NumberInput, RadioGroup, Select, Toast, Tooltip); a grep showed no imports.
11. **Fixed in passing.** `/rate-watch` nested the demo-data paragraph inside another paragraph (a hydration error); the wrapper is now a `div`.
12. **Goods-journey illustration (2026-10-07).** At the user's request for a hero illustration in the spirit of an industrial port scene, `components/hero/GoodsJourney.tsx` adds a full-width band under the hero: a freight train with one wagon per sector group (read from `rules.sectors`, so the drawing follows the config), a works, a container ship and a quay crane, drawn as inline SVG in the role tokens. A data line rises from each wagon into the compliance snapshot above, which shows the product mechanism (customs lines becoming a position). It is hand-authored SVG in an engraving style, split into `components/hero/journey/` (defs with hatch, corrugation and stipple patterns and a reflection mask; a faint background of tank farm, steelworks and distant cranes; ship; ship-to-shore crane; train and track; water with a mirrored hull). It has no image request and no JavaScript; about 41 KB of HTML, about 5.3 KB gzipped, crops around the centre on phones, and draws its lines once (`.journey-line`; reduced motion shows the final state). The band sits under the hero rather than replacing the snapshot, because brief section 8 requires the snapshot in the hero. Raster or AI-generated imagery was rejected for weight on the LCP path and palette control.

## 38. Visual redesign: CargoFlow system (2026-10-10)

The user supplied https://carrgoflow.webflow.io as the reference and asked for its design system on this site: the same orange, full motion. Plan and site analysis: `docs/REDESIGN_PLAN_CARGOFLOW.md`. This supersedes the "Carbon copy" look of section 37 (behaviour and content are unchanged).

1. **Colour** (`lib/design/tokens.ts`). `brand` is exactly `#FF5D18` and is only ever a fill, carrying navy `#060517` text (6.5:1). White on that orange is 3.1:1, so text and icons that are orange on a light ground use `primary` `#C2410C` (4.9:1 on canvas, white on it 5.2:1). Ramps: `zinc` (neutral, navy ink) and `ember` (orange); `plum` was removed and Mantine's `primaryColor` is `ember`.
2. **Tones.** `inverse` is now navy `#00101A` (footer, supplier section) and also re-points `surface`/`surface-alt` so line drawings stay legible; `brand` (new) is a full orange section with navy ink and navy buttons; `paper` restores the light roles for white cards on either.
3. **Shapes and type.** Buttons are 80 px pills with a sliding arrow (`.btn-arrow`); cards 4 px; photo-style panels 24 px. Headings are one weight (Medium), display 80 px, chapter 48 px, title 28 px; new `.t-eyebrow` (small caps with a tick) and `.t-giant` (one-word section marker). Archivo/Atkinson stay in place until Aspekta files are added (needs the user's go-ahead to download); swapping is a change to `lib/design/fonts.ts` only.
4. **Header.** Fixed, transparent with white ink over a `data-hero` page until the page scrolls, then a blurred light bar (`styles/header.css`, unlayered so it beats utilities). Links use slash separators and a text-roll hover (`.roll`).
5. **Motion kit** (`components/motion/`, no libraries so the 150 KB route budget holds): `CountUp`, `ScrollWords`, `ScrollScene` (writes `--p`, CSS moves the crane and the step texts), `Marquee` (pure CSS), plus `HeroTabs` and `FeatureAccordion` in `components/home/`. Everything is visible and static without JavaScript and under reduced motion. Lenis smooth scroll was not copied: it is a library, hijacks native scrolling, and conflicts with the reduced-motion rule.
6. **Not copied from the reference.** Photos, videos, logos, testimonials and their copy. The testimonial strip became a strip of official source titles; partner logos became the sector groups; the stat counters read the threshold, sector count and retention period from `lib/config/rules.ts`; the hero video became the existing goods-journey drawing.
7. **Rule changes.** "No eyebrow above a heading" (section 37 item 8) is reversed: eyebrows are part of this system, and `ChapterHeading` has an `eyebrow` prop again. The "Sample" stamp no longer tilts or fades in (an axe scan caught it mid-fade).
8. **Open.** Inner pages and the tool screens only inherit the new tokens, buttons and type so far; their layouts are not yet redesigned (plan phases 4 and 5). `DESIGN.md` still describes the old system below its front matter.

