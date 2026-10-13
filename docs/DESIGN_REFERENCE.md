# Public Website Design Reference

## Decision

Use a **hybrid design language**:

- **Primary visual reference:** Agentik 360
- **Primary compliance/product reference:** CBAMReturn
- **Primary conversion/tool reference:** CBAMcheck

## What this means in practice

### Agentik 360
The site should inherit the editorial rhythm visible in Agentik 360: a strong thesis, large headlines, generous whitespace, narrative “chapters”, outcome metrics, selective large imagery and an end-to-end story from operational problem to engineered outcome.

### CBAMReturn
Use its public product communication patterns: hero with a concrete compliance artifact, deadline/threshold fact strip, operational three-step workflow, sector scope, broker positioning, FAQ and dated/source-aware regulatory language.

### CBAMcheck
Use its conversion pattern: explain the problem quickly, show a simple three-step path, offer a quick estimate plus an upload route, then preview the report and drive to the exposure checker.

## Final design personality

The resulting website should feel like:

> A premium compliance product studio with the clarity of a finance tool.

It should **not** feel like:

- generic green ESG software
- a copied SaaS template
- a dashboard wall
- a “climate tech” landing page full of planets/leaves
- an AI startup site

## Core visual rules

> Amended 7 October 2026 (`docs/DECISIONS.md` §37): the "Carbon copy" direction replaces the warm-neutral, petrol and serif rules. Full rules in `docs/DESIGN_SYSTEM.md`.

1. Cool zinc-white paper base.
2. Dark aubergine-tinted ink; Archivo headings, Atkinson Hyperlegible body.
3. Stamp-ink aubergine action colour.
4. Large, confident headlines.
5. Short text blocks.
6. Strong grid alignment.
7. Occasional full-width image sections.
8. Labelled boxes and ruled ledgers instead of cards; spacing and rules for structure.
9. Real-looking product UI previews.
10. Provenance shown as stamps: “official”, “scenario”, “illustrative”.
11. Subtle motion only.
12. Excellent mobile typography and spacing.

## UI library decision

Use **Mantine** instead of shadcn/ui.

Mantine supplies accessible primitives and interaction components; the site should apply a custom theme so it does not look like an off-the-shelf Mantine application.

Tailwind may be used for layout/utility styling where useful, but do not duplicate component systems unnecessarily.
