$env:PATH='C:\Users\dimad\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;'+$env:PATH
$env:PWTEST_DAEMON_SESSION_DIR=Join-Path $PSScriptRoot '..\artifacts\playwright-daemon'
$env:PLAYWRIGHT_BROWSERS_PATH=Join-Path $PSScriptRoot '..\artifacts\playwright-browsers'
& 'C:\Users\dimad\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' (Join-Path $PSScriptRoot '..\node_modules\@playwright\cli\playwright-cli.js') -s=polis @args
exit $LASTEXITCODE
