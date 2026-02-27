#!/usr/bin/env node
/**
 * bundle-budget.js — Phase 14 Bundle Budget Enforcement
 *
 * Measures the gzip size of the built @cyber-sheet/core SDK entry point and
 * fails with a non-zero exit code if it exceeds the configured limit.
 *
 * Usage:
 *   node scripts/bundle-budget.js [--limit <KB>] [--path <file>]
 *
 * Defaults:
 *   --limit  50           (50 KB gzipped)
 *   --path   packages/core/dist/sdk/index.js
 *
 * Exit codes:
 *   0  — within budget
 *   1  — over budget or file not found
 */

'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---------------------------------------------------------------------------
// Parse CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let limitKB = 50;
let targetPath = path.resolve(__dirname, '../packages/core/dist/index.js');

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--limit' && args[i + 1]) {
    limitKB = parseFloat(args[++i]);
  } else if (args[i] === '--path' && args[i + 1]) {
    targetPath = path.resolve(process.cwd(), args[++i]);
  }
}

// ---------------------------------------------------------------------------
// Read & measure
// ---------------------------------------------------------------------------

if (!fs.existsSync(targetPath)) {
  console.error(`[bundle-budget] ERROR: File not found: ${targetPath}`);
  console.error('  Run `pnpm --filter @cyber-sheet/core build` first.');
  process.exit(1);
}

const raw = fs.readFileSync(targetPath);
const gzipped = zlib.gzipSync(raw, { level: 9 });

const rawKB = (raw.byteLength / 1024).toFixed(2);
const gzipKB = (gzipped.byteLength / 1024).toFixed(2);
const limitBytes = limitKB * 1024;

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log('');
console.log('┌─────────────────────────────────────────────────┐');
console.log('│            Bundle Budget Report                 │');
console.log('├─────────────────────────────────────────────────┤');
console.log(`│  File:    ${path.relative(process.cwd(), targetPath).padEnd(38)}│`);
console.log(`│  Raw:     ${String(rawKB + ' KB').padEnd(38)}│`);
console.log(`│  Gzip:    ${String(gzipKB + ' KB').padEnd(38)}│`);
console.log(`│  Budget:  ${String(limitKB + ' KB').padEnd(38)}│`);
console.log('└─────────────────────────────────────────────────┘');

if (gzipped.byteLength > limitBytes) {
  console.error('');
  console.error(`[bundle-budget] FAIL: ${gzipKB} KB gzipped exceeds limit of ${limitKB} KB`);
  console.error(`  Over budget by ${((gzipped.byteLength - limitBytes) / 1024).toFixed(2)} KB`);
  console.error('  Investigate with: pnpm --filter @cyber-sheet/core build --analyze');
  process.exit(1);
} else {
  const headroom = ((limitBytes - gzipped.byteLength) / 1024).toFixed(2);
  console.log(`[bundle-budget] PASS: ${gzipKB} KB gzipped (${headroom} KB headroom)`);
  process.exit(0);
}
