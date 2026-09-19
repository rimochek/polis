---
name: Polis public landing
description: A public introduction and working synthetic comparison in the existing Polis identity.
colors:
  primary: '#246354'
  primary-hover: '#194c40'
  ink: '#182a2b'
  lime: '#d6edbd'
  muted: '#5c6a60'
  paper: '#ffffff'
  divider: '#dce4dd'
typography:
  display:
    fontFamily: "'Golos Text Variable', sans-serif"
    fontSize: 'clamp(52px,4.85vw,72px)'
    fontWeight: 500
    lineHeight: 1.07
    letterSpacing: '-0.04em'
  headline:
    fontFamily: "'Golos Text Variable', sans-serif"
    fontSize: '45px'
    fontWeight: 450
    lineHeight: 1.15
    letterSpacing: '-0.035em'
  body:
    fontFamily: "'Golos Text Variable', sans-serif"
    fontSize: '16px'
    fontWeight: 400
  label:
    fontFamily: "'Golos Text Variable', sans-serif"
    fontSize: '14px'
    fontWeight: 500
    lineHeight: 1.4
rounded:
  control: '7px'
  comparison: '12px'
  stage: '18px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.paper}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '16px 24px'
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
---

# Design System: Polis public landing

## Overview

**Creative North Star: "The Broker's Evidence Desk"**

This surface extends the identity recorded in `docs/design/workspace.md`. Golos Text, forest ink, teal actions, soft lime and readable document surfaces carry into a more spacious public introduction. The workspace design document and `.impeccable/design.json` remain the authority for the operational workspace; this file records landing-specific implementation in `landing/src/main.tsx` and `landing/src/style.css`.

The composition is code-led and inherited from the established identity. The local Airtable community design reference informed restrained editorial composition; it is not an official Airtable specification. No screenshot comp was approved, and no new visual identity or user-selected comp is claimed. Page strategy is recorded in `../.impeccable/landing-surface.md`.

## Colors

Document Teal drives primary actions and highlighted headline text; Forest Ink anchors headings and the wordmark. Soft Lime marks the brand and broad, pale green product stages. White paper and fine green dividers keep comparisons distinct. Quiet Sage supports explanatory copy.

Status colors retain the existing semantic vocabulary: green for a match, amber for a difference and sage for an unknown condition. Status icons, accessible labels and explicit findings accompany color. Marking an item reviewed preserves its underlying condition status.

## Typography

Golos Text Variable is bundled through Fontsource and used throughout, with a sans-serif fallback. The larger display hierarchy introduces the product; full-demo values, notes and citations retain the working interface's restrained hierarchy. Comparison figures use tabular numerals.

The display token describes the base hero. It becomes 74px above 1500px, 56px at 1180px and below, and 64px in the single-column tablet composition. At 700px and below it uses `clamp(38px,9.6vw,60px)` with 1.12 line-height. Most mobile section headings are 32–34px. Body prose is generally 14–17px with generous 1.75–1.85 line-height. Mobile form controls use 16px text.

## Layout

The desktop container caps at 1280px with 56px side gutters. Gutters reduce to 36px at 1180px and 20px at 700px. The header is 80px high on desktop and 70px on mobile. The desktop hero pairs left-aligned copy with a working comparison; at 960px it becomes one column with centered copy, then returns to left alignment on mobile. Workflow, evidence, editorial image and FAQ sections stack at 700px. Desktop sections generally use 88–110px vertical spacing, reduced to approximately 55–65px on mobile.

Both comparison sizes show three insurers on desktop. At 700px and below a labeled native selector displays one insurer alongside the condition column; this final rule supersedes the earlier compact-table scrolling treatment. The selector starts on the second offer, making the deductible discrepancy discoverable. Source review occupies a right-edge drawer up to 520px wide, with internal scrolling and full viewport width where necessary.

## Elevation & Depth

White surfaces, pale green stages and fine dividers provide most separation. The miniature comparison uses a subtle paper lift (`0 12px 32px #2443290b`), while the full comparison stays flat. The source drawer casts a directional shadow (`-15px 0 50px #132a2721`) over a translucent overlay. Primary button hover has a small lift.

The hero sheet enters once over 850ms, action arrows shift on hover, and the drawer enters over 350ms. There is no autoplay interaction. Reduced-motion preferences disable animations, transitions and smooth scrolling.

## Shapes

Controls have gently rounded corners; the comparison and broad inset stages use progressively wider rounding from the frontmatter. The editorial image has a 14px radius. Fine borders separate conditions and FAQ rows. The rounded lime brand glyph and oversized closing wordmark reuse Polis's existing identity.

## Components

The hero miniature is a real React comparison, not a screenshot: each condition opens its finding, synthetic source quote and PDF page link. The `/demo` route expands the same component to all 24 conditions, a discrepancy filter, individual review marks, offer-level review confirmations, a recommendation selector and a client comment. Export is enabled only after all conditions are marked reviewed. Its downloadable HTML retains status meanings, source evidence and the synthetic-demo disclosure; it can be printed to PDF. Review state and comments live only in the current page session.

Desktop navigation uses inline links; mobile navigation uses an explicit toggle with expanded state. FAQ entries use native disclosure elements. The Radix source dialog supplies modal focus management, a named close action and a confirmation action. All interactive elements retain a visible keyboard outline; the page includes a skip link.

The editorial asset at `public/images/broker-desk.webp` is an AI-generated editorial photograph of a broker's desk, delivered as WebP and lazy-loaded with descriptive alt text. Built-in Imagegen produced the PNG source, which was optimized to WebP with PIL. The exact generation prompt is preserved in `../.impeccable/landing-image-prompt.txt` and `public/images/broker-desk.webp.json`; the metadata records creation on 2026-09-11. It supports the story of human review and is not documentary evidence, a real office or customer photograph, or an approved interface comp.

## Do's and Don'ts

- **Do** preserve the inherited Polis palette, Cyrillic typography and explicit evidence semantics.
- **Do** keep the miniature interactive and the mobile insurer selector visible.
- **Do** distinguish generated editorial imagery from synthetic source documents and working UI.
- **Do** keep unknown conditions and discrepancies visible after review and in exports.
- **Don't** turn this public surface into a claim of live AI analysis or document upload: its data and PDFs are bundled synthetic examples.
- **Don't** replace root workspace design tokens with the landing's larger display and spacing choices.
