# Polis — local insurance broker prototype

Russian-language workspace for comparing business property insurance proposals with client requirements. Includes a clearly labelled synthetic case with three fictional insurers and real generated PDFs.

## Run

Node 24 is recommended. Run `npm install`, start PostgreSQL with `docker compose -f docker-compose-dev.yaml up -d`, set `DATABASE_URL` and a random `AUTH_SECRET` in `.env`, then run `npm run db:generate` and `npm run db:migrate`. Start the app with `npm run dev` and open http://127.0.0.1:5173. The API listens on 127.0.0.1:5174. Docker access and PostgreSQL must be available before starting the server.

The workspace uses email/password accounts with access and rotating refresh sessions in HttpOnly cookies. Registering an account creates an independent synthetic demo company. Cases and uploaded PDF bytes are owned by the account in PostgreSQL; the public landing and its browser demo remain static and unauthenticated. AI provider credentials are deployment-wide environment settings and cannot be changed through the authenticated UI.

## Real analysis

Copy `.env.example` to `.env`. The default provider is Google Cloud Vertex AI with `gemini-3.8-flash`. Open the local app's analysis settings to enter your Cloud project and a Vertex API key or temporary OAuth access token, then test access. See [GOOGLE-CLOUD.md](GOOGLE-CLOUD.md) for setup and token expiry. Alternatively set `AI_PROVIDER=openai`, `OPENAI_API_KEY` and `OPENAI_MODEL` (default `gpt-5.6-terra`). API access and billing must be enabled separately. Credentials are saved server-side and are never returned by the API or bundled into the frontend. No API credentials are included in this repository.

Create a case, enter client requirements, and upload 2–3 insurer PDF packages. Each PDF must be 1–40 pages and at most 12 MB, without a password. One package per insurer; combine related terms in one PDF before upload. New versions preserve the original file. Analysis sends the latest PDF of each offer to the selected provider: Vertex AI Gemini or OpenAI Responses API (with `store:false` for OpenAI). Both integrations request structured output. No email or insurer integration is used. Files and results are stored locally under ignored `data/`; the provider's applicable data handling still applies to requests.

Review citations in the source drawer, edit findings, and confirm review. Clarification drafts are copied, not sent. Updated documents or requirements invalidate the comparison and previous approvals. Reanalysis compares field values with the previous successful result. Export is blocked until all fields are reviewed on the current revision; unknown conditions and mismatches remain visible in the output. Download creates self-contained HTML; use Print / PDF for browser PDF output.

## Verification and limits

`npm run build` type-checks and builds the UI. `npm test` checks citation bounds, incomplete responses and export gates. Browser QA uses the user's Playwright CLI installation.

The demo uses deterministic synthetic results, never a disguised live model response. Live model accuracy is not established by the demo. Citation presence/page bounds are checked programmatically; quotation correctness and completeness require a broker. No coverage recommendation, issuance, payment, team sharing or guaranteed claim outcome is implemented. PostgreSQL data is retained in the Compose volume; deleting `data/` no longer resets database records.

## Public landing and browser demo

`npm run build:landing` generates only synthetic documents, type-checks the project, builds the independent landing and verifies the publication file allowlist. Output: `landing/dist/`. `npm run dev:landing` previews it on http://127.0.0.1:5175 after the first build. Page `/demo.html` is an interactive browser demonstration, with source PDFs, per-condition review, insurer selection and self-contained HTML export. State is confined to the current page session.

Deploy only `landing/dist/`, which includes a physical `demo.html` entry to work without SPA rewrites. Do not deploy the repository root or the local Express API. The public artifact does not contain credentials or real client documents. `scripts/deploy-payload.cjs prepare` produces an ignored, allowlisted Vercel API file payload for the same static build. The generated editorial image has provenance in `landing/public/images/broker-desk.webp.json`; that non-runtime sidecar is excluded from the deployment.

Browser checks: `scripts/landing-qa.cjs` (functional flow), `scripts/landing-capture.cjs` (desktop/mobile visual evidence), run via `scripts/pw.ps1 run-code --filename=...`.

## Design references

Taste (applicable composition rules), Impeccable (Operate mode, review), Awesome DESIGN.md (Airtable community reference) and Playwright CLI. Typography: Golos Text; document font: Noto Sans (npm packages with licenses). All example insurers and prices are fictional.
