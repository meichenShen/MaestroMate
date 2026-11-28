import { useCallback, useEffect, useRef, useState } from "react";
import { useAudio } from "../../audio/AudioProvider";
import { PoolAudio, type SoundLayer, type Instrument } from "../water/audio";
import type { Melody } from "../water/model";
import { preloadPiano } from "../water/piano";
import { backingLayers, type BackingStyle } from "../creation/music";
import type { Clip } from "../../content/aquarium";
export function useWorkshopSound(enabled: boolean, instrument: Instrument = "smooth") {
  const recording = useAudio(),
    synth = useRef<PoolAudio | null>(null),
    alive = useRef(false),
    ticket = useRef(0),
    [beat, setBeat] = useState<number | null>(null),
    [playing, setPlaying] = useState(false),
    [muted, setMuted] = useState(false),
    [error, setError] = useState("");
  const [usingRecording, setUsingRecording] = useState(false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const stop = useCallback(() => {
    ticket.current++;
    synth.current?.stop();
    recording.pause();
    setPlaying(false);
    setBeat(null);
    setUsingRecording(false);
    setError("");
  }, [recording.pause]);
  useEffect(() => {
    alive.current = true;
    synth.current = new PoolAudio();
    const hide = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      alive.current = false;
      ticket.current++;
      synth.current?.dispose();
      recording.pause();
      document.removeEventListener("visibilitychange", hide);
    };
  }, [stop, recording.pause]);
  useEffect(() => {
    if (!enabled) stop();
  }, [enabled, stop]);
  useEffect(() => {
    synth.current?.setVolume(muted ? 0 : 0.2);
  }, [muted]);
  useEffect(() => {
    stop(); synth.current?.setInstrument(instrument);
    if(enabled && instrument === 'piano') void preloadPiano().catch(()=>{});
  }, [instrument, enabled, stop]);
  const practice = async (
    notes: Melody,
    options?: {
      bpm?: number;
      backing?: BackingStyle;
      repeats?: number;
      extraLayers?: SoundLayer[];
      gain?: number;
      colour?: "smooth" | "sparkling";
      accompaniment?: boolean;
      duration?: number;
      onDone?: () => void;
    },
  ) => {
    stop();
    if (!enabled || document.hidden || mutedRef.current) return;
    const id = ticket.current;
    setPlaying(true);
    setError("");
    try {
      const layers: SoundLayer[] = [
        {
          notes,
          gain: options?.gain,
          colour: options?.colour,
          duration: options?.duration,
        },
      ];
      if(options?.extraLayers) layers.push(...options.extraLayers.slice(0,2));
      if(options?.backing) layers.push(...backingLayers(options.backing));
      if (options?.accompaniment && !options.backing)
        layers.push({
          notes: notes.map((_, i) => (i % 2 ? 1 : 0)),
          gain: 0.35,
          duration: 0.12,
        });
      const repeats=Math.min(4, Math.max(1, options?.repeats ?? 1));
      const sequence=layers.map(layer=>({...layer,notes:Array.from({length:repeats},()=>layer.notes).flat()}));
      const ok = await synth.current?.playLayers(
        sequence,
        (i) => {
          if (alive.current && ticket.current === id) setBeat(i % notes.length);
        },
        () => {
          if (alive.current && ticket.current === id) {
            setPlaying(false);
            setBeat(null);
            options?.onDone?.();
          }
        },
        Math.min(32,notes.length*repeats),
        options?.bpm,
      );
      if (alive.current && id === ticket.current && !ok) setPlaying(false);
    } catch {
      if (alive.current && id === ticket.current) {
        setPlaying(false);
        setError(instrument === "piano" ? "Piano sound could not start. Try again or choose another sound." : instrument !== "smooth" ? "Sound could not start. Try again." : "Sound did not start. Tap Hear again.");
      }
    }
  };
  const note = (n: number) => {
    stop();
    if (enabled && !document.hidden && !mutedRef.current) {
      const id = ticket.current;
      void synth.current?.note(n).catch(() => {
        if (alive.current && id === ticket.current)
          setError("Sound is unavailable. You can still build.");
      });
    }
  };
  const clip = (c: Clip) => {
    const was = recording.playing && recording.clipLabel === c.label;
    stop();
    setError("");
    if (!was && enabled && !mutedRef.current && !document.hidden) {
      setUsingRecording(true);
      recording.playClip(c);
    }
  };
  return {
    beat,
    playing,
    recording,
    muted,
    error: error || (usingRecording ? recording.error : null),
    stop,
    practice,
    note,
    clip,
    toggleMute() {
      stop();
      setMuted(!muted);
      if (muted && recording.volume === 0) recording.setVolume(0.8);
    },
  };
}
export type WorkshopSound = ReturnType<typeof useWorkshopSound>;
