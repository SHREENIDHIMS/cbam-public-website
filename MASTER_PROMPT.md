# MASTER PROMPT — Build the Separate CBAM Public Website

You are a senior product engineer, UX designer, frontend architect, conversion-focused B2B web designer and QA lead.

You are building a **separate repository** for the public website of an existing UK CBAM compliance application.

The existing private application already contains the authenticated compliance/workspace concepts. This repository must NOT rebuild the private dashboard. It must build the public-facing website and public tools that sit in front of that application.

The public website should combine the strongest publicly observable product ideas from:
- https://www.cbamcheck.co.uk/
- https://cbamreturn.co.uk/

but it must have an original brand, original copy, original component composition, original visuals and original implementation.

Do NOT copy:
- logos
- exact wording
- source code
- proprietary images
- exact layouts
- brand identity
- visual assets

Use the concepts and workflow ideas only.

---

# 0. HOW TO USE THIS BRIEF

## 0.1 Precedence

This file is the source of truth. The files in `docs/` expand on it. If a doc contradicts this file, follow this file and fix the doc in the same change. If two parts of this file contradict each other, stop and record the conflict in `docs/DECISIONS.md` before choosing.

## 0.2 Project inputs

These values are not known yet. Do not invent them. Keep each one in a single config module (`lib/config/site.ts`) with an obvious placeholder, and list unresolved ones in `docs/PROGRESS.md`.

| Input | Placeholder until confirmed |
|---|---|
| Product/brand name | `CBAM Control` (working name) |
| Production site URL | `NEXT_PUBLIC_SITE_URL` |
| Legal entity name, company number, registered address | `[Legal entity — to confirm]` |
| Contact, support and privacy email addresses | `[contact email — to confirm]` |
| Existing app sign-in / create-workspace / dashboard URLs | env vars (see `docs/INTEGRATION_CONTRACT.md`) |
| Approved commercial plans and prices | none — pricing shows "Contact us" until approved |
| Analytics provider | no-op provider |
| Email/newsletter provider for rate alerts | fixture adapter only |

The brand name must never be hard-coded outside the config module.

## 0.3 Working protocol

- Work one phase at a time (§37). Do not start the next phase until the current phase passes its checks.
- Keep `docs/PROGRESS.md` up to date: phase status, what was built, open questions, known issues.
- Record non-obvious choices (font, library, architecture trade-offs) in `docs/DECISIONS.md` with a one-line reason.
- When information is missing, choose the safest reversible default, label it, and log it. Do not block on it unless it would cause a false claim.
- Prefer finishing fewer routes to production quality over many routes at placeholder quality.

---

# 1. CORE OBJECTIVE

Build a polished B2B UK CBAM public website that answers three questions immediately:

1. Does UK CBAM potentially apply to my business?
2. What could my exposure/liability look like?
3. What should I do next?

The visitor journey must feel like:

UNDERSTAND
↓
CHECK EXPOSURE
↓
QUICK ESTIMATE OR UPLOAD DATA
↓
SEE A USEFUL RESULT
↓
UNDERSTAND ASSUMPTIONS / MISSING DATA
↓
START / OPEN THE EXISTING CBAM WORKSPACE

The website must feel like a serious regulatory/compliance product, not a generic sustainability landing page.

---

# 2. HARD BOUNDARY WITH THE EXISTING APPLICATION

This is a separate public-site repository.

Do NOT implement the following private modules here:
- authenticated dashboard
- private import ledger
- internal supplier management
- internal supplier chase board
- supplier private upload portal
- records/evidence vault
- carbon price relief internal workspace
- registration workspace
- return preparation workspace
- internal audit log
- organisation/team management
- broker portfolio management
- billing administration

The public site may explain and preview these features, but it must not duplicate their internal implementation.

The existing application remains the source of truth for authenticated operational workflows.

---

# 3. EXISTING PROJECT CONTEXT

The existing CBAM product is already planned around:
- import ledgers
- commodity-code scope resolution
- threshold monitoring
- liability calculations
- supplier data collection
- evidence
- carbon price relief
- registration preparation
- return preview
- reporting
- broker functionality
- rules/rate versioning

The public site should expose the **front door** to those capabilities.

Where a real backend endpoint exists, call it through a typed adapter.
Where a backend endpoint is not yet available, use fixture mode with deterministic sample responses.

Never fork business rules into the frontend merely to make a demo work.

---

# 4. TECHNOLOGY

Use:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Mantine for the base component system, with a custom theme and custom CSS for the public visual identity
- React Hook Form
- Zod
- Lucide icons or another consistent icon system
- Vitest for unit tests
- Playwright for E2E, with `@axe-core/playwright` for automated accessibility checks
- ESLint and Prettier
- TanStack Query only where client-side remote state genuinely benefits (e.g. upload polling); not on content pages

Keep dependencies reasonable.
Do not add libraries unless there is a clear user or engineering benefit.

## 4.1 Runtime and scripts

- Pin the Node.js LTS version in `.nvmrc` and `package.json#engines`. Use npm and commit `package-lock.json`.
- `package.json` must define: `dev`, `build`, `start`, `typecheck` (`tsc --noEmit`), `lint`, `format`, `test` (Vitest), `test:e2e` (Playwright).
- Provide `.env.example` listing every variable with a comment. Never commit a real `.env`.
- Add a CI workflow (`.github/workflows/ci.yml`) that runs install, typecheck, lint, unit tests, build and E2E in fixture mode on every pull request.

The site should run independently with:

`npm install`
`npm run dev`

and be production buildable with:

`npm run build`

## 4.2 Mantine, Tailwind and server components

These three interact; follow these rules to avoid style conflicts and bloated bundles:

