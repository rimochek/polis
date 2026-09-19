# Architecture

## Application boundaries

The workspace (`src/`) calls the Express API through Vite's `/api` proxy in development and Nginx in production. `shared/types.ts` is the common contract for cases, offers, evidence, and review eligibility. The static landing imports shared types and generated demo data but runs without the API.

`server/index.ts` owns route registration, request-scoped case state, and persistence orchestration. `auth.ts` handles access tokens, refresh-token families, password hashing, and CSRF. `analysis.ts` validates provider-independent results and calls OpenAI; `gemini.ts` adapts Vertex requests to the same normalization contract. `storage.ts` wraps MinIO and derives object keys from document IDs.

## Consistency rules

- Each request loads only the authenticated user's cases into asynchronous request context.
- Case updates compare the previous timestamp to reject stale writes.
- Replacing documents or requirements increments the revision and clears reviews and selection.
- Model evidence must reference the latest PDF, a valid physical page, and a nonempty quote; invalid evidence becomes unknown.
- Export requires a current analysis and reviewed cells for at least two offers.
- Refresh-token reuse revokes the token family; rotation updates the current session transactionally.

## Document storage transition

New PDFs are currently saved in both PostgreSQL and object storage. Downloads use object storage when `storageKey` is present and fall back to legacy database bytes otherwise. Live analysis still reads the database bytes directly. The backfill utility only selects documents with bytes and no storage key, uploads them, then clears those bytes. Do not run that utility for cases that need reanalysis until the analysis path supports object storage.

Synthetic fixtures use stable source IDs. Account-specific demos clone those files under fresh IDs and rewrite citation references before persistence. Files under `data/` are generation inputs/temporary copies, not the authoritative database.

## Operational limits

The analysis busy set is local to one API process. AI configuration is deployment-wide, including updates made through the authenticated Google settings endpoint. Current unit tests use mocks and do not verify a live database, object store, or AI provider.
