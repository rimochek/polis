# Scripts

Run all commands from the repository root. Paths inside the scripts are rooted there unless explicitly resolved from the script location.

| Directory      | Files and purpose                                                                                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `landing/`     | `prepare-landing.ts` generates synthetic assets; `finalize-landing.ts` validates the static build; `deploy-payload.cjs prepare` writes an allowlisted base64 payload to `artifacts/vercel-landing-files.json`                            |
| `qa/`          | `landing-qa.cjs` checks the local demo; `landing-capture.cjs` captures local desktop/mobile screenshots; `landing-live-check.cjs` targets the public alias recorded in deployment notes; `pw.ps1` wraps the Playwright CLI on PowerShell |
| `maintenance/` | `backfill-document-storage.ts` migrates legacy database PDF bytes into object storage                                                                                                                                                    |
| `demo/`        | `create-presentation-mocks.py` builds optional presentation PDFs, a ZIP, and preview images                                                                                                                                              |
| `legacy/`      | `capture.cjs`, `qa-flow.cjs`, and `gemini-presentation-check.mjs` preserve earlier workspace verification scenarios that predate authentication                                                                                          |

## Landing browser checks

Build and start the landing first. The `.cjs` browser files are callbacks for Playwright CLI's `run-code` command; they are not standalone Node programs. With a browser session open:

```sh
npx playwright-cli -s=polis open http://127.0.0.1:5175
npx playwright-cli -s=polis run-code --filename=scripts/qa/landing-qa.cjs
npx playwright-cli -s=polis run-code --filename=scripts/qa/landing-capture.cjs
```

PowerShell users can use `./scripts/qa/pw.ps1` in place of `npx playwright-cli -s=polis`. Browser installation is a separate Playwright prerequisite. Legacy scripts assume old routes, case IDs, or unauthenticated requests and need adaptation before reuse.

## Storage backfill

`npm run storage:backfill` requires database and object-storage configuration in the environment. It uploads in batches and clears database bytes after each successful object write. The current live analysis path still depends on those bytes: review [the storage transition](../docs/architecture.md) before using this maintenance command.

## Optional presentation generator

The generator requires Python, `reportlab`, `pypdf`, `pypdfium2`, and Pillow, plus Windows Arial fonts at the paths declared in the script. It is historical presentation tooling, not a prerequisite for building the application. Outputs go to ignored `output/pdf/` and `artifacts/mock-preview/`.

To format this optional Python script, install `black==26.1.0` and run `python -m black scripts/demo/`. The normal application formatter does not require Python.
