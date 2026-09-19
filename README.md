# Polis

Polis is a Russian-language insurance broker workspace for comparing commercial property insurance proposals against a client's requirements. It combines a React application, an Express API, and an independent public landing page with a synthetic browser demo.

Brokers can upload proposals from up to three insurers, inspect AI-extracted conditions and PDF citations, review or edit findings, and export a self-contained HTML comparison. All example companies, prices, and policies are fictional.

## Quick start

Prerequisites: Node.js 24, npm, and Docker Engine with Docker Compose. Run commands from the repository root. npm and `package-lock.json` are the supported dependency workflow.

```sh
npm ci
cp .env.example .env
```

Set `AUTH_SECRET` in `.env` to a random value of at least 32 characters. Generate one with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

The example database and storage credentials match the development Compose services. Set `APP_ORIGIN=http://127.0.0.1:5173` for local development. Then:

```sh
docker compose -f docker-compose-dev.yaml up -d
npm run db:generate
npm run db:migrate
npm run dev
```

Open <http://127.0.0.1:5173> and register an account. Registration creates a private synthetic demo case; no AI key or seed command is needed for that case. The API uses port 5174, PostgreSQL 5432, MinIO 9000, and the MinIO console 9001. `APP_PORT` controls the production Docker entry point, not the development API port.

## Using the workspace

1. Create a case and enter the client's requirements.
2. Add two or three insurer proposals. Each upload must be an unencrypted PDF of 1–40 pages, no larger than 12 MB. Combine related terms into one PDF per insurer.
3. Configure an AI provider and run analysis. Only the latest document version of each offer is analyzed.
4. Inspect citations in the PDF drawer, correct findings, and confirm review.
5. Select an insurer if desired and export the comparison as HTML. Use the browser's print dialog for PDF output.

Changes to requirements or documents invalidate the comparison and review approvals. Export requires every condition to be reviewed on the current revision. Clarification drafts are copied; the application does not send them.

## AI configuration

Set deployment-wide credentials in `.env`; see [.env.example](.env.example) and the [AI configuration guide](docs/ai-configuration.md). The application supports Vertex AI Gemini (`AI_PROVIDER=vertex`) and OpenAI Responses (`AI_PROVIDER=openai`). Model defaults are defined in `server/ai-config.ts` and can be overridden with `GOOGLE_MODEL` or `OPENAI_MODEL`.

The authenticated settings dialog can also save Google credentials to the server's `.env`. These settings apply to all accounts on that server. API responses expose configuration status, not credentials. Live analysis sends PDF content and client requirements to the selected provider; OpenAI requests set `store: false`. The synthetic demo uses deterministic results.

## Repository map

| Path                   | Responsibility                                                                 |
| ---------------------- | ------------------------------------------------------------------------------ |
| `src/`                 | Authenticated React workspace and PDF viewer                                   |
| `server/`              | Express routes, authentication, AI adapters, persistence, and document storage |
| `shared/`              | Shared domain types, comparison fields, and review rules                       |
| `landing/`             | Independent static site, browser demo, and public assets                       |
| `prisma/`              | Database schema, ordered migration history, and seed entry point               |
| `tests/`               | Node test runner suites for analysis, auth, Gemini, and storage                |
| `scripts/landing/`     | Synthetic asset preparation and publication validation                         |
| `scripts/qa/`          | Landing browser checks and screenshots                                         |
| `scripts/maintenance/` | Document storage migration utility                                             |
| `scripts/demo/`        | Optional presentation PDF generator                                            |
| `scripts/legacy/`      | Historical checks for the former unauthenticated API                           |
| `docs/`                | Product, architecture, design, and AI/deployment documentation                 |
| `deploy/`              | EC2 instructions and Nginx configurations                                      |
| `.github/`             | Deployment and code quality workflows                                          |
| `.impeccable/`         | Design-tool metadata and source prompts                                        |

Root-level package, TypeScript, Vite, Docker, Compose, and editor files configure the project. `public/` contains workspace assets. `data/`, `dist/`, `landing/dist/`, `node_modules/`, and QA outputs are ignored local or generated files. See [repository conventions](docs/repository.md) for ownership and generated-file rules.

## Development commands

| Command                             | Purpose                                                          |
| ----------------------------------- | ---------------------------------------------------------------- |
| `npm run dev`                       | Start API and workspace with concurrent processes                |
| `npm run server` / `npm run client` | Start either process independently                               |
| `npm run build`                     | Type-check the project and build the workspace into `dist/`      |
| `npm test`                          | Run automated unit and mocked integration tests                  |
| `npm run format`                    | Format supported source and documentation files with Prettier    |
| `npm run format:check`              | Check formatting without modifying files                         |
| `npm run db:format`                 | Format the Prisma schema                                         |
| `npm run db:generate`               | Generate the Prisma client                                       |
| `npm run db:migrate`                | Apply/create development migrations                              |
| `npm run db:seed`                   | Run the informational seed entry point; creates no global data   |
| `npm run prepare:landing`           | Regenerate synthetic landing documents and data                  |
| `npm run dev:landing`               | Serve the landing at port 5175                                   |
| `npm run build:landing`             | Generate, type-check, build, and validate the static publication |

See [scripts](scripts/README.md) for browser QA, optional Python tooling, and the storage backfill utility.

## Storage and architecture

PostgreSQL stores accounts, refresh sessions, case payloads, and document metadata. Uploads currently write PDF bytes to both PostgreSQL and MinIO; document serving prefers MinIO when a storage key exists, while live analysis still reads database bytes. The maintenance backfill clears legacy database bytes, so it needs the analysis read path to be migrated before use on cases requiring reanalysis. See [architecture](docs/architecture.md).

Authentication uses password hashing, signed short-lived access cookies, rotating refresh sessions, and CSRF checks. Case access is scoped to the signed-in account. The local `data/` directory is used during synthetic PDF generation; deleting it does not reset the database. Compose volumes retain PostgreSQL and MinIO data.

## Landing and deployment

```sh
npm run build:landing
npm run dev:landing
```

The static output is `landing/dist/`, including a physical `demo.html` entry, three synthetic PDFs, and bundled assets. The publication validator rejects unexpected files and excludes image provenance metadata. The browser demo keeps its state only for the current page session.

Use [EC2 deployment instructions](deploy/README.md) for the authenticated application and [landing deployment notes](docs/deployment/landing.md) for the independent static site. Publish the static output directory only.

## Verification and limitations

Run `npm run format:check`, `npm test`, `npm run build`, and `npm run build:landing` before submitting changes. Automated tests cover citation validation, incomplete model responses, review gates, authentication helpers, and storage behavior. They do not establish live provider accuracy or replace a full authenticated browser test.

Citation presence and page bounds are checked programmatically; a broker must verify quotation accuracy and completeness. No issuance, payment, team sharing, insurer messaging, or guaranteed claim outcome is implemented.

Design references are recorded in [workspace design](docs/design/workspace.md), [landing design](docs/design/landing.md), and the [product brief](docs/product.md). Typography uses Golos Text and Noto Sans from npm packages; the landing image provenance remains beside its source asset.
