import { ArrowUpRight } from "lucide-react";
import { questions } from "../../content/aquarium";
import { ClipButton } from "../../components/ClipButton";
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
      className="conversation-feature"
      aria-labelledby="conversation-title"
    >
      <div className="feature-heading">
        <p className="eyebrow">Meet the composer</p>
        <h1 id="conversation-title">Camille Saint-Saëns</h1>
        <p>1835–1921. Composer. Pianist. Endlessly curious.</p>
      </div>
      <div className="conversation-layout">
        <figure className="composer-portrait">
          <img
            src="/images/composer.webp"
            alt="A sculptural interpretation of a nineteenth-century composer"
          />
          <figcaption>An imagined portrait</figcaption>
        </figure>
        <div className="composer-interaction">
          <p className="question-intro">What are you curious about?</p>
          <div className="question-options" aria-label="Prepared questions">
            {questions.map((item) => (
              <button
                key={item.id}
                aria-label={item.prompt}
                aria-pressed={selected === item.id}
                onClick={() => onSelect(item.id)}
              >
                {item.prompt}
                <ArrowUpRight size={20} />
              </button>
            ))}
          </div>
          <article
            className="answer-card"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="eyebrow">A note to listen with</p>
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
        </div>
      </div>
      <p className="feature-disclaimer">
        Prepared listening notes, not a live chat or the composer's own words.
      </p>
    </section>
  );
}
