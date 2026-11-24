import { midiFrequency, poolNotes, stepSeconds, type Melody } from "./model.ts";

// A local instrument, unrelated to the historical recording. No audio files,
// network requests or second HTMLAudioElement. Creation requires an interaction.
export interface SoundLayer {
  notes: Melody;
  duration?: number;
  gain?: number;
  colour?: "smooth" | "sparkling";
}
export class PoolAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private generation = 0;
  private disposed = false;
  private voices = new Set<OscillatorNode>();
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private level = 0.2;
  private create: () => AudioContext;
  constructor(create: () => AudioContext = () => new AudioContext()) {
    this.create = create;
  }
  private async ready(ticket: number) {
    if (this.disposed) return false;
    if (!this.context) {
      this.context = this.create();
      this.master = this.context.createGain();
      this.master.gain.value = this.level;
      const compressor = this.context.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 18;
      compressor.ratio.value = 5;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.12;
      this.master.connect(compressor);
      compressor.connect(this.context.destination);
    }
    try {
      if (this.context.state === "suspended") await this.context.resume();
    } catch (error) {
      if (this.disposed || ticket !== this.generation) return false;
      throw error;
    }
    if (this.disposed || ticket !== this.generation) return false;
    if (this.context.state !== "running")
      throw new Error("Sound did not start");
    return true;
  }
  setVolume(value: number) {
    this.level = Math.max(0, Math.min(0.4, value));
    if (this.master) this.master.gain.value = this.level;
  }
  private voice(
    note: number,
    when: number,
    duration: number,
    gainScale = 1,
    colour = "smooth",
  ) {
    const ctx = this.context!;
    const frequency = midiFrequency(poolNotes[note].midi);
    for (const [ratio, level] of [
      [1, 0.7],
      [2, colour === "sparkling" ? 0.4 : 0.12],
    ]) {
      const oscillator = ctx.createOscillator(),
        gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency * ratio;
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.linearRampToValueAtTime(level * gainScale, when + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      oscillator.connect(gain);
      gain.connect(this.master!);
      this.voices.add(oscillator);
      oscillator.onended = () => {
        this.voices.delete(oscillator);
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start(when);
      oscillator.stop(when + duration + 0.01);
    }
  }
  async note(note: number) {
    if (!poolNotes[note]) return false;
    const ticket = this.generation;
    if (!(await this.ready(ticket))) return false;
    // Bound rapid free play, including key repeat, without unbounded voices.
    if (this.voices.size > 30) return false;
    this.voice(note, this.context!.currentTime, 0.65);
    return true;
  }
  async play(
    melody: Melody,
    onStep: (step: number) => void,
    onDone: () => void,
    length = 8,
  ) {
    return this.playLayers([{ notes: melody }], onStep, onDone, length);
  }
  async playLayers(
    layers: readonly SoundLayer[],
    onStep: (step: number) => void,
    onDone: () => void,
    length = 8,
  ) {
    this.stop();
    const ticket = this.generation;
    if (!(await this.ready(ticket))) return false;
    const slots = Math.max(
      1,
      Math.min(8, Math.floor(Number.isFinite(length) ? length : 8)),
    );
    const start = this.context!.currentTime + 0.025;
    const later = (seconds: number, action: () => void) => {
      const timer = setTimeout(() => {
        this.timers.delete(timer);
        if (ticket === this.generation && !this.disposed) action();
      }, seconds * 1000);
      this.timers.add(timer);
    };
    for (let i = 0; i < slots; i++) {
      for (const layer of layers.slice(0, 2)) {
        const note = layer.notes[i];
        if (typeof note === "number" && poolNotes[note])
          this.voice(
            note,
            start + i * stepSeconds,
            Math.min(0.8, Math.max(0.05, layer.duration ?? 0.27)),
            Math.min(1, Math.max(0, layer.gain ?? 1)),
            layer.colour,
          );
      }
      later(0.025 + i * stepSeconds, () => onStep(i));
    }
    later(0.025 + slots * stepSeconds, () => {
      this.stop();
      onDone();
    });
    return true;
  }
  stop() {
    this.generation++;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.voices.forEach((voice) => {
      try {
        voice.stop();
      } catch {}
    });
    this.voices.clear();
  }
  dispose() {
    this.disposed = true;
    this.stop();
    if (this.context && this.context.state !== "closed")
      void this.context.close().catch(() => {});
  }
}
