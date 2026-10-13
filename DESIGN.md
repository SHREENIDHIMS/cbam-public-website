---
name: UK CBAM Public Website
description: Carbon copy. The site is laid out like the customs declaration it helps produce.
colors:
  canvas: "#F0F4F9"
  surface: "#FAFCFE"
  surface-alt: "#E3E8F0"
  surface-inverse: "#3A1734"
  ink: "#231521"
  ink-muted: "#554857"
  ink-subtle: "#706472"
  line: "#CDD1DB"
  line-strong: "#818693"
  primary: "#5E2154"
  primary-hover: "#4A1541"
  primary-tint: "#F6E5F2"
  on-primary: "#FAFCFE"
  secondary: "#405D7B"
  inverse-ink-muted: "#EBCDE3"
  inverse-line: "#6B2B60"
  positive-fg: "#2B6246"
  positive-bg: "#EDF5F0"
  watch-fg: "#6E4C08"
  watch-bg: "#FDF6E7"
  critical-fg: "#872B26"
  critical-bg: "#FBEFEE"
  info-fg: "#3C586E"
  info-bg: "#EEF2F6"
  neutral-fg: "#554857"
  neutral-bg: "#E3E8F0"
typography:
  display:
    fontFamily: "Archivo, 'Arial Narrow', Arial, sans-serif"
    fontSize: "clamp(2.625rem, 1.5rem + 4.1vw, 5rem)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.022em"
  headline:
    fontFamily: "Archivo, 'Arial Narrow', Arial, sans-serif"
    fontSize: "clamp(2rem, 1.25rem + 2.6vw, 3.5rem)"
    fontWeight: 750
    lineHeight: 1.02
    letterSpacing: "-0.016em"
  title:
    fontFamily: "Archivo, 'Arial Narrow', Arial, sans-serif"
    fontSize: "clamp(1.25rem, 1.08rem + 0.7vw, 1.625rem)"
    fontWeight: 680
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "'Atkinson Hyperlegible Next', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "'Atkinson Hyperlegible Next', 'Segoe UI', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  caption:
    fontFamily: "'Atkinson Hyperlegible Next', 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, 'Arial Narrow', Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "0.08em"
  figure:
    fontFamily: "'Atkinson Hyperlegible Mono', Consolas, ui-monospace, monospace"
    fontSize: "1em"
    letterSpacing: "-0.01em"
    fontFeature: "'tnum', 'zero'"
  figure-lg:
    fontFamily: "Archivo, 'Arial Narrow', Arial, sans-serif"
    fontSize: "clamp(1.75rem, 1.4rem + 1.4vw, 2.5rem)"
    fontWeight: 750
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "'tnum'"
rounded:
  xs: "2px"
  sm: "3px"
  md: "6px"
spacing:
  gutter-mobile: "20px"
  gutter-desktop: "40px"
  box-head: "10px 16px"
  box-body: "16px"
  box-body-desktop: "20px 24px"
  section-gap: "clamp(4.5rem, 3rem + 7vw, 9rem)"
  section-gap-compact: "calc(clamp(4.5rem, 3rem + 7vw, 9rem) / 2)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "8px 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-primary-lg:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
    height: "52px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 18px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
  box:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  box-head:
    textColor: "{colors.ink-subtle}"
    typography: "{typography.label}"
    padding: "10px 16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "48px"
  choice-card-selected:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.ink}"
  stamp:
    backgroundColor: "transparent"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
    padding: "3px 8px"
  tag:
    rounded: "{rounded.xs}"
    padding: "4px 8px"
  link:
    textColor: "{colors.primary}"
  link-hover:
    textColor: "{colors.primary-hover}"
---

# Design System: UK CBAM Public Website

## Overview

**Creative North Star: "Carbon Copy"**

The site is laid out like the artefact it helps an importer produce: a customs declaration. Content sits in labelled boxes on cool zinc-white paper, lists are ruled ledgers closed by a heavy ink rule, figures run in a mono column with tabular digits, and the provenance of every value is marked with a double-ruled ink stamp. Aubergine stamp ink carries action and fills the dark sections and footer; everything else is paper, ink and hairlines.

