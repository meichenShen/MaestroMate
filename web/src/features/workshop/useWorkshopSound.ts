import { useCallback, useEffect, useRef, useState } from "react";
import { useAudio } from "../../audio/AudioProvider";
import { PoolAudio } from "../water/audio";
import type { Melody } from "../water/model";
import type { Clip } from "../../content/aquarium";
export function useWorkshopSound(enabled: boolean) {
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
  const practice = async (notes: Melody) => {
    stop();
    if (!enabled || document.hidden || mutedRef.current) return;
    const id = ticket.current;
    setPlaying(true);
    setError("");
    try {
      const ok = await synth.current?.play(
        notes,
        (i) => {
          if (alive.current && ticket.current === id) setBeat(i);
        },
        () => {
          if (alive.current && ticket.current === id) {
            setPlaying(false);
            setBeat(null);
          }
        },
      );
      if (alive.current && id === ticket.current && !ok) setPlaying(false);
    } catch {
      if (alive.current && id === ticket.current) {
        setPlaying(false);
        setError("Sound did not start. Tap Hear again.");
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
