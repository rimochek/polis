---
name: Polis
description: A calm evidence desk for broker review and comparison.
colors:
  primary: '#246354'
  primary-hover: '#194c40'
  charcoal-green: '#182a2b'
  lime: '#d6edbd'
  ink: '#253635'
  muted: '#687771'
  canvas: '#f7f9f8'
  paper: '#ffffff'
  dialog-paper: '#fcfdfa'
  divider: '#e1e7e3'
  evidence-text: '#5c6a60'
  source-text: '#5b6a60'
  match: '#6d9672'
  mismatch: '#b39550'
  unknown: '#8e9b8b'
  mismatch-surface: '#fffcf5'
  unknown-surface: '#f7f8f5'
  finding-mismatch: '#7e5e24'
  finding-unknown: '#586545'
  focus: '#559885'
typography:
  display:
    fontFamily: "'Golos Text Variable', sans-serif"
    fontSize: '30px'
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: '-1px'
  headline:
    fontFamily: "'Golos Text Variable', sans-serif"
    fontSize: '19px'
    fontWeight: 550
    letterSpacing: '-0.4px'
  title:
    fontFamily: "'Golos Text Variable', sans-serif"
    fontSize: '16px'
    fontWeight: 550
  body:
    fontFamily: "'Golos Text Variable', sans-serif"
    fontSize: '15px'
  evidence:
    fontFamily: "'Golos Text Variable', sans-serif"
    fontSize: '13px'
    fontWeight: 400
    lineHeight: 1.65
  condition:
    fontFamily: "'Golos Text Variable', sans-serif"
    fontSize: '14px'
    fontWeight: 500
    lineHeight: 1.55
  label:
    fontFamily: "'Golos Text Variable', sans-serif"
    fontSize: '13px'
    fontWeight: 500
    lineHeight: 1.4
  premium:
    fontFamily: "'Golos Text Variable', sans-serif"
    fontSize: '27px'
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: '-0.9px'
rounded:
  chip: '5px'
  field: '7px'
  control: '8px'
  container: '10px'
  table: '11px'
  dialog: '14px'
spacing:
  compact: '8px'
  small: '12px'
  medium: '20px'
  large: '28px'
  page: '40px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.paper}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '10px 14px'
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
  button-secondary:
    backgroundColor: '{colors.paper}'
    textColor: '#3e5148'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '10px 14px'
  button-text:
    textColor: '{colors.primary}'
    padding: '7px 0'
  input:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.field}'
    padding: '11px 12px'
  navigation:
    backgroundColor: '{colors.charcoal-green}'
    textColor: '#ccd8d1'
    rounded: '{rounded.field}'
    padding: '12px 13px'
  chip:
    backgroundColor: '#f3f6f4'
    textColor: '{colors.ink}'
    rounded: '{rounded.chip}'
    padding: '4px 8px'
  requirements:
    backgroundColor: '{colors.paper}'
    rounded: '{rounded.container}'
    padding: '18px 20px'
  condition:
    textColor: '{colors.ink}'
    typography: '{typography.condition}'
    padding: '17px 18px 13px'
---

# Design System: Polis

## Overview

**Creative North Star: "The Broker's Evidence Desk"**

Polis is a calm, precise evidence desk for Russian-language broker work. White document surfaces, dark charcoal-green navigation and restrained teal actions make dense insurance conditions readable. Golos Text carries both the interface and financial figures, with tabular numerals reserved for premiums.

The visual direction adapts the local awesome-design-md Airtable community marketing analysis for an operational table workspace. It is a community reference, not an official Airtable design system. The implementation uses flat surfaces and fine dividers; depth is reserved for temporary dialogs and source review.

**Key Characteristics:**

- Readable evidence, notes and source references within a compact comparison.
- White surfaces, charcoal-green navigation, teal actions and a lime brand accent.
- Condition status expressed through icons, text and subtle background tints.
- Responsive review with one selected insurer at a time on mobile.

