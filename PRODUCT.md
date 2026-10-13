# Product

<!-- impeccable:product-schema 1 -->

Derived from `MASTER_PROMPT.md` (the project brief) and the user's instructions of 7 October 2026. No separate interview round was held; facts below are taken from the brief, not inferred.

## Platform

web

## Users

- UK importers of aluminium, cement, fertilisers, hydrogen, and iron and steel goods: finance directors, customs managers, compliance and sustainability managers. They arrive unsure whether UK CBAM applies to them and what it could cost.
- Customs brokers, advisers and freight forwarders who look after several importers and want a portfolio view.

## Product Purpose

The public front door to an existing private UK CBAM compliance application. It answers three questions: does UK CBAM apply to my business, what could my exposure look like, and what should I do next. Success is a visitor reaching a useful indicative result (quick estimate, threshold check or upload-based liability preview) and continuing into the workspace.

## Positioning

Turns the customs and supplier data an importer already holds into an explainable position: every figure is labelled by where it came from (official, default value, supplier actual, scenario, unverified), and the visitor can see how each number is built. Free public tools give a result before any sign-in.

## Operating Context

Customs declarations and broker/CDS exports (CSV, XLSX), commodity codes, supplier emissions declarations, the £-denominated registration threshold with a 12-month look-back and 30-day forward test, carbon price relief evidence, and HMRC/GOV.UK guidance as the primary source.

## Capabilities and Constraints

- Public tools: exposure check, five-step quick estimate, threshold checker, liability preview (file read in the browser; only mapped, validated rows are sent). Fixture mode until the backend contract is confirmed; results carry a "Demo data" indicator.
- The authenticated workspace (supplier chase, evidence vault, returns, broker portfolio) is not built here; the public site may explain and preview it only.
- Regulatory values come only from `lib/config/rules.ts`, each with a source and status.
- Next.js 16 App Router, Tailwind 4, Mantine only on result/upload routes; first-load JS budgets enforced by `npm run bundles:check`.
- Undecided: final brand name (working name "CBAM Control"), legal entity, contact emails, app URLs, prices, analytics and email providers, photography.

## Brand Commitments

- Working name "CBAM Control", read only from `lib/config/site.ts`.
- Voice: calm, precise British English. Preferred phrases: indicative liability, estimated exposure, readiness position, based on the information provided, official source, scenario value, needs review, evidence required, return-ready. No fear wording, no "AI" marketing, no legal or tax advice claims.
- One primary action label everywhere: "Check my exposure".
- Must not look like generic green ESG software, a SaaS template, a dashboard wall or an AI-generated site, and must not copy cbamcheck.co.uk, cbamreturn.co.uk or Agentik 360.

## Evidence on Hand

- No customers, testimonials, logos, metrics or case studies exist. None may be invented.
- Fictional sample companies only (Northstar Steel Imports Ltd, Meridian Aluminium Trading Ltd, Greenfield Building Materials Ltd; suppliers Atlas Metals, Meridian Alloy Works, North Channel Materials), always labelled sample or illustrative.
- Five sourced guides in `content/guides/`; verified rules record in `docs/PROGRESS.md`.

## Product Principles

1. Show the working: every number is explainable and labelled by provenance.
2. Useful before sign-in: a visitor gets a real indicative result without an account.
3. Uncertainty is visible, never hidden: scenario and unverified values are marked as such.
4. Calm and exact over persuasive: no scarcity, no fear, no inflated claims.

## Accessibility & Inclusion

WCAG 2.2 AA. Keyboard operable, visible focus, status never by colour alone, accessible tables and charts with text summaries, reduced motion respected. Checked by axe in Playwright on every public route.
