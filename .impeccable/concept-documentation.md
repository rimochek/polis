# Workspace concept documentation check

Reviewed 2026-09-19 by source inspection. This records the isolated `/concept.html` surface, an extension of the existing Polis world. It does not replace `DESIGN.md`, `.impeccable/design.json` or `PRODUCT.md` and does not establish new global tokens.

## Scope and behavior

`WORKSPACE-CONCEPT.md` describes the proposed product structure. Its final “Макет” section correctly bounds the implemented demonstration. Earlier sections on extraction, version invalidation, permissions, editable requirements and audit history describe intended product behavior, not completed capabilities of this route.

- `concept.html` loads only `src/concept/WorkspaceConcept.tsx`, which imports its own `concept.css`. The working application remains linked at `/`.
- Case records, per-case document metadata, per-context messages, review and clarification flags use React memory state. Reloading resets the demonstration; there is no local/session storage or persistence API in this entry point.
- Chat answers are predefined branches selected by the prompt and current context, with a short simulated delay. The workspace answer is a fixed sample, not a live cross-case search. No AI service is called, and chat does not silently revise comparison values or the review checkbox.
- File selection reads names only and creates placeholder metadata. Document roles can be changed locally. No file contents are read, uploaded, extracted or analyzed. Adding files or changing roles clears the demo review flag.
- The source dialog contains a fictional text fragment and calculation, not a PDF viewer. Only the populated shop case has prepared comparison data; other cases demonstrate empty states.
- A clarification draft can be added explicitly and copied to the clipboard. Nothing sends email or external messages. Marking a question resolved is a demo checkbox, not receipt or verification of an insurer answer.
- TXT export requires the populated case and an explicit review check. It includes the fictional comparison and all three questions with their current open/resolved labels. The report makes its educational status explicit.
- The history tab is a prepared illustration, not a journal of subsequent interactions. This route does not implement production authorization, durable records, document version processing or production AI.

Evidence: `WorkspaceConcept.tsx` state declarations and `send`, `download`, file-input, clarification and history handlers. Verification here is static; browser interaction and layout verification belong to the separate finish pass.

## Surface deviations from the established design system

The concept retains Golos Text, green charcoal navigation, Document Teal actions, white paper, fine dividers and the existing focus color. Local sage shades distinguish chat, lifecycle and next-step surfaces; they are implementation details of this concept, not additions to the shared palette.

The concept is denser: body 14px, primary heading 29px, standard button label 12px with a 38px minimum height, versus the documented working application's 15px, 30px, 13px and 40px. Several metadata and disclaimer labels use 9–11px, including mobile lifecycle labels. These small sizes are a concept deviation requiring renewed legibility assessment before production adoption; they do not supersede the Working Text Rule.

Its desktop navigation is 218px. The contextual assistant is a fixed, full viewport-height right panel, 360–440px wide, with space reserved across the entire workspace including its headers. Messages scroll independently and the composer stays at the bottom. At 900px and below the assistant takes the full screen, hides the background workspace, and starts closed on fresh mobile visits. Closing or Escape returns focus to its toggle. Navigation becomes a toggleable panel at 640px. The comparison retains a horizontally scrollable multi-insurer table rather than the working application's mobile insurer selector. This is local composition, not a replacement for the incumbent responsive contract.

## Existing documentation drift

`PRODUCT.md` still states that no API credentials have been supplied. The concept brief flags this as stale relative to an earlier Google setup; this pass did not inspect credentials or independently validate that setup. The statement is outside this route's scope and was preserved.

`DESIGN.md` includes `finding-mismatch` and `finding-unknown` primitives and the current source-drawer description, while `.impeccable/design.json` has no matching color metadata entries. Sidecar metadata is optional, so this is a coverage difference rather than a demonstrated runtime defect. Both files were preserved.
