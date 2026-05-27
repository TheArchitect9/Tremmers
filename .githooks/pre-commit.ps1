#!/usr/bin/env pwsh
try {
  node scripts/prevent-commit-secrets.js
  if ($LASTEXITCODE -ne 0) { throw 'secrets-found' }
} catch {
  Write-Error 'Commit blocked by secret scanner. Fix issues and try again.'
  exit 1
}
exit 0
