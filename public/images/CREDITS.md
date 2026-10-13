# Image and asset credits

Every visual on the site is an original SVG or CSS composition made for this project. No stock photography, no third-party illustrations and no icon files are committed under `public/`. If a photograph or illustration is added later, add a row below before merging.

## Images

| File | Description | Author | Licence | Source |
|---|---|---|---|---|
| `public/favicon.svg` | Brand mark (double-ruled declaration box) | Project team | Project-owned | Original |
| Open Graph images (`/og/*`) | Generated at build time with `next/og` from page titles | Project team | Project-owned | Original (`lib/seo/og-image.tsx`) |
| Homepage goods-journey illustration | Inline SVG engraving-style drawing: freight train with one wagon per sector group, tank farm and steelworks, container ship at a ship-to-shore crane, water reflection, data lines into the hero snapshot | Project team | Project-owned | Original (`components/hero/GoodsJourney.tsx`); subject inspired by a competitor hero, no asset, layout or style reused |

## Checklist before launch

- [x] No third-party image files in `public/`.
- [x] Hero, product preview and texture visuals are CSS or inline SVG.
- [ ] Final photography or art direction supplied by the project owner (pending, see `docs/PROGRESS.md`).
- [ ] Any image added later is listed above with author, licence and source.

## Fonts (self-hosted)

| Font | Files | Licence |
|---|---|---|
| Archivo (variable weight, Latin subset, from @fontsource-variable/archivo 5.3.0) | `styles/fonts/archivo/` | SIL Open Font Licence 1.1 (`OFL.txt` alongside) |
| Atkinson Hyperlegible Next (variable, Latin subset, from @fontsource-variable/atkinson-hyperlegible-next 5.3.0) | `styles/fonts/atkinson-hyperlegible-next/` | SIL Open Font Licence 1.1 (`OFL.txt` alongside) |
| Atkinson Hyperlegible Mono (variable, Latin subset, from @fontsource-variable/atkinson-hyperlegible-mono 5.3.0) | `styles/fonts/atkinson-hyperlegible-mono/` | SIL Open Font Licence 1.1 (`OFL.txt` alongside) |

Icons come from the `lucide-react` package (ISC licence).
