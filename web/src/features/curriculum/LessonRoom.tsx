import { BackLink } from "../../navigation/BackLink";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BookOpen, Check, Play, Square, Volume2, VolumeX } from "lucide-react";
import {
  resolveUnitInArea,
  units,
  emptyUnitProgress,
  unitDone,
  checkCorrect,
  type LearningArea,
  type CurriculumProgress,
  type UnitProgress,
} from "../../content/curriculum";
import { references } from "../../content/knowledge/sources";
import { navigate } from "../../navigation/routes";
import { useWorkshopSound } from "../workshop/useWorkshopSound";
import { GameGlyph } from "../workshop/GamePieces";
import { LessonVisual, NoteRibbon } from "./LessonVisual";
import { StoryVisual } from "./StoryVisual";
import { studyHash, studyParent, type StudyPhase } from "./study-flow";
import "./curriculum.css";
import "./study.css";
export function LessonRoom({
  unitId,
  area,
  workId,
  progress,
  onChange,
  enabled,
  journey = false,
  phase = "learn",
  question = 0,
}: {
  unitId: string;
  area: LearningArea;
  workId?: string;
  progress: CurriculumProgress;
  onChange: (id: string, p: UnitProgress) => void;
  enabled: boolean;
  journey?: boolean;
  phase?: StudyPhase;
  question?: number;
}) {
  const u = resolveUnitInArea(unitId, area, workId);
  if (!u || (journey && u.area !== "works"))
    return (
      <main id="main" className="page-room unavailable-play" tabIndex={-1}>
        <h1>This lesson is still backstage.</h1>
        <a href={"#play/" + area}>
          Back to {area === "works" ? "Aquarium discoveries" : "Music lessons"}
        </a>
      </main>
    );
  return (
    <StudyRoom
      key={u.id + journey}
      u={u}
      progress={progress}
      onChange={onChange}
      enabled={enabled}
      journey={journey}
      phase={phase}
      question={Math.min(Math.max(0, question), u.checks.length - 1)}
    />
  );
}
function StudyRoom({
  u,
  progress,
  onChange,
  enabled,
  journey,
  phase,
  question,
}: {
  u: NonNullable<ReturnType<typeof resolveUnitInArea>>;
  progress: CurriculumProgress;
  onChange: (id: string, p: UnitProgress) => void;
  enabled: boolean;
  journey: boolean;
  phase: StudyPhase;
  question: number;
}) {
  const p = progress[u.id] || emptyUnitProgress(u),
    q = u.checks[question],
    sound = useWorkshopSound(enabled);
  const heading = useRef<HTMLHeadingElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null);
  const [burst, setBurst] = useState(0);
  const siblings = units.filter((x) => x.area === u.area),
    position = siblings.findIndex((x) => x.id === u.id);
  const complete = unitDone(u, p),
    actualPhase = phase === "done" && !complete ? "try" : phase;
  const selected = p.answers[question],
    response = p.responses?.[question] || [],
    checked = p.checked[question],
    correct = checked && checkCorrect(q, selected, response);
  const patch = (next: Partial<UnitProgress>) =>
    onChange(u.id, { ...p, ...next });
  const go = (next: StudyPhase, index = 0) => {
    sound.stop();
    navigate(studyHash(u, journey, next, index));
  };
  useEffect(() => {
    sound.stop();
    requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
  }, [phase, question]);
  useEffect(() => {
    if (!enabled) dialog.current?.close();
  }, [enabled]);
  const updateResponse = (value: number[]) =>
    patch({
      responses: u.checks.map((_, i) =>
        i === question ? value : p.responses?.[i] || [],
      ),
      checked: p.checked.map((v, i) => (i === question ? false : v)),
    });
  const ready =
    q.interaction === "order"
      ? response.length === q.options.length
      : q.interaction === "pattern"
        ? response.length === q.target?.length
        : selected !== null;
  return (
    <main
      id="main"
      tabIndex={-1}
      className="lesson-room study-room page-room"
      data-unit={u.id}
      data-phase={actualPhase}
      style={{ "--unit-colour": u.colour } as CSSProperties}
    >
      <header className="study-top">
        <div>
          <BackLink href={studyParent(u, journey, actualPhase, question)}>
            {actualPhase === "learn"
              ? "← " +
                (journey
                  ? "Back to your conversation"
                  : u.area === "works"
                    ? "Back to Aquarium discoveries"
                    : "Back to Music lessons")
              : "← Back one step"}
          </BackLink>
          <p>
            {u.area === "works" ? "Aquarium discoveries" : "Music lessons"}{" "}
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
          {journey && <a href="#program/aquarium/done">Finish visit</a>}
        </div>
      </header>
      <section className="study-stage" aria-labelledby="lesson-title">
        <header className="study-heading">
          <div>
            <p className="study-kicker">
              {u.concept} ·{" "}
              {actualPhase === "learn"
                ? "Learn"
                : actualPhase === "try"
                  ? `Try ${question + 1} / ${u.checks.length}`
                  : "Complete"}
            </p>
            <h1 id="lesson-title" ref={heading} tabIndex={-1}>
              {actualPhase === "learn"
                ? u.title
                : actualPhase === "try"
                  ? q.prompt
                  : "A little more music, understood."}
            </h1>
          </div>
          {u.clip && actualPhase !== "done" && (
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
        <div className="study-body" key={actualPhase + question}>
          {actualPhase === "learn" ? (
            <div className="study-learn">
              <div className="study-visual">
                {[
                  "steps",
                  "people",
                  "timeline",
                  "recording",
                  "families",
                ].includes(u.kind) ? (
                  <StoryVisual unit={u} sound={sound} enabled={enabled} />
                ) : (
                  <LessonVisual unit={u} sound={sound} enabled={enabled} />
                )}
              </div>
              <aside className="study-explanation">
                <BookOpen size={26} />
                <p>{u.teach}</p>
              </aside>
            </div>
          ) : actualPhase === "done" ? (
            <div className="study-complete">
              <div className="study-medallion">
                <Check size={70} />
              </div>
              <h2>{u.title}</h2>
              <p>Three discoveries. One idea to keep.</p>
            </div>
          ) : (
            <div className="study-practice">
              {q.notes && (
                <div className="study-audio">
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
              {q.interaction === "pattern" ? (
                <div
                  className="study-pattern"
                  role="group"
                  aria-label="Your rhythm"
                >
                  {q.target!.map((_, i) => (
                    <button
                      key={i}
                      aria-label={"Rhythm step " + (i + 1)}
                      aria-pressed={!!response[i]}
                      onClick={() => {
                        const next = response.length
                          ? response.slice()
                          : q.target!.map(() => 0);
                        next[i] = next[i] ? 0 : 1;
                        updateResponse(next);
                        if (next[i]) sound.note(0);
                      }}
                    >
                      <span>{response[i] ? "●" : "○"}</span>
                      <small>{response[i] ? "Sound" : "Rest"}</small>
                    </button>
                  ))}
                </div>
              ) : q.interaction === "order" ? (
                <div className="study-order">
                  <div className="order-slots" aria-label="Your order">
                    {q.options.map((_, i) => (
                      <span key={i}>
                        {response[i] === undefined ? (
                          <b>{i + 1}</b>
                        ) : (
                          <>
                            <GameGlyph kind={q.options[response[i]].icon} />
                            <strong>{q.options[response[i]].label}</strong>
                          </>
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="order-options">
                    {q.options.map((o, i) => (
                      <button
                        key={o.label}
                        disabled={response.includes(i) || !enabled}
                        onClick={() => updateResponse([...response, i])}
                      >
                        <GameGlyph kind={o.icon} />
                        <span>{o.label}</span>
                      </button>
                    ))}
                    <button
                      className="order-undo"
                      disabled={!response.length}
                      onClick={() => updateResponse(response.slice(0, -1))}
                    >
                      Undo
                    </button>
                  </div>
                </div>
              ) : (
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
                        })
                      }
                    >
                      <GameGlyph kind={o.icon} />
                      <strong>{o.label}</strong>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {burst > 0 && (
          <div className="study-celebration" key={burst} aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <i
                key={i}
                style={
                  {
                    "--x": `${Math.cos(i * 2.4) * (90 + i * 8)}px`,
                    "--y": `${Math.sin(i * 2.4) * (70 + i * 6)}px`,
                    "--spin": `${i * 57}deg`,
                    "--spark": ["#45D9FD", "#EE2560", "#FFDA8E", "#A593E0"][
                      i % 4
                    ],
                  } as CSSProperties
                }
              />
            ))}
          </div>
        )}
        <footer className="study-dock">
          <div
            className="study-feedback"
            role="status"
            data-feedback={
              actualPhase === "try"
                ? checked
                  ? correct
                    ? "correct"
                    : "retry"
                  : "waiting"
                : actualPhase === "done"
                  ? "complete"
                  : "learning"
            }
          >
            {sound.error ? (
              <p role="alert">{sound.error}</p>
            ) : actualPhase === "try" ? (
              <>
                <strong>
                  {checked
                    ? correct
                      ? "You’ve got it!"
                      : "Try another idea."
                    : q.interaction === "order"
                      ? "Tap the pictures in order."
                      : q.interaction === "pattern"
                        ? "Tap the beats to build your answer."
                        : "Choose a picture."}
                </strong>
                {checked && <p>{q.explanation}</p>}
              </>
            ) : (
              <p>
                {actualPhase === "done"
                  ? "Ready for the next little discovery?"
                  : "Explore the picture, then give it a go."}
              </p>
            )}
          </div>
          <div className="study-action">
            {actualPhase === "learn" ? (
              <button className="lesson-primary" onClick={() => go("try")}>
                Start practice →
              </button>
            ) : actualPhase === "try" ? (
              correct ? (
                <button
                  className="lesson-primary"
                  onClick={() =>
                    go(
                      question < u.checks.length - 1 ? "try" : "done",
                      question < u.checks.length - 1 ? question + 1 : 0,
                    )
                  }
                >
                  {question < u.checks.length - 1
                    ? "Next question →"
                    : "Finish discovery →"}
                </button>
              ) : (
                <button
                  className="lesson-primary"
                  disabled={!ready || !enabled}
                  onClick={() => {
                    patch({
                      checked: p.checked.map((v, i) =>
                        i === question ? true : v,
                      ),
                    });
                    if (checkCorrect(q, selected, response))
                      setBurst((n) => n + 1);
                  }}
                >
                  Check answer
                </button>
              )
            ) : (
              <a
                className="lesson-primary"
                href={
                  siblings[position + 1]
                    ? studyHash(siblings[position + 1], journey)
                    : journey
                      ? "#program/aquarium/done"
                      : "#play/" + u.area
                }
              >
                {siblings[position + 1]
                  ? u.area === "works"
                    ? "Next discovery →"
                    : "Next lesson →"
                  : journey
                    ? "Finish Program →"
                    : "Back to " +
                      (u.area === "works"
                        ? "Aquarium discoveries"
                        : "Music lessons")}
              </a>
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
        {u.sourceIds.map((id) => (
          <section key={id}>
            {id === "editorial" ? (
              <strong>{references[id].label}</strong>
            ) : (
              <a href={references[id].url} target="_blank" rel="noreferrer">
                {references[id].label} ↗
              </a>
            )}
            <p>{references[id].note}</p>
          </section>
        ))}
        <p>
          Your progress stays during this visit. Reloading starts a new visit.
        </p>
      </dialog>
    </main>
  );
}
