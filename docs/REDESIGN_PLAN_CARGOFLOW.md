# Redesign plan: adopt the CargoFlow design system

Status: phases 1-3 done (tokens, core components, home page); phases 4-6 open. See docs/DECISIONS.md section 38.
Reference site: https://carrgoflow.webflow.io (a Webflow logistics template, 17 pages).
Reviewed: 2026-10-10. Method: downloaded every page's HTML, the shared CSS and the inline scripts, and scrolled the live home page at 1440 px.

## 1. What the reference site is

A light, editorial logistics site. Big photo or video hero, lots of white space, one loud orange accent (`#ff5d18`) used for whole-section colour blocks, pill buttons, small caps labels with a slash-separated look, and scroll-driven motion (smooth scroll, pinned crane that lowers a container, count-up numbers, sliding marquees).

### 1.1 Pages (all 200 OK)
| Path | Sections (from the page markup) |
|---|---|
| `/` | hero video slider, about intro, partners (orange), how it works (3 steps + crane), optimise (accordion + photo), core value (stat cards), services (orange, 4 cards + 1 CTA card), testimonial marquee, "LOGISTIC" giant-word + blog teasers, FAQ, articles, CTA photo band, footer |
| `/about` | about hero, who we are, planning/awards list, what we do, choose us (5 reasons), partner, delivered (stats), team, CTA |
| `/services` | service hero, service list with 01-04 index, process (3 steps), why choose (5 points), FAQ, CTA |
| `/how-it-works` | hero, 3 detailed stages (each with 3 sub-points), 5-step process flow, CTA |
| `/pricing`, `/pricing-single` | hero, 3 plan cards with "Includes" lists, "why our pricing makes sense" (4 points), CTA |
| `/blog`, `/blog/[slug]` | hero, category filter + search + card grid (9 posts), CTA |
| `/career`, `/career/[slug]` | hero, culture (4 numbered values), openings list (type / level / title / blurb), FAQ, CTA |
| `/contact` | hero, form (name, email, company, phone, service select, message) + office details and hours, CTA |
| `/changelog`, `/style-guide`, `/licenses`, `/instructions`, `/policy`, `/terms`, `/401`, `/404`, `/checkout` | utility pages; only style-guide, policy/terms, 404 matter for us |

Every inner page ends with the same CTA photo band ("Partner in your global logistics journey") and the same dark footer with a newsletter box.

### 1.2 Design tokens (read from the shared CSS)

**Colour**
| Role | Value |
|---|---|
| Brand (accent) | `#ff5d18` |
| Ink / text | `#060517` (deep navy) |
| Footer ground | `#00101a` |
| Page ground | `#fafafa`; alt panels `#f8f8f8`; cards `#ffffff` |
| Muted text | `#7c7c7c`, `#666d78` |
| Borders | `#e5e5e5`, `#0e0e0e1a`, on dark `#ffffff1c` / `#fff3` |

**Fonts**
- Headings and body: **Aspekta** (weights 100-900; most headings use 500 Medium). Fallback Arial.
- **Helvetica Now Display** is loaded for some elements (commercial font, do not copy).
- Inter is loaded through WebFont but barely used.

**Type scale (desktop / tablet / mobile steps)**
- Display 01: 128 px (hero giant words), Display 02: 120 px, Display 03: 80 px (page hero, `-1.6 px` tracking, line-height 1).
- H1 48, H2 40, H3 32, H4 28, H5 24, H6 20 px; line-height 120%; tracking about -2% to -1%.
- Body 16 px, large 18, small 14; line-height 140%.

**Shape and spacing**
- Container max width 85 rem (1360 px); side padding 1 rem.
- Radius: tiny 4 px (cards), pill 80 px (all buttons), large 24-32 px (photo cards).
- Spacing steps: 4, 8, 10-12, 16, 20-24, 32-40, 48-60, 80, 120 px. Big sections use roughly 120 px top and bottom on desktop.
- Breakpoints: 479, 767, 991, 1440, 1920.

