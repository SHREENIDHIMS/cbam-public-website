# Progress

Source of truth for build status. Update at the end of every phase (and whenever a project input or regulatory value is resolved).

Last updated: 2026-10-07 (visual redesign "Carbon copy"; Phase 6 blocked)

## Phases (MASTER_PROMPT §37)

| Phase | Scope | Status | Notes |
|---|---|---|---|
| 0 | Orientation: read brief, create PROGRESS/DECISIONS, list inputs and unverified values, confirm Mantine/Tailwind + request architecture | **Done** | See `docs/DECISIONS.md` |
| 1 | Foundation: Next app, tooling, env validation, CI, config modules, global styles, tokens, fonts, header/footer, base components | **Done** | See `docs/DECISIONS.md` §20 for implementation notes |
| 2 | Homepage | **Done** | See `docs/DECISIONS.md` §21 |
| 3 | Public tools + fixture adapter | **Done** | Exposure check, quick estimate, threshold checker, liability preview and its API. See `docs/DECISIONS.md` section 22 |
| 4 | Knowledge/content | **Done** | Seven content routes, five sourced guides, rate alert server action. See `docs/DECISIONS.md` section 24 |
| 5 | Conversion/trust pages | **Done** | for-brokers, pricing, security, privacy, terms, data-processing. See `docs/DECISIONS.md` section 23 |
| 6 | Live API integration | Blocked on backend contract | Needs existing app OpenAPI/routes |
| 7 | Hardening: tests, a11y, SEO, performance, analytics, production build | **Done** (gaps recorded below) | See `docs/DECISIONS.md` section 36 |
| 8 | Visual redesign ("Carbon copy"): palette, fonts, type tiers, element language, wordmark, every route | **Done** (see below) | See `docs/DECISIONS.md` section 37 |
| 9 | CargoFlow redesign (`docs/REDESIGN_PLAN_CARGOFLOW.md`): tokens, buttons, header, motion kit, new home page | **Partly done**: phases 1-3 of the plan; inner pages and tools restyled only through tokens | See `docs/DECISIONS.md` section 38 |

After each phase: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, screenshots at 375/768/1440 px, record known issues here, commit the phase separately.

## Deliverables checklist

### Phase 1: Foundation
- [x] Next.js 16 app scaffold, `.nvmrc`, `engines`, `package-lock.json`
- [x] Scripts: dev, build, start, typecheck, lint, format, test, test:e2e
- [x] ESLint flat config + Prettier + Tailwind plugin
- [x] `.env.example` with every variable documented
- [x] `lib/config/env-schema.ts`, `env.ts`, `public-env.ts`; build fails on invalid live config
- [x] `lib/config/site.ts`, `rules.ts` (+ schema), `navigation.ts`, `pricing.ts`, `status.ts`, `provenance.ts`, `tools.ts`, `routes.ts`
- [x] Design tokens (`lib/design/tokens.ts`, `theme.ts`), `styles/globals.css` with layer order, Tailwind `@theme` mapping
- [x] Fonts: Instrument Serif + Geist Sans via `next/font/local`
- [x] Security headers in `next.config.ts`
- [x] Root layout, providers, SkipLink, SiteHeader, MobileNav, SiteFooter, PageContainer, Section
- [x] Shared components (§29 Shared + DESIGN_SYSTEM state components)
- [x] `not-found.tsx`, `error.tsx`, `global-error.tsx`, `robots.ts`, `sitemap.ts` (route list from `routes.ts`)
- [x] `lib/utils/format.ts`, `lib/utils/rules-dates.ts`
- [x] `lib/api/types.ts`, `schemas.ts`, `errors.ts`, `client.ts`, adapter skeletons
- [x] Analytics interface (no-op)
- [x] Vitest + Testing Library setup; unit tests for config schemas, format, status, contrast, env schema
- [x] Playwright + axe setup; smoke test (home renders, header nav, mobile nav, 404)
- [x] CI workflow `.github/workflows/ci.yml`

### Phase 2: Homepage
- [x] `/`: hero with date-aware eyebrow, ProductPreview (hero snapshot), FactStrip, ProcessSteps (4 stages), FeatureGrid, supplier story, "why this number" CalculationPreview, broker teaser, featured guides, FAQ + FAQPage JSON-LD, final CTA
- [x] Page metadata (title, description, canonical, OG); entry motion island with reduced-motion support
- [x] Unit, component and E2E tests (CTA to `/exposure-check`, axe on `/`, FAQ keyboard, JSON-LD, reduced motion)
- [x] Screenshots at 375/768/1440 px inspected and iterated

