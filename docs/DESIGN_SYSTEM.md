# Public Website Design System

Direction: "Carbon copy" (chosen 7 October 2026; decision record `docs/DECISIONS.md` §37). The site is laid out like the artefact it produces, a customs declaration: labelled boxes on ruled paper, figures in a mono column, provenance as ink stamps.

## Design character

Premium B2B regulatory/compliance product. Calm, credible, precise, operational. It should read like a well-made form, not a landing-page template.

Avoid (these read as AI-generated or as a competitor's lane):
- cream, ivory or sand grounds; blue-violet accents; generic green sustainability branding
- Inter, Geist, Instrument Serif, DM Serif, Fraunces, Playfair as faces
- a kicker or eyebrow label above a heading; decorative 01/02/03 numerals
- "heading plus three icon cards" as page structure; icon tiles; nested cards
- grid or dot textures, gradient blobs, gradient text, glass
- pill badges for anything except native radio buttons
- invented proof: testimonials, logo strips, unverified metrics

## Palette

Role tokens only, defined once in `lib/design/tokens.ts` and emitted as `--cc-*` variables. Components never name a hue.

- Ground: zinc-white `canvas`; `surface` for boxes and inputs; `surface-alt` for bands.
- Ink: aubergine-tinted `ink`, `ink-muted`, `ink-subtle`.
- Action: `primary` (stamp-ink aubergine) with `on-primary`, `primary-hover`, `primary-tint`.
- Secondary: galvanised steel blue.
- Status: positive (green), watch (amber), critical (red, only for genuinely critical states), info (steel), neutral. Each is a self-contained fg/bg pair.
- Dark sections set `data-tone="inverse"`; the role variables flip, so components need no special cases. `data-tone="paper"` restores light roles for a paper box on a dark section.

Every text pair is contrast-tested (`tests/unit/design/contrast.test.ts`).

## Typography

- Archivo for headings, labels, buttons and large figures. Atkinson Hyperlegible Next for body and UI. Atkinson Hyperlegible Mono for money, mass, dates and codes only.
- Four tiers in `styles/type.css`: `.t-display` (home headline, closing CTA), `.t-chapter` (section headings, interior page titles), `.t-title` (box and card titles), `.t-label` (box labels, table heads). Supporting classes: `.t-lead`, `.t-figure`, `.t-figure-lg`.
- A heading never sets its own size. If a section seems to need one, it needs one of the tiers.

## Layout and rhythm

- Content width 1240px (`max-w-site`); evidence sections may use 1440px (`max-w-wide`, `Section wide`).
- One vertical rhythm token, `--section-gap`, used by every `Section`.
- Interior pages open with `PageHeader`: the title and lead on the left, a small reference box (form name and rules date) on the right.
- Vary section shapes: boxed fields, ruled ledgers, a dark band, a split with a product visual. Do not repeat the same shape twice in a row.

## Element language (`styles/elements.css`)

- `.box`, `.box-head`, `.box-body`: a labelled box on the form. 3px radius.
- `.box-no`: a numbered box, only for a real sequence (wizard step, process stage, calculation line).
- `.ledger`: ruled list or table, 2px ink top rule, hairlines between rows.
- `.stamp`: double-ruled stamp for value provenance. `.stamp-tilt` once per sample artefact.
- `.tag`: flat status tag.
- `.btn` with `.btn-primary`, `.btn-secondary`, `.btn-ghost` and `.btn-md` or `.btn-lg`. Buttons rest off a small underprint and press into it on hover.
- `.link` for links in running copy.

## Components

Shared state components: EmptyState, ErrorState, InlineFieldError, ErrorSummary, ResultNotice, DemoDataIndicator (fixture mode only, rendered as a stamp), StatusBadge (tag) and ProvenanceBadge (stamp), both driven by the canonical vocabularies in `lib/config/status.ts` and `lib/config/provenance.ts`.

## Motion

One curve (`--ease`) and three durations (`--dur-1/2/3`). One reveal ("settle": opacity and a slight scale, no drift), gauge and bar draw-ins whose final state is the resting state, and one stamp landing on the hero sample. Everything respects `prefers-reduced-motion`.

Use drawers for methodology and calculation details. Never make an important assumption discoverable only through hover.
