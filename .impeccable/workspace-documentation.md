# Workspace extension: implementation record

Recorded 2026-09-19. This is a surface-specific supplement to `DESIGN.md` and `.impeccable/design.json`, not a replacement identity or a new token source. Both incumbent files are preserved. The working direction is `.impeccable/workspace-surface.md`; product context remains in `PRODUCT.md`, and operational capabilities and limits are documented in `README.md`.

## Retained design

The Broker's Evidence Desk remains the visual world: Golos Text, charcoal-green navigation, white document surfaces, cool canvas, restrained Document Teal actions, and the lime brand accent. The base palette and typography continue to come from `src/styles.css`; the extension reuses the existing ink, teal, divider, buttons, fields, icons, status semantics and source-review components.

The inherited type hierarchy remains the case heading (30px), section heading (19px), smaller title (16px) and body base (15px), with the existing responsive adjustments. Evidence values, notes and source references remain adjacent. The Evidence Rule, Working Text Rule and Temporary Depth Rule still apply: color accompanies meaning, evidence remains readable, and resting surfaces use borders and tone rather than shadow.

Source verification still opens the PDF review drawer. The comparison retains the mobile insurer selector and its status, evidence and review structure. Human review remains distinct from answering a clarification. Existing mismatch and unknown indicators are not removed by either action.

## Local layout and component additions

- The main application at `/` now offers cases, clients and a workspace assistant in navigation. Each case has six tabs: overview, documents, comparison, clarifications, report and history. Tabs can scroll horizontally on narrow screens.
- The case assistant reserves `clamp(360px, 28vw, 440px)` at the right edge on desktop. It is fixed to the full viewport height, with its own scrolling log and a composer anchored below the log. The main workspace reserves its width, so the panel does not cover the comparison. A scope strip identifies the current case; citation buttons open original PDFs; draft saving is an explicit action.
- Assistant conversation text uses 14px with a 1.8 line height; the title uses the existing 16px/550 role. Sage surfaces distinguish user messages and context. These local shades, 6px/9px/12px corner variations and compact 11–12px utility text are implementation details, not additions to the normative token scales.
- With the assistant visible, desktop content uses 28px side padding and the comparison can scroll at an 850px minimum width. From 1300px the minimum is removed and three offers fit beside the assistant, with narrower cell padding and 24px premiums. These are local density adjustments to the existing comparison.
- At 900px and below the case assistant uses a full-screen Radix dialog and does not reserve horizontal space. Initial mobile load keeps it closed. It provides close/Escape behavior and modal keyboard containment; the composer becomes 16px on mobile. This assistant breakpoint coexists with the incumbent 800px navigation/comparison breakpoint rather than redefining it.
- Source review opened from the mobile assistant layers above it: the existing overlay uses z-index 70 and dialog/source drawer 71, above the assistant's 61. Closing the source returns to the assistant; closing the assistant returns to the case. These stacking values solve nested modal visibility and do not change the identity or depth vocabulary.
- The workspace assistant uses the same conversation components in an inline, bounded panel. It receives directory context and offers case links. It is not the fixed case panel.
- Overview next-step guidance, grouped client sections, clarification rows, activity rows and the report preview use the established flat surfaces and dividers. Client groups become one column at 1000px. Owner/deadline fields and attachment controls wrap at compact widths.

The sidecar's existing component gallery and 800px/1200px/1600px breakpoints still describe the incumbent surface. It does not enumerate these local assistant/layout additions. No sidecar regeneration was needed for this extension.

## Implemented behavior and limits

The local API persists owner, deadline, clarification status, saved drafts, activity and case conversations under ignored `data/`; the workspace conversation has a separate persisted file. Existing cases remain compatible, and missing historical activity is explicitly shown rather than reconstructed. Activity retains the most recent 200 events per case; conversations retain 100 messages, with the last 12 used in a model request.

Clients are grouped by the exact client-name string already stored on case records. They are not independent CRM entities, a shared contact directory or user accounts.

Offer PDFs retain version history. Each of up to six supplemental PDFs currently has a single version and one role: requirements, policy, rules or correspondence. PDFs are limited to 1–40 pages and 12 MB each; current PDFs in one request have a combined 24 MB limit. Role changes invalidate analysis and review. Requirements-role documents supplement the written request; comparison evidence remains tied to the current insurer offer.

Case chat receives only that case's current insurer PDFs, supplemental documents, written requirements, saved comparison/context and recent messages. Old file versions are excluded from new requests. Workspace chat receives case metadata without PDFs. Citations are filtered to current, in-scope files and valid physical page bounds; this does not verify quotation accuracy. Old-revision replies are marked in the UI, and a case changed while a response is in flight rejects that response.

Demo replies are deterministic and visibly state that no model request occurred. Live chat calls the configured provider and surfaces failures without substituting a demo response. The attempted Google connection rejected the supplied token; successful live-model execution and model accuracy are not established. Mocked provider tests verify request scope and response handling, not live service success.

Drafts can be saved and edited, and clarification answers are recorded. Neither action sends an external message or marks coverage reviewed. Current-revision review of every condition gates final export. Exports retain open/answered clarification status and coverage uncertainty. The existing self-contained HTML download and browser Print/PDF flow remain. No insurance issuance, authentication, multi-user sharing or production CRM is implemented. `/concept.html` remains a separate transient prototype; the working workspace now exists at `/`.

## Evidence and verification

Source review covered `src/styles.css`, `src/workspace.css`, `src/App.tsx`, `src/Assistant.tsx`, `src/WorkspaceViews.tsx`, `server/chat.ts`, `server/workspace.ts`, the incumbent design files, direction record, README and PRODUCT context. Test definitions in `tests/analysis.test.ts`, `tests/chat.test.ts`, `tests/gemini.test.ts` and `tests/workspace.test.ts` were inspected.

The final implementation handoff reports 14 passing tests, a passing production build and passing main/mobile/source/error browser checks, including the flow in `artifacts/workspace-browser-check.cjs`. Persistence through restart, review invalidation, citation scope, role uploads, drafts and export gating are covered by the reported checks. The mobile source was verified as topmost with `elementFromPoint`, followed by closing back to the assistant and case; `workspace-mobile-source.png` records that final state. This documentation pass did not rerun these checks or independently inspect the added source screenshot.

Visual inspection of `.impeccable/review/workspace-overview.png`, `workspace-comparison.png`, `workspace-mobile.png` and `workspace-mobile-chat.png` confirms the retained palette and hierarchy, three desktop offer columns beside the assistant, the mobile closed state, and the full-screen mobile conversation with bottom composer. Screenshots are visual evidence, not evidence of a successful live model response.

## Drift not canonized or repaired

`PRODUCT.md` still says no API credentials were supplied. The supplied-token connection attempt makes that a pre-existing product-record mismatch; it is reported here and left unchanged within this documentation-only boundary. Existing tiny uppercase sidebar group labels and table labels remain visible in the incumbent interface; they are not promoted into new system rules. Local small assistant utility text and extra corner/color values are also recorded descriptively, not legitimized as a new global type or token scale. No design-system file or product file was rewritten.
