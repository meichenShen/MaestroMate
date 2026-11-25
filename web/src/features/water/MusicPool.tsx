import {BackLink} from "../../navigation/BackLink";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
import { getPoolLayout } from "./layout";
import "./music-pool.css";
import { PoolMission } from "./PoolMission";
import { usePoolEcho } from "./usePoolEcho";
import { PoolFish } from "./PoolFish";
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
  const [layout, setLayout] = useState(() => getPoolLayout(900, 360));
  const stage = useRef<HTMLElement>(null);
  const view = useRef<PoolViewHandle>(null),
    audio = useRef<PoolAudio | null>(null),
    playingRef = useRef(false),
    alive = useRef(true);
  const release = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const echoCancel = useRef<() => void>(() => {}),
    echoTap = useRef<{ active: boolean; tap: (n: number) => void }>({
      active: false,
      tap: () => {},
    });
  const [fish, setFish] = useState(2);
  const paintAt = useRef(0);
  const state = useRef({ melody, selected, enabled, muted });
  state.current = { melody, selected, enabled, muted };
  useLayoutEffect(() => {
    const element = stage.current!;
    const resize = () => {
      const r = element.getBoundingClientRect();
      setLayout((previous) =>
        previous.width === r.width && previous.height === r.height
          ? previous
          : getPoolLayout(r.width, r.height),
      );
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const stop = useCallback(() => {
    audio.current?.stop();
    echoCancel.current();
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
    setFish(note);
    clearTimeout(release.current);
    release.current = setTimeout(() => {
      if (alive.current) setSounding(null);
    }, 260);
  }, []);
  const echo = usePoolEcho(audio, flash);
  echoCancel.current = echo.cancel;
  echoTap.current = { active: echo.active, tap: echo.tap };
  const playNote = useCallback(
    (note: number) => {
      if (!state.current.enabled || document.hidden) return;
      if (echoTap.current.active) {
        echoTap.current.tap(note);
        return;
      }
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
      data-pool-motion={motion && enabled}
    >
      <header className="pool-heading">
        <div>
          <BackLink href="#play/create" className="pool-back">
            <ArrowLeft size={18} />
            Back to the play room
          </BackLink>
          <p className="eyebrow">Aquarium · Music Pool</p>
          <h1>Make a little ripple.</h1>
          <p>Paint the water. Or follow a little fish.</p>
        </div>
        <div className="pool-switches">
          <PoolMission
            melody={melody}
            onOpen={stop}
            onStart={() => {
              stop();
              echo.free();
              onChange([0, 1, 2, 3, 0, 1, 2, 3]);
              setSelected(7);
            }}
          />
          <button
            onClick={() => {
              stop();
              setMuted(!muted);
            }}
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
        ref={stage}
        className="pool-stage"
        aria-label="Five-note water instrument"
        data-echo-phase={echo.phase}
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button,a")) return;
          view.current?.splash(event.clientX, event.clientY);
          if (!echo.active) {
            const r = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - r.left) / r.width) * 100;
            const n = layout.notes.reduce(
              (best, p, i) =>
                Math.abs(p.x - x) < Math.abs(layout.notes[best].x - x)
                  ? i
                  : best,
              0,
            );
            paintAt.current = performance.now();
            playNote(n);
          }
        }}
        onPointerMove={(event) => {
          if (
            event.pointerType !== "mouse" ||
            !event.buttons ||
            echo.active ||
            (event.target as HTMLElement).closest("button,a")
          )
            return;
          if (performance.now() - paintAt.current < 140) return;
          paintAt.current = performance.now();
          const r = event.currentTarget.getBoundingClientRect(),
            x = ((event.clientX - r.left) / r.width) * 100;
          const n = layout.notes.reduce(
            (best, p, i) =>
              Math.abs(p.x - x) < Math.abs(layout.notes[best].x - x) ? i : best,
            0,
          );
          view.current?.splash(event.clientX, event.clientY);
          playNote(n);
        }}
      >
        <MusicPoolView
          ref={view}
          motion={motion}
          active={enabled}
          layout={layout}
        />
        <div className="pool-play-modes" aria-label="Pool play modes">
          <button
            aria-pressed={!echo.active}
            onClick={() => {
              stop();
              echo.free();
            }}
          >
            Paint a tune
          </button>
          <button
            aria-pressed={echo.active}
            onClick={() => {
              stop();
              void echo.start();
            }}
            disabled={!enabled || muted}
          >
            {echo.phase === "watch"
              ? "Watch the fish…"
              : echo.phase === "answer"
                ? "Start trail again"
                : "Follow the fish"}{" "}
            ↗
          </button>
        </div>
        <div
          className={`pool-guide-fish ${echo.phase === "won" ? "fish-cheer" : ""}`}
          style={{
            left: layout.notes[fish].x + "%",
            top: layout.notes[fish].y - 9 + "%",
            color: poolNotes[fish].color,
          }}
        >
          <PoolFish />
        </div>
        <div
          className="pool-ambient-fish"
          style={{
            animationPlayState: motion && enabled ? "running" : "paused",
          }}
        >
          <PoolFish />
        </div>
        {echo.active && (
          <div className="pool-echo-coach">
            <span role="status">
              {echo.message}{" "}
              {echo.phase === "answer" ? `${echo.position}/${echo.total}` : ""}
            </span>
            {echo.phase === "won" ? (
              <button
                onClick={() => {
                  stop();
                  void echo.next();
                }}
              >
                Another trail ↗
              </button>
            ) : echo.phase === "idle" ? (
              <button
                disabled={!enabled || muted}
                onClick={() => void echo.start()}
              >
                Play fish trail ▶
              </button>
            ) : null}
          </div>
        )}
        <span
          className="pool-register pool-low"
          style={{ left: layout.surface.left + "%" }}
        >
          Lower notes
        </span>
        <span
          className="pool-register pool-high"
          style={{ right: layout.surface.left + "%" }}
        >
          Higher notes
        </span>
        {poolNotes.map((note, i) => (
          <button
            key={note.name}
            className={"pool-pad" + (sounding === i ? " is-sounding" : "")}
            style={
              {
                left: layout.notes[i].x + "%",
                top: layout.notes[i].y + "%",
                width: layout.padSize,
                "--note-color": note.color,
              } as CSSProperties
            }
            aria-label={"Play " + note.name}
            disabled={!enabled}
            onClick={() => playNote(i)}
          >
            <span className="pool-pad-light" />
            <strong>{note.name}</strong>
          </button>
        ))}
        <p className="pool-key-hint">Try your keyboard: A S D F G</p>
      </section>
      <section
        className="pool-composer"
        aria-label="Your melody"
        data-echo-active={echo.active}
      >
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
              disabled={echo.active}
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
            disabled={
              !enabled || echo.active || !melody.some((n) => n !== null)
            }
          >
            {playing ? <Square size={18} /> : <Play size={18} />}{" "}
            {playing ? "Stop" : "Play my melody"}
          </button>
          <button
            className="pool-clear"
            aria-label="Clear melody"
            disabled={echo.active}
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
                  : "Tap the water to paint a tune.")}
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