- Mantine owns interactive components (inputs, selects, dialogs, drawers, tooltips, toasts). Tailwind is for layout, spacing and typography utilities only. Do not rebuild Mantine components in Tailwind or vice versa.
- Disable or scope Tailwind's preflight so it does not override Mantine's base styles, and set CSS layer order explicitly. Record the approach in `docs/DECISIONS.md`.
- Define design tokens once as CSS variables and feed both the Mantine theme and the Tailwind config from them.
- Most Mantine components are client components. Keep editorial/content pages as server components and import Mantine only inside small client islands, so content pages ship minimal JavaScript (§28).

## 4.3 Request architecture

- The browser never calls the existing CBAM backend directly. Browser → Next.js route handlers or server actions in this repo → adapter (§23) → backend.
- This keeps API credentials server-side, avoids CORS coupling, gives one place for rate limiting, and lets fixture mode work without a backend.
- Only genuinely public values use `NEXT_PUBLIC_*`.

---

# 5. REPOSITORY STRUCTURE

Use this general structure and improve it only when a real reason exists:

app/
  (marketing)/
    page.tsx
    exposure-check/
    quick-estimate/
    liability-preview/
    threshold-checker/
    how-it-works/
    sectors/
    carbon-price-relief/
    rate-watch/
    guides/
      [slug]/
    worked-example/
    for-brokers/
    pricing/
    security/
    privacy/
    terms/
    data-processing/
    rules-changelog/
  api/              (route handlers that proxy to the adapter; no business rules)
  not-found.tsx
  error.tsx
  sitemap.ts
  robots.ts

components/
  layout/
  hero/
  tools/
  results/
  content/
  conversion/
  shared/

lib/
  api/
  config/           (site.ts, rules.ts, pricing.ts, navigation.ts)
  content/
  validation/
  analytics/
  utils/

content/
  guides/           (MDX guide files)
types/
public/
  images/
styles/
tests/
  fixtures/         (sample CSV/XLSX files used by fixture mode and E2E)
docs/

Do not create an authenticated `(app)` area in this repository.

---

# 6. BRAND / VISUAL DIRECTION

The visual direction is a deliberate combination of the three reference sites:

1. **Agentik 360 — visual and narrative direction**
2. **CBAMReturn — product clarity and compliance credibility**
3. **CBAMcheck — low-friction conversion and simple public tooling**

The new site must be original. Do not reproduce any reference site's exact layout, imagery, copy, colours, logo or component styling. Recreate the design principles only.

## 6.1 Agentik 360 principles to borrow

Use Agentik 360 as the primary **brand/design reference**. Its public site is structured as an editorial story rather than a generic SaaS template: a strong positioning statement, outcome-led metrics, a clear “what we built” narrative, chapter-like sections, large supporting imagery, focused service/feature groupings and a restrained final CTA.

Borrow these principles:
- Large, confident editorial headlines.
- Very generous whitespace.
- Short paragraphs instead of text-heavy marketing blocks.
- Narrative progression from problem → friction → system → outcome.
- Full-width or visually dominant imagery at selected moments rather than everywhere.
- Metrics used as evidence of operational value.
- Strong alignment and disciplined grids.
- Quiet, premium visual treatment rather than “startup template” styling.
- Product/UI visuals should feel like part of the story, not a random screenshot pasted into a card.
- Use chapters/sections to create rhythm while scrolling.

Do **not** copy Agentik 360's property-management wording, customer names, statistics or exact visual assets.

## 6.2 CBAMReturn principles to borrow

Use CBAMReturn as the primary **product-information reference**. Its homepage places the core outcome immediately in the hero, then shows a draft-return/liability preview, key regulatory dates, a three-step operational workflow, covered sectors, broker positioning and an FAQ.

Borrow these principles:
- Product value above the fold.
- A real-looking compliance artifact in the hero.
- Regulatory facts presented compactly.
- “Messy input → structured result” storytelling.
- Clear operational workflow.
- Explain difficult compliance concepts in plain English.
- Make assumptions and regulatory status visible.
- Use sector-specific examples.

## 6.3 CBAMcheck principles to borrow

Use CBAMcheck as the primary **conversion/tool reference**. Its public journey is intentionally simple: explain the problem, show a three-step flow, expose the sectors, preview the resulting report and repeatedly drive visitors toward a free estimate/exposure check.

Borrow these principles:
- One dominant primary CTA.
- Short route from homepage to useful tool.
- Quick estimator for users without data.
- Upload route for users with real customs data.
- Results shown as ranges/scenarios where certainty is unavailable.
- Supplier exposure as an actionable result, not just a number.
- Report preview as a concrete artifact.

## 6.4 Combined visual concept

The final visual language should feel like:

**Agentik 360's premium editorial storytelling**
+
**CBAMReturn's compliance/product precision**
+
**CBAMcheck's simple conversion journey**

The website should look more like a premium consulting/product studio that happens to have a powerful compliance tool than like a generic SaaS dashboard landing page.

## 6.5 Color direction

> Amended on user instruction, 7 October 2026. The original ivory/petrol direction read as the default look AI tools produce and sat in the same lane as the reference sites. Decision record: `docs/DECISIONS.md` §37.

Do not imitate any reference site's exact colour palette. The palette is "carbon copy": the colours of a customs declaration and the ink that stamps it.

- cool zinc-white paper ground (not cream, ivory or sand)
- aubergine-tinted near-black ink for text
- stamp-ink aubergine as the single action colour, and as the ground of dark sections
- galvanised steel blue as the secondary (links on light grounds, info states)
- muted green for positive states
- amber for watch/approaching states
- red only for genuinely critical states

