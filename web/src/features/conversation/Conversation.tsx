import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  Send,
  Music2,
  BookOpen,
  Sparkles,
  Compass,
} from "lucide-react";
import { questions, questionPresentation } from "../../content/aquarium";
import { ClipButton } from "../../components/ClipButton";
import { Hint } from "../../components/Hint";
import type { ChatTurn } from "./useComposerChat";
const topics = [
  {
    id: "all",
    label: "All",
    hint: "Follow any question that catches your ear.",
    Icon: Compass,
  },
  {
    id: "life",
    label: "Life",
    hint: "The early years, Paris and a life in music.",
    Icon: BookOpen,
  },
  {
    id: "music",
    label: "Music",
    hint: "The piece, its textures and a closer listen.",
    Icon: Music2,
  },
  {
    id: "play",
    label: "Mischief",
    hint: "A private musical joke and your own imagination.",
    Icon: Sparkles,
  },
];
export function Conversation({
  turns,
  pending,
  onAsk,
}: {
  turns: ChatTurn[];
  pending: boolean;
  onAsk: (id: string) => void;
}) {
  const thread = useRef<HTMLDivElement>(null),
    follow = useRef(true);
  const [topic, setTopic] = useState("all");
  const latest = () =>
    thread.current?.scrollTo({
      top: thread.current.scrollHeight,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  useEffect(() => {
    if (follow.current) latest();
  }, [turns, pending]);
  return (
    <section
      className="conversation-feature chat-studio"
      aria-labelledby="conversation-title"
    >
      <aside className="artist-profile">
        <p className="eyebrow">Meet the artist</p>
        <div className="artist-emblem" aria-hidden="true">
          <Music2 strokeWidth={1.1} />
          <span>C.S.</span>
        </div>
        <h1 id="conversation-title">Camille Saint-Saëns</h1>
        <p className="artist-years">1835 — 1921</p>
        <p className="artist-roles">Composer. Pianist. Organist.</p>
        <nav className="chat-topics" aria-label="Conversation topics">
          {topics.map(({ id, label, hint, Icon }) => (
            <button
              key={id}
              aria-label={label}
              aria-pressed={topic === id}
              aria-describedby={`topic-${id}-hint`}
              onClick={() => setTopic(id)}
            >
              <Icon size={21} />
              <span>{label}</span>
              <span className="topic-tip" id={`topic-${id}-hint`}>
                {hint}
              </span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="chat-main">
        <header className="chat-room-heading">
          <h2>Pull up a chair.</h2>
          <Hint id="conversation-note" label="About this conversation">
            An imagined first-person conversation. Prepared replies draw on the
            sources shown; they are not historical quotations or live AI.
          </Hint>
        </header>
        <div className="chat-window">
          <div
            ref={thread}
            tabIndex={0}
            className="chat-thread"
            role="log"
            aria-label="Conversation with Camille"
            aria-live="polite"
            aria-relevant="additions"
            data-lenis-prevent
            onScroll={() => {
              const e = thread.current!;
              follow.current =
                e.scrollHeight - e.scrollTop - e.clientHeight < 120;
            }}
          >
            <div className="chat-message incoming" data-speaker="camille">
              <span className="speaker-name">Camille</span>
              <p>
                I'm Camille. Shall we begin with a life, a sound, or a little
                mischief?
              </p>
            </div>
            {turns.map((turn) => {
              const q = questions.find((q) => q.id === turn.questionId)!;
              return (
                <div className="chat-turn" key={turn.id}>
                  <div className="chat-message outgoing" data-speaker="you">
                    <span className="speaker-name">You</span>
                    <p>{q.prompt}</p>
                  </div>
                  {turn.replied && (
                    <div
                      className="chat-message incoming"
                      data-speaker="camille"
                    >
                      <span className="speaker-name">Camille</span>
                      <p>{q.answer}</p>
                      {q.clip && <ClipButton clip={q.clip} />}
                      <details className="message-source">
                        <summary>Behind this reply</summary>
                        {q.source ? (
                          <a href={q.source} target="_blank" rel="noreferrer">
                            {q.sourceLabel} ↗
                          </a>
                        ) : (
                          <p>{q.sourceLabel}</p>
                        )}
                      </details>
                    </div>
                  )}
                </div>
              );
            })}
            {pending && (
              <div className="typing-indicator" role="status">
                Camille is replying…
              </div>
            )}
          </div>
          <div className="chat-prompts">
            <div className="prompt-heading">
              <p>Ask me about…</p>
              <button
                className="thread-bottom"
                aria-label="Show latest messages"
                onClick={() => {
                  follow.current = true;
                  latest();
                }}
              >
                <ArrowDown size={18} />
              </button>
            </div>
            <div className="question-tiles">
              {questions
                .filter(
                  (q) =>
                    topic === "all" ||
                    questionPresentation[q.id].topic === topic,
                )
                .map((q) => (
                  <button
                    className="question-tile"
                    key={q.id}
                    aria-label={q.prompt}
                    disabled={pending}
                    onClick={() => {
                      follow.current = true;
                      onAsk(q.id);
                    }}
                  >
                    <strong>{questionPresentation[q.id].label}</strong>
                    <Send size={16} />
                    <span className="question-full">{q.prompt}</span>
                  </button>
                ))}
            </div>
            <p className="chat-note">
              An imagined conversation, with real history.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