### Phase 3: Public tools
- [x] `/exposure-check`
- [x] `/quick-estimate` (5-step wizard) and `/quick-estimate/result` (URL bands, print view, noindex)
- [x] `/threshold-checker` (12-month + 30-day views, gauge, guidance bands labelled)
- [x] `/liability-preview` (upload → headings → mapping → validation → scope → preview; methodology drawer; supplier exposure; workspace CTA)
- [x] `app/api/liability-preview` route handlers
- [x] Fixture adapter complete; committed fixtures in `tests/fixtures/` + hash manifest (all Phase 3 methods done; guides, rate alert and contact stay Phase 4/5)
- [x] DemoDataIndicator, ResultNotice, StaleRulesNotice on every result (on every Phase 3 result)

### Phase 4: Knowledge/content
- [x] `/how-it-works` (not assigned in §37; placed here)
- [x] `/sectors`
- [x] `/guides` (search + sector/topic/recently-reviewed filters)
- [x] `/guides/[slug]` (statically generated; ≥ 5 sourced guides)
- [x] `/worked-example` (tabs: Import ledger, Supplier A, Supplier B, Engine decisions, Preview output)
- [x] `/carbon-price-relief` (+ illustrative mini-calculator)
- [x] `/rate-watch` (official vs scenario, timeline, source cards, alert form via server action)
- [x] `/rules-changelog`

### Phase 5: Conversion/trust
- [x] `/for-brokers` (portfolio preview, contact form via server action)
- [x] `/pricing` (config-driven, "Talk to us" until prices approved)
- [x] `/security`
- [x] `/privacy` (draft notice)
- [x] `/terms` (draft notice)
- [x] `/data-processing` (draft notice; states actual upload behaviour)
- [ ] `public/images/CREDITS.md` complete

### Phase 6: Live API integration
- [ ] Obtain existing app API contract/OpenAPI
- [ ] Map all 12 adapter methods; live loading/error states; timeouts
- [ ] Confirm hand-off paths (sign-in, create workspace, dashboard) and preview-claim support
- [ ] Shared rate limiting in live mode

### Phase 7: Hardening
- [x] E2E scenarios in section 35 (314 Playwright tests across desktop and a Pixel 7 viewport pass)
- [x] Axe scan of every public route, every guide and both result routes (`tests/e2e/routes.spec.ts`; no serious or critical)
- [x] Keyboard-only runs of quick estimate and liability preview (`tests/e2e/keyboard.spec.ts`), Tab focus visibility and reduced motion (`routes.spec.ts`)
- [x] OG images (`next/og`, `app/og/*`), canonical URLs, structured data (FAQPage, Organization, Article, BreadcrumbList), noindex rules
- [~] Lighthouse budgets: scores met; LCP 2.6 to 2.8 s on simulated mobile throttling, above the 2.5 s target (analysed and re-measured in the final hardening pass, see Lighthouse)
- [x] Analytics payload test (`tests/unit/analytics/coverage.test.ts`, `tests/component/cta-tracker.test.tsx`)
- [x] Security checks (section 36), CSP documented (DECISIONS 36.8)

## Per-route bundle sizes

