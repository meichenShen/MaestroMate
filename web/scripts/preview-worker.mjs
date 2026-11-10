// Real local HTTP + persistent SQLite, matching the Worker API and static assets.
// Not a production server. No public database inspection endpoint.
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import worker from '../dist/server/index.js';
import { openLocalDatabase } from './local-d1.mjs';
await mkdir('.tmp/feedback', { recursive: true });
const DB = await openLocalDatabase(process.env.QA_DB_PATH || '.tmp/feedback/local.sqlite');
const root = resolve('dist/client');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };
const ASSETS = { async fetch(request) {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(request.url).pathname === '/' ? '/index.html' : new URL(request.url).pathname));
    if (!path.startsWith(root + sep)) return new Response('Not found', { status: 404 });
    const info = await stat(path); if (!info.isFile()) return new Response('Not found', { status: 404 });
    const headers = { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Accept-Ranges': 'bytes' };
    let start = 0, end = info.size - 1, status = 200;
    const range = request.headers.get('range');
    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      if (!match || Number(match[1]) >= info.size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${info.size}` } });
      start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), end) : end;
      if (end < start) return new Response(null, { status: 416 });
      status = 206; headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
    }
    headers['Content-Length'] = String(end - start + 1);
    const body = request.method === 'HEAD' ? null : (await readFile(path)).subarray(start, end + 1);
    return new Response(body, { status, headers });
  } catch { return new Response('Not found', { status: 404 }); }
} };
const server = createServer(async (incoming, outgoing) => {
  try {
    const origin = `http://${incoming.headers.host}`;
    const init = { method: incoming.method, headers: incoming.headers };
    if (!['GET', 'HEAD'].includes(incoming.method)) { init.body = incoming; init.duplex = 'half'; }
    const response = await worker.fetch(new Request(new URL(incoming.url, origin), init), { DB, ASSETS });
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) for await (const chunk of response.body) outgoing.write(chunk);
    outgoing.end();
  } catch { outgoing.writeHead(500); outgoing.end('Local preview error'); }
});
server.listen(Number(process.env.PORT || 8787), '0.0.0.0', () => console.log(`Worker preview: http://127.0.0.1:${server.address().port}`));
const close = () => server.close(() => { DB.close(); process.exit(0); });
process.on('SIGINT', close); process.on('SIGTERM', close);