Density is form-like rather than airy-marketing: boxes are tight (3px corners, 1px hairline borders, uppercase Archivo labels in a head strip), while chapters are separated by one generous vertical rhythm. Depth is printed, not floated: buttons sit off a hard offset underprint and press into register on hover. Motion is a quiet "settle" (opacity and a 1.5% scale, no vertical drift), plus a single stamp that lands once on the hero sample.

The world deliberately rejects the category default it replaced: gradient heroes, icon-card grids ("heading plus three cards"), rounded dashboard islands, pill badges, dashed eyebrows above every heading, ghost numerals and grid textures.

**Key Characteristics:**
- Zinc-white paper ground with aubergine stamp ink as the single action colour.
- Labelled boxes (3px radius, hairline border, uppercase label head) as the primary container.
- Ledgers: 2px ink top rule, hairlines between rows.
- Archivo display and labels, Atkinson Hyperlegible Next body, Atkinson Hyperlegible Mono for figures only.
- Buttons with a hard offset underprint that press in on hover.
- Dark sections re-point role colours via a tone attribute; components never change.

## Colors

A cool, near-neutral paper-and-ink palette with one saturated ink (aubergine) and a status set that only appears in tags and stamps.

### Primary
- **Stamp-Ink Aubergine** (primary): every primary button, text link, selected choice border, brand glyph, and the "Sample" stamp. Its darker sibling **Pressed Aubergine** (primary-hover) is the hover state of buttons and links; **Aubergine Wash** (primary-tint) is the selected-choice fill, secondary-button hover and text selection.
- **Deep Aubergine Ground** (surface-inverse): the dark sections and the footer. It is the same ink family as the action colour, so a dark chapter reads as a page printed in the stamp colour rather than a black slab.

### Secondary
- **Galvanised Steel** (secondary): a restrained supporting hue for data encoding (for example the "requested" bar in the supplier preview). It is never a second action colour.

### Neutral
- **Zinc-White Paper** (canvas): the page ground.
- **Clean Sheet** (surface): box, input and panel fill, one step lighter than the paper.
- **Pale Zinc Band** (surface-alt): alternate chapter bands and banded ledger rows.
- **Aubergine-Black Ink** (ink): headings and body text; also the focus ring and the 2px ledger rule.
- **Faded Ink** (ink-muted): lead paragraphs, secondary copy, nav links at rest.
- **Pencil Grey-Plum** (ink-subtle): box labels, field descriptions, placeholders.
- **Hairline Zinc** (line): every 1px box border, box-head divider and ledger row separator.
- **Control Zinc** (line-strong): form-control borders (meets 3:1 non-text contrast).

### Status pairs
Positive (green), watch (amber), critical (red), info (steel) and neutral (zinc) each pair a dark foreground with a pale wash of the same hue. They appear only in tags, stamps and alerts, and always with an icon and a text label.

### Named Rules
**The Tone Re-point Rule.** Dark sections are made with `data-tone="inverse"`, which re-points the role variables (ink becomes the light zinc, muted ink the pale plum, lines the mid plum, primary a light plum chip with dark text, focus the light zinc). A paper box inside a dark section restores light roles with `data-tone="paper"`. Never darken a section by hand-picking light text colours or opacity utilities.

**The One Ink Rule.** Aubergine is the only colour that means "act". Status colours describe results; steel encodes data. Neither is ever used for a call to action.

**The Paired Contrast Rule.** Every foreground/background pairing in use is listed in the token file's contrast pairs and tested (text 4.5:1, control borders and focus 3:1). A new pairing is added to that list before it ships.

## Typography

**Display Font:** Archivo variable, weight axis (with Arial Narrow, Arial)
**Body Font:** Atkinson Hyperlegible Next variable (with Segoe UI, system-ui)
**Label/Mono Font:** Archivo for labels; Atkinson Hyperlegible Mono variable for figures (with Consolas, ui-monospace)

**Character:** A sturdy grotesque set heavy and tight for headings, against a legibility-first body face; the mono gives every money, mass, date and commodity-code value the look of a figure typed into a form.

