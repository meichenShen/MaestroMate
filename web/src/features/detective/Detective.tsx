import { detectiveQuestions } from "../../content/aquarium";
import { ClipButton } from "../../components/ClipButton";
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
export function Detective({
  progress,
  onChange,
}: {
  progress: DetectiveProgress;
  onChange: (value: DetectiveProgress) => void;
}) {
  const question = detectiveQuestions[progress.index],
    selected = progress.answers[question.id],
    revealed = !!progress.revealed[question.id],
    correct = selected === question.correct;
  return (
    <section className="detective-feature" aria-labelledby="detective-title">
      <div className="feature-heading">
        <span className="micro">Music Detective</span>
        <h1 id="detective-title">Follow the clues.</h1>
        <p>Small details. New discoveries.</p>
      </div>
      <div className="case-header">
        <span className="case-number">0{progress.index + 1}</span>
        <div>
          <span className="micro">
            Sound case · {progress.index + 1} of {detectiveQuestions.length}
          </span>
          <h2>{question.title}</h2>
        </div>
      </div>
      <p className="case-prompt">{question.prompt}</p>
      <div className="clue-clips">
        {question.clips.map((clip) => (
          <ClipButton key={clip.label} clip={clip} />
        ))}
      </div>
      <fieldset>
        <legend>What do you hear?</legend>
        {question.options.map((option, index) => (
          <label
            className={`answer-option ${selected === index ? "is-selected" : ""} ${revealed && index === question.correct ? "is-correct" : ""}`}
            key={option}
          >
            <input
              type="radio"
              name={question.id}
              checked={selected === index}
              disabled={revealed}
              onChange={() =>
                onChange({
                  ...progress,
                  answers: { ...progress.answers, [question.id]: index },
                })
              }
            />
            <span className="micro">{String.fromCharCode(65 + index)}</span>
            <span>{option}</span>
            {revealed && index === question.correct && <span>✓</span>}
          </label>
        ))}
      </fieldset>
      {!revealed ? (
        <button
          className="pill-button"
          aria-label="Reveal the clue"
          disabled={selected === undefined}
          onClick={() =>
            onChange({
              ...progress,
              revealed: { ...progress.revealed, [question.id]: true },
            })
          }
        >
          Reveal the clue <span>↗</span>
        </button>
      ) : (
        <div className="answer-feedback" role="status">
          <strong>
            {correct ? "You found it." : "Try a different angle."}
          </strong>
          <p>{question.explanation.replace(/^You found it\.\s*/, "")}</p>
          <button
            className="text-button"
            aria-label="Try again"
            onClick={() =>
              onChange({
                ...progress,
                answers: { ...progress.answers, [question.id]: undefined },
                revealed: { ...progress.revealed, [question.id]: false },
              })
            }
          >
            Try again ↗
          </button>
        </div>
      )}
      <div className="case-pagination">
        <button
          disabled={progress.index === 0}
          onClick={() => onChange({ ...progress, index: progress.index - 1 })}
        >
          ← Previous clue
        </button>
        <span className="micro">Take your time</span>
        <button
          disabled={
            !revealed || progress.index === detectiveQuestions.length - 1
          }
          onClick={() => onChange({ ...progress, index: progress.index + 1 })}
        >
          Next clue ↗
        </button>
      </div>
    </section>
  );
}
