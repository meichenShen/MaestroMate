import { useEffect, useRef } from "react";
import { Music2, ArrowDown, Send } from "lucide-react";
import { questions } from "../../content/aquarium";
import { ClipButton } from "../../components/ClipButton";
import type { ChatTurn } from "./useComposerChat";
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
  useEffect(() => {
    if (follow.current && thread.current)
      thread.current.scrollTo({
        top: thread.current.scrollHeight,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }, [turns, pending]);
  return (
    <section
      className="conversation-feature"
      aria-labelledby="conversation-title"
    >
      <div className="chat-heading">
        <div className="composer-avatar" aria-hidden="true">
          <Music2 size={34} strokeWidth={1.4} />
        </div>
        <div>
          <p className="eyebrow">Come, have a chat</p>
          <h1 id="conversation-title">Camille Saint-Saëns</h1>
          <p>An imagined conversation, with prepared replies.</p>
        </div>
      </div>
      <div className="chat-window">
        <div
          ref={thread}
          className="chat-thread"
          role="log"
          aria-label="Conversation with Camille"
          aria-live="polite"
          aria-relevant="additions"
          data-lenis-prevent
          onScroll={() => {
            const e = thread.current!;
            follow.current =
              e.scrollHeight - e.scrollTop - e.clientHeight < 140;
          }}
        >
          <div className="chat-message incoming" data-speaker="camille">
            <span className="speaker-name">Camille</span>
            <p>
              Hi there! Fancy a little trip underwater? Pick a question below.
              We can take it one sound at a time.
            </p>
          </div>
          {turns.map((turn) => {
            const q = questions.find((item) => item.id === turn.questionId)!;
            return (
              <div className="chat-turn" key={turn.id}>
                <div className="chat-message outgoing" data-speaker="you">
                  <span className="speaker-name">You</span>
                  <p>{q.prompt}</p>
                </div>
                {turn.replied && (
                  <div className="chat-message incoming" data-speaker="camille">
                    <span className="speaker-name">Camille</span>
                    <p>{q.answer}</p>
                    {q.clip && <ClipButton clip={q.clip} />}
                    <details className="message-source">
                      <summary>A little background</summary>
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
              Camille is replying<span aria-hidden="true">…</span>
            </div>
          )}
        </div>
        <div className="chat-prompts">
          <div className="prompt-heading">
            <p>What would you like to ask?</p>
            <button
              className="thread-bottom"
              aria-label="Show latest messages"
              onClick={() => {
                follow.current = true;
                thread.current?.scrollTo({
                  top: thread.current.scrollHeight,
                  behavior: "smooth",
                });
              }}
            >
              <ArrowDown size={19} />
            </button>
          </div>
          <div className="prompt-chips" aria-label="Suggested questions">
            {questions.map((q) => (
              <button
                key={q.id}
                aria-label={q.prompt}
                disabled={pending}
                onClick={() => {
                  follow.current = true;
                  onAsk(q.id);
                }}
              >
                {q.prompt}
                <Send size={15} />
              </button>
            ))}
          </div>
          <p className="chat-note">Tap a question. There's no wrong one.</p>
        </div>
      </div>
    </section>
  );
}
