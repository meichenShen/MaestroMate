import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { work, type Clip } from '../content/aquarium';
import { chapterAt, clampSeek } from './timeline';

type AudioState = {
  time: number; duration: number; playing: boolean; loading: boolean; error: string | null;
  volume: number; rate: number; clipLabel: string | null;
  play: () => void; pause: () => void; toggle: () => void;
  seek: (time: number) => void; playClip: (clip: Clip) => void;
  setVolume: (volume: number) => void; setRate: (rate: number) => void; retry: () => void;
  chapter: ReturnType<typeof chapterAt>;
};
const AudioContext = createContext<AudioState | null>(null);
export function AudioProvider({ children }: { children: ReactNode }) {
  const element = useRef<HTMLAudioElement>(null);
  const stopAt = useRef<number | null>(null);
  const pendingSeek = useRef<number | null>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(work.duration);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, updateVolume] = useState(0.8);
  const [rate, updateRate] = useState(1);
  const [clipLabel, setClipLabel] = useState<string | null>(null);
  const play = useCallback(() => {
    const audio = element.current;
    if (!audio) return;
    setError(null);
    if (audio.ended) audio.currentTime = 0;
    setLoading(true);
    void audio.play().catch((cause: unknown) => {
      if (cause instanceof DOMException && cause.name === 'AbortError') return;
      setLoading(false); setPlaying(false);
      setError('暂时无法播放。请检查网络后重试。');
    });
  }, []);
  const pause = useCallback(() => { element.current?.pause(); setLoading(false); }, []);
  const seekTo = useCallback((value: number) => {
    const audio = element.current;
    if (!audio) return;
    const next = clampSeek(value, duration);
    setTime(next);
    if (audio.readyState >= 1) audio.currentTime = next;
    else pendingSeek.current = next;
  }, [duration]);
  const seek = useCallback((value: number) => {
    stopAt.current = null; setClipLabel(null); seekTo(value);
  }, [seekTo]);
  const playClip = useCallback((clip: Clip) => {
    stopAt.current = Math.min(clip.end, duration); setClipLabel(clip.label);
    seekTo(clip.start); play();
  }, [duration, play, seekTo]);
  const setVolume = (value: number) => { const next = Math.max(0, Math.min(1, value)); updateVolume(next); if (element.current) element.current.volume = next; };
  const setRate = (value: number) => { updateRate(value); if (element.current) element.current.playbackRate = value; };
  useEffect(() => { if (element.current) element.current.volume = 0.8; }, []);
  const updateTime = () => {
    const audio = element.current;
    if (!audio) return;
    if (stopAt.current !== null && audio.currentTime >= stopAt.current) {
      const end = stopAt.current;
      stopAt.current = null; audio.pause(); audio.currentTime = end;
      setClipLabel(null);
    }
    setTime(audio.currentTime);
  };
  const value: AudioState = {
    time, duration, playing, loading, error, volume, rate, clipLabel, play, pause,
    toggle: () => { if (element.current?.paused) { stopAt.current = null; setClipLabel(null); play(); } else pause(); },
    seek, playClip, setVolume, setRate, chapter: chapterAt(time),
    retry: () => { pendingSeek.current = time; element.current?.load(); play(); },
  };
  return <AudioContext.Provider value={value}>
    <audio ref={element} src={work.audio} preload="metadata"
      onLoadedMetadata={() => {
        const audio = element.current!;
        if (Number.isFinite(audio.duration)) setDuration(audio.duration);
        if (pendingSeek.current !== null) { audio.currentTime = pendingSeek.current; pendingSeek.current = null; }
        setError(null);
      }}
      onTimeUpdate={updateTime} onSeeking={updateTime}
      onPlay={() => setPlaying(true)} onPlaying={() => setLoading(false)}
      onWaiting={() => setLoading(true)}
      onPause={() => { setPlaying(false); setLoading(false); }}
      onEnded={() => { setPlaying(false); setLoading(false); stopAt.current = null; setClipLabel(null); }}
      onError={() => { setError('录音加载失败，请检查网络并重试。'); setLoading(false); setPlaying(false); }} />
    {children}
  </AudioContext.Provider>;
}
export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio requires AudioProvider');
  return context;
}
