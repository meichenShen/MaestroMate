import { build } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
// Standard Sites Worker layout; no server packages ship in the browser bundle.
await build({ entryPoints: ['worker/index.ts'], bundle: true, format: 'esm', platform: 'browser', target: 'es2022', outfile: 'dist/server/index.js' });
await mkdir('dist/.openai', { recursive: true });
await cp('.openai/hosting.json', 'dist/.openai/hosting.json');
await rm('dist/.openai/drizzle', { recursive: true, force: true });
await cp('drizzle', 'dist/.openai/drizzle', { recursive: true });
