import { preloadPiano, type PianoFile } from "./piano.ts";
import { midiFrequency, poolNotes, type Melody } from "./model.ts";

// Original user performances, separate from the Aquarium recording. Samples
// and synths share one cancellable AudioContext; no second audio element.
export type Instrument = "smooth" | "piano" | "glass" | "pluck" | "drums";
export type PitchedInstrument = "piano" | "glass" | "pluck";
export interface SoundLayer {
  instrument?: Instrument;
  octave?: number;
  notes: Melody;
  duration?: number;
  gain?: number;
  colour?: "smooth" | "sparkling";
}
export class PoolAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private generation = 0;
  private noteRequest = 0;
  private disposed = false;
  private voices = new Set<AudioScheduledSourceNode>();
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private level = 0.2;
  private voiceEnd = 0;
  private create: () => AudioContext;
  private instrument: Instrument;
  private pianoPromise?: Promise<{ midi:number; buffer:AudioBuffer }[]>;
  private piano: {midi:number;buffer:AudioBuffer}[] = [];
  private noise?: AudioBuffer;
  private loadPiano: () => Promise<PianoFile[]>;
  constructor(create: () => AudioContext = () => new AudioContext(), instrument: Instrument = "smooth", loadPiano: () => Promise<PianoFile[]> = preloadPiano) {
    this.instrument = instrument;
    this.loadPiano = loadPiano;
    this.create = create;
  }
  setInstrument(instrument: Instrument) {
    if(this.instrument === instrument) return;
    this.stop(); this.instrument = instrument;
  }
  private async ready(ticket: number, needsPiano = this.instrument === "piano") {
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
    if (this.context.state !== "running") throw new Error("Sound did not start");
    if(needsPiano) {
      const ctx=this.context;
      this.pianoPromise ??= this.loadPiano().then(files=>Promise.all(files.map(async file=>({midi:file.midi,buffer:await ctx.decodeAudioData(file.bytes.slice(0))})))).catch(error=>{this.pianoPromise=undefined;throw error});
      try { this.piano = await this.pianoPromise; }
      catch(error) { if(this.disposed || ticket !== this.generation) return false; throw error; }
    }
    return !this.disposed && ticket === this.generation;
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
    colour?: "smooth" | "sparkling",
    octave = 0,
    instrument = this.instrument,
  ) {
    const ctx = this.context!;
    const midi=poolNotes[note].midi + 12*Math.max(-1,Math.min(1,octave));
    const frequency = midiFrequency(midi);
    const track = (source: AudioScheduledSourceNode, gain: GainNode) => {
      this.voices.add(source);
      source.onended=()=>{this.voices.delete(source);source.disconnect();gain.disconnect()};
    };
    if(instrument === "piano") {
      const sample=this.piano.reduce((best,s)=>Math.abs(s.midi-midi)<Math.abs(best.midi-midi)?s:best);
      if(!sample) return;
      const source=ctx.createBufferSource(), gain=ctx.createGain();
      source.buffer=sample.buffer;source.playbackRate.value=2**((midi-sample.midi)/12);
      gain.gain.setValueAtTime(0.0001,when);gain.gain.linearRampToValueAtTime(1.8*gainScale,when+.003);
      gain.gain.setValueAtTime(1.8*gainScale,when+duration);
      gain.gain.exponentialRampToValueAtTime(.0001,when+duration+.65);
      source.connect(gain);gain.connect(this.master!);track(source,gain);
      source.start(when);source.stop(when+duration+.7);this.voiceEnd=Math.max(this.voiceEnd,when+duration+.7);return;
    }
    if(instrument === "drums") {
      const gain=ctx.createGain();gain.connect(this.master!);
      if(note===0) {
        const kick=ctx.createOscillator();kick.frequency.setValueAtTime(150,when);kick.frequency.exponentialRampToValueAtTime(48,when+.12);
        gain.gain.setValueAtTime(.9*gainScale,when);gain.gain.exponentialRampToValueAtTime(.0001,when+.22);
        kick.connect(gain);track(kick,gain);kick.start(when);kick.stop(when+.24);this.voiceEnd=Math.max(this.voiceEnd,when+.24);
      } else {
        if(!this.noise){this.noise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.25),ctx.sampleRate);const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}
        const noise=ctx.createBufferSource(), filter=ctx.createBiquadFilter();noise.buffer=this.noise;
        filter.type="highpass";filter.frequency.value=note===4?6500:1500;
        const length=note===4?.065:.15;
        gain.gain.setValueAtTime((note===4?.25:.5)*gainScale,when);gain.gain.exponentialRampToValueAtTime(.0001,when+length);
        noise.connect(filter);filter.connect(gain);track(noise,gain);noise.addEventListener("ended",()=>filter.disconnect(),{once:true});noise.start(when);noise.stop(when+length+.01);this.voiceEnd=Math.max(this.voiceEnd,when+length+.01);
      }
      return;
    }
    if(instrument === "glass" || instrument === "pluck") {
      const partials=instrument==="glass"?[[1,.7],[2.76,.24],[5.4,.07]]:[[1,.6],[2,.3],[3,.15],[4,.06]];
      for(const [ratio,level] of partials){
        const osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=frequency*ratio;
        const decay=instrument==="glass"?Math.max(.65,duration):Math.max(.22,duration*.8);
        gain.gain.setValueAtTime(.0001,when);gain.gain.linearRampToValueAtTime(level*gainScale,when+.004);gain.gain.exponentialRampToValueAtTime(.0001,when+decay);
        osc.connect(gain);gain.connect(this.master!);track(osc,gain);osc.start(when);osc.stop(when+decay+.02);this.voiceEnd=Math.max(this.voiceEnd,when+decay+.02);
      }return;
    }
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
      this.voiceEnd=Math.max(this.voiceEnd,when+duration+.01);
    }
  }
  async note(note: number) {
    if (!poolNotes[note]) return false;
    const ticket = this.generation, request=++this.noteRequest;
    if (!(await this.ready(ticket)) || request !== this.noteRequest) return false;
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
    bpm = 100,
  ) {
    return this.playLayers([{ notes: melody }], onStep, onDone, length, bpm);
  }
  async playLayers(
    layers: readonly SoundLayer[],
    onStep: (step: number) => void,
    onDone: () => void,
    length = 8,
    bpm = 100,
  ) {
    this.stop();
    const ticket = this.generation;
    if (!(await this.ready(ticket, layers.some(layer=>(layer.instrument ?? this.instrument) === "piano")))) return false;
    const slots = Math.max(
      1,
      Math.min(32, Math.floor(Number.isFinite(length) ? length : 8)),
    );
    const interval =
      60 / Math.max(60, Math.min(140, Number.isFinite(bpm) ? bpm : 100)) / 2;
    const start = this.context!.currentTime + 0.025;
    const later = (seconds: number, action: () => void) => {
      const timer = setTimeout(() => {
        this.timers.delete(timer);
        if (ticket === this.generation && !this.disposed) action();
      }, seconds * 1000);
      this.timers.add(timer);
    };
    for (let i = 0; i < slots; i++) {
      for (const layer of layers.slice(0, 4)) {
        const note = layer.notes[i];
        if (typeof note === "number" && poolNotes[note])
          this.voice(
            note,
            start + i * interval,
            Math.min(0.8, Math.max(0.05, layer.duration ?? 0.27)),
            Math.min(1, Math.max(0, layer.gain ?? 1)),
            layer.colour,
            layer.octave,
            layer.instrument,
          );
      }
      later(0.025 + i * interval, () => onStep(i));
    }
    later(Math.max(0.025 + slots * interval, this.voiceEnd - this.context!.currentTime + .01), () => {
      this.stop();
      onDone();
    });
    return true;
  }
  stop() {
    this.voiceEnd = 0;
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
