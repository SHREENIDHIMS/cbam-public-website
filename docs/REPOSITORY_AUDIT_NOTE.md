# Repository Audit Note

## Access status

The supplied repository URL:
`https://github.com/SHREENIDHIMS/CBAMindeatiled`

could not be fetched during this build and currently resolves as a GitHub 404 from the available public web access. No source-code-level claim is made here about files that could not be inspected.

## What this public-site repo is based on

The current CBAM product files available in the project context describe an existing authenticated application with:
- import ledgers
- threshold engine
- liability calculations
- supplier workflows
- evidence vault
- carbon-price relief
- registration/return workflows
- reports/export
- audit trail
- broker features
- rules/rate versioning

The public website deliberately treats those as existing backend/application capabilities and provides a frontend/public acquisition layer around them.

## Required integration step

Before enabling live production API mode, map the typed adapter in `docs/INTEGRATION_CONTRACT.md` to the actual existing CBAM API/OpenAPI routes.

Do not invent endpoint paths merely because an adapter method exists.
