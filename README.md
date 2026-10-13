# CBAM Public Website — Separate Repository

A standalone Next.js public website and public-tool frontend for the existing CBAM compliance platform.

## Purpose

This repository contains **only the public/acquisition layer**:

- marketing website
- CBAM education/content
- exposure checker
- quick estimator
- public liability preview
- worked example
- rate/rules watch
- carbon-price-relief explainer
- broker/partner page
- pricing
- legal/security pages

The authenticated compliance workspace, supplier portal, internal dashboard, evidence vault, returns workspace, broker portfolio and other private application modules stay in the existing CBAM application repository.

## Relationship with the existing CBAM application

Use an API/service-adapter boundary so this site can call the existing CBAM backend without copying the private application into this repo.

The integration contract is documented in `docs/INTEGRATION_CONTRACT.md`.

The public site must also have a fixture/mock mode so the UI can be built and tested when the existing backend is unavailable.

The primary visual reference is Agentik 360 for editorial storytelling and premium composition, combined with the compliance UX patterns of CBAMReturn and the low-friction public tooling of CBAMcheck.

## Recommended stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Mantine
- React Hook Form
- Zod
- TanStack Query only where client-side remote state benefits from it
- Playwright with axe accessibility checks
- Vitest
- ESLint and Prettier

## Start

1. Run the master prompt in `MASTER_PROMPT.md` with Claude Code from this directory. Fill in the project inputs in §0.2 first if you have them.
2. Make the public website run independently in fixture mode first.
3. Connect the real CBAM API through the adapter in `lib/api/`.
4. Set production environment variables only after the backend contract is confirmed.

## Important

Do not copy competitor branding, logos, exact wording, source code, proprietary illustrations or exact layouts. Recreate useful product concepts with an original visual identity and interaction design.

Do not make regulatory claims without a source. Keep official values distinct from scenario/illustrative values.