Source: `.next/diagnostics/route-bundle-stats.json` after `npm run build`; `npm run bundles:check` prints the table and fails on budget breaches (150 KB gzip outside tool routes, a per-route budget a few KB above each tool route's size), on Mantine or full Zod in a content route or in `/quick-estimate` or `/threshold-checker`, on parser code or TanStack Query leaking, and on a server env name in `.next/static`. First-load JavaScript, gzip.

| Route | Before Phase 7 | After Phase 7 |
|---|---|---|
| content routes (`/how-it-works`, `/sectors`, `/security`, `/privacy`, `/terms`, `/data-processing`, `/rules-changelog`, `/_not-found`) | 176,062 B | 143,108 B |
| `/` | 176,577 B | 143,623 B |
| `/guides/[slug]` | 176,062 B | 143,361 B |
| `/worked-example` | 176,974 B | 144,020 B |
| `/exposure-check` | 268,668 B | 143,403 B |
| `/guides` | 273,179 B | 145,822 B |
| `/carbon-price-relief` | 272,895 B | 146,063 B |
| `/rate-watch` | 270,271 B | 146,465 B |
| `/pricing` | 281,466 B | 146,541 B |
| `/for-brokers` | 282,169 B | 146,628 B |
| `/liability-preview` | 313,056 B | 159,116 B (the tool itself loads after the shell) |
| `/liability-preview/result/[sessionId]` | 276,474 B | 184,073 B |
| `/quick-estimate/result` | 271,764 B | 178,410 B |
| `/quick-estimate` | 281,078 B | 278,466 B |
| `/threshold-checker` | 308,014 B | 304,976 B |

Final hardening pass (native fields and buttons on the two light tools, schema libraries kept out of their browser code):

| Route | Before | After | Budget |
|---|---|---|---|
| `/quick-estimate` | 278,466 B gzip (1,004,627 B raw) | 147,945 B gzip (490,959 B raw) | 152,000 B |
| `/threshold-checker` | 304,976 B gzip (1,080,241 B raw) | 153,026 B gzip (507,581 B raw) | 157,000 B |
| `/` | 143,623 B gzip | 143,300 B gzip | 150,000 B |
| `/quick-estimate/result` | 178,410 B gzip | 175,455 B gzip | 180,000 B |

`/quick-estimate` and `/threshold-checker` no longer load the Mantine runtime, Zod, react-hook-form or `@hookform/resolvers` (both packages removed). `/quick-estimate/result`, `/liability-preview` and its result keep Mantine (drawer, dialogs, file inputs).

About 131 KB of the content figure is React and the Next client runtime. After the final hardening pass only the result and upload routes carry Mantine, and only `/liability-preview` carries TanStack Query.

## Lighthouse (section 28)

Lighthouse 13 with the preinstalled Chromium, mobile emulation and default simulated throttling, against `next build && next start` with `NEXT_PUBLIC_SITE_ENV=production`. Three runs per page (values shown run 1 / 2 / 3).

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 96 / 95 / 96 | 100 | 100 | 100 | 2.8 / 2.8 / 2.8 s | 0.023 | 50-60 ms |
| `/guides/how-the-registration-threshold-works` | 96 / 97 / 97 | 100 | 100 | 100 | 2.7 / 2.6 / 2.7 s | 0 | 50-100 ms |
| `/liability-preview` | 83 / 93 / 93 | 100 | 100 | 100 | 2.7 / 2.7 / 1.9 s | 0 | 220-510 ms |

Re-measured in the final hardening pass (same method, three runs each, after the changes below):

| Page | Performance | LCP | FCP | CLS | TBT |
|---|---|---|---|---|---|
| `/` | 95 / 95 / 95 | 2.8 / 2.8 / 2.8 s | 1.1 s | 0.023 | 60 ms |
| `/guides/how-the-registration-threshold-works` | 97 / 97 / 96 | 2.6 / 2.7 / 2.7 s | 0.9 s | 0 | 50-70 ms |

Baseline in the same session, before any change: `/` 2.8 / 2.2 / (run failed) s and the guide 2.6 / 2.7 / 2.3 s. LCP stays above the 2.5 s target; it was not fixed.

What the LCP is. On `/` it is the hero headline (`h1#hero-title`, display font); on a guide it is the first paragraph (Geist). Both paint at about 130 to 180 ms in the unthrottled trace (TTFB 10-15 ms, element render delay about 150 ms), so the element is not late and no entry animation or opacity is involved.

Why the simulated figure is 2.6 to 2.8 s. Lighthouse's simulated LCP is the mean of an optimistic and a pessimistic graph; the pessimistic one contains every request that finished before the observed paint (document, two fonts, CSS, all eight framework scripts, about 235 KB gzip on a 1.6 Mbit/s link) plus every main-thread task that started before it, slowed 4x. Blocking all scripts moves the guide's LCP from 2.6 s to 1.8 s, so the JavaScript (about 143 KB gzip of React and the Next client, of which the app's own code is about 11 KB) accounts for the whole gap. The 2.2 s runs happen when the hydration task starts just after the paint instead of just before it, which is timing luck, not something the page controls.

Tried and measured, then reverted: dropping the font preloads (`/` LCP 2.5 / 2.1 / 2.1 s but FCP 1.1 s to 1.5-1.7 s and CLS 0.023 to 0.099, guide LCP unchanged at 2.6 to 2.7 s, so a worse trade); `experimental.inlineCss` (no CSS request, LCP unchanged at 2.8 s and 2.6 to 2.7 s, TBT worse); `font-display: optional` or `fallback` (observed paint time unchanged). The fonts are already metric-matched (`adjustFontFallback`), the display italic is not preloaded and loads after the paint, and neither LCP element uses animation. Kept: the Mantine colour-scheme script and its client component are gone from the root layout (a static `data-mantine-color-scheme="light"` attribute replaces them), which removes an inline script and a little first-load JS.

What would move it: fewer first-load bytes than the framework floor allows, or starting hydration after first paint, which the App Router does not expose. Re-measure on the real host and CDN (HTTP/2 or HTTP/3, compression, caching) before treating 2.5 s as a blocker; the unthrottled LCP is about 0.15 s.

## Visual redesign (2026-10-07)

Bundle figures after the redesign (`npm run bundles:check`, gzip first-load JS; all budgets met):

| Route | Before | After |
|---|---|---|
| `/` | 143,300 B | 144,257 B |
| content routes | 143,108 B | 143,742 B |
| `/quick-estimate` | 147,945 B | 148,798 B |
| `/threshold-checker` | 153,026 B | 153,999 B |
| `/quick-estimate/result` | 175,455 B | 176,511 B |
| `/liability-preview` | 159,116 B | 159,597 B |
| `/liability-preview/result/[sessionId]` | 184,073 B | 184,525 B |

Preloaded fonts: Archivo 34.9 KB and Atkinson Hyperlegible Next 34.0 KB (before: Instrument Serif and Geist, about 52 KB). The mono (17.8 KB) is not preloaded. Lighthouse was not re-run in this change; re-measure on the real host before launch.

## Unresolved project inputs (§0.2)

| Input | Current placeholder | Where it lives | Status |
|---|---|---|---|
| Product/brand name | `CBAM Control` (working name) | `lib/config/site.ts` | Unresolved |
| Production site URL | `NEXT_PUBLIC_SITE_URL` (dev default `http://localhost:3000`) | env | Unresolved |
| Legal entity name, company number, registered address | `[Legal entity — to confirm]` | `lib/config/site.ts` | Unresolved |
| Contact, support, privacy emails | `[contact email — to confirm]` | `lib/config/site.ts` | Unresolved |
| Existing app URL + sign-in / create-workspace / dashboard paths | `NEXT_PUBLIC_CBAM_APP_URL`, `NEXT_PUBLIC_CBAM_*_PATH` | env | Unresolved |
| Whether a public preview can be claimed into a workspace | assumed **no**: CTA says data must be re-uploaded | `lib/config/site.ts` | Unresolved |
| Approved commercial plans and prices | none: "Talk to us" | `lib/config/pricing.ts` | Unresolved |
| Analytics provider | no-op | `lib/analytics` | Unresolved |
| Email/newsletter provider for rate alerts | fixture adapter only | `lib/api` | Unresolved |
| Existing backend API contract (OpenAPI/routes) | fixture mode | `docs/INTEGRATION_CONTRACT.md` | Unresolved (repo `SHREENIDHIMS/CBAMindeatiled` returned 404; see `REPOSITORY_AUDIT_NOTE.md`) |
| Upload data retention behaviour of the backend | not stated on site | `/data-processing` copy | Unresolved |
| Legal review of privacy/terms/data-processing | draft notice shown | `lib/config/site.ts` `legal.*.approved` | Unresolved |
| Final photography/art direction | original SVG/CSS compositions | `public/images/CREDITS.md` | Unresolved |

## Regulatory values: verification record (§31)

Checked on 2026-10-06 by opening each page in the working session (WebFetch). Page text was read through a summarising fetch tool, so quoted wording below is as returned and should be re-read on the page by a human before launch. Status `official` is set only where the page was read; everything else stays `unverified`.

| Key | Status | Value shown | Primary source read (date on page) | What the page said |
|---|---|---|---|---|
| `startDate` | official | 1 January 2027 | GOV.UK CBAM policy summary (updated 9 Sep 2026); Finance Act 2026 Part 5 s.158 on legislation.gov.uk | "CBAM Commencement: 1 January 2027"; "This Part has effect in relation to goods imported into the United Kingdom on or after 1 January 2027." |
| `registrationThreshold` | official | £50,000, tested over 12 months and 30 days | GOV.UK "Work out the date you'll need to register for CBAM" (16 Jul 2026); policy summary | "You must register if you expect to import CBAM goods into the UK worth £50,000 or more within the next 30 days." |
| `thresholdTests` | official | look-back (first day of each month, previous 12 months) and forward (next 30 days) | same page | "on the first day of each month, check whether you've imported £50,000 or more of CBAM goods ... in the previous 12 months"; "Do not include the value of CBAM goods that you imported ... before 1 January 2027." |
| `thresholdExclusions` | official | five categories (private use, UK origin, returned goods relief, temporary admission, special customs procedures) | GOV.UK "Imported CBAM goods that may not contribute towards the registration threshold" (16 Jul 2026) | Five categories listed with conditions |
| `sectors` | official | aluminium, cement, fertilisers, hydrogen, iron and steel | Policy summary; Finance Act 2026 s.143 | "aluminium goods; cement; fertilisers; hydrogen; iron and steel goods" |
| `commodityScopeBasis` | official | scope by commodity code | GOV.UK "Check which goods are in scope of CBAM" (16 Jul 2026); policy summary | "check which of the goods you import are in scope of CBAM by checking their commodity codes" |
| `registrationDeadline` (new key) | official | 31 January 2028 (first calendar year); 30 days otherwise | Policy summary | "during the first calendar year of CBAM, businesses will have until 31 January 2028 to register" |
| `firstReturnDeadline` | official | 31 May 2028 | Policy summary | "Returns and payments will be due 5 months after the end of the first accounting period (31 May 2028)." |
| `paymentDeadline` | official | 31 May 2028 (first period only) | Policy summary | same sentence |
| `rateState` | official (mechanism only) | mechanism text; `currentRate` null | Policy summary; Finance Act s.149; SI 2026/809 (made 13 Jul 2026) | Rates "calculated and published ... at the beginning of each quarter from 1 January 2027"; "An illustrative example CBAM rate will be set out in Autumn 2026." No rate found on any page read |
| `carbonPriceRelief` | official (concept only) | conditions for a claim | GOV.UK "Claiming Carbon Price Relief" collection (16 Jul 2026); SI 2026/809 | Qualifying scheme, completed verification form, independent verifier |
| `recordRetention` | official | 6 years | GOV.UK "Keeping records for CBAM" (16 Jul 2026) | "6 years from whichever is latest: the date they were created; the end of the accounting period they relate to" |
| `registrationOpens` | **unverified** | none | GOV.UK registration collection (16 Jul 2026) | Summary of the page said "Registration opens by 1 January 2028"; not confirmed against the exact sentence, so not displayed |

Still to confirm by a human: the Finance Act 2026 Royal Assent date (not shown on the page excerpt read); the exact wording of "registration opens"; later accounting-period return dates (on the policy summary, not in the rules config); whether an illustrative CBAM rate has since been published; the Schedule 16 goods lists themselves (not read; the site never resolves scope). Force of law notices were still draft on 2026-10-06 and the qualifying carbon pricing scheme list was provisional (27 Aug 2026).

## Known issues

- Resolved in Phase 7: GOV.UK says "£50,000 or more" for both tests, so exactly the threshold is now "triggered" (was "approaching").
- Resolved in Phase 7: `/exposure-check` is now 143 KB gzip like other content pages.
- Phase 3: the liability preview is a fixture demo. Sample files get a pre-computed result, any other file gets a labelled demo result that is not calculated from its rows. Scope, rate, relief and default intensities are scenario values; no official figure is invented. Live behaviour and data retention remain Phase 6 items.
- Phase 3: `npm run fixtures:generate` rewrites the XLSX fixtures and so changes their hashes; re-run `fixtures:hash` and update `lib/api/fixtures/upload-manifest.ts` (a unit test fails otherwise).
- Phase 3: mapping uses native selects and the result table uses sticky headers in an overflow region; behaviour in WebKit and Firefox is untested (Chromium only).

- Resolved in Phase 7: the Mantine provider is no longer in the root layout (see bundle table).
- Unbuilt routes render a noindex "Coming soon" holding page and are not in the sitemap (`available: false` in `lib/config/routes.ts`).
- Desktop header omits "Sign in" until `NEXT_PUBLIC_CBAM_APP_URL` is configured (mobile drawer shows "Sign-in link to be confirmed").
- First `npm install` needs `--legacy-peer-deps` because of an npm 10.9.4 arborist crash; `npm ci` with the committed lockfile works normally (DECISIONS §20.2).
- `npm install` prints a deprecation warning for ESLint 9.39.5; ESLint 10 is blocked by `eslint-plugin-react` (DECISIONS §1).
- CI workflow is written but has not run on GitHub yet.
- Playwright runs Chromium only (desktop 1440 and Pixel 7 viewport); WebKit is not installed.
- Screenshots at 375/768/1440 px for `/`, a holding page and the 404 were captured locally (`test-results/screenshots/`, gitignored).

- Homepage product visuals use fictional sample figures from `lib/config/home-sample.ts`. The rate, default intensity and relief assumption there are scenario values, not rules; no official rate is seeded.
- FAQ answer about uploads: confirmed against the built tool in Phase 3 and reworded to match.
- Lighthouse results are recorded above; LCP is 2.6 to 2.8 s on simulated mobile, above the 2.5 s target, bounded by the framework JavaScript.
- Running `next dev` rewrites `CLAUDE.md` and `next-env.d.ts`; revert those before committing.

- Resolved in Phase 7: in live mode `/rate-watch` and the other adapter-backed pages show an in-page error state (still HTTP 200). Guides are local content and work in both modes.
- Phase 4: the rate alert is a fixture acknowledgement only (no email, nothing stored). Live double opt-in is a Phase 6 item.
- Phase 4: the worked example's Supplier A adds one row (row 9, no commodity code) to the Northstar sample so a rejection can be shown; it is labelled on the page.
- Phase 4: the guide MDX pipeline sets `blockJS: false` so DataTable props can be arrays; guides are repo-authored and dangerous globals stay blocked.
- Phase 4: the Phase 3 fixture previews no longer say the sector list is unverified, because it is now official.

- Phase 7: `script-src` keeps `'unsafe-inline'` (a nonce would end static generation); see DECISIONS 36.8.
- Phase 7: the tool pages are tested in Chromium only; the deferred liability preview tool shows a placeholder before it mounts.
- Phase 7: the mobile Pixel 7 project is Chromium, not WebKit; Safari-specific layout is untested.
- Phase 7: Lighthouse was run locally, not on the production host or CDN.

## Section 38 and 39 checklist (end of Phase 7)

Section 38, before declaring complete:
- [x] No major placeholder page remains (all 17 public routes built; unbuilt routes would show a noindex holding page, none remain).
- [x] No fake functionality is represented as live (demo indicator on every result; live mode fails visibly).
- [x] All links work (header, footer, in-page links covered by E2E; sitemap routes all return 200).
- [x] All primary forms validate (rate alert, contact, quick estimate, threshold checker, upload).
- [x] Live-vs-fixture mode is explicit.
- [x] typecheck, lint, format:check, build, test (427), test:e2e (263 passed, 51 skipped by project) and bundles:check pass.
- [x] Responsive layouts checked (375, 768, 1440 screenshots; no horizontal scroll tests on mobile).
- [x] Accessibility issues found were fixed (heading order, list indent, missing h1 on result states, eval probe).

Section 39, definition of done:
- [x] Homepage production-ready, navigation and footer complete, all public routes implemented.
- [x] Exposure checker, quick estimate, threshold checker work; liability preview works in fixture mode.
- [x] Live adapter boundary exists (not connected).
- [x] Results explain assumptions; guides searchable and filterable; worked example interactive; rate watch separates official and scenario; carbon price relief usable; broker page complete; pricing configurable; legal and trust pages exist.
- [x] SEO metadata, canonical, Open Graph images, structured data, sitemap, robots.
- [x] Responsive design and keyboard accessibility verified.
- [x] E2E happy paths and production build pass.
- [ ] CI workflow passes on a clean checkout. Not met: the workflow has never run on GitHub from this environment.
- [~] Performance budgets: first-load JS (now about 143 to 153 KB gzip on every route except the result and upload routes), scores and CLS met; LCP 2.6 to 2.8 s on simulated mobile (target 2.5 s). Cause and experiments recorded under Lighthouse.
- [~] Every regulatory value sourced or marked unverified: met for what is shown. `registrationOpens` stays unverified and is not displayed; items listed under the verification record still need a human read.
- [x] `docs/PROGRESS.md` lists remaining project inputs and known issues.
- [ ] Phase 6 live API: blocked on the backend contract (checklist in `docs/INTEGRATION_CONTRACT.md`).
- [ ] Project inputs pending: brand name, production URL, legal entity, emails, app URL and paths, analytics and email providers, approved prices, legal review, photography (table above).

## Next step

Phase 6 (live API) is blocked on the backend contract: fill in the checklist in `docs/INTEGRATION_CONTRACT.md`. Resolve the project inputs, run CI on GitHub, re-measure Lighthouse on the real host, and re-read the regulatory sources listed above before launch.
