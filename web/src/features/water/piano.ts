// A small, self-hosted CC BY 3.0 subset; provenance lives with the audio files.
export const pianoSamples = [
  [48, "C3"], [51, "Ds3"], [57, "A3"], [60, "C4"], [63, "Ds4"],
  [66, "Fs4"], [69, "A4"], [72, "C5"],
] as const;
export interface PianoFile { midi: number; bytes: ArrayBuffer }
let pending: Promise<PianoFile[]> | undefined;
export function preloadPiano(): Promise<PianoFile[]> {
  if (!pending) {
    pending = Promise.all(pianoSamples.map(async ([midi, name]) => {
      const response = await fetch(`/audio/piano/${name}.mp3`, {signal: AbortSignal.timeout(10000)});
      if (!response.ok) throw new Error("Piano samples unavailable");
      return { midi, bytes: await response.arrayBuffer() };
    })).catch((error) => { pending = undefined; throw error; });
  }
  return pending;
}
