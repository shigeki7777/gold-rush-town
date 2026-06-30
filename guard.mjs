#!/usr/bin/env node
// Gold Rush Town — Community Frontend Kit: publish leak-guard.
//
// This repo is the COMMUNITY DESIGN LAYER (look, voxel parts, palette, styling).
// The backend — money, pricing, claim secrets, settlement, the SaSame business —
// lives privately on SaSame's side and is NEVER in this repo. This guard fails the
// build/PR if anything backend, secret, or money-logic leaks into the publishable
// bundle. Run by every contributor PR (CI) and before any publish.
//
// Usage: node guard.mjs [dir]   (default: this repo root)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.argv[2] || dirname(fileURLToPath(import.meta.url));

// 1) Backend files that must NEVER appear in the community repo (by exact basename).
const FORBIDDEN_FILES = new Set([
  'town-api.mjs', 'town-econ.mjs', 'commercial-config.mjs', 'town-realms.mjs', 'town-chain.mjs',
  'build-world-state.mjs', 'build-catalog-functions.mjs', 'build-offers.mjs', 'build-town-parts.mjs',
  'deploy.sh', 'pay.js', 'market.js', 'owner-auth.js',
  'secrets.env', '.env', '.env.local', '.env.production',
]);
const FORBIDDEN_EXT = ['.service', '.key', '.pem'];

// 2) Secret / money-backend content patterns. A match = hard fail.
const FORBIDDEN_PATTERNS = [
  { re: /sk_live_[A-Za-z0-9]/, why: 'Stripe live secret key' },
  { re: /sk_test_[A-Za-z0-9]/, why: 'Stripe test secret key' },
  { re: /rk_live_[A-Za-z0-9]/, why: 'Stripe restricted key' },
  { re: /whsec_[A-Za-z0-9]/, why: 'Stripe webhook secret' },
  { re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, why: 'private key block' },
  { re: /postgres(ql)?:\/\/[^ \n"']+/i, why: 'Postgres connection string' },
  { re: /mongodb(\+srv)?:\/\//i, why: 'MongoDB connection string' },
  { re: /\b(ghp|gho|ghs)_[A-Za-z0-9]{20,}/, why: 'GitHub token' },
  { re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/, why: 'Slack token' },
  { re: /\bAKIA[0-9A-Z]{16}\b/, why: 'AWS access key' },
  { re: /STRIPE_SECRET_KEY\s*[:=]/, why: 'Stripe secret env assignment' },
  { re: /\b(X402_PAYTO|AGENT_WALLET_KEY|INTERNAL_AUTH_TOKEN|MCP_BEARER)\s*[:=]\s*['"][^'"]+/, why: 'backend secret env assignment' },
  // money/backend LOGIC markers (the private business engine must not be mirrored here)
  { re: /OFFER_REGISTRY\s*=/, why: 'town-econ offer registry (private revenue logic)' },
  { re: /function\s+paymentQuote\b/, why: 'town-econ paymentQuote (private pricing logic)' },
  { re: /function\s+recordIntent\b/, why: 'town-api intent backend' },
  { re: /CARD_PREMIUM|hosting_monthly_usdc\s*[:=]\s*[0-9]/, why: 'private pricing constant' },
];

// 3) Allowlist: public references that are intentionally fine and must NOT trip the guard.
//    - public Stripe payment LINKS (buy.stripe.com/...) are customer-facing, not secrets
//    - the owner's PUBLIC Base receive address is public by nature (already in town-state)
//    These are only ever expected inside fixtures/ as sample display data.
const ALLOW_SUBSTRINGS = [
  'buy.stripe.com/',
  '0xee74da43A6992dDfeBCf0afb9D6FDA57f8624012', // public receive address (display-only)
];

const SKIP_DIRS = new Set(['.git', 'node_modules', '.github']);
const TEXT_EXT = new Set(['.js', '.mjs', '.cjs', '.ts', '.json', '.html', '.css', '.md', '.txt', '.yml', '.yaml', '.sh', '.env', '']);

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    if (SKIP_DIRS.has(e)) continue;
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const failures = [];
let scanned = 0;
for (const file of walk(ROOT)) {
  const name = basename(file);
  if (name === 'guard.mjs') continue;
  if (FORBIDDEN_FILES.has(name)) { failures.push(`${file}: forbidden backend file present`); continue; }
  if (FORBIDDEN_EXT.some((x) => name.endsWith(x))) { failures.push(`${file}: forbidden backend file type`); continue; }
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
  if (!TEXT_EXT.has(ext)) continue; // binary/asset — patterns don't apply
  let body;
  try { body = readFileSync(file, 'utf8'); } catch { continue; }
  scanned++;
  for (const { re, why } of FORBIDDEN_PATTERNS) {
    const m = body.match(re);
    if (!m) continue;
    const around = body.slice(Math.max(0, m.index - 20), m.index + 60);
    if (ALLOW_SUBSTRINGS.some((a) => around.includes(a))) continue; // public reference, allowed
    failures.push(`${file}: leaked ${why} (matched ${JSON.stringify(m[0].slice(0, 24))}...)`);
  }
}

if (failures.length) {
  console.error(`[community-guard] ✗ ${failures.length} leak(s) — this bundle is NOT safe to publish:`);
  for (const f of failures) console.error('  - ' + f);
  console.error('\nThe community repo is the design/visual layer only. Money, pricing, claim secrets,');
  console.error('and the SaSame business backend stay private and must never appear here.');
  process.exit(1);
}
console.log(`[community-guard] ✓ scanned ${scanned} text files — no backend, secret, or money-logic leak. Safe to publish.`);
