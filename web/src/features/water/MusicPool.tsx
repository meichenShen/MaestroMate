import {t,useLocale} from "../../i18n/locale";
import { BackLink } from "../../navigation/BackLink";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, } from "react";
import { ArrowLeft, Play, Square, RotateCcw, Volume2, VolumeX, Waves, } from "lucide-react";
import { MusicPoolView, type PoolViewHandle, } from "../../components/MusicPoolView";
import { preloadPiano } from "./piano";
import { melodyIdeas } from "../creation/music";
import { PoolAudio, type PitchedInstrument } from "./audio";
import { emptyMelody, poolNotes, putNote, type Melody } from "./model";
import { getPoolLayout } from "./layout";
import "./music-pool.css";
import { PoolMission } from "./PoolMission";
import { usePoolEcho } from "./usePoolEcho";
import { PoolFish } from "./PoolFish";
export function MusicPool({ melody, onChange, enabled, }: {
    melody: Melody;
    onChange: (m: Melody) => void;
    enabled: boolean;
}) {
    useLocale();
    const [instrument,setInstrument]=useState<PitchedInstrument>("piano"), [idea,setIdea]=useState(0);
    const [selected, setSelected] = useState(0), [playing, setPlaying] = useState(false), [sounding, setSounding] = useState<number | null>(null), [beat, setBeat] = useState<number | null>(null);
    const [error, setError] = useState(""), [muted, setMuted] = useState(false), [motion, setMotion] = useState(() => !matchMedia("(prefers-reduced-motion: reduce)").matches);
    const [layout, setLayout] = useState(() => getPoolLayout(900, 360));
    const stage = useRef<HTMLElement>(null);
    const view = useRef<PoolViewHandle>(null), audio = useRef<PoolAudio | null>(null), playingRef = useRef(false), alive = useRef(true);
    const release = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const echoCancel = useRef<() => void>(() => { }), echoTap = useRef<{
        active: boolean;
        tap: (n: number) => void;
    }>({
        active: false,
        tap: () => { },
    });
    const [fish, setFish] = useState(2);
    const paintAt = useRef(0);
    const state = useRef({ melody, selected, enabled, muted });
    state.current = { melody, selected, enabled, muted };
    useLayoutEffect(() => {
        const element = stage.current!;
        const resize = () => {
            const r = element.getBoundingClientRect();
            setLayout((previous) => previous.width === r.width && previous.height === r.height
                ? previous
                : getPoolLayout(r.width, r.height));
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
        audio.current?.setInstrument(instrument);
        if(enabled && instrument === "piano") void preloadPiano().catch(()=>{});
    },[instrument,enabled]);
    useEffect(() => {
        if (!enabled)
            stop();
    }, [enabled, stop]);
    useEffect(() => {
        audio.current?.setVolume(muted ? 0 : 0.2);
    }, [muted]);
    useEffect(() => {
        const hide = () => {
            if (document.hidden)
                stop();
        };
        document.addEventListener("visibilitychange", hide);
        const reduce = matchMedia("(prefers-reduced-motion: reduce)"), change = () => {
            if (reduce.matches)
                setMotion(false);
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
            if (alive.current)
                setSounding(null);
        }, 260);
    }, []);
    const echo = usePoolEcho(audio, flash);
    echoCancel.current = echo.cancel;
    echoTap.current = { active: echo.active, tap: echo.tap };
    const playNote = useCallback((note: number) => {
        if (!state.current.enabled || document.hidden)
            return;
        if (echoTap.current.active) {
            echoTap.current.tap(note);
            return;
        }
        if (playingRef.current)
            stop();
        onChange(putNote(state.current.melody, state.current.selected, note));
        setSelected((state.current.selected + 1) % 8);
        flash(note);
        void audio.current
            ?.note(note)
            .then((started) => {
            if (started && alive.current)
                setError("");
        })
            .catch(() => {
            if (alive.current)
                setError("Sound isn’t available right now. You can still arrange your notes.");
        });
    }, [flash, onChange, stop]);
    useEffect(() => {
        const keys = (event: KeyboardEvent) => {
            if (event.repeat ||
                event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                document.querySelector("dialog[open]"))
                return;
            if ((event.target as HTMLElement).closest('input,textarea,select,[contenteditable="true"]'))
                return;
            const note = poolNotes.findIndex((n) => n.key.toLowerCase() === event.key.toLowerCase());
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
        if (!enabled || !melody.some((n) => n !== null))
            return;
        playingRef.current = true;
        setPlaying(true);
        setError("");
        void audio.current
            ?.play([...melody], (step) => {
            setBeat(step);
            const note = melody[step];
            if (note !== null)
                flash(note);
        }, () => {
            if (alive.current) {
                playingRef.current = false;
                setPlaying(false);
                setBeat(null);
            }
        })
            .catch(() => {
            if (alive.current) {
                stop();
                setError("Sound isn’t available right now. You can still arrange your notes.");
            }
        });
    };
    return (<main id="main" tabIndex={-1} className="pool-room" data-pool-playing={playing} data-pool-motion={motion && enabled}>
      <header className="pool-heading">
        <div>
          <BackLink href="#play/create" className="pool-back">
            <ArrowLeft size={18}/>{t("Back to Create & play")}</BackLink>
          <p className="eyebrow">{t("Aquarium \u00B7 Music Pool")}</p>
          <h1>{t("Music Pool")}</h1>
          <p>{t("Tap a light. Make a tune.")}</p>
        </div>
        <div className="pool-switches">
          <label className="pool-instrument">{t("Instrument")}<select aria-label={t("Creative instrument")} value={instrument} disabled={!enabled} onChange={e=>{stop();setInstrument(e.target.value as PitchedInstrument)}}><option value="piano">{t("Piano")}</option><option value="glass">{t("Glass bells")}</option><option value="pluck">{t("Bright pluck")}</option></select></label>
          <PoolMission melody={melody} onOpen={stop} onStart={() => {
            stop();
            echo.free();
            onChange([0, 1, 2, 3, 0, 1, 2, 3]);
            setSelected(7);
        }}/>
          <button onClick={() => {
            stop();
            setMuted(!muted);
        }} aria-pressed={!muted} aria-label={t(muted ? "Unmute instrument" : "Mute instrument")}>
            {t(muted ? <VolumeX size={19}/> : <Volume2 size={19}/>)}
            <span>{t(muted ? "Sound off" : "Sound on")}</span>
          </button>
          <button onClick={() => setMotion(!motion)} aria-pressed={motion}>
            <Waves size={19}/>
            <span>{t("Motion ")}{t(motion ? "on" : "off")}</span>
          </button>
        </div>
      </header>
      <section ref={stage} className="pool-stage" aria-label={t("Five-note water instrument")} data-echo-phase={echo.phase} onPointerDown={(event) => {
            if ((event.target as HTMLElement).closest("button,a"))
                return;
            view.current?.splash(event.clientX, event.clientY);
            if (!echo.active) {
                const r = event.currentTarget.getBoundingClientRect();
                const x = ((event.clientX - r.left) / r.width) * 100;
                const n = layout.notes.reduce((best, p, i) => Math.abs(p.x - x) < Math.abs(layout.notes[best].x - x)
                    ? i
                    : best, 0);
                paintAt.current = performance.now();
                playNote(n);
            }
        }} onPointerMove={(event) => {
            if (event.pointerType !== "mouse" ||
                !event.buttons ||
                echo.active ||
                (event.target as HTMLElement).closest("button,a"))
                return;
            if (performance.now() - paintAt.current < 140)
                return;
            paintAt.current = performance.now();
            const r = event.currentTarget.getBoundingClientRect(), x = ((event.clientX - r.left) / r.width) * 100;
            const n = layout.notes.reduce((best, p, i) => Math.abs(p.x - x) < Math.abs(layout.notes[best].x - x) ? i : best, 0);
            view.current?.splash(event.clientX, event.clientY);
            playNote(n);
        }}>
        <MusicPoolView ref={view} motion={motion} active={enabled} layout={layout}/>
        <div className="pool-play-modes" aria-label={t("Pool play modes")}>
          <button aria-pressed={!echo.active} onClick={() => {
            stop();
            echo.free();
        }}>{t("Paint a tune")}</button>
          <button aria-pressed={echo.active} onClick={() => {
            stop();
            void echo.start();
        }} disabled={!enabled || muted}>
            {t(echo.phase === "watch"
            ? "Watch the fish…"
            : echo.phase === "answer"
                ? "Start trail again"
                : "Follow the fish")}{t(" ")}{t("\u2197")}</button>
        </div>
        <div className={`pool-guide-fish ${echo.phase === "won" ? "fish-cheer" : ""}`} style={{
            left: layout.notes[fish].x + "%",
            top: layout.notes[fish].y - 9 + "%",
            color: poolNotes[fish].color,
        }}>
          <PoolFish />
        </div>
        <div className="pool-ambient-fish" style={{
            animationPlayState: motion && enabled ? "running" : "paused",
        }}>
          <PoolFish />
        </div>
        {t(echo.active && (<div className="pool-echo-coach">
            <span role="status">
              {t(echo.message)}{t(" ")}
              {t(echo.phase === "answer" ? `${echo.position}/${echo.total}` : "")}
            </span>
            {t(echo.phase === "won" ? (<button onClick={() => {
                    stop();
                    void echo.next();
                }}>{t("Another trail \u2197")}</button>) : echo.phase === "idle" ? (<button disabled={!enabled || muted} onClick={() => void echo.start()}>{t("Play fish trail \u25B6")}</button>) : null)}
          </div>))}
        <span className="pool-register pool-low" style={{ left: layout.surface.left + "%" }}>{t("Lower notes")}</span>
        <span className="pool-register pool-high" style={{ right: layout.surface.left + "%" }}>{t("Higher notes")}</span>
        {t(poolNotes.map((note, i) => (<button key={note.name} className={"pool-pad" + (sounding === i ? " is-sounding" : "")} style={{
                left: layout.notes[i].x + "%",
                top: layout.notes[i].y + "%",
                width: layout.padSize,
                "--note-color": note.color,
            } as CSSProperties} aria-label={t("Play " + note.name)} disabled={!enabled} onClick={() => playNote(i)}>
            <span className="pool-pad-light"/>
            <strong>{t(note.name)}</strong>
          </button>)))}
        <p className="pool-key-hint">{t("Try your keyboard: A S D F G")}</p>
      </section>
      <section className="pool-composer" aria-label={t("Your melody")} data-echo-active={echo.active}>
        <div className="pool-sequence-heading">
          <h2>{t("Your little melody")}</h2>
          <p>{t("Pick a step to change it.")}</p>
          <span>{t(melody.filter((n) => n !== null).length)}{t(" / 8 notes")}</span>
        </div>
        <div className="pool-sequence" role="group" aria-label={t("Eight melody steps")}>
          {t(melody.map((note, i) => (<button key={i} className={"pool-step" +
                (selected === i ? " is-selected" : "") +
                (beat === i ? " is-playing" : "")} style={note !== null
                ? ({ "--note-color": poolNotes[note].color } as CSSProperties)
                : undefined} aria-label={t("Step " +
            (i + 1) +
            ": " +
            (note === null ? "empty" : poolNotes[note].name))} aria-pressed={selected === i} disabled={echo.active} onClick={() => {
                stop();
                setSelected(i);
                if (note !== null) {
                    flash(note);
                    void audio.current
                        ?.note(note)
                        .catch(() => setError("Sound couldn’t start. Your notes are still here."));
                }
            }} onKeyDown={(event) => {
                if (event.key === "Delete" || event.key === "Backspace") {
                    event.preventDefault();
                    stop();
                    onChange(putNote(melody, i, null));
                }
            }}>
              <span>{t(i + 1)}</span>
              <strong>{t(note === null ? "·" : poolNotes[note].name)}</strong>
            </button>)))}
        </div>
        <div className="pool-actions">
          <button className="solid-button" aria-label={t(playing ? "Stop melody" : "Play melody")} onClick={replay} disabled={!enabled || echo.active || !melody.some((n) => n !== null)}>
            {t(playing ? <Square size={18}/> : <Play size={18}/>)}{t(" ")}
            {t(playing ? "Stop" : "Play my melody")}
          </button>
          <button className="pool-clear" disabled={!enabled || echo.active} onClick={()=>{stop();onChange([...melodyIdeas[idea % melodyIdeas.length]]);setIdea(idea+1);setSelected(0)}}>{t("Try an idea")}</button>
          <button className="pool-clear" aria-label={t("Clear melody")} disabled={echo.active} onClick={() => {
            stop();
            onChange(emptyMelody());
            setSelected(0);
        }}>
            <RotateCcw size={17}/>{t("Start fresh")}</button>
          <p className="pool-feedback" role={error ? "alert" : "status"}>
            {t(error ||
            (playing
                ? "That’s your melody."
                : muted
                    ? "Sound is off. Your notes still make ripples."
                    : "Tap a light. Fill the steps. Press Play."))}
          </p>
        </div>
      </section>
      <p className="pool-footnote">{t("Piano and original synth sounds · not the Aquarium recording.")} <a href="/audio/piano/ATTRIBUTION.txt" target="_blank" rel="noreferrer">{t("Sound credits")}</a></p>
    </main>);
}