### Hierarchy
- **Display** (800, clamp 42px to 80px, 0.96): the home headline and the closing call to action only.
- **Headline / Chapter** (750, clamp 32px to 56px, 1.02): every section heading and every interior page title.
- **Title** (680, clamp 20px to 26px, 1.15): box titles, card titles, result headlines.
- **Lead** (400, clamp 17px to 20px, 1.5, max 60ch, ink-muted): the paragraph under a chapter heading.
- **Body** (400, 16px, 1.55, max 64ch with pretty wrapping): running copy.
- **Caption** (400, 13px): meta lines, footer snapshot data, small notes inside boxes.
- **Label** (650, 12px, 0.08em tracking, uppercase): box heads, table heads, field-group names, footer column heads.
- **Figure** (mono, tabular and slashed-zero numerals, -0.01em): money, mass, dates, codes, counts inline.
- **Figure-lg** (Archivo 750, clamp 28px to 40px, tabular, 1): the single large value inside a box (liability, threshold value).

Display, chapter and title use balanced wrapping and a slight positive word-spacing (0.03 to 0.04em) to open the tight Archivo setting.

### Named Rules
**The Four Tiers Rule.** A heading takes one of the tier classes (display, chapter, title, label) and never sets its own size.

**The Label Names Content Rule.** A label names the content of a box or column. It never sits above a heading as an eyebrow.

**The Figures Are Typed Rule.** Any quantity a user could copy onto a declaration (money, tonnes, dates, CN codes) is set in the mono figure face with tabular numerals. Prose numbers are not.

## Layout

A single centred column: content container 1240px (77.5rem) with 20px gutters on mobile and 40px from 768px; evidence sections with wide ledgers or tables may widen to 1440px (90rem). The sticky header is 64px tall on the canvas ground and gains a hairline bottom border once the page scrolls.

Every chapter uses one vertical rhythm, `--section-gap` (clamp 72px to 144px) top and bottom, or half of it for compact sections. Chapters alternate between canvas and the pale zinc band; dark aubergine sections are reserved for a single emphasis chapter and the footer.

Inside a chapter, composition is asymmetric on a 12-column grid at desktop (for example a 5/7 split of explanation beside a boxed artefact) and collapses to one column on mobile. Fact strips are one box divided into 1, 2 or 4 cells by hairlines rather than separate cards. Box padding steps up at 768px (16px to 20px by 24px).

## Elevation & Depth

Depth is printed, not lit. The system is flat at rest except for a hard, offset "underprint" behind buttons, and two soft shadows used sparingly on tool panels.

### Shadow Vocabulary
- **Underprint** (`box-shadow: 3px 3px 0 0` ink at 30% via color-mix; secondary buttons use the hairline colour): every primary and secondary button at rest. On hover the button translates 2px and the offset shrinks to 1px; on active it translates 3px and the offset reaches 0.
- **Panel lift** (`0 1px 2px rgb(35 21 33 / 0.06)`): tool input panels, result boxes, filter boxes, an open workings disclosure.
- **Hover lift** (`0 10px 30px -18px rgb(35 21 33 / 0.35)`): the hover/focus-within state of a whole-box guide link, and the liability preview tool frame.

### Named Rules
**The Press-Into-Register Rule.** Interactive press feedback is a translation toward the underprint, never a raised lift or a glow. Ghost buttons and text links have no underprint; their hover thickens the underline from 1px to 2px.

## Shapes

Small, sharp corners throughout, so the page reads as a form rather than an app: 2px for stamps, tags, box numbers and checkboxes; 3px for boxes and buttons; 6px for text inputs and the expandable workings rows. Circles appear only on radio indicators.

Borders do the structural work: 1px hairline for boxes and row separators, 2px ink for the heading rule of a ledger and the strong rule, 1.5px currentColor plus a 1px outline offset 1.5px for the double-ruled stamp. The one tilted element is the "Sample" stamp (rotated -4deg) on an illustrative preview or the 404 stamp.

## Components

### Buttons
Archivo, weight 650, slight word-spacing, firm and print-like.
- **Shape:** 3px corners, 1.5px border.
- **Primary:** aubergine fill, clean-sheet text, underprint at rest. Medium is 44px min height with 8px by 18px padding at 16px; large is 52px with 12px by 24px at 17px.
- **Hover / Active / Focus:** fill deepens to pressed aubergine and the button presses 2px (3px when active) into its underprint over 160ms on the shared curve. Focus is the global 2px ink outline at 3px offset.
- **Secondary:** transparent with a 1.5px ink border and a hairline-coloured underprint; hover fills with aubergine wash.
- **Ghost:** aubergine underlined text, no border or underprint; hover thickens the underline.
- **Disabled:** 55% opacity, no underprint, no movement.
- **Inside a dark section:** the same primary class renders as a light plum chip with dark aubergine text by the tone re-point.

