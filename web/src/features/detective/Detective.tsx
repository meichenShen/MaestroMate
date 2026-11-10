import { useRef } from "react";
import { detectiveQuestions } from "../../content/aquarium";
import { useAudio } from "../../audio/AudioProvider";
import { Encore } from "../../components/Encore";
import { ClipButton } from "../../components/ClipButton";
import { Hint } from "../../components/Hint";
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
function CaseGlyph({ kind }: { kind: number }) {
  return (
    <svg
      className="case-glyph"
      viewBox="0 0 100 70"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        {kind === 0 ? (
          <>
            <path d="M6 22c12-24 24 24 36 0s24 24 36 0" />
            <path d="M6 49h76" />
          </>
        ) : kind === 1 ? (
          <>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <path key={i} d={`M${9 + i * 11} ${12 + i * 3}v${46 - i * 6}`} />
            ))}
          </>
        ) : (
          <>
            <path d="M9 21q12-25 24 0t24 0t24 0" />
            <path d="M9 50q12-25 24 0t24 0t24 0" />
          </>
        )}
      </g>
    </svg>
  );
}
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
    active = progress.index ?? 0,
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
    onChange({ ...progress, index: Math.max(0, Math.min(2, index)) });
  };
  return (
    <section
      className="detective-feature detective-workspace"
      aria-labelledby="detective-title"
    >
      <header className="game-heading">
        <div>
          <p className="eyebrow">Three moments. Follow your ears.</p>
          <h1 id="detective-title">Follow the clues.</h1>
        </div>
        <p className="discovery-count">
          <strong>{discovered}</strong> / 3 discovered
        </p>
      </header>
      <div className="case-overview">
        {detectiveQuestions.map((item, i) => (
          <article
            key={item.id}
            aria-labelledby={`overview-${item.id}`}
            className={`case-preview case-${i + 1}`}
          >
            <button
              aria-label={`Open case ${i + 1}`}
              aria-pressed={active === i}
              aria-controls="current-sound-case"
              onClick={() => move(i)}
            >
              <span className="case-label">0{i + 1}</span>
              <CaseGlyph kind={i} />
              <h2 id={`overview-${item.id}`}>{item.title}</h2>
              <span
                className="case-done"
                aria-label={
                  progress.revealed[item.id]
                    ? "Discovered"
                    : "Not yet discovered"
                }
              >
                {progress.revealed[item.id] ? "✓" : "↗"}
              </span>
            </button>
          </article>
        ))}
      </div>
      <div
        className={`active-case case-${active + 1}`}
        id="current-sound-case"
        aria-labelledby="active-case-title"
      >
        <div className={`case-scene enter-${direction.current}`} key={q.id}>
          <header className="active-case-heading">
            <h2
              id="active-case-title"
              tabIndex={0}
              aria-describedby={`case-${q.id}-hint`}
            >
              {q.title}
            </h2>
            <Hint id={`case-${q.id}-hint`} label={`About case ${active + 1}`}>
              {q.prompt}
            </Hint>
          </header>
          <div className="case-centre">
            {revealed ? (
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
            ) : (
              <>
                <CaseGlyph kind={active} />
                <div className="case-listen">
                  {q.clips.map((clip) => (
                    <ClipButton key={clip.label} clip={clip} />
                  ))}
                </div>
              </>
            )}
          </div>
          <fieldset
            className="answer-tiles"
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
                <button
                  className="case-replay"
                  onClick={() => audio.playClip(q.clips[q.replayClipIndex])}
                >
                  Hear it again ↺
                </button>
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
        {discovered === 3 ? (
          <div className="game-completion">
            <Encore />
            <span>You noticed something new.</span>
          </div>
        ) : (
          <span className="case-position" aria-live="polite">
            0{active + 1} / 03<span className="sr-only"> · {q.title}</span>
          </span>
        )}
        <button
          aria-label="Next case"
          disabled={active === 2}
          onClick={() => move(active + 1)}
        >
          Next →
        </button>
      </footer>
    </section>
  );
}
