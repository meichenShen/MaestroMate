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