**Components**
- Primary button: white pill, navy text, 13 px / 32 px padding, small arrow in a clipped box that slides on hover. Variants: orange fill, outline, navy-on-hover.
- Nav: absolute over hero, transparent, centred links separated by "/" slashes, cart icon and a white "Contact us" pill on the right. Link hover uses a text-roll (a copy of the text sits 1.4 rem below via `text-shadow`, clipped, and slides up).
- Section label: tiny uppercase text (eyebrow) with a left rule, e.g. "ABOUT US", "PARTNER", "CORE VALUE".
- Service card: white, 4 px radius, small outline icon, orange category tag top right, title and blurb; a taller "Discover our services" card with an orange pill in the middle.
- Accordion (optimise, FAQ): title + plus/minus, thin rule, first item open, FAQ marks the open item in orange.
- Testimonial card: white, quote mark, centred text, name and role in small grey.
- Footer: dark `#00101a`, newsletter on the left, link columns (Main, Address, Contact) on the right, social icons and copyright line at the bottom.

### 1.3 Motion (from the inline script and CSS)
1. **Lenis smooth scroll** (duration 1.2 s, lerp 0.1), off on touch devices, synced to GSAP's ticker.
2. **GSAP ScrollTrigger** drives: scroll-linked text colour reveal on the about paragraph (grey to dark), the pinned crane/container scene on "How it works" (container descends as steps 1-3 appear, background fills with stacked containers), and the stacked photo cards on "Core value" (each photo card slides over the last while the big number counts).
3. **Counters**: `.cc-coma` and `.cc-integer` count up from 0 over 3 s when 90% into view, once.
4. **Marquees**: infinite horizontal loops, partners in two rows moving opposite ways (20-22 s), testimonials (25 s).
5. **Hero**: full-height background video slider with three slides (Air / Road / Sea tabs at the bottom), headline and CTA repeat per slide, play/pause button.
6. **Hover**: buttons `transition: all .25s`; nav text-roll; arrow slide; card transitions at .25-.4 s.
7. SplitText is loaded, so headings likely reveal line by line.

I did not read the Webflow interaction JSON (IX2) line by line, so exact easings of the reveal animations are "not verified". The visible behaviour above was confirmed by scrolling.

## 2. Things we must not copy as-is
- **Photos, videos, logos, copy, icons, illustrations**: they belong to the template author or stock sites. `README.md` and `PRODUCT.md` also forbid copying competitor assets or wording. We copy the *system* (tokens, layout patterns, motion types), never the files.
- **Helvetica Now Display**: commercial. Use Aspekta only (it is open source under the SIL OFL) and confirm the licence file before bundling; otherwise fall back to a free alternative.
- **Stock people photography and fake testimonials**: `PRODUCT.md` says no invented customers, logos or metrics. The stat counters ("2000+ moves", "98%") must become real, sourced CBAM facts (e.g. 1 Jan 2027 start, £50,000 threshold, 5 sectors, 5 guides) or be dropped.

## 3. Conflicts to resolve before building
| Conflict | Why it matters | Recommended answer |
|---|---|---|
| White text on `#ff5d18` is about 3.1:1 contrast | `PRODUCT.md` requires WCAG 2.2 AA; `tests/unit/design/contrast.test.ts` enforces it | Use navy `#060517` text on orange (about 6.5:1), or a darker orange for white text. Keep white-on-orange only for text 24 px and above. |
| Orange brand vs today's aubergine "Carbon copy" look | The whole identity changes | Confirm: replace aubergine entirely, or keep aubergine for dark sections. |
| `PRODUCT.md`: "calm, precise", "must not look like a SaaS template" | The reference is a loud, animated agency template | Keep the layout language but tone motion down: no looping videos, no pinned crane. |
| First-load JS budget 150 KB gzip per route (`npm run bundles:check`) | GSAP + ScrollTrigger + Lenis are about 40-50 KB gzip | Do the motion with CSS scroll-driven animation, `IntersectionObserver` and `requestAnimationFrame`, no libraries. |
| Reduced motion (`PRODUCT.md`) | Smooth scroll and pinned scenes can hurt users | Disable Lenis-style scroll, marquees and parallax under `prefers-reduced-motion`. |
| Existing tests assert current copy, structure and screenshots | A redesign breaks `tests/e2e/*` and some component tests | Update tests phase by phase. |