This is an extracted implementation record. Token primitives above come from `src/styles.css`, including its final override block; behaviors come from `src/App.tsx`. Product purpose lives in `docs/product.md`, and first-surface composition lives in `.impeccable/surface.md`.

## Colors

The palette combines cool white paper with green charcoal, restrained teal and softly tinted evidence states.

### Primary

- **Document Teal** (`primary`): primary actions, text actions and active tab underline. **Deep Document Teal** (`primary-hover`) darkens active button hover.
- **Charcoal Green** (`charcoal-green`): persistent navigation and the mobile navigation interior.

### Secondary

- **Soft Lime** (`lime`): the brand glyph, brand punctuation, active navigation icon and text selection.

### Neutral

- **Green Ink** (`ink`): primary interface text.
- **Quiet Sage** (`muted`): supporting prose.
- **Cool Canvas**, **White Paper** and **Dialog Paper** (`canvas`, `paper`, `dialog-paper`): workspace backdrop, document surfaces and temporary panels.
- **Fine Divider** (`divider`): structural borders.
- **Evidence Sage** and **Source Sage** (`evidence-text`, `source-text`): readable cell explanations and citation references.

### Semantic States

- **Match Green**, **Difference Amber** and **Uncertain Sage** (`match`, `mismatch`, `unknown`): condition icons, supported by explicit meaning in text and the legend.
- **Warm Difference Paper** and **Uncertain Paper** (`mismatch-surface`, `unknown-surface`): quiet cell background emphasis.
- **Focus Sage** (`focus`): visible keyboard outline.

**The Evidence Rule.** Condition color always accompanies an icon and an explicit status meaning.

## Typography

**Display Font:** Golos Text Variable, with sans-serif fallback.  
**Body Font:** Golos Text Variable, with sans-serif fallback.  
**Label/Mono Font:** The same family; premiums use tabular numerals.

**Character:** A contemporary Cyrillic sans with restrained weight differences. The hierarchy favors content legibility over decorative display treatment.

### Hierarchy

- **Display:** `display` is the case or list heading. It reduces to 27px at the compact desktop breakpoint and 26px on mobile.
- **Headline:** `headline` names sections; comparison headlines reduce to 17px on mobile.
- **Title:** `title` names smaller sections. Dialog titles use 23px, weight 550 and line-height 1.4; mobile dialog titles use 22px.
- **Body:** `body` supplies the inherited root size. Most interface text has an explicit contextual size.
- **Evidence:** `condition` is the comparison value; `evidence` is its explanatory note. Source references use 12px. On mobile these become 15px, 14px and 13px respectively.
- **Label:** `label` captures standard button typography. Tabs use 14px on desktop and 13px on mobile.
- **Premium:** `premium` highlights the price without changing family; it grows to 32px from 1600px and uses 30px on mobile.

**The Working Text Rule.** Evidence notes and source references remain readable working content, including on mobile.

## Layout

The desktop shell uses a sticky navigation column (232px) and flexible content. The white topbar is 73px high. The main container stops at 1530px with 40px side gutters, 32px top padding and 20px bottom padding. Sections use compact control gaps and more generous separation between groups.

At 1200px and below the sidebar narrows to 205px, side gutters become 25px and heading actions stack. At 800px and below the sidebar becomes a navigation dialog, the topbar is 61px high and content uses 20px side gutters. Page headings stack and form layouts become one column.

Desktop comparison is a fixed-layout table with a parameter column (21%) and insurer columns; its 900px minimum width can scroll horizontally. From 1600px that minimum is 960px. The final mobile rule removes the minimum width: a labeled native insurer selector controls one visible offer column, with parameter labels above each condition. This selector is part of the working review flow and must stay obvious.

Desktop conditions have a minimum height of 136px and wrap long content. Mobile cells grow naturally with their content. Dialogs and drawers scroll internally within viewport height.

## Elevation & Depth

The workspace is flat at rest. Fine borders and subtle background changes separate rows, requirements and content groups. A dark translucent overlay separates temporary tasks from the underlying workspace; shadows establish dialogs and the source drawer as temporary layers.

