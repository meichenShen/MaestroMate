import { questions } from "../../content/aquarium";
import { ClipButton } from "../../components/ClipButton";
import { Mark } from "../../components/Mark";
export function Conversation({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const question =
    questions.find((item) => item.id === selected) || questions[0];
  return (
    <section
      aria-labelledby="conversation-title"
      className="conversation-feature"
    >
      <div className="feature-heading">
        <span className="micro">02 / MEET THE COMPOSER</span>
        <h1 id="conversation-title">
          Camille
          <br />
          Saint-Saëns
        </h1>
        <p>1835–1921. Composer. Pianist. Endlessly curious.</p>
      </div>
      <div className="composer-line">
        <Mark kind="meet" />
        <p>
          A conversation
          <br />
          starts with curiosity.
        </p>
        <span className="micro">
          PREPARED QUESTIONS
          <br />
          NO LIVE AI
        </span>
      </div>
      <div className="question-options" aria-label="Prepared questions">
        {questions.map((item, index) => (
          <button
            key={item.id}
            aria-pressed={selected === item.id}
            onClick={() => onSelect(item.id)}
          >
            <span className="micro">0{index + 1}</span>
            {item.prompt}
            <span>↗</span>
          </button>
        ))}
      </div>
      <article className="answer-card" aria-live="polite" aria-atomic="true">
        <span className="micro">A NOTE TO LISTEN WITH</span>
        <h2>{question.prompt}</h2>
        <p>{question.answer}</p>
        {question.clip && <ClipButton clip={question.clip} />}
        <div className="answer-source">
          {question.source ? (
            <a href={question.source} target="_blank" rel="noreferrer">
              {question.sourceLabel} ↗
            </a>
          ) : (
            question.sourceLabel
          )}
        </div>
      </article>
      <p className="feature-disclaimer">
        Scripted listening notes, not a live chat or the composer's own words.
      </p>
    </section>
  );
}