Large surfaces stay quiet. Colour is used for hierarchy, actions and status. Every colour is a role token with an `on-*` partner, defined once in `lib/design/tokens.ts`.

## 6.6 Typography direction

> Amended on user instruction, 7 October 2026: no common or default fonts. Decision record: `docs/DECISIONS.md` §37.

- Display and labels: Archivo (variable weight). Headlines, box labels and table heads.
- UI/body: Atkinson Hyperlegible Next (variable). Designed for legibility, which suits dense compliance text.
- Figures: Atkinson Hyperlegible Mono, only for money, mass, dates and commodity codes.
- Four named type tiers (display, chapter, title, label) in `styles/type.css`. No heading sets its own size.

Load fonts with `next/font/local` (self-hosted, `display: swap`) so there are no third-party font requests and no layout shift.

Do not use Inter, Geist, Instrument Serif, DM Serif, Fraunces, Playfair or similar defaults.

## 6.7 Layout direction

Use an editorial grid rather than a standard 12-card SaaS template.

Target desktop content width: approximately 1200–1280px.

Use a mixture of:
- full-width narrative sections
- asymmetric two-column sections
- large single visual moments
- compact fact strips
- small metric clusters
- product preview panels
- occasional bordered cards

Do not put every section inside a rounded white card.

Use stronger visual separation through spacing, typography, rules/dividers, photography/illustration and background shifts.

## 6.8 Shape language

> Amended on user instruction, 7 October 2026. Decision record: `docs/DECISIONS.md` §37.

- The page is a form: labelled boxes on ruled paper, hairline rules, a 2px ink rule to open a ledger.
- Border radius: 3px for boxes and buttons, 6px for text inputs and dialogs.
- Value provenance is shown as a double-ruled stamp; result status as a flat tag.
- Buttons sit off a small offset underprint and press into it on hover.
- Avoid pill-shaped UI, glass effects, gradient blobs, grid textures and floating "dashboard islands".
- No kicker or eyebrow label above a heading; no decorative section numerals.

## 6.9 Motion

Motion should feel editorial and deliberate:
- fade/translate on section entry
- small number counters
- subtle line/path animation for process diagrams
- gentle hover transitions
- no constant floating animations
- no huge parallax effects

Respect `prefers-reduced-motion`.

## 6.10 Image direction

Use a small set of custom, high-quality visuals with a coherent art direction:
- industrial logistics / port / materials
- steel and aluminium textures
- customs documents / spreadsheets photographed as objects
- suppliers / operations in real working environments
- compliance evidence and document close-ups

Do not use generic “green planet” stock imagery.
Do not use robot/AI imagery.
Do not reuse assets from Agentik 360, CBAMReturn or CBAMcheck.

Sourcing rule: you cannot produce photography. Until final art-directed images are supplied:
- use original SVG/CSS compositions (document textures, material grids, line diagrams) that fit the palette, or
- use openly licensed images whose licence permits commercial use, downloaded into `public/images/`, never hot-linked.

Record every image with its source and licence in `public/images/CREDITS.md`, and mark temporary ones as "to replace". A deliberate interim visual is acceptable; a grey box or "image here" placeholder is not.

## 6.11 Product preview direction

At least two homepage visual moments should show the product itself:

1. **Hero:** an elegant compliance snapshot showing threshold, liability and supplier coverage.
2. **Mid-page:** a detailed “why this number?” line-level calculation panel.

These should be custom-designed marketing visuals that look like real product UI but are not literal screenshots of the private application.

## 6.12 Public-site emotional arc

Design the homepage as a story:

OPEN WITH UNCERTAINTY
“What does CBAM mean for us?”
↓
MAKE IT CONCRETE
“Here is your exposure.”
↓
SHOW THE WORK
“Here is how the number is built.”
↓
SHOW THE OPERATION
“Here is how suppliers, evidence and threshold tracking fit together.”
↓
SHOW THE OUTCOME
“Here is the path to a return-ready position.”
↓
CTA
“Check your exposure.”

This narrative structure is the primary design decision for the new website.

---

# 7. HEADER / NAVIGATION

Desktop header:

Left:
- logo/brand

Center:
- How it works
- Check Exposure
- Sectors
- Guides
- Rate Watch

Optional grouped menu:
- Tools
- Resources

Right:
- For Brokers
- Pricing
- Sign in
- Check my exposure (primary button)

The primary CTA should remain visible on desktop.

Use one label for the primary action everywhere: `Check my exposure`. Navigation items, labels and order live in `lib/config/navigation.ts`, not in the header component.

Mobile:
- logo
- menu button
- prominent “Check Exposure” inside the opened navigation

Header should become sticky after scroll but remain visually restrained.

---

# 8. HOMEPAGE — `/`

The homepage must be the strongest conversion page.

## Hero

Eyebrow (rendered from the rules config, not hard-coded):
`UK CBAM · live 1 Jan 2027`

The eyebrow and any "starts on" copy must be date-aware: before the start date say "starts", on or after it say "in force since". Build a single helper for this and use it everywhere the start date appears.

Write original headline copy. Do not copy competitor wording.

The headline should communicate an outcome such as:
- understand your CBAM exposure
- turn customs data into a clear CBAM position
- know what is covered, what is owed, and what is missing

Supporting copy:
Explain that the platform turns customs/import data and supplier emissions data into an understandable exposure and readiness position.

Primary CTA:
`Check my exposure`

Secondary CTA:
`See how it works`

Hero visual:
Build an original product preview, not a competitor screenshot.

Show a believable fictional compliance snapshot containing:
- threshold gauge
- indicative liability
- supplier coverage
- evidence readiness
- rules/source status

Label all values as sample/demo/illustrative.

