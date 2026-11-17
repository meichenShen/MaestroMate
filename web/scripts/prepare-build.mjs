import { rm } from 'node:fs/promises';
// Clear only this project's reproducible build; avoid stale static-v9 files
// being included beside the Worker/client output after the hosting migration.
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
