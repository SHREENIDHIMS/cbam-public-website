# Integration Contract With Existing CBAM Application

The public website is a separate repository. It must communicate with the existing CBAM platform through a small typed adapter layer.

## Core rule

Do not copy business logic from the existing application into this repo. The public website renders and orchestrates public workflows; the existing backend remains authoritative for live calculations and rules whenever a real API is available.

## Adapter interface

Implement an interface similar to:

- `getPublicRulesSummary()`
- `runQuickEstimate(input)`
- `runThresholdCheck(input)`
- `createLiabilityPreview(input)`
- `uploadLiabilityPreviewFile(sessionId, file)`
- `getLiabilityPreview(sessionId)`
- `getGuideIndex()`
- `getGuide(slug)`
- `getRateWatch()`
- `subscribeRateAlert(input)`
- `submitContactRequest(input)`
- `getPublicProductConfig()`

Use a real API implementation and a fixture implementation behind the same interface. These names match `MASTER_PROMPT.md` §23; keep them in sync.

The adapter runs server-side only. The browser calls this repository's route handlers or server actions, which call the adapter. The browser never calls the existing backend directly.

Every result includes the `rulesVersion` it was calculated with, so the site can detect stale results.

## Expected public result shapes

Quick estimate:

- status: below | approaching | likely_triggered | needs_data (see `MASTER_PROMPT.md` §31.1)
- estimate range or clearly labelled scenario value
- sector exposure
- explanation
- next actions

Threshold check:

- backward-test status: below | watch | approaching | triggered
- forward-test status: below | watch | approaching | triggered
- current/estimated amount
- threshold amount
- trigger explanation
- relevant next step/deadline when supported by the ruleset

Liability preview:

- upload session id
- processing status
- row counts
- validation issues
- in-scope/out-of-scope counts
- covered value
- quantity/weight summary
- indicative liability
- supplier exposure ranking
- threshold position
- line-level preview
- methodology/source metadata

## Do not invent live endpoints

Before connecting production mode, inspect the existing application's API documentation/OpenAPI contract or backend route implementation and map these adapter methods to the actual endpoints.

Never invent an endpoint and silently ship it as production.

## Environment

Public (safe in the browser):

`NEXT_PUBLIC_SITE_URL` — canonical origin for SEO
`NEXT_PUBLIC_CBAM_APP_URL` — existing application, for sign-in/create-workspace links

Server-only:

`CBAM_API_URL` — existing backend base URL
`CBAM_API_KEY` — credential for the backend, if one is required
`PUBLIC_API_MODE=fixture|live`

The API URL and mode are server-only because only route handlers call the backend. Validate all variables with Zod at startup; selecting `live` without the required values must fail the build.

Do not expose server-only API secrets through `NEXT_PUBLIC_*` variables. Document every variable in `.env.example`.

## Hand-off links

The public site should have a configurable destination for:

- sign in
- create workspace
- authenticated dashboard
- support/contact

Do not hard-code the existing application's hostname.

## Phase 6 open checklist (live mode)

Status as of Phase 7: the live adapter (`lib/api/live-adapter.ts`) has no endpoints. Every method except the two guide methods throws `not_configured`, and every page and route that calls the adapter turns that into a visible error state (no demo data in live mode). The request wrapper `liveRequest` (`lib/api/http.ts`) already provides an explicit timeout (`CBAM_API_TIMEOUT_MS`, default 10 s), an optional bearer credential (`CBAM_API_KEY`), HTTP-status to error-code mapping and Zod parsing of every response. What is missing is the contract itself. Each row below stays open until the backend owner supplies the route and a response sample.

| Adapter method | Backend route (method and path) | Request shape | Response shape and Zod schema | Auth | Status |
|---|---|---|---|---|---|
| `getPublicRulesSummary` | to be supplied | none | `publicRulesSummarySchema` in `lib/api/schemas.ts` | to be supplied | Open |
| `runQuickEstimate` | to be supplied | `QuickEstimateInput` (bands only) | `quickEstimateResultSchema` | to be supplied | Open |
| `runThresholdCheck` | to be supplied | `ThresholdCheckInput` | `thresholdCheckResultSchema` | to be supplied | Open |
| `createLiabilityPreview` | to be supplied | `CreateLiabilityPreviewInput` (mapped, validated rows) | `liabilityPreviewSchema` | to be supplied | Open |
| `uploadLiabilityPreviewFile` | to be supplied (only if the backend should receive raw files; today the browser parses files and sends mapped rows) | multipart or none | `liabilityPreviewSchema` | to be supplied | Open |
| `getLiabilityPreview` | to be supplied | session id | `liabilityPreviewSchema` | to be supplied | Open |
| `getGuideIndex`, `getGuide` | not needed: guides are local MDX and served in live mode | none | none | none | Local |
| `getRateWatch` | to be supplied | none | `rateWatchSchema` | to be supplied | Open |
| `subscribeRateAlert` | to be supplied (double opt-in email) | `RateAlertInput` | `acknowledgementSchema` | to be supplied | Open |
| `submitContactRequest` | to be supplied | `ContactRequestInput` | `acknowledgementSchema` | to be supplied | Open |
| `getPublicProductConfig` | to be supplied (or keep local config) | none | `publicProductConfigSchema` | to be supplied | Open |

Questions the backend contract must answer before live mode ships:

- [ ] OpenAPI document or route list for the existing application, and which routes are public.
- [ ] How a public caller authenticates (API key, none, or a dedicated public service) and whether `CBAM_API_KEY` is the right credential.
- [ ] Whether the backend returns `rulesVersion` on every result (required for the stale-rules notice).
- [ ] Upload data retention, so `/data-processing` and the FAQ can state it.
- [ ] Whether a public preview can be claimed into a workspace (`previewClaimSupported` in `lib/config/site.ts`); until confirmed the site tells visitors to upload again.
- [ ] Hand-off paths on the existing app: sign in, create workspace, dashboard (`NEXT_PUBLIC_CBAM_*_PATH`).
- [ ] Shared rate limiting for live mode (the in-process limiter is per instance).
- [ ] Error body shape, so backend errors map to the user messages in `lib/api/errors.ts`.
- [ ] Timeouts per method (the default 10 s is a placeholder).

When a row is filled in: implement the method with `liveRequest`, add a contract test with a recorded response sample, remove the method from the `not_configured` set, and tick the row here.