## Section: trust / facts

Immediately below hero show a compact fact strip.

Potential items:
- UK CBAM start date
- registration threshold
- covered sector groups
- record retention

Never display a figure as an official value unless the current rules source supports it.

## Section: how the platform works

Four stages:

01 — Bring in your import data
02 — Identify scope and threshold position
03 — Collect supplier information
04 — Build a return-ready position

Each stage should have a meaningful visual or data snippet.

## Section: why this is useful

Feature grid:
- exposure visibility
- line-level liability
- supplier evidence collection
- threshold monitoring
- carbon price relief
- audit-ready records

Do not overstuff the section.

## Section: supplier story

Show why supplier emissions data matters.

Example visual:

Supplier A
Data received ✓
Verified ✓

Supplier B
Requested →
Missing emissions →
Potential impact £X →

Use only illustrative figures.

## Section: transparent numbers

Build a “Why is this number?” product section.

Show:

customs value
→ quantity
→ emissions basis
→ rate
→ gross charge
→ relief
→ indicative net position

Emphasise that the system distinguishes official values, defaults, actual supplier data and scenario assumptions.

## Section: broker / partner

Short section leading to `/for-brokers`.

## Section: knowledge centre

Three or four featured guides.

## FAQ

Use real user questions:
- What is UK CBAM?
- Does the £50,000 threshold apply to every import?
- Which goods are covered?
- What happens if supplier emissions are missing?
- Can I upload my customs data?
- What is carbon price relief?
- Does the software submit the return?

Answers must be careful and source-aware. Any figure in an answer (such as the threshold amount) must be interpolated from the rules config, not typed into the copy. Add FAQPage structured data from the same content.

## Final CTA

Strong but calm:
`Find out where you stand.`

Button:
`Check my exposure`

---

# 9. `/exposure-check` — PRIMARY TOOL LANDING PAGE

This is the main public workflow.

At the top explain:

`Choose the fastest path for the data you have.`

Two large options:

### Option A — Quick estimate

For people who do not have a customs export ready.

Time indicator:
`About 60 seconds`

### Option B — Upload customs data

For people who want a data-backed preview.

Explain:
`CSV or XLSX`

Do not force sign-in before the visitor gets useful value unless the existing backend specifically requires it.

---

# 10. QUICK ESTIMATE

Route:
`/quick-estimate`

Use a wizard, not a long form.

Progress:
1 / 5, 2 / 5, etc.

Questions:

1. Approximate annual covered-goods import value.
2. Which CBAM sector groups are relevant?
3. Main countries of origin.
4. Approximate supplier count.
5. Does the business have occasional very large shipments?

Collect email/company only at the point where it adds value, such as sending a report or saving a result.

Results should show:
- likely status
- estimate/range where appropriate
- main exposure sector
- reason
- confidence/data quality
- actions

Possible result states:

`Below threshold — based on the information supplied`

`Approaching threshold — real customs data recommended`

`Likely triggered — confirm using the detailed ledger tests`

`Not enough information — add customs data for a reliable view`

These map to the canonical status vocabulary in §31.1.

Never call this a guaranteed legal determination.

Result handling:
- The wizard keeps answers in component state. Do not write them to localStorage.
- The result page must survive a refresh without re-entering answers: persist the result server-side behind an opaque result id, or encode only the non-sensitive answer bands (not exact values) in the URL. Record the choice in `docs/DECISIONS.md`.
- Offer a print-friendly result view (print stylesheet) as the "take it away" artifact. Emailing a report depends on the backend and is fixture-only until confirmed.

---

# 11. THRESHOLD CHECKER

Route:
`/threshold-checker`

Build a browser-friendly instant calculator using only deliberately simplified inputs.

Inputs:
- sector group selection
- annual covered-goods value
- lumpy shipment toggle
- optional expected next-30-day amount

Output must clearly separate:

Backward-looking 12-month view

and

Forward-looking 30-day view

Show a visual gauge.

Statuses:
- lower range
- watch
- approaching
- triggered

These map to the canonical status vocabulary in §31.1. Watch and approaching bands are product guidance, not statutory values; label them as such and keep their boundaries in config.

Use configurable threshold data from the rules/config layer.

Do not hard-code regulatory values in many components.

---

# 12. `/liability-preview` — DATA UPLOAD TOOL

This is the strongest public tool.

Goal:
Let a visitor upload a broker/CDS-style CSV/XLSX and see an indicative line-by-line CBAM preview before creating an account.

Flow:

STEP 1
Upload file

STEP 2
Discover headings

STEP 3
Map columns

STEP 4
Validate data

STEP 5
Resolve CBAM scope

STEP 6
Preview liability

Do not make this feel like a generic file-upload form.

## Responsibility split

- Steps 1–4 (reading the file, discovering headings, mapping columns, row/cell validation) are presentation-level parsing and may run in this repo. Prefer parsing in the browser so the file does not leave the device until the visitor chooses to run the preview, and say so on screen only if that is what the implementation actually does.
- Steps 5–6 (scope resolution and liability) belong to the backend. Send only the mapped, validated rows the backend needs. In fixture mode, return deterministic results keyed to the files in `tests/fixtures/`, and for any other file show a clearly labelled demo result rather than inventing a calculation.
- Choose one maintained XLSX parser, load it only on this route (dynamic import), and record the choice in `docs/DECISIONS.md`.
- Default limits, configurable in one place: 10 MB per file, 5,000 data rows, `.csv` and `.xlsx` only, first sheet unless the visitor picks another. Check extension, MIME type and size before parsing, and reject macro-enabled files.

## Upload screen

Explain:
- accepted CSV/XLSX
- expected useful columns
- max file size
- whether processing is temporary or persisted, based only on actual implementation