### Shadow Vocabulary

- **Dialog lift:** `0 16px 60px #152c2926`, supplied by the existing shadow variable.
- **Source drawer lift:** `-8px 0 55px #152c2924`, cast toward the comparison.
- **Overlay:** `#1526226b`, with a brief fade (180ms, ease).

**The Temporary Depth Rule.** Use shadows for dialogs and source review; resting workspace surfaces rely on borders and tone.

## Shapes

Controls use gently curved corners through the frontmatter radius scale. Fields are slightly tighter than buttons; small badges are tighter again. Containers and the table use broader rounding, and dialogs use the widest radius. The right-edge source drawer stays flush with the viewport.

Thin solid borders supply structure. The upload area uses a dashed outline to signal a drop target. Round status dots, the circular avatar and small square insurer initials provide compact recognition without raster imagery.

## Components

### Buttons

Precise, restrained controls with readable labels. Primary buttons use Document Teal and white text; secondary buttons use white, a thin border and green ink. Standard buttons have a 40px minimum height; small buttons have a 34px minimum height. Text actions remove the container and retain teal emphasis.

Hover transitions animate background, text and border color (150ms, ease). Keyboard focus uses a 3px outline with 3px offset. Disabled buttons reduce opacity to 0.45 and show the unavailable cursor. There is no separate pressed transform.

### Chips

Compact status labels use a fine border and the chip radius. The demo badge uses a subdued yellow-green tint; it is an informational label. The discrepancy filter is an interactive button with a count and selected green tint, and exposes its pressed state.

### Cards / Containers

White, bordered surfaces stay flat. The requirements container uses the established container radius and groups its icon, summary and edit action in one row. The comparison enclosure uses the table radius, contains the scrolling area and maintains dividers between conditions.

### Inputs / Fields

White fields use a thin sage border, the field radius and comfortable padding from the token table. Labels remain above the input. Textareas resize vertically. Inputs use the same visible keyboard ring with a tighter 2px offset; dialog inputs increase to 16px on mobile. Error messages appear in a tinted alert with an icon and explanatory text.

### Navigation

Charcoal-green sidebar with compact icon-and-label rows. Hover lightens the row; the selected row has a stronger green fill and pale text with a lime icon. Recent cases use quiet dots and truncated names. At the mobile breakpoint a menu button opens the same navigation inside a dialog. Case tabs use a teal underline and counts when relevant.

### Evidence Cell and Source Drawer

Each condition combines a status icon, value, explanatory note and source reference. Clicking the full cell opens the source drawer, containing a finding, quoted evidence, page link, PDF preview and editable review fields. The lazily loaded preview in `src/PdfPreview.tsx` renders PDF.js canvas pages with physical page navigation and a zoom toggle. Missing evidence receives explicit copy. Reviewed conditions keep their status semantics and gain a checkmark. Drawer findings use the deeper `finding-mismatch` and `finding-unknown` text colors on their existing softly tinted backgrounds.

The drawer is at most 570px wide and becomes the viewport width on smaller screens. It slides in over 230ms using `cubic-bezier(.2,.8,.2,1)`. Its heading and action footer frame a scrolling review area. All animations and transitions are disabled when reduced motion is requested.

### Mobile Offer Selector

A visible label and full-width native select identify the displayed insurer. The control uses the button radius, a fine border and 15px text. It changes the displayed offer while preserving the familiar parameter, value, note and citation structure.

## Do's and Don'ts

### Do:

- **Do** keep values, explanatory notes and source references visible together.
- **Do** pair status color with its icon and written meaning.
- **Do** use tabular numerals for premiums.
- **Do** preserve the labeled insurer selector on mobile.
- **Do** keep visible keyboard focus and respect reduced motion.

### Don't:

- **Don't** use the lime brand accent as a substitute for condition status.
- **Don't** remove discrepancy or unknown indicators when an item is marked reviewed.
- **Don't** reduce evidence to decorative microcopy.
- **Don't** describe the community Airtable reference as an official design system.