### Stamps and Tags
- **Stamp:** provenance marker. Archivo 11px, 700, uppercase, 0.08em tracking, 1.5px currentColor border plus a 1px outline offset 1.5px (a double rule), 2px corners, in the status tone's ink on its wash. One stamp per artefact may tilt -4deg; on the hero it lands once with a short press from 1.4x scale.
- **Tag:** flat status label for tables and result headers. 14px, 600, 4px by 8px, 2px corners, tone wash fill. Always icon plus text, never colour alone.

### Cards / Containers (Boxes)
- **Corner Style:** 3px.
- **Background:** clean sheet on the paper ground.
- **Shadow Strategy:** flat; panel lift only for tool panels (see Elevation).
- **Border:** 1px hairline.
- **Head strip:** uppercase label in pencil grey-plum, 10px by 16px (24px inline at desktop), hairline below, optional right-aligned stamp or meta.
- **Internal Padding:** 16px, 20px by 24px from 768px.
- **Box number:** a 24px mono numeral in a 1px currentColor square with 2px corners, used only for a real sequence (wizard steps, process stages, calculation lines).

### Ledgers
Ruled lists and tables: a 2px ink rule on top, hairlines between rows and a hairline to close. Even rows may be banded with the pale zinc at 60%. Ledgers replace card grids for any list of parallel items.

### Inputs / Fields
- **Style:** 48px tall, 6px corners, 1px control-zinc border, clean-sheet fill, 12px inline padding, pencil grey-plum placeholder. Labels sit above in semibold ink with an optional small subtle description.
- **Hover / Focus:** border darkens to ink on hover; focus is the global 2px ink outline.
- **Choice cards:** bordered options in control zinc; selected gains an aubergine border, aubergine wash fill and a 1px inset aubergine ring, with a filled aubergine checkbox (2px corners) or radio.
- **Error:** inline field error under the control plus an error summary at the top of the form.

### Navigation
Sticky 64px header on the paper ground. Links are 15px Atkinson in faded ink with 10px by 8px padding and 2px corners; hover turns them ink with a 1px underline offset 0.35em. The primary call to action is a medium primary button at the right. Below 1024px the links collapse into a drawer. The footer is a dark aubergine section: brand mark, uppercase label column heads over a hairline, 15px muted links, and a rules-snapshot line in mono caption.

### Brand Mark
A double-ruled declaration box glyph with two ledger lines and a filled cell, drawn in currentColor (aubergine in the header, light ink in the footer) beside the wordmark. The favicon and Open Graph images reuse it.

## Do's and Don'ts

### Do:
- **Do** put content in labelled boxes (3px, hairline, uppercase label head) and lists in ledgers (2px ink top rule, hairline rows).
- **Do** set every money, mass, date and code value in the mono figure face with tabular numerals.
- **Do** make dark sections with the inverse tone attribute and let the role variables flip; use the paper tone for a light box inside them.
- **Do** keep aubergine as the only action colour, and show status with icon, text and tone together.
- **Do** use one curve (`cubic-bezier(0.2, 0.7, 0.1, 1)`) and the three durations (160ms state, 320ms stamp, 560ms reveal); honour reduced motion.
- **Do** use the one shared section gap for every chapter.

### Don't:
- **Don't** place an eyebrow label above a heading; labels name box and column content only.
- **Don't** build "heading plus three icon cards" grids; use a ledger or a single divided box.
- **Don't** use pill badges or 12px-plus rounded cards; corners stop at 6px (radio indicators excepted).
- **Don't** use gradient heroes, grid textures, ghost numerals or decorative italic display phrases.
- **Don't** lift buttons with soft shadows or glows; they press into their underprint.
- **Don't** tilt more than one stamp per artefact, and reserve the tilt for "Sample" or the 404 stamp.
- **Don't** use vertical slide-in entry motion; reveals settle in place.
- **Don't** set a heading's size directly; pick a type tier.