Do not promise deletion/in-memory processing unless the backend really does this.

## Column discovery

Show detected columns such as:

Entry date → Import date
CN code → Commodity code
Net mass → Net mass
Customs value → Customs value
Supplier → Supplier
Origin country → Origin country

Each mapping has a confidence indicator.

Allow manual correction.

## Validation screen

Example:

15 rows found
13 valid
1 duplicate
1 needs review

Show exact row/cell issues.

Examples:
- missing commodity code
- malformed date
- decimal comma
- unit in numeric cell
- unsupported value

## Results screen

Top summary:

Covered lines
Covered import value
Covered tonnes
Indicative liability
Threshold position

Then:

### Liability table

Columns:
- commodity code
- description
- sector
- origin
- supplier
- quantity
- emissions basis
- gross liability
- relief
- net indicative position
- status

Use sticky headers and horizontal overflow on mobile.

### Supplier exposure

Rank suppliers by liability impact / missing-data impact.

### Threshold position

Show the amount and the reason.

### Methodology drawer

Every value should be explainable.

Show:
- inputs
- formula concept
- ruleset/source
- official vs scenario
- missing information

Do not expose private internal calculation implementation that belongs to the authenticated app.

### Conversion CTA

`Save this position in {brand name}` (brand name from `lib/config/site.ts`)

Link to the existing application's configurable create-workspace route. Pass the preview session id only if the backend contract supports claiming a public preview into a workspace; otherwise link without it and say the data will need to be uploaded again.

---

# 13. `/how-it-works`

Build a detailed but highly readable workflow page.

Sections:

1. Import data
2. Resolve commodity scope
3. Monitor threshold
4. Calculate indicative liability
5. Request supplier emissions
6. Apply carbon-price relief
7. Track evidence
8. Prepare return

Only describe functionality that exists or is explicitly planned.

Use diagrams/cards rather than long walls of text.

---

# 14. `/sectors`

Build a sector exploration page.

Current public grouping should be based on the current UK statutory structure:
- aluminium
- cement
- fertilisers
- hydrogen
- iron & steel

Do not hard-code sector lists separately across components.

Each sector card should contain:
- overview
- example products
- commodity-code concept
- typical evidence questions
- related guide
- CTA to exposure checker

Create a commodity/scope explainer that makes clear the exact commodity code matters more than a broad product label.

---

# 15. `/carbon-price-relief`

Explain the idea in plain English.

Structure:

- What carbon-price relief means
- When it may matter
- Why evidence matters
- Worked example
- Evidence checklist
- CTA to liability preview/workspace

Build an illustrative mini-calculator with sample data where useful.

Do not present eligibility as guaranteed without authoritative support.

---

# 16. `/rate-watch`

This page must distinguish:

OFFICIAL

from

SCENARIO / ILLUSTRATIVE

Show:
- current known state
- source date
- effective date if applicable
- timeline
- source cards
- change log
- email alert form

The design should make uncertainty visible rather than hiding it.

---

# 17. `/worked-example`

Create an interactive demonstration of how the platform handles messy operational data.

Tabs:
- Import ledger
- Supplier A
- Supplier B
- Engine decisions
- Preview output

Supplier A:
clean, mostly valid file.

Supplier B:
intentionally messy:
- decimal comma
- unit strings
- typo in header
- reordered sheets/columns
- total row
- unverified declaration

Show exactly what the system detected.

Important:
Do not pretend the system “magically fixed” everything.
Show:
`Detected`
`Normalized`
`Needs review`
`Rejected`

This is a major trust-building section.

---

# 18. `/guides`

Build a professional editorial knowledge centre.

Features:
- search
- sector filter
- category filter
- reviewed date
- rules basis
- featured guide
- card grid

Guide pages should have:
- title
- summary
- reviewed date
- source/rules badge
- key facts
- article content
- tables/examples where needed
- related guides
- calculator CTA

Content should be stored in structured data/MDX/content files instead of being deeply embedded inside React components.

Guides live in `content/guides/*.mdx` with Zod-validated frontmatter (title, summary, slug, sectors, topic, tags, reviewedAt, rulesBasis, sources). They are statically generated. `getGuideIndex`/`getGuide` read this local content in both fixture and live mode unless the existing backend is confirmed to own guide content.

Seed the library with a small number of complete, sourced guides (for example: what UK CBAM is, how the threshold works, commodity codes and scope, supplier emissions data, carbon price relief). A few finished guides beat many stubs. Do not publish a guide without at least one official source.

---

# 19. `/for-brokers`

Target customs brokers, advisers and forwarders.

Explain:
- multiple client organisations
- portfolio visibility
- client workspaces
- bulk onboarding concept
- read-only API concept
- partnership/referral options
- white-label/partner possibilities if commercially offered

Use a sample portfolio preview with fictional clients.

Do not implement the private broker dashboard here.

CTA:
`Talk to us about your portfolio`

---

# 20. `/pricing`

Build a clean pricing page without fake scarcity.

Use configuration-driven content.

Potential structure:

Importer
- public tools
- saved workspace
- supplier workflows
- evidence
- reports

Broker/Partner
- client portfolios
- onboarding
- reporting
- API

Do not hard-code competitor pricing.

Do not promise a commercial plan that has not been approved.

Plans, features and prices live in `lib/config/pricing.ts`. Until prices are approved, each plan shows its features and a `Talk to us` action instead of a number.

---

# 21. LEGAL / TRUST PAGES

Build:

/security
/privacy
/terms
/data-processing
/rules-changelog

Security page should explain high-level controls without revealing operational secrets.

