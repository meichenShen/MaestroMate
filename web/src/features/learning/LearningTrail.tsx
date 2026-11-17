import { useEffect, useRef, useState } from "react";
import {
  learningSteps,
  evaluateVariation,
  completedTrail,
  type TrailProgress,
} from "../../content/learning";
import { PoolAudio } from "../water/audio";
import { poolNotes, type Melody } from "../water/model";
import "./learning.css";
export function LearningTrail({
  progress,
  onChange,
  enabled,
  journey = false,
}: {
  progress: TrailProgress;
  onChange: (p: TrailProgress) => void;
  enabled: boolean;
  journey?: boolean;
}) {
  const [step, setStep] = useState(0),
    [beat, setBeat] = useState<number | null>(null),
    [playing, setPlaying] = useState(false),
    [error, setError] = useState(""),
    [slot, setSlot] = useState(0),
    [muted, setMuted] = useState(false);
  const synth = useRef<PoolAudio | null>(null),
    alive = useRef(true),
    ticket = useRef(0);
  const stop = () => {
    ticket.current++;
    synth.current?.stop();
    setPlaying(false);
    setBeat(null);
  };
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
      document.removeEventListener("visibilitychange", hide);
      synth.current?.dispose();
    };
  }, []);
  useEffect(() => {
    if (!enabled) stop();
  }, [enabled]);
  useEffect(() => {
    synth.current?.setVolume(muted ? 0 : 0.2);
  }, [muted]);
  const item = learningSteps[step],
    done = completedTrail(progress),
    checked = progress.checked[step],
    correct = done[step];
  const latest = useRef(progress);
  latest.current = progress;
  const patch = (next: Partial<TrailProgress>) =>
    onChange({ ...latest.current, ...next });
  const play = async (notes: Melody) => {
    stop();
    if (!enabled || document.hidden) return;
    const id = ticket.current;
    setPlaying(true);
    setError("");
    try {
      const started = await synth.current!.play(
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
      if (alive.current && id === ticket.current) {
        if (started)
          patch({
            heard: latest.current.heard.map((v, i) => (i === step ? true : v)),
          });
        else setPlaying(false);
      }
    } catch {
      if (alive.current && id === ticket.current) {
        setPlaying(false);
        setError("Sound could not start. Try Listen again.");
      }
    }
  };
  const chooseStep = (n: number) => {
    stop();
    setStep(n);
    setError("");
  };
  const check = () =>
    patch({ checked: progress.checked.map((v, i) => (i === step ? true : v)) });
  return (
    <main id="main" tabIndex={-1} className="learning-page page-room">
      <header className="learning-heading">
        <div>
          <a href={journey ? "#program" : "#play"}>
            ← Back to {journey ? "your Program" : "Play"}
          </a>
          <p>Little discoveries · {done.filter(Boolean).length}/3 explored</p>
        </div>
        <button
          onClick={() => {
            stop();
            setMuted(!muted);
          }}
          aria-pressed={muted}
        >
          Sound {muted ? "off" : "on"}
        </button>
      </header>
      <nav className="learning-levels" aria-label="Learning stages">
        {learningSteps.map((x, i) => (
          <button
            key={x.id}
            onClick={() => chooseStep(i)}
            aria-current={step === i ? "step" : undefined}
          >
            <span>
              0{i + 1} · {x.level}
            </span>
            <strong>
              {x.name} {done[i] ? "✓" : "↗"}
            </strong>
          </button>
        ))}
      </nav>
      <section
        className={`learning-card level-${step}`}
        aria-labelledby="learning-title"
        key={step}
      >
        <div className="learning-question">
          <div>
            <p className="eyebrow">
              {step === 2 ? "Try it yourself" : "Listen, then explore"}
            </p>
            <h1 id="learning-title">{item.title}</h1>
            <p>{item.goal}</p>
          </div>
          <button
            className="solid-button"
            onClick={() => (playing ? stop() : void play([...item.demo]))}
            disabled={!enabled || muted}
          >
            {playing ? "Stop" : "Listen to the example"} {playing ? "■" : "▶"}
          </button>
        </div>
        {step === 0 ? (
          <div
            className="pitch-picture"
            aria-label="Five notes rising from C to A"
          >
            {poolNotes.map((n, i) => (
              <span
                key={n.name}
                className={beat === i ? "sounding" : ""}
                style={{ height: `${38 + i * 15}%`, background: n.color }}
              >
                <b>{n.name}</b>
              </span>
            ))}
          </div>
        ) : step === 1 ? (
          <div
            className="phrase-picture"
            aria-label={
              checked ? "First phrase A, middle B, last A" : "Three phrases"
            }
          >
            {["Opening", "Middle", "Ending"].map((n, i) => (
              <div
                key={n}
                className={
                  beat !== null && beat < 6 && Math.floor(beat / 2) === i
                    ? "sounding"
                    : ""
                }
              >
                <span>{n}</span>
                <strong>{checked ? ["A", "B", "A"][i] : "♪"}</strong>
                <small>
                  {checked
                    ? i === 1
                      ? "Something different"
                      : "The same two notes"
                    : "Follow each little phrase"}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <div className="variation-editor">
            <div
              className="reply-slots"
              role="group"
              aria-label="Your four-note variation"
            >
              {progress.reply.map((n, i) => (
                <button
                  key={i}
                  aria-label={`Reply space ${i + 1}: ${n === null ? "empty" : poolNotes[n].name}`}
                  aria-pressed={slot === i}
                  onClick={() => setSlot(i)}
                >
                  {n === null ? "＋" : poolNotes[n].name}
                  <small>
                    {i < 3 ? "Keep the opening" : "Change the ending"}
                  </small>
                </button>
              ))}
            </div>
            <div className="note-palette" aria-label="Choose a note">
              {poolNotes.map((n, i) => (
                <button
                  key={n.name}
                  style={{ color: n.color }}
                  aria-label={`Add ${n.name}`}
                  onClick={() => {
                    stop();
                    patch({
                      reply: progress.reply.map((v, j) => (j === slot ? i : v)),
                      checked: progress.checked.map((v, j) =>
                        j === 2 ? false : v,
                      ),
                    });
                    setSlot((slot + 1) % 4);
                    if (enabled && !document.hidden)
                      void synth.current
                        ?.note(i)
                        .catch(() =>
                          setError(
                            "Sound is unavailable. You can still arrange notes.",
                          ),
                        );
                  }}
                >
                  {n.name}
                </button>
              ))}
              <button
                disabled={
                  progress.reply.some((n) => n === null) || muted || !enabled
                }
                onClick={() =>
                  void play([...progress.reply, null, null, null, null])
                }
              >
                Hear my reply ▶
              </button>
            </div>
          </div>
        )}
        <p className="learning-prompt">{item.question}</p>
        {step < 2 && (
          <div className="learning-choices">
            {item.choices.map((label, i) => (
              <button
                key={label}
                aria-pressed={progress.choices[step] === i}
                onClick={() =>
                  patch({
                    choices: progress.choices.map((v, j) =>
                      j === step ? i : v,
                    ),
                    checked: progress.checked.map((v, j) =>
                      j === step ? false : v,
                    ),
                  })
                }
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <div className="learning-feedback">
          <div role="status">
            {error ||
              (checked
                ? step === 2
                  ? evaluateVariation(progress.reply).message
                  : correct
                    ? "You found it! " + item.explanation
                    : "Not quite yet. Listen again and follow the highlighted shapes."
                : "No timer. Try as often as you like.")}
          </div>
          <button
            className="solid-button"
            disabled={
              step === 2
                ? progress.reply.some((n) => n === null)
                : progress.choices[step] === null
            }
            onClick={check}
          >
            {checked && !correct ? "Try my answer" : "Check my discovery"} ↗
          </button>
        </div>
      </section>
      <footer className="learning-footer">
        <button disabled={step === 0} onClick={() => chooseStep(step - 1)}>
          ← Previous
        </button>
        <span>Original practice sounds · not the Aquarium recording</span>
        {step < 2 ? (
          <button onClick={() => chooseStep(step + 1)}>Next discovery →</button>
        ) : (
          <a href={journey ? "#program/aquarium/done" : "#play/pool"}>
            {journey ? "Finish Program" : "Make more in Music Pool"} ↗
          </a>
        )}
      </footer>
    </main>
  );
}
