# Polis public landing

- Public URL: https://polis-broker-demo.vercel.app
- Demo: https://polis-broker-demo.vercel.app/demo.html
- Project: `polis-broker-demo`, under `rimocheks-projects`.
- Production deployment completed on 2026-09-11 through Vercel CLI, authenticated as `rimochek`.
- Deployment ID: `dpl_4zk9yaxyx1Lqdx5RMg7wFts4DJLj`. State: `READY`.
- Project ID: `prj_TKQh9LuZMKDOsEBMCYjV6Qk9GKft`; team ID: `team_CQRgWGA64rQenBKqroco5nac`.
- Inspector: https://vercel.com/rimocheks-projects/polis-broker-demo/4zk9yaxyx1Lqdx5RMg7wFts4DJLj
- Published boundary: 14 runtime/config files plus `.vercelignore`, including three synthetic PDFs; no Express API, local client data, environment files or credentials.

Build with `npm run build:landing`. Run `node scripts/landing/deploy-payload.cjs prepare` for an allowlisted Vercel API file payload. Source image provenance stays outside the published artifact. The public production alias responds with HTTP 200; team/immutable aliases may require Vercel sign-in, so use the public URL above.

CLI updates run from `landing/dist/`. A rebuild clears this output directory, so relink with `vercel link --yes --project polis-broker-demo --scope rimocheks-projects` when needed. The CLI may generate `.env.local` while linking: remove that generated file and ignore `.env*`, `.vercel`, `.gitignore`, `*.log` before publishing. Inspect inputs with `vercel deploy --dry --json`, then run `vercel deploy --prod --yes --scope rimocheks-projects`.

Live browser verification passed: landing and image load, CTA navigation, direct demo refresh, PDF page link, served PDF, review gate, HTML export, mobile insurer selection and no page overflow. No page errors were recorded in that scenario. Script: `scripts/qa/landing-live-check.cjs`.
