import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BookOpen, Check, Play, Square, Volume2, VolumeX } from "lucide-react";
import {
  resolveUnit,
  resolveUnitInArea,
  type LearningArea,
  units,
  checksDone,
  unitDone,
  emptyUnitProgress,
  type CurriculumProgress,
  type UnitProgress,
} from "../../content/curriculum";
import { references } from "../../content/knowledge/sources";
import { useWorkshopSound } from "../workshop/useWorkshopSound";
import { GameGlyph } from "../workshop/GamePieces";
import { unitHash } from "./PlayCatalog";
import { LessonVisual, NoteRibbon } from "./LessonVisual";
import { CreationBoard } from "./CreationBoard";
import "./curriculum.css";
export function LessonRoom(props: {
  unitId: string;
  area: LearningArea;
  workId?: string;
  progress: CurriculumProgress;
  onChange: (id: string, p: UnitProgress) => void;
  enabled: boolean;
  journey?: boolean;
  onSendToPool: (notes: (number | null)[]) => void;
}) {
  const candidate = resolveUnitInArea(props.unitId, props.area, props.workId);
  const unit =
    props.journey && candidate?.area !== "works" ? undefined : candidate;
  if (!unit)
    return (
      <main id="main" tabIndex={-1} className="page-room unavailable-play">
        <h1>This lesson is still backstage.</h1>
        <a href="#play">Back to Play</a>
      </main>
    );
  return (
    <LessonWorkspace key={unit.id + !!props.journey} unit={unit} {...props} />
  );
}
function LessonWorkspace({
  unit: u,
  progress,
  onChange,
  enabled,
  journey = false,
  onSendToPool,
}: {
  unit: NonNullable<ReturnType<typeof resolveUnit>>;
  progress: CurriculumProgress;
  onChange: (id: string, p: UnitProgress) => void;
  enabled: boolean;
  journey?: boolean;
  onSendToPool: (notes: (number | null)[]) => void;
}) {
  const p = progress[u.id] || emptyUnitProgress(u),
    [phase, setPhase] = useState<"learn" | "try" | "make">("learn"),
    [question, setQuestion] = useState(0);
  const sound = useWorkshopSound(enabled),
    dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const siblings = units.filter((x) => x.area === u.area),
    position = siblings.findIndex((x) => x.id === u.id),
    allChecks = checksDone(u, p),
    q = u.checks[question],
    selected = p.answers[question],
    checked = p.checked[question],
    correct = checked && selected === q.answer;
  const patch = (next: Partial<UnitProgress>) =>
    onChange(u.id, { ...p, ...next });
  const changePhase = (next: typeof phase) => {
    sound.stop();
    setPhase(next);
    requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
  };
  const nextQuestion = () => {
    sound.stop();
    setQuestion(1);
    requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
  };
  useEffect(() => {
    if (!enabled) dialog.current?.close();
  }, [enabled]);
  return (
    <main
      id="main"
      tabIndex={-1}
      className="lesson-room page-room"
      data-unit={u.id}
      data-phase={phase}
      style={{ "--unit-colour": u.colour } as CSSProperties}
    >
      <header className="lesson-top">
        <div>
          <a href={journey ? "#program" : "#play/" + u.area}>
            {journey
              ? "Your Aquarium Program"
              : "Back to " +
                (u.area === "works" ? "Aquarium discoveries" : "Music lessons")}
          </a>
          <p>
            {u.area === "works" ? "Aquarium · Saint-Saëns" : "Music lessons"}{" "}
            <span>
              {position + 1} / {siblings.length}
            </span>
          </p>
        </div>
        <div className="lesson-tools">
          <button
            onClick={sound.toggleMute}
            aria-label={sound.muted ? "Turn sound on" : "Turn sound off"}
          >
            {sound.muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
            <span>Sound {sound.muted ? "off" : "on"}</span>
          </button>
          <button
            ref={opener}
            onClick={() => {
              sound.stop();
              dialog.current?.showModal();
            }}
          >
            <BookOpen size={18} />
            Sources & notes
          </button>
          {journey && (
            <nav className="lesson-program-links" aria-label="Your Program">
              <a href="#program/aquarium/listen">Listen</a>
              <a href="#program/aquarium/chat">Chat</a>
              <a href="#program/aquarium/learn" aria-current="step">
                Play
              </a>
              <a href="#program/aquarium/done">Finish visit</a>
            </nav>
          )}
        </div>
      </header>
      <nav
        className="lesson-unit-rail"
        aria-label={
          u.area === "works" ? "Aquarium discoveries" : "Music lessons"
        }
      >
        {siblings.map((x) => (
          <a
            href={unitHash(x.id, journey)}
            key={x.id}
            aria-current={x.id === u.id ? "page" : undefined}
          >
            {x.title}
            {unitDone(x, progress[x.id]) && <Check size={17} />}
          </a>
        ))}
      </nav>
      <section className="lesson-stage" aria-labelledby="lesson-title">
        <div className="lesson-stage-top">
          <p className="lesson-concept">{u.concept}</p>
          <nav className="lesson-phases" aria-label="Lesson steps">
            <button
              aria-current={phase === "learn" ? "step" : undefined}
              onClick={() => changePhase("learn")}
            >
              Learn
            </button>
            <button
              aria-current={phase === "try" ? "step" : undefined}
              onClick={() => changePhase("try")}
            >
              Try
            </button>
            <button
              aria-current={phase === "make" ? "step" : undefined}
              disabled={!allChecks}
              onClick={() => changePhase("make")}
            >
              Make {allChecks && <Check size={14} />}
            </button>
          </nav>
        </div>
        <header className="lesson-question">
          <div>
            <h1 ref={heading} id="lesson-title" tabIndex={-1}>
              {phase === "learn"
                ? u.title
                : phase === "try"
                  ? q.prompt
                  : u.makeTitle}
            </h1>
            <p>
              {phase === "learn"
                ? u.invitation
                : phase === "try"
                  ? "Choose a picture. Then check your idea."
                  : u.makePrompt}
            </p>
          </div>
          {u.clip && phase !== "make" && (
            <button
              className="lesson-recording"
              aria-label={u.clip.label}
              aria-description="Full-mix recording excerpt"
              disabled={!enabled || sound.muted}
              onClick={() => sound.clip(u.clip!)}
            >
              {sound.recording.playing &&
              sound.recording.clipLabel === u.clip.label ? (
                <Square size={18} />
              ) : (
                <Play size={18} />
              )}
              <span>
                {u.clip.label}
                <small className="full-mix-label">Full mix</small>
              </span>
            </button>
          )}
        </header>
        <div className="lesson-content" key={phase + "-" + question}>
          {phase === "learn" ? (
            <div className="lesson-learn">
              <div className="lesson-demonstration">
                <LessonVisual unit={u} sound={sound} enabled={enabled} />
              </div>
              <aside className="lesson-teaching">
                <span className="teaching-mark">
                  <BookOpen size={22} />
                </span>
                <p>{u.teach}</p>
                <span className="teaching-invitation">
                  Try the controls. You can come back to this.
                </span>
              </aside>
            </div>
          ) : phase === "try" ? (
            <div className="lesson-practice">
              {q.notes && (
                <div className="question-example">
                  <NoteRibbon notes={q.notes} beat={sound.beat} />
                  <button
                    disabled={!enabled || sound.muted}
                    onClick={() =>
                      sound.playing
                        ? sound.stop()
                        : void sound.practice(q.notes!)
                    }
                  >
                    {sound.playing ? <Square size={18} /> : <Play size={18} />}
                    Hear the example
                  </button>
                </div>
              )}
              <div className={"answer-pictures options-" + q.options.length}>
                {q.options.map((o, i) => (
                  <button
                    key={o.label}
                    aria-label={o.label}
                    aria-pressed={selected === i}
                    disabled={!enabled}
                    onClick={() =>
                      patch({
                        answers: p.answers.map((v, j) =>
                          j === question ? i : v,
                        ),
                        checked: p.checked.map((v, j) =>
                          j === question ? false : v,
                        ),
                        made: false,
                      })
                    }
                  >
                    <GameGlyph kind={o.icon} />
                    <strong>{o.label}</strong>
                    <span>{selected === i ? "Your choice" : "Choose"}</span>
                  </button>
                ))}
              </div>
              <div
                className="lesson-feedback"
                role="status"
                data-feedback={
                  checked ? (correct ? "correct" : "retry") : "waiting"
                }
              >
                {checked ? (
                  <>
                    <strong>
                      {correct ? "You’ve got it." : "Let’s look again."}
                    </strong>
                    <span>{q.explanation}</span>
                  </>
                ) : (
                  <span>Trust your ears. There’s time to try again.</span>
                )}
              </div>
            </div>
          ) : (
            <CreationBoard
              unit={u}
              progress={p}
              onChange={(next) => onChange(u.id, next)}
              sound={sound}
              enabled={enabled}
              onSend={onSendToPool}
            />
          )}
        </div>
        <footer className="lesson-dock">
          <div>
            {sound.error ? (
              <p className="lesson-error" role="alert">
                {sound.error}
              </p>
            ) : (
              <p>
                {phase === "learn"
                  ? "Original visual and sound examples"
                  : phase === "try"
                    ? `Question ${question + 1} of 2`
                    : "Your music. Your decisions."}
              </p>
            )}
            {phase === "learn" && u.kind !== "colour" && (
              <span>Synthesised teaching model · not the recording</span>
            )}
          </div>
          <div className="lesson-dock-actions">
            {phase === "learn" ? (
              <button
                className="lesson-primary"
                onClick={() => {
                  setQuestion(0);
                  changePhase("try");
                }}
              >
                Start practice
              </button>
            ) : phase === "try" ? (
              <>
                <button
                  className="lesson-secondary"
                  onClick={() =>
                    question === 1
                      ? (sound.stop(), setQuestion(0))
                      : changePhase("learn")
                  }
                >
                  {question === 1 ? "Previous question" : "Back to learning"}
                </button>
                {!correct ? (
                  <button
                    className="lesson-primary"
                    disabled={selected === null || !enabled}
                    onClick={() =>
                      patch({
                        checked: p.checked.map((v, j) =>
                          j === question ? true : v,
                        ),
                      })
                    }
                  >
                    Check answer
                  </button>
                ) : (
                  <button
                    className="lesson-primary"
                    onClick={() =>
                      question === 0 ? nextQuestion() : changePhase("make")
                    }
                  >
                    {question === 0 ? "Next question" : "Make something"}
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  className="lesson-secondary"
                  onClick={() => changePhase("try")}
                >
                  Revisit practice
                </button>
                {p.made ? (
                  <a
                    className="lesson-primary"
                    href={
                      siblings[position + 1]
                        ? unitHash(siblings[position + 1].id, journey)
                        : journey
                          ? "#program/aquarium/done"
                          : "#play/" + u.area
                    }
                  >
                    {siblings[position + 1]
                      ? "Next discovery"
                      : journey
                        ? "Finish Program"
                        : "Back to discoveries"}
                  </a>
                ) : (
                  <span className="make-coach">Make it, then hear it.</span>
                )}
              </>
            )}
          </div>
        </footer>
      </section>
      <dialog
        ref={dialog}
        className="curriculum-dialog discovery-dialog"
        aria-labelledby="lesson-notes-title"
        data-lenis-prevent
        onClose={() => opener.current?.focus({ preventScroll: true })}
      >
        <header>
          <h2 id="lesson-notes-title">Behind this discovery</h2>
          <button onClick={() => dialog.current?.close()}>Close</button>
        </header>
        <p>{u.teach}</p>
        {u.context && (
          <section>
            <h3>{u.context.title}</h3>
            <p>{u.context.text}</p>
          </section>
        )}
        <h3>Read and listen further</h3>
        {u.sourceIds.map((id) => (
          <section key={id}>
            <a href={references[id].url} target="_blank" rel="noreferrer">
              {references[id].label}
            </a>
            <p>{references[id].note}</p>
          </section>
        ))}
        <p>
          Your progress stays during this visit. Refreshing the page starts a
          new visit.
        </p>
      </dialog>
    </main>
  );
}
