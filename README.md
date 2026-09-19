# Polis — local insurance broker prototype

Russian-language workspace for comparing business property insurance proposals with client requirements. Includes a clearly labelled synthetic case with three fictional insurers and real generated PDFs.

## Run

Node 24 is recommended. Run `npm install`, then `npm run dev`. Open http://127.0.0.1:5173. The API listens only on 127.0.0.1:5174. Keep both processes running. This version is local-only; do not expose it to the Internet without authentication, authorization and production storage controls.

## Real analysis

Copy `.env.example` to `.env`. The default provider is Google Cloud Vertex AI with `gemini-3.8-flash`. Open the local app's analysis settings to enter your Cloud project and a Vertex API key or temporary OAuth access token, then test access. See [GOOGLE-CLOUD.md](GOOGLE-CLOUD.md) for setup and token expiry. Alternatively set `AI_PROVIDER=openai`, `OPENAI_API_KEY` and `OPENAI_MODEL` (default `gpt-5.6-terra`). API access and billing must be enabled separately. Credentials are saved server-side and are never returned by the API or bundled into the frontend. No API credentials are included in this repository.

Create a case, enter client requirements, and upload 2–3 insurer PDF packages. Each PDF must be 1–40 pages and at most 12 MB, without a password. One package per insurer; combine related terms in one PDF before upload. New versions preserve the original file. Analysis sends the latest PDF of each offer to the selected provider: Vertex AI Gemini or OpenAI Responses API (with `store:false` for OpenAI). Both integrations request structured output. No email or insurer integration is used. Files and results are stored locally under ignored `data/`; the provider's applicable data handling still applies to requests.

Review citations in the source drawer, edit findings, and confirm review. Clarification drafts are copied, not sent. Updated documents or requirements invalidate the comparison and previous approvals. Reanalysis compares field values with the previous successful result. Export is blocked until all fields are reviewed on the current revision; unknown conditions and mismatches remain visible in the output. Download creates self-contained HTML; use Print / PDF for browser PDF output.

## Workspace and assistant

The main application at `/` includes clients (grouped by the client name on each case), case search and stage filters, and six case sections: overview, documents, comparison, clarifications, report and history. Owner, deadline, clarification state, saved drafts, activity and conversations persist in the local `data/` directory. Existing cases remain compatible; their past activity is not invented. Client grouping is not a separate CRM or multi-user directory.

The case assistant occupies the full right edge of the desktop window with independent scrolling; on mobile it opens as a full-screen dialog. It sends only the selected case's current insurer PDFs, supplemental documents, explicit requirements, comparison and recent messages to the configured provider. Old file versions are retained locally and excluded from new chat requests. A workspace assistant receives case metadata and can link to cases, but does not receive their PDFs. Replies cannot send emails, change insurance facts or mark conditions reviewed. A proposed letter is saved only after clicking the explicit action. Chat citations are checked for document ownership and physical page bounds; quote accuracy still requires human review. Provider failures are displayed, not replaced with synthetic answers. The demo case uses visibly labelled local answers without a model request.

Up to six supplemental PDFs can be added with roles: client requirements, existing policy, rules or correspondence. Each supports 1–40 pages and 12 MB. Current documents in one request have a combined 24 MB limit. Requirements-role PDFs supplement the written client request during analysis; the other documents supply context, and comparison citations must still point to the current insurer offer. Changing a role invalidates analysis and review. The latest offer versions are used for analysis; offer version history remains available. Supplemental documents currently have one version each.

Open and answered clarification statuses are included in exports, without hiding uncertain coverage. Activity retains the latest 200 entries per case; chat retains the latest 100 messages (last 12 included in a model request). Drafts remain editable and should be rechecked after document changes. `/concept.html` is the separate, transient design prototype; it is no longer the only place with workspace navigation.

## Verification and limits

`npm run build` type-checks and builds the UI. `npm test` checks citation bounds, incomplete responses and export gates. Browser QA uses the user's Playwright CLI installation.

The demo uses deterministic synthetic results, never a disguised live model response. Live model accuracy is not established by the demo. Citation presence/page bounds are checked programmatically; quotation correctness and completeness require a broker. No coverage recommendation, issuance, payment, authentication, multi-user sharing or guaranteed claim outcome is implemented. Data is retained on this computer; deleting `data/` resets the local prototype, so back it up if needed.

## Public landing and browser demo

`npm run build:landing` generates only synthetic documents, type-checks the project, builds the independent landing and verifies the publication file allowlist. Output: `landing/dist/`. `npm run dev:landing` previews it on http://127.0.0.1:5175 after the first build. Page `/demo.html` is an interactive browser demonstration, with source PDFs, per-condition review, insurer selection and self-contained HTML export. State is confined to the current page session.

Deploy only `landing/dist/`, which includes a physical `demo.html` entry to work without SPA rewrites. Do not deploy the repository root or the local Express API. The public artifact does not contain credentials or real client documents. `scripts/deploy-payload.cjs prepare` produces an ignored, allowlisted Vercel API file payload for the same static build. The generated editorial image has provenance in `landing/public/images/broker-desk.webp.json`; that non-runtime sidecar is excluded from the deployment.

Browser checks: `scripts/landing-qa.cjs` (functional flow), `scripts/landing-capture.cjs` (desktop/mobile visual evidence), run via `scripts/pw.ps1 run-code --filename=...`.

## Design references

Taste (applicable composition rules), Impeccable (Operate mode, review), Awesome DESIGN.md (Airtable community reference) and Playwright CLI. Typography: Golos Text; document font: Noto Sans (npm packages with licenses). All example insurers and prices are fictional.
