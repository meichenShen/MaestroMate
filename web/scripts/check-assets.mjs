import { readFile, stat } from "node:fs/promises";

const audio = new URL("../public/audio/aquarium.mp3", import.meta.url);
try {
  const metadata = await stat(audio);
  const contents = await readFile(audio);
  const hasMp3Header =
    contents.subarray(0, 3).toString() === "ID3" ||
    (contents[0] === 0xff && (contents[1] & 0xe0) === 0xe0);
  if (metadata.size < 1000 || !hasMp3Header)
    throw new Error("Expected a complete MP3 recording.");
  console.log(`Recording asset verified: ${metadata.size} bytes`);
} catch (cause) {
  console.error(
    "Missing or invalid public/audio/aquarium.mp3. Download the fixed recording documented in public/audio/ATTRIBUTION.md and transcode it before publishing.",
  );
  console.error(cause.message);
  process.exitCode = 1;
}

// Keep the small sampled instrument complete and unchanged from its credited source.
try {
  const { createHash } = await import('node:crypto');
  const root = new URL('../public/audio/piano/', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
  for (const file of manifest) {
    const bytes = await readFile(new URL(file.file, root));
    if (bytes.length !== file.bytes || createHash('sha256').update(bytes).digest('hex') !== file.sha256)
      throw new Error(`Piano sample does not match its manifest: ${file.file}`);
  }
  await stat(new URL('ATTRIBUTION.txt', root));
  console.log(`Piano sample assets verified: ${manifest.length} files`);
} catch (error) {
  console.error(error.message); process.exitCode = 1;
}
