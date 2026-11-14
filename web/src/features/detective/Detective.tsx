import { useRef } from "react";
import { detectiveQuestions } from "../../content/aquarium";
import { useAudio } from "../../audio/AudioProvider";
import { Encore } from "../../components/Encore";
import { ClipButton } from "../../components/ClipButton";
import { CaseGlyph } from "./CaseGlyph";
import { Play } from "lucide-react";
import { CaseNavigator } from "./CaseNavigator";
export interface DetectiveProgress {
  index: number;
  answers: Record<string, number | undefined>;
  revealed: Record<string, boolean>;
}
export const initialProgress: DetectiveProgress = {
  index: 0,
  answers: {},
  revealed: {},
};
function CatchMark() {
  return (
    <svg
      className="catch-mark"
      viewBox="0 0 90 90"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="45" cy="45" r="38" />
      <path d="m26 45 13 14 27-29" />
    </svg>
  );
}
export function Detective({
  progress,
  onChange,
}: {
  progress: DetectiveProgress;
  onChange: (value: DetectiveProgress) => void;
}) {
  const audio = useAudio(),
    direction = useRef("next"),
    total = detectiveQuestions.length,
    active = Math.max(0, Math.min(total - 1, progress.index ?? 0)),
    q = detectiveQuestions[active],
    selected = progress.answers[q.id],
    revealed = !!progress.revealed[q.id],
    correct = selected === q.correct;
  const discovered = detectiveQuestions.filter(
    (q) => progress.revealed[q.id],
  ).length;
  const move = (index: number) => {
    direction.current = index < active ? "back" : "next";
    audio.pause();
    onChange({ ...progress, index: Math.max(0, Math.min(total - 1, index)) });
  };
  return (
    <section
      className="detective-feature detective-workspace"
      aria-labelledby="detective-title"
    >
      <header className="game-heading">
        <div>
          <p className="eyebrow">{total} moments. Follow your ears.</p>
          <h1 id="detective-title">Follow the clues.</h1>
        </div>
        <p className="discovery-count">
          <strong>{discovered}</strong> / {total} discovered
        </p>
      </header>
      <CaseNavigator
        items={detectiveQuestions}
        active={active}
        revealed={progress.revealed}
        onSelect={move}
      />
      <div
        className={`active-case case-${(active % 3) + 1}`}
        id="current-sound-case"
        aria-labelledby="active-case-title"
      >
        <div className={`case-scene enter-${direction.current}`} key={q.id}>
          <div className="case-question-row">
            <header className="case-question-copy">
              <h2
                id="active-case-title"
                aria-describedby={`case-${q.id}-prompt`}
              >
                {q.title}
              </h2>
              <p className="case-prompt" id={`case-${q.id}-prompt`}>
                {q.prompt}
              </p>
            </header>
            <div className="case-question-audio">
              {revealed ? (
                <button
                  className="case-replay"
                  onClick={() => audio.playClip(q.clips[q.replayClipIndex])}
                >
                  <Play size={14} fill="currentColor" /> Hear it again ↺
                </button>
              ) : (
                q.clips.map((clip) => (
                  <ClipButton key={clip.label} clip={clip} />
                ))
              )}
            </div>
          </div>
          <fieldset
            className="answer-tiles"
            aria-describedby={`case-${q.id}-prompt`}
            style={{
              gridTemplateColumns: `repeat(${q.options.length},minmax(0,1fr))`,
            }}
          >
            <legend className="sr-only">Your answer</legend>
            {q.options.map((option, i) => (
              <label
                className={`sound-option ${selected === i ? "is-selected" : ""} ${revealed && q.correct === i ? "is-correct" : ""}`}
                key={option}
              >
                <input
                  type="radio"
                  name={q.id}
                  checked={selected === i}
                  disabled={revealed}
                  onChange={() =>
                    onChange({
                      ...progress,
                      answers: { ...progress.answers, [q.id]: i },
                    })
                  }
                />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
          <div className="case-actions">
            {revealed ? (
              <>
                <div
                  className={`answer-reveal ${correct ? "is-success" : ""}`}
                  role="status"
                >
                  {correct ? <CatchMark /> : <CaseGlyph kind={active} />}
                  <div>
                    <strong>
                      {correct ? "You found it." : "Try a different angle."}
                    </strong>
                    <p>{q.explanation}</p>
                  </div>
                </div>
                <button
                  className="case-check"
                  aria-label="Try again"
                  onClick={() =>
                    onChange({
                      ...progress,
                      answers: { ...progress.answers, [q.id]: undefined },
                      revealed: { ...progress.revealed, [q.id]: false },
                    })
                  }
                >
                  Try again ↗
                </button>
              </>
            ) : (
              <>
                <span className="case-action-hint">
                  Listen. Choose. Trust your ears.
                </span>
                <button
                  className="case-check"
                  aria-label="Check answer"
                  disabled={selected === undefined}
                  onClick={() =>
                    onChange({
                      ...progress,
                      revealed: { ...progress.revealed, [q.id]: true },
                    })
                  }
                >
                  Check <span>↗</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <footer className="case-navigation">
        <button
          aria-label="Previous case"
          disabled={active === 0}
          onClick={() => move(active - 1)}
        >
          ← Previous
        </button>
        {discovered === total ? (
          <div className="game-completion">
            <Encore />
            <span>You noticed something new.</span>
          </div>
        ) : (
          <span className="case-position" aria-live="polite">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
            <span className="sr-only"> · {q.title}</span>
          </span>
        )}
        <button
          aria-label="Next case"
          disabled={active === total - 1}
          onClick={() => move(active + 1)}
        >
          Next →
        </button>
      </footer>
    </section>
  );
}
