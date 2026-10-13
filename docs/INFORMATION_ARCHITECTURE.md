# Public Website Information Architecture

## Primary navigation

Follows `MASTER_PROMPT.md` §7. Defined once in `lib/config/navigation.ts`.

Centre:
How it works
Check Exposure
Sectors
Guides
Rate Watch

Optional grouped menus:
Tools (exposure check, quick estimate, threshold checker, liability preview, worked example)
Resources (guides, carbon price relief, rate watch, rules changelog)

Right-side actions:
For Brokers
Pricing
Sign in
Check my exposure (primary button)

## Public routes

/
/exposure-check
/quick-estimate
/liability-preview
/threshold-checker
/how-it-works
/sectors
/carbon-price-relief
/rate-watch
/guides
/guides/[slug]
/worked-example
/for-brokers
/pricing
/security
/privacy
/terms
/data-processing
/rules-changelog

## Primary conversion path

/
→ /exposure-check
→ choose Quick Estimate or Upload Data
→ result
→ save/continue
→ existing application's sign-in/create-workspace route

## Secondary paths

Guides → calculator
Sectors → calculator
Carbon Price Relief → liability preview
Rate Watch → alert subscription → calculator
Worked Example → liability preview
For Brokers → demo/contact
Pricing → start workspace
