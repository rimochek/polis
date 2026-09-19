# Use Node from PATH so the browser runner works across developer machines.
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$env:PWTEST_DAEMON_SESSION_DIR = Join-Path $repoRoot 'artifacts/playwright-daemon'
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $repoRoot 'artifacts/playwright-browsers'
& node (Join-Path $repoRoot 'node_modules/@playwright/cli/playwright-cli.js') -s=polis @args
exit $LASTEXITCODE