Data-processing page must clearly state what public tools do with uploads and contact details based on the actual backend behavior.

No false claims such as:
- “GDPR certified”
- “HMRC approved”
- “guaranteed compliant”

unless actually proven and contractually approved.

Privacy, terms and data-processing text is a draft for legal review. Show a visible "Draft — pending legal review" notice on these pages until `site.ts` marks them approved, and leave legal entity details as placeholders (§0.2).

---

# 22. CONTENT LANGUAGE

Use calm, precise wording.

Preferred phrases:
- indicative liability
- estimated exposure
- readiness position
- based on the information provided
- official source
- scenario value
- needs review
- evidence required
- return-ready

Avoid fear-heavy wording.
Avoid pretending the site is legal/tax advice.
Avoid “AI” as a generic marketing gimmick.

Use British English spelling and UK formats throughout (`£`, `1 January 2027`, `organisation`). Format money, mass and dates through shared helpers using the `en-GB` locale; never format numbers inline.

Every tool result shows one short, consistent notice (a single shared component): the result is indicative, based on the information provided and the named rules snapshot, and is not legal or tax advice.

---

# 23. PUBLIC API ADAPTER

Create:

`lib/api/client.ts`
`lib/api/types.ts`
`lib/api/fixture-adapter.ts`
`lib/api/live-adapter.ts`

The interface should contain methods such as:

- `getPublicRulesSummary`
- `runQuickEstimate`
- `runThresholdCheck`
- `createLiabilityPreview`
- `uploadLiabilityPreviewFile`
- `getLiabilityPreview`
- `getGuideIndex`
- `getGuide`
- `getRateWatch`
- `subscribeRateAlert`
- `submitContactRequest`
- `getPublicProductConfig`

`docs/INTEGRATION_CONTRACT.md` uses the same names; keep them in sync.

Use Zod schemas on responses.

If live mode fails, fail visibly; do not silently replace live calculations with invented data.

Fixture mode is acceptable for development/demo, and every fixture must be labelled internally as fixture/demo data.

Adapter rules:
- The adapter runs server-side only (mark the module `server-only`). Client components call this repo's route handlers or server actions (§4.3).
- Select the adapter from a server-side mode variable. Validate all environment variables with Zod at startup and fail the build if live mode is selected without the required values.
- In fixture mode, show a small persistent "Demo data" indicator on every tool result so a screenshot can never be mistaken for a live calculation.
- Every result carries the `rulesVersion` it was calculated with. Compare it with the current rules snapshot to drive the stale-rules message in §34.
- Set explicit timeouts on live calls and map backend errors to the user-facing messages in §34.

---

# 24. PRIVACY / DATA HANDLING FOR PUBLIC TOOLS

Treat uploaded customs data as sensitive business information.

Do not:
- log raw uploaded rows
- put file contents into analytics
- put emails or supplier names into analytics event payloads
- persist uploads in the browser's localStorage
- expose backend secrets to browser JavaScript

Use `NEXT_PUBLIC_*` only for genuinely public configuration such as URLs.

Server-only secrets must remain server-side.

Use appropriate upload controls and file type/size restrictions.

## 24.1 Cookies and consent (UK GDPR / PECR)

- Ship with strictly necessary cookies only. Any analytics or marketing script that sets cookies or reads device storage must load only after opt-in consent.
- If a non-essential provider is added, add a consent banner with equal-weight "Accept" and "Reject" options, a way to change the choice later (footer link), and a cookie list on `/privacy`.
- Prefer a cookieless analytics provider so no banner is needed; record the decision.

## 24.2 Forms

Applies to rate alerts, broker/contact requests and "email me this result":
- Validate with the same Zod schema on client and server.
- Collect the minimum fields. Marketing consent is a separate, unticked checkbox; a rate-alert subscription is not consent to marketing.
- Use a honeypot field and server-side rate limiting. Add a CAPTCHA only if abuse appears.
- Show a clear confirmation state and say what happens next (for example, "Check your inbox to confirm").

## 24.3 Security headers

Set in `next.config` or middleware: Content-Security-Policy (no `unsafe-eval` in production), Strict-Transport-Security, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `frame-ancestors 'none'` and a restrictive Permissions-Policy. External links use `rel="noopener noreferrer"`.

---

# 25. SEO

Implement:
- per-page title
- meta description
- canonical URLs
- Open Graph
- sitemap
- robots.txt
- semantic headings
- accessible link names
- internal linking
- structured data where appropriate

SEO should be based on useful CBAM education, not keyword stuffing.

Build canonical URLs, Open Graph URLs and the sitemap from `NEXT_PUBLIC_SITE_URL`. Generate a default Open Graph image per page type with `next/og`. Tool result pages and any URL carrying a result id are `noindex`. Non-production deployments send `noindex` everywhere.

---

# 26. RESPONSIVE DESIGN

Desktop:
- premium editorial grid
- full navigation
- dense but readable result tables

Tablet:
- reduced columns
- responsive cards

Mobile:
- stacked sections
- full-width primary actions
- compact navigation
- results tables become horizontally scrollable or card-based
- upload flow optimized for touch

Supplier/private portal is NOT in this repository, but the public tool experience should still work well on mobile.

---

# 27. ACCESSIBILITY

Target WCAG 2.2 AA.

Requirements:
- keyboard accessible
- visible focus states
- semantic HTML
- correct labels
- error summaries
- accessible dialogs
- accessible table headers
- accessible charts with textual summaries
- no status communicated only through colour
- reduced motion

Test with keyboard navigation and automated accessibility checks where practical.

---

# 28. PERFORMANCE

Treat this as a public high-traffic website.

