#!/usr/bin/env node
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

function getStagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    return out.split(/\r?\n/).filter(Boolean)
  } catch (err) {
    console.error('Could not get staged files:', err.message)
    process.exit(0) // don't block commit if git not available
  }
}

const patterns = [
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"]?eyJ/i,
  /VITE_SUPABASE_ANON_KEY\s*=\s*['"]?eyJ/i,
  /AIza[0-9A-Za-z\-_]{35}/, // common API key pattern (Google-like)
  new RegExp('-{5}BEGIN PRIVATE KEY-{5}'), // private key block
  new RegExp('-{5}BEGIN RSA PRIVATE KEY-{5}')
]

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    for (const p of patterns) {
      if (p.test(content)) return p
    }
  } catch (e) {
    // ignore binary or unreadable
  }
  return null
}

const staged = getStagedFiles()
const repoRoot = process.cwd()
const findings = []

for (const f of staged) {
  const abs = path.join(repoRoot, f)
  const match = scanFile(abs)
  if (match) findings.push({ file: f, pattern: match.toString() })
}

if (findings.length) {
  console.error('\nERROR: Potential secret(s) found in staged files:')
  for (const r of findings) console.error(` - ${r.file}  matched ${r.pattern}`)
  console.error('\nRemove the secrets from these files, move them to env vars, or unstage the files and try again.')
  process.exit(1)
} else {
  console.log('No obvious secrets found in staged files.')
  process.exit(0)
}
