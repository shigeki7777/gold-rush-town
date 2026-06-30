#!/usr/bin/env node
// Gold Rush Town — Community Frontend Kit: zero-dependency local dev server.
//
// Serves the design surface (the voxel part catalog) with NO SaSame backend, so you
// can design and preview parts entirely offline. Run `node build-community-kit.mjs`
// upstream first (SaSame) or, in the public repo, partkit/ is already materialized.
//
// Usage: node dev-server.mjs [port]   ->   open http://localhost:8080/
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2]) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webmanifest': 'application/manifest+json',
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent((req.url || '/').split('?')[0]);
    if (path === '/' || path === '/catalog' || path === '/catalog/') path = '/partkit/catalog.html';
    // contain the request to ROOT (no path traversal)
    const full = normalize(join(ROOT, path));
    if (!full.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
    let target = full;
    try { if ((await stat(full)).isDirectory()) target = join(full, 'index.html'); } catch { /* fallthrough */ }
    const body = await readFile(target);
    res.writeHead(200, { 'content-type': TYPES[extname(target)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  }
}).listen(PORT, () => {
  console.log(`Gold Rush Town — Community Frontend Kit`);
  console.log(`  catalog (design surface):  http://localhost:${PORT}/`);
  console.log(`  no backend required — pure design/visual layer. Happy building!`);
});