Prefer:
- server components where useful
- static generation for editorial content
- optimized images
- lazy loading for below-the-fold media
- minimal JavaScript on content pages
- route-level code splitting
- no unnecessary animation libraries

Avoid shipping the entire tool application bundle to every marketing page.

Budgets (mobile, production build, checked with Lighthouse on the homepage, a guide and `/liability-preview`):
- LCP under 2.5 s, CLS under 0.1, INP under 200 ms
- Lighthouse performance, accessibility, best practices and SEO each 90 or above
- first-load JavaScript on content pages kept as low as practical; report the per-route figures from `next build` in `docs/PROGRESS.md` and investigate any content route that pulls in tool code

---

# 29. VISUAL COMPONENT REQUIREMENTS

Build reusable components rather than page-by-page copies.

Required component groups:

### Layout
- SiteHeader
- MobileNav
- SiteFooter
- PageContainer
- Section

### Marketing
- HeroSection
- ProductPreview
- FactStrip
- ProcessSteps
- FeatureGrid
- SplitFeature
- CTASection
- FAQSection

### Tools
- WizardShell
- ProgressBar
- EstimateForm
- SectorSelector
- CountrySelector
- RangeSelector
- FileDropzone
- FileRequirements
- FilePreview
- ColumnDiscovery
- ColumnMapper
- ValidationSummary
- ProcessingStatus
- LiabilitySummary
- LiabilityTable
- SupplierExposureList
- ThresholdGauge
- MethodologyDrawer
- ScenarioBadge
- SourceBadge

### Content
- GuideCard
- GuideFilters
- GuideHeader
- KeyFacts
- RelatedGuides
- SourcePanel
- ChangelogTimeline

### Shared
- Button
- Input
- Select
- Checkbox
- RadioGroup
- Badge
- Card
- Dialog
- Drawer
- Tooltip
- Accordion
- Toast
- Skeleton
- Alert

Every reusable component must support useful loading/error/disabled states where relevant.

---

# 30. FIXTURE / DEMO DATA

Use fictional companies only.

Suggested:
- Northstar Steel Imports Ltd
- Meridian Aluminium Trading Ltd
- Greenfield Building Materials Ltd

Fictional suppliers:
- Atlas Metals
- Meridian Alloy Works
- North Channel Materials

Sample data should include:
- steel in-scope
- steel fasteners in-scope
- aluminium in-scope
- aluminium scrap out of scope
- ferrous scrap out of scope
- pre-1-Jan-2027 line outside CBAM
- cement line

Do not use competitor company names or real customer information.

---

# 31. REGULATORY DATA RULE

Do not scatter regulatory values through components.

Create a configuration/source model for public display:

- start date
- threshold amount
- threshold test descriptions
- covered sectors
- deadlines
- current rate state
- scenario/official status
- reviewed date
- source references

The current public site must reflect the current official UK framework, but future changes must be updateable without rewriting every page.

When an official value is not yet available:

`Scenario value`

and explain what is illustrative.

Never turn a scenario figure into an official claim.

Shape of each value in `lib/config/rules.ts` (validated with Zod):

- `value`
- `status`: `official` | `proposed` | `scenario` | `unverified`
- `sourceTitle`, `sourceUrl` (GOV.UK, legislation.gov.uk or another primary source), `sourceDate`
- `effectiveFrom` where applicable
- `reviewedAt`
- `note` explaining any simplification

Seeding protocol:
- Verify each value against a primary source at build time. If you cannot verify it, set `status: 'unverified'`, display it with an "Unverified" badge, and list it in `docs/PROGRESS.md` for human review.
- Do not rely on memory for regulatory values; legislation and guidance may have changed since this brief was written.
- `/rules-changelog` and `/rate-watch` read from the same config, so a rules update is a single data change.

## 31.1 Canonical status vocabulary

Define each status once (key, label, description, colour token, icon) and reuse it across tools, badges and tests. Colour is never the only signal.

| Key | Used by | Meaning |
|---|---|---|
| `below` | quick estimate, threshold | Below the threshold on the information supplied |
| `watch` | threshold | Below, within the configured watch band |
| `approaching` | quick estimate, threshold | Close to the threshold; real data recommended |
| `likely_triggered` | quick estimate | Likely over; confirm with ledger tests |
| `triggered` | threshold | Over the threshold on the inputs supplied |
| `needs_data` | quick estimate, liability preview | Not enough information for a view |

Value-provenance badges are separate from result statuses: `official`, `default value`, `supplier actual`, `scenario`, `unverified`.

---

# 32. SEARCH / KNOWLEDGE CENTRE

Build a lightweight client/server-friendly guide search.

Search fields:
- title
- summary
- topic
- sector
- tags

Filter by:
- sector
- topic
- recently reviewed

No heavy search infrastructure is necessary for a small public content library.

---

# 33. ANALYTICS

Create a provider-independent event interface.

Track only non-sensitive events such as:
- CTA clicks
- wizard start/completion
- upload start/completion/failure
- guide open
- rate alert subscription
- broker form submission
- sign-in CTA

Never send:
- customs rows
- invoice values
- supplier names
- uploaded file contents
- private calculation inputs

---

# 34. ERROR HANDLING

Every major tool step needs:

Loading:
`Checking your file…`

Validation error:
`We found 3 rows that need review.`

Recoverable error:
`We could not complete the preview. Your uploaded file has not been changed.`

No-data:
`No result yet. Upload a customs file or run the quick estimate.`

Stale rules:
`This result uses an earlier public rules snapshot. Refresh before relying on it.`

Never show:
`Something went wrong.`

without useful context.

Also build a branded `not-found` page that routes visitors to the exposure check and guides, a root `error` boundary with a retry action, and `loading` states for routes that fetch data.

