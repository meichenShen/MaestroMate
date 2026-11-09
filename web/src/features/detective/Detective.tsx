import { Search, Check, RotateCcw, ArrowRight, Headphones } from "lucide-react";
import { detectiveQuestions } from "../../content/aquarium";
import { ClipButton } from "../../components/ClipButton";
import "./detective.css";
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
  const question = detectiveQuestions[progress.index];
  const selected = progress.answers[question.id];
  const revealed = !!progress.revealed[question.id];
  const correct = selected === question.correct;
  const completed = detectiveQuestions.every(
    (item) => progress.revealed[item.id],
  );
  return (
    <section className="detective-feature" aria-labelledby="detective-title">
      <div className="feature-heading">
        <div>
          <span className="section-overline">LISTEN & DISCOVER</span>
          <h2 id="detective-title">每一次回听，都是新发现。</h2>
        </div>
        <span className="feature-badge">
          <Search size={12} /> 音乐侦探
        </span>
      </div>
      <div className="case-header">
        <span className="case-icon">
          <Headphones size={27} strokeWidth={1.3} />
        </span>
        <div>
          <span className="section-overline">
            SOUND CASE / 0{progress.index + 1}
          </span>
          <h3>{question.title}</h3>
        </div>
        <span className="case-count">
          {progress.index + 1} / {detectiveQuestions.length}
        </span>
      </div>
      <div className="case-body">
        <p>{question.prompt}</p>
        <div className="clue-clips">
          {question.clips.map((clip) => (
            <ClipButton key={clip.label} clip={clip} />
          ))}
        </div>
        <fieldset>
          <legend>听过之后，选择你的发现</legend>
          {question.options.map((option, index) => (
            <label
              className={`answer-option ${selected === index ? "is-selected" : ""} ${revealed && index === question.correct ? "is-correct" : ""}`}
              key={option}
            >
              <input
                type="radio"
                name={question.id}
                value={index}
                checked={selected === index}
                disabled={revealed}
                onChange={() =>
                  onChange({
                    ...progress,
                    answers: { ...progress.answers, [question.id]: index },
                  })
                }
              />
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option}</span>
              {revealed && index === question.correct && <Check size={17} />}
            </label>
          ))}
        </fieldset>
        {!revealed ? (
          <button
            className="primary-button submit-answer"
            disabled={selected === undefined}
            onClick={() =>
              onChange({
                ...progress,
                revealed: { ...progress.revealed, [question.id]: true },
              })
            }
          >
            看看我的发现 <ArrowRight size={16} />
          </button>
        ) : (
          <div
            className={`answer-feedback ${correct ? "correct" : "try-again"}`}
            role="status"
          >
            <strong>
              {correct ? "听见了，发现得很棒。" : "换一个角度，再听听看。"}
            </strong>
            <p>{question.explanation}</p>
            <button
              onClick={() =>
                onChange({
                  ...progress,
                  revealed: { ...progress.revealed, [question.id]: false },
                  answers: { ...progress.answers, [question.id]: undefined },
                })
              }
            >
              <RotateCcw size={14} /> 再试一次
            </button>
          </div>
        )}
        <div className="case-pagination">
          <button
            disabled={progress.index === 0}
            onClick={() => onChange({ ...progress, index: progress.index - 1 })}
          >
            上一条线索
          </button>
          <span>
            {completed
              ? "两条线索都探索过了，随时可以回听。"
              : "不计时，慢慢听。"}
          </span>
          <button
            disabled={
              !revealed || progress.index === detectiveQuestions.length - 1
            }
            onClick={() => onChange({ ...progress, index: progress.index + 1 })}
          >
            下一条线索 <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
