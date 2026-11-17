import { useEffect, useRef, useState } from "react";
import {
  Lightbulb,
  Play,
  Square,
  Check,
  Fish,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  playWorks,
  emptyAnswer,
  evaluateGame,
  workshopDone,
  type WorkPlaySet,
  type WorkshopProgress,
  type GameAnswer,
} from "../../content/play/aquarium";
import { GamePieces, GameGlyph } from "./GamePieces";
import { useWorkshopSound } from "./useWorkshopSound";
import "./workshop.css";
export function AquariumWorkshop({
  workId = "aquarium",
  ...props
}: {
  workId?: string;
  progress: WorkshopProgress;
  onChange: (p: WorkshopProgress) => void;
  enabled: boolean;
  journey?: boolean;
  startLevel?: number;
}) {
  const work = playWorks[workId];
  return work ? (
    <WorkshopBoard
      key={`${workId}:${props.startLevel || 0}`}
      work={work}
      {...props}
    />
  ) : (
    <main id="main" tabIndex={-1} className="page-room unavailable-play">
      <h1>This work is still backstage.</h1>
      <a href="#play">Choose an available work ↗</a>
    </main>
  );
}
function WorkshopBoard({
  work,
  progress,
  onChange,
  enabled,
  journey = false,
  startLevel = 0,
}: {
  work: WorkPlaySet;
  progress: WorkshopProgress;
  onChange: (p: WorkshopProgress) => void;
  enabled: boolean;
  journey?: boolean;
  startLevel?: number;
}) {
  const [index, setIndex] = useState(() =>
      Math.max(
        0,
        work.games.findIndex((g) => g.level === startLevel),
      ),
    ),
    [slot, setSlot] = useState(3),
    [nudge, setNudge] = useState(true),
    [attempt, setAttempt] = useState(0);
  const sound = useWorkshopSound(enabled),
    help = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null),
    heading = useRef<HTMLHeadingElement>(null),
    latest = useRef(progress);
  latest.current = progress;
  const g = work.games[index],
    a = progress[g.id] || {
      ...emptyAnswer(),
      notes:
        g.kind === "variation" ? [0, 1, 2, null] : [null, null, null, null],
    },
    result = evaluateGame(g, a),
    done = workshopDone(progress, work.games),
    levels = ["Notice", "Explore", "Invent"];
  const changeGame = (i: number) => {
    sound.stop();
    setIndex(i);
    setSlot(3);
    setNudge(true);
    setAttempt(0);
    requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
  };
  useEffect(() => {
    if (!enabled) help.current?.close();
  }, [enabled]);
  const edit = (patch: Partial<GameAnswer>, instant = false) => {
    const next = { ...a, ...patch, checked: instant || patch.checked === true };
    onChange({ ...latest.current, [g.id]: next });
    setNudge(false);
    if (instant) setAttempt((v) => v + 1);
  };
  const check = () => {
    edit({ checked: true });
    setAttempt((v) => v + 1);
  };
  const preview = () => {
    if (sound.playing) return sound.stop();
    if (g.kind === "variation")
      void sound.practice([...a.notes, null, null, null, null]);
    else if (g.kind === "rhythm")
      void sound.practice(a.beats.map((on) => (on ? 0 : null)));
    else {
      const notes = a.picks.flatMap((n) => (n === 0 ? [0, 2] : [4, 3]));
      void sound.practice([...notes, null, null].slice(0, 8));
    }
  };
  const ready =
    g.kind === "variation"
      ? a.notes.every((n) => n !== null)
      : g.kind === "rhythm"
        ? a.beats.some(Boolean)
        : g.kind === "multi"
          ? a.picks.length > 0
          : a.picks.length === 3;
  const checked = a.checked,
    success = checked && result.correct,
    recordingActive = sound.recording.playing;
  return (
    <main
      id="main"
      tabIndex={-1}
      className="workshop page-room"
      data-game={g.id}
      data-active={enabled}
    >
      <header className="workshop-top">
        <div>
          <a href={journey ? "#program" : "#play"}>
            ← {journey ? "Your Program" : "Play by work"}
          </a>
          <p>
            {work.title} <span>· {work.composer}</span>
          </p>
        </div>
        <div className="workshop-top-actions">
          <span aria-label="Discoveries completed">
            {done.filter(Boolean).length}/{work.games.length} discoveries
          </span>
          <button
            aria-label={sound.muted ? "Turn sound on" : "Turn sound off"}
            onClick={sound.toggleMute}
          >
            {sound.muted ? <VolumeX /> : <Volume2 />}
          </button>
          <a href={work.listenHash} aria-label={"Listen to " + work.title}>
            <Play /> Listen
          </a>
        </div>
      </header>
      <nav className="workshop-levels" aria-label="Difficulty">
        {levels.map((name, l) => (
          <button
            key={name}
            aria-current={g.level === l ? "step" : undefined}
            onClick={() =>
              changeGame(work.games.findIndex((x) => x.level === l))
            }
          >
            <span>{["Easy", "Medium", "Hard"][l]}</span>
            <strong>{name}</strong>
            <small>
              {work.games.filter((x, i) => x.level === l && done[i]).length}/4
            </small>
          </button>
        ))}
      </nav>
      <nav className="game-islands" aria-label="Games in this level">
        {work.games.map((x, i) =>
          x.level === g.level ? (
            <button
              key={x.id}
              aria-label={x.title}
              aria-current={i === index ? "step" : undefined}
              onClick={() => changeGame(i)}
            >
              <span className="island-number">0{(i % 4) + 1}</span>
              <GameGlyph
                kind={
                  x.options[0]?.icon ||
                  (x.kind === "rhythm" ? "waves" : "spark")
                }
              />
              <span>{x.title}</span>
              {done[i] && <Check className="island-check" />}
            </button>
          ) : null,
        )}
      </nav>
      <section
        className={`workshop-stage ${checked ? (success ? "discovered" : "try-again") : ""}`}
        key={g.id}
        aria-labelledby="workshop-title"
      >
        <div className="workshop-question">
          <div>
            <h1 id="workshop-title" ref={heading} tabIndex={-1}>
              {g.title}
            </h1>
            <p>{g.prompt}</p>
          </div>
          <button
            ref={opener}
            className="clue-button"
            onClick={() => {
              sound.stop();
              help.current?.showModal();
            }}
            aria-label="Open a little clue"
          >
            <Lightbulb />
            <span>A little clue</span>
          </button>
        </div>
        {g.clips && (
          <div
            className="recording-bubbles"
            aria-label="Passages from Aquarium"
          >
            {g.clips.map((c) => (
              <button
                key={c.label}
                disabled={!enabled || sound.muted}
                aria-pressed={
                  recordingActive && sound.recording.clipLabel === c.label
                }
                onClick={() => sound.clip(c)}
              >
                {recordingActive && sound.recording.clipLabel === c.label ? (
                  <Square />
                ) : (
                  <Play />
                )}
                <span>{c.label}</span>
              </button>
            ))}
            <small>
              {g.practice
                ? "Aquarium inspiration · below, your own miniature"
                : "From the Aquarium recording"}
            </small>
          </div>
        )}
        <div className="game-playfield">
          <GamePieces
            game={g}
            answer={a}
            sound={sound}
            slot={slot}
            onSlot={setSlot}
            onEdit={edit}
          />
          {nudge && !checked && (
            <div className="coach-bubble" aria-hidden="true">
              {g.kind === "choice"
                ? "Tap a picture ↗"
                : g.kind === "multi"
                  ? "Tap to collect ＋"
                  : g.kind === "rhythm"
                    ? "Light a beat ↓"
                    : g.kind === "variation"
                      ? "Pick your ending ↓"
                      : "Tap cards to fill the spaces ↑"}
            </div>
          )}
          {success && (
            <div className="discovery-swim" key={attempt} aria-hidden="true">
              <Fish />
              <span>Discovery!</span>
              <Fish />
            </div>
          )}
        </div>
        <div className="workshop-dock">
          <p role={sound.error ? "alert" : "status"}>
            {sound.error ||
              (checked
                ? success
                  ? g.learn
                  : result.message
                : g.kind === "choice"
                  ? "Hear it. Tap your choice."
                  : g.kind === "multi"
                    ? `${a.picks.length} collected`
                    : "Your turn. Make something happen.")}
          </p>
          <div className="dock-buttons">
            {g.practice && (
              <button
                className="practice-button"
                disabled={!enabled || sound.muted || !ready}
                onClick={preview}
              >
                {sound.playing ? <Square /> : <Play />}
                {sound.playing ? "Stop" : "Hear mine"}
              </button>
            )}
            {g.kind !== "choice" && !success && (
              <button
                className="solid-button check-game"
                disabled={!ready}
                onClick={check}
              >
                Try it <Check />
              </button>
            )}
            {success && index < work.games.length - 1 && (
              <button
                className="solid-button next-popup"
                onClick={() => changeGame(index + 1)}
              >
                Next game ↗
              </button>
            )}
            {success && index === work.games.length - 1 && (
              <a
                className="solid-button"
                href={journey ? "#program/aquarium/done" : "#play/pool"}
              >
                {journey ? "Finish Program" : "Make a splash"} ↗
              </a>
            )}
          </div>
        </div>
      </section>
      <footer className="workshop-footer">
        <button disabled={index === 0} onClick={() => changeGame(index - 1)}>
          ← Previous
        </button>
        <div>
          <button
            className="start-over-game"
            onClick={() => {
              sound.stop();
              edit({
                ...emptyAnswer(),
                notes:
                  g.kind === "variation"
                    ? [0, 1, 2, null]
                    : [null, null, null, null],
              });
              setSlot(3);
              setNudge(true);
            }}
          >
            Reset this game ↺
          </button>
          <a href={work.chatHash}>Visit Camille ↗</a>
        </div>
        {index < work.games.length - 1 ? (
          <button onClick={() => changeGame(index + 1)}>Explore next →</button>
        ) : (
          <a href={journey ? "#program/aquarium/done" : "#play/pool"}>
            {journey ? "Finish Program" : "Music Pool"} ↗
          </a>
        )}
      </footer>
      <dialog
        ref={help}
        className="workshop-help"
        aria-labelledby="clue-title"
        data-lenis-prevent
        onClose={() => opener.current?.focus({ preventScroll: true })}
      >
        <Lightbulb />
        <h2 id="clue-title">One little clue</h2>
        <p>{g.hint}</p>
        <details>
          <summary>Why this belongs in Aquarium</summary>
          <p>{g.learn}</p>
          <a href={g.source} target="_blank" rel="noreferrer">
            Source ↗
          </a>
        </details>
        <button className="solid-button" onClick={() => help.current?.close()}>
          Let me try ↗
        </button>
      </dialog>
    </main>
  );
}
