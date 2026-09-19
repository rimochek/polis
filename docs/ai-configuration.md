# AI configuration

The implementation reads provider settings from the process environment and then overlays values from the repository's `.env`, if present. Configuration is shared across accounts. Never commit the populated `.env`.

## Vertex AI

Set `AI_PROVIDER=vertex`, `GOOGLE_MODEL`, and either `GOOGLE_API_KEY` or `GOOGLE_ACCESS_TOKEN`. A token takes precedence if both are populated. Standard mode also uses `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_LOCATION` (default `global`). `GOOGLE_VERTEX_EXPRESS=true` selects the project's Express-mode request URL.

The signed-in settings dialog can save a Google key/token, project, model, and mode to the server `.env`. The connection test sends a small technical request without client documents. Credentials and model access must be valid for the configured provider account; the application does not provision cloud resources or refresh OAuth tokens automatically.

## OpenAI

Set `AI_PROVIDER=openai`, `OPENAI_API_KEY`, and optionally `OPENAI_MODEL`. The adapter uses the Responses API with structured output and `store: false`. The Google connection test is specific to Vertex; it does not validate OpenAI access.

## Validation

Both adapters pass results through the same eight-field schema and evidence validation. Unknown or untraceable conditions stay visibly unresolved. API errors do not substitute synthetic results for a failed live analysis. Tests exercise mocked requests and validation, so actual access, billing, quotas, and model quality need separate verification.

The historical presentation smoke script is kept under `scripts/legacy/`; it predates authentication and is not a supported live verification command.