## 4. Mapping: CargoFlow pattern to CBAM page

| CargoFlow section | CBAM equivalent (real content only) |
|---|---|
| Hero video + Air/Road/Sea tabs | Photo or CSS hero, headline "Check my exposure", three tabs: Quick estimate / Threshold check / Upload customs file |
| About paragraph with grey-to-dark reveal | One-paragraph explainer: what UK CBAM is and when it starts |
| Partner marquee (orange) | Sector marquee: aluminium, cement, fertilisers, hydrogen, iron and steel (no fake logos) |
| How it works (3 steps + crane) | Four stages: upload ledger, map suppliers, see provenance, indicative position. Replace the crane with the existing ship/crane/train SVG (`components/hero/journey`) pinned on scroll |
| Optimise accordion + photo | Features accordion (supplier data, provenance labels, relief) |
| Core value stat cards | Fact cards: 1 Jan 2027, £50,000, 5 sectors (from `lib/config/rules.ts`) |
| Services orange cards | Tools cards: exposure check, quick estimate, threshold checker, liability preview |
| Testimonials marquee | Dropped or replaced with "Rules snapshot" source cards (no invented quotes) |
| "LOGISTIC" giant word + blog cards | Giant word "GUIDES" + the 5 MDX guides |
| FAQ | Existing FAQ (`lib/config/faq.ts`) in the new accordion style |
| CTA photo band + footer | Same pattern: "Find out where you stand" + dark footer with rate-alert signup |
| About, Services, How it works, Pricing, Blog, Contact | `/sectors` and `/how-it-works`, `/for-brokers`, `/pricing`, `/guides`, a contact section |
| Career, Changelog | Not needed. `/rules-changelog` already exists and can take the changelog timeline style |
| Style guide page | Optional internal `/style-guide` page generated from our tokens |

## 5. Phased plan

Each phase ends with: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run bundles:check`, Playwright incl. axe, and screenshots at 375 / 768 / 1440 px. Each phase is a separate commit on a feature branch.

0. **Decisions** (no code): answer section 6 below; confirm fonts and licences; confirm real images (own or licensed) for hero and CTA band.
1. **Tokens**: replace colours, radii, spacing, type scale in `DESIGN.md`, `lib/design/tokens.ts`, `styles/tokens-theme.css`, `styles/type.css`; swap fonts in `lib/design/fonts.ts`; update the contrast test.
2. **Core components**: pill `Button`/`ButtonLink` with sliding arrow, section eyebrow label, new card, accordion, stat card, dark footer, transparent-over-hero header with slash nav and text-roll hover.
3. **Home page**: all sections in section 4; hero tabs; counters; marquee; scroll reveal; reduced-motion handling.
4. **Inner marketing pages**: how it works, sectors, guides, for-brokers, pricing, security, legal pages on the new layouts and the shared CTA band.
5. **Tools and results**: restyle quick estimate, threshold checker, liability preview and result pages (forms, wizard, tables) with the new tokens; keep behaviour unchanged.
6. **Polish and hardening**: motion tuning, Lighthouse re-run (LCP was 2.8 s before), bundle budgets, full e2e and axe, update `docs/PROGRESS.md` and `docs/DECISIONS.md`.

## 6. Questions I need answered
1. Accent colour: use CargoFlow's orange `#ff5d18`, or keep CBAM's own brand colour and copy only layout and motion?
2. Images: do you have photos or video of your own, or should I build the hero from CSS/SVG (no stock photos)?
3. Motion level: full CargoFlow motion (pinned scene, marquees, counters), or the calmer version in section 3?
4. Git: this folder's git root is `C:/Users/chait` (your home folder), not the project. OK to run `git init` here, or is there a repo URL to use instead?
