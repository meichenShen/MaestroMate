import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";
import {
  MusicPoolView,
  type PoolViewHandle,
} from "../../components/MusicPoolView";
import { PoolAudio } from "./audio";
import { emptyMelody, poolNotes, putNote, type Melody } from "./model";
import type { PadPosition } from "../../rendering/music-pool";
import "./music-pool.css";
export function MusicPool({
  melody,
  onChange,
  enabled,
}: {
  melody: Melody;
  onChange: (m: Melody) => void;
  enabled: boolean;
}) {
  const [selected, setSelected] = useState(0),
    [playing, setPlaying] = useState(false),
    [sounding, setSounding] = useState<number | null>(null),
    [beat, setBeat] = useState<number | null>(null);
  const [error, setError] = useState(""),
    [muted, setMuted] = useState(false),
    [motion, setMotion] = useState(
      () => !matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  const [positions, setPositions] = useState<PadPosition[]>(() =>
    poolNotes.map((_, i) => ({ x: 10 + i * 20, y: 57.4 - i * 4.47 })),
  );
  const view = useRef<PoolViewHandle>(null),
    audio = useRef<PoolAudio | null>(null),
    playingRef = useRef(false),
    alive = useRef(true);
  const release = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const state = useRef({ melody, selected, enabled, muted });
  state.current = { melody, selected, enabled, muted };
  const stop = useCallback(() => {
    audio.current?.stop();
    playingRef.current = false;
    setPlaying(false);
    setBeat(null);
    setSounding(null);
    clearTimeout(release.current);
  }, []);
  useEffect(() => {
    alive.current = true;
    audio.current = new PoolAudio();
    return () => {
      alive.current = false;
      clearTimeout(release.current);
      audio.current?.dispose();
      audio.current = null;
    };
  }, []);
  useEffect(() => {
    if (!enabled) stop();
  }, [enabled, stop]);
  useEffect(() => {
    audio.current?.setVolume(muted ? 0 : 0.2);
  }, [muted]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hide);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)"),
      change = () => {
        if (reduce.matches) setMotion(false);
      };
    reduce.addEventListener("change", change);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      reduce.removeEventListener("change", change);
    };
  }, [stop]);
  const flash = useCallback((note: number) => {
    view.current?.pulse(note);
    setSounding(note);
    clearTimeout(release.current);
    release.current = setTimeout(() => {
      if (alive.current) setSounding(null);
    }, 260);
  }, []);
  const playNote = useCallback(
    (note: number) => {
      if (!state.current.enabled || document.hidden) return;
      if (playingRef.current) stop();
      onChange(putNote(state.current.melody, state.current.selected, note));
      setSelected((state.current.selected + 1) % 8);
      flash(note);
      void audio.current
        ?.note(note)
        .then((started) => {
          if (started && alive.current) setError("");
        })
        .catch(() => {
          if (alive.current)
            setError(
              "Sound isn’t available right now. You can still arrange your notes.",
            );
        });
    },
    [flash, onChange, stop],
  );
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        document.querySelector("dialog[open]")
      )
        return;
      if (
        (event.target as HTMLElement).closest(
          'input,textarea,select,[contenteditable="true"]',
        )
      )
        return;
      const note = poolNotes.findIndex(
        (n) => n.key.toLowerCase() === event.key.toLowerCase(),
      );
      if (note >= 0) {
        event.preventDefault();
        playNote(note);
      }
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [playNote]);
  const replay = () => {
    if (playingRef.current) {
      stop();
      return;
    }
    if (!enabled || !melody.some((n) => n !== null)) return;
    playingRef.current = true;
    setPlaying(true);
    setError("");
    void audio.current
      ?.play(
        [...melody],
        (step) => {
          setBeat(step);
          const note = melody[step];
          if (note !== null) flash(note);
        },
        () => {
          if (alive.current) {
            playingRef.current = false;
            setPlaying(false);
            setBeat(null);
          }
        },
      )
      .catch(() => {
        if (alive.current) {
          stop();
          setError(
            "Sound isn’t available right now. You can still arrange your notes.",
          );
        }
      });
  };
  return (
    <main
      id="main"
      tabIndex={-1}
      className="pool-room"
      data-pool-playing={playing}
    >
      <header className="pool-heading">
        <div>
          <a href="#play" className="pool-back">
            <ArrowLeft size={18} />
            Back to the play room
          </a>
          <p className="eyebrow">Music Pool · A little experiment</p>
          <h1>Make a little ripple.</h1>
          <p>Tap a light. Hear a note. See where it takes you.</p>
        </div>
        <div className="pool-switches">
          <button
            onClick={() => setMuted(!muted)}
            aria-pressed={!muted}
            aria-label={muted ? "Unmute instrument" : "Mute instrument"}
          >
            {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
            <span>{muted ? "Sound off" : "Sound on"}</span>
          </button>
          <button onClick={() => setMotion(!motion)} aria-pressed={motion}>
            <Waves size={19} />
            <span>Motion {motion ? "on" : "off"}</span>
          </button>
        </div>
      </header>
      <section
        className="pool-stage"
        aria-label="Five-note water instrument"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget)
            view.current?.splash(event.clientX, event.clientY);
        }}
      >
        <MusicPoolView
          ref={view}
          motion={motion}
          active={enabled}
          onPositions={setPositions}
        />
        <span className="pool-register pool-low">Lower notes</span>
        <span className="pool-register pool-high">Higher notes</span>
        {poolNotes.map((note, i) => (
          <button
            key={note.name}
            className={"pool-pad" + (sounding === i ? " is-sounding" : "")}
            style={
              {
                left: positions[i].x + "%",
                top: positions[i].y + "%",
                "--note-color": note.color,
              } as CSSProperties
            }
            aria-label={"Play " + note.name}
            disabled={!enabled}
            onClick={() => playNote(i)}
          >
            <span className="pool-pad-light" />
            <strong>{note.name}</strong>
            <kbd>{note.key}</kbd>
          </button>
        ))}
        <p className="pool-key-hint">Try your keyboard: A S D F G</p>
      </section>
      <section className="pool-composer" aria-label="Your melody">
        <div className="pool-sequence-heading">
          <h2>Your little melody</h2>
          <p>Pick a step to change it.</p>
          <span>{melody.filter((n) => n !== null).length} / 8 notes</span>
        </div>
        <div
          className="pool-sequence"
          role="group"
          aria-label="Eight melody steps"
        >
          {melody.map((note, i) => (
            <button
              key={i}
              className={
                "pool-step" +
                (selected === i ? " is-selected" : "") +
                (beat === i ? " is-playing" : "")
              }
              style={
                note !== null
                  ? ({ "--note-color": poolNotes[note].color } as CSSProperties)
                  : undefined
              }
              aria-label={
                "Step " +
                (i + 1) +
                ": " +
                (note === null ? "empty" : poolNotes[note].name)
              }
              aria-pressed={selected === i}
              onClick={() => {
                stop();
                setSelected(i);
                if (note !== null) {
                  flash(note);
                  void audio.current
                    ?.note(note)
                    .catch(() =>
                      setError(
                        "Sound couldn’t start. Your notes are still here.",
                      ),
                    );
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Delete" || event.key === "Backspace") {
                  event.preventDefault();
                  stop();
                  onChange(putNote(melody, i, null));
                }
              }}
            >
              <span>{i + 1}</span>
              <strong>{note === null ? "·" : poolNotes[note].name}</strong>
            </button>
          ))}
        </div>
        <div className="pool-actions">
          <button
            className="solid-button"
            aria-label={playing ? "Stop melody" : "Play melody"}
            onClick={replay}
            disabled={!enabled || !melody.some((n) => n !== null)}
          >
            {playing ? <Square size={18} /> : <Play size={18} />}{" "}
            {playing ? "Stop" : "Play my melody"}
          </button>
          <button
            className="pool-clear"
            aria-label="Clear melody"
            onClick={() => {
              stop();
              onChange(emptyMelody());
              setSelected(0);
            }}
          >
            <RotateCcw size={17} />
            Start fresh
          </button>
          <p className="pool-feedback" role={error ? "alert" : "status"}>
            {error ||
              (playing
                ? "That’s your melody."
                : muted
                  ? "Sound is off. Your notes still make ripples."
                  : "Five notes. So many possibilities.")}
          </p>
        </div>
      </section>
      <p className="pool-footnote">
        An instrument of your own. These sounds are created here, separate from
        the Aquarium recording.
      </p>
    </main>
  );
}