---

# 35. TESTING

Unit tests:
- Zod validation
- estimate input validation
- adapter response parsing
- formatting
- status mapping
- route utilities

Component tests where practical:
- wizard step progression
- file validation display
- threshold result state
- liability table rendering
- methodology drawer

E2E:
1. Homepage CTA works.
2. Exposure checker opens.
3. Quick estimate completes in fixture mode.
4. Threshold checker works.
5. Liability preview accepts a fixture CSV/XLSX.
6. Column mapping can be changed.
7. Validation issues are shown.
8. Result page renders line-level preview.
9. Scenario badges are visible.
10. Workspace CTA points to configured existing app URL.
11. Guides search/filter work.
12. Rate watch page loads.
13. Alert form validates.
14. Mobile navigation works.
15. All public pages return valid production responses.
16. Every public route passes an axe scan with no serious or critical violations.
17. Keyboard-only run of the quick estimate and liability preview.
18. Fixture mode shows the "Demo data" indicator on every result.

Fixture files:
- Keep sample CSV/XLSX files in `tests/fixtures/`, covering the sample data in §30 and the messy cases in §12 and §17.
- Unit tests for every Zod config file (rules, pricing, navigation, guide frontmatter) so invalid content fails CI rather than production.

---

# 36. SECURITY CHECKS

Verify:
- no secrets committed
- no API secret appears in client bundle
- external links are safe
- upload type/size checks exist
- analytics payloads contain no sensitive business data
- forms have CSRF-safe architecture appropriate to the selected implementation
- no raw upload contents are written to logs

---

# 37. BUILD ORDER

Phase 0 — orientation
- read this brief, README.md and docs/
- create `docs/PROGRESS.md` and `docs/DECISIONS.md`
- list unresolved project inputs (§0.2) and unverified regulatory values (§31)
- confirm the plan for Mantine/Tailwind integration and request architecture (§4.2, §4.3)

Phase 1 — foundation
- Next.js app setup
- tooling: scripts, lint, format, env validation, CI
- config modules: site, rules, navigation, pricing
- global styles
- brand config
- header/footer
- typography
- buttons/forms
- base components

Phase 2 — homepage
- hero
- product preview
- fact strip
- process
- feature sections
- FAQ
- CTA

Phase 3 — public tools
- exposure checker
- quick estimate
- threshold checker
- liability preview
- fixture adapter

Phase 4 — knowledge/content
- sectors
- guides
- worked example
- carbon price relief
- rate watch
- changelog

Phase 5 — conversion/trust
- for brokers
- pricing
- security
- privacy
- terms
- data processing

Phase 6 — live API integration
- confirm actual existing API contract
- map adapter methods
- live loading/error states
- environment configuration

Phase 7 — hardening
- tests
- accessibility
- SEO
- performance
- analytics
- production build

After each phase:
- run typecheck
- run lint
- run tests
- run production build
- visually inspect major routes at mobile (375px), tablet (768px) and desktop (1440px) widths, using Playwright screenshots
- record known issues in `docs/PROGRESS.md`
- commit the phase as its own set of commits so it can be reviewed independently

---

# 38. WORKING RULES FOR CLAUDE CODE

Before changing code:
1. Inspect the repository.
2. Read README.md and all docs/ files.
3. Preserve the public/private boundary.
4. Reuse existing components where appropriate.
5. Do not invent production API endpoints.
6. Use fixture adapters until the real contract is confirmed.

While implementing:
- keep copy original
- keep regulatory claims sourced
- keep numbers labelled
- keep public tool results explainable
- keep loading/error/empty states intentional
- avoid placeholder-looking UI in primary routes
- make the primary conversion path obvious

Attribution (applies to every commit, pull request and code comment):
- never add AI attribution of any kind
- no `Co-Authored-By:` trailers naming an AI tool or model
- no "Generated with ..." / "Written by AI" lines in commit messages or PR descriptions
- no comments in code, docs or config that mention AI authorship
- commit messages describe the change only, in the author's own voice

Before declaring the work complete:
- no major placeholder page remains
- no fake functionality is represented as live
- all links work
- all primary forms validate
- live-vs-fixture mode is explicit
- `npm run typecheck` passes
- `npm run lint` passes
- `npm run build` passes
- `npm test` and `npm run test:e2e` pass
- responsive layouts are checked
- accessibility issues found during testing are fixed

---

# 39. DEFINITION OF DONE

The public website is complete only when:

- homepage looks production-ready
- navigation and footer are complete
- all public routes are implemented
- exposure checker works
- quick estimate works
- threshold checker works
- liability preview works in fixture mode
- live adapter boundary exists
- results explain assumptions
- guides are searchable/filterable
- worked example is interactive
- rate watch clearly separates official/scenario
- carbon price relief content is usable
- broker page is complete
- pricing is configurable
- legal/trust pages exist
- SEO metadata exists
- responsive design is verified
- keyboard accessibility is verified
- E2E happy paths pass
- production build passes
- CI workflow passes on a clean checkout
- performance budgets (§28) are met or the gap is recorded
- every regulatory value is sourced or visibly marked unverified
- `docs/PROGRESS.md` lists remaining project inputs and known issues

---

# 40. FINAL PRODUCT STANDARD

The result should look like a premium UK compliance product that a finance director, customs manager, sustainability manager or broker would trust enough to explore.

It must be significantly more useful than a normal marketing website because the visitor can actually run meaningful public tools.

The strongest product sequence is:

MARKETING CLARITY
+
CBAMcheck-style low-friction exposure discovery
+
CBAMReturn-style operational transparency
+
original UI/brand
+
clean API boundary into the existing application

Build that combination as one coherent website.
