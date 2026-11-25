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
import { KnowledgeShelf } from "./KnowledgeShelf";
import { unitHash } from "../curriculum/PlayCatalog";
import type { useComposerChat } from "./useComposerChat";
import { ChatSettings } from "./ChatSettings";
import { references, type ReferenceId } from "../../content/knowledge/sources";
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
  journey = false,
  chat,
}: {
  journey?: boolean;
  chat: ReturnType<typeof useComposerChat>;
}) {
  const { turns, pending, ask: onAsk } = chat;
  const [draft, setDraft] = useState("");
  const thread = useRef<HTMLDivElement>(null),
    follow = useRef(true),
    questionRail = useRef<HTMLDivElement>(null);
  const [topic, setTopic] = useState("all");
  useEffect(() => {
    questionRail.current?.scrollTo({ left: 0 });
  }, [topic]);
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
        <KnowledgeShelf />
      </aside>
      <div className="chat-main">
        <header className="chat-room-heading">
          <h2>Pull up a chair.</h2>
          <Hint id="conversation-note" label="About this conversation">
            An imagined educational conversation, not historical quotations. AI
            replies may contain mistakes; check the sources shown.
          </Hint>
          <ChatSettings
            config={chat.config}
            enabled={chat.aiEnabled}
            pending={pending}
            model={chat.model}
            onModel={chat.setModel}
            onEnable={chat.setAI}
          />
        </header>
        <p className="prepared-disclosure">
          {chat.aiEnabled
            ? "AI preview · An imagined Camille, with sources"
            : "Prepared conversation · Imagined replies, with sources"}
        </p>
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
              const q = questions.find((q) => q.id === turn.questionId);
              return (
                <div className="chat-turn" key={turn.id}>
                  <div className="chat-message outgoing" data-speaker="you">
                    <span className="speaker-name">You</span>
                    <p>{turn.question}</p>
                  </div>
                  {turn.replied && (
                    <div
                      className="chat-message incoming"
                      data-speaker="camille"
                    >
                      <span className="speaker-name">Camille</span>
                      <span className="reply-label">
                        {turn.mode === "prepared"
                          ? "Prepared reply"
                          : turn.reply?.mode === "guidance"
                            ? "A little guidance"
                            : turn.reply?.kind === "listening"
                              ? "AI · Listening idea"
                              : turn.reply?.kind === "unknown"
                                ? "AI · A limit to what we know"
                                : "AI · From the knowledge shelf"}
                      </span>
                      <p>
                        {turn.mode === "prepared"
                          ? q?.answer
                          : turn.reply?.answer}
                      </p>
                      {q?.clip && <ClipButton clip={q.clip} />}
                      <details className="message-source">
                        <summary>Behind this reply</summary>
                        {turn.reply?.mode === "guidance" ? (
                          <p>
                            This reminder is written by MaestroMate. No AI
                            request was made for this reply.
                          </p>
                        ) : turn.mode === "prepared" ? (
                          q?.source ? (
                            <a href={q.source} target="_blank" rel="noreferrer">
                              {q.sourceLabel} ↗
                            </a>
                          ) : (
                            <p>{q?.sourceLabel}</p>
                          )
                        ) : (
                          <>
                            <p>
                              AI adapted these reference notes into an imagined
                              reply. Source links are checked; factual accuracy
                              still needs your judgement.
                            </p>
                            {turn.reply?.sourceIds.map((id) =>
                              Object.hasOwn(references, id) ? (
                                id === "editorial" ? (
                                  <div key={id} className="editorial-source">
                                    <strong>
                                      {references.editorial.label}
                                    </strong>
                                    {turn.reply?.editorialNotes?.map(
                                      (note, i) => (
                                        <p key={i}>{note}</p>
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <a
                                    key={id}
                                    href={references[id as ReferenceId].url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {references[id as ReferenceId].label} ↗
                                  </a>
                                )
                              ) : null,
                            )}
                            {!turn.reply?.sourceIds.length && (
                              <p>No supporting reference was returned.</p>
                            )}
                          </>
                        )}
                      </details>
                      {q && (
                        <a
                          className="chat-play-link"
                          href={unitHash(q.playUnit, journey)}
                        >
                          Try this idea in Play
                        </a>
                      )}
                    </div>
                  )}
                  {turn.error && (
                    <div className="chat-error" role="alert">
                      <p>
                        {turn.error === "rate_limited"
                          ? "Our AI needs a little rest. Try again later, or explore the prepared questions."
                          : "That reply could not be checked. Try again, or use our prepared questions."}
                      </p>
                      <div>
                        {chat.aiEnabled && (
                          <button
                            disabled={pending}
                            onClick={() => chat.retry(turn.id)}
                          >
                            Try that question again
                          </button>
                        )}
                        {q ? (
                          <button
                            disabled={pending}
                            onClick={() => chat.readPrepared(turn.id)}
                          >
                            Read the prepared reply
                          </button>
                        ) : (
                          <button
                            disabled={pending}
                            onClick={() => chat.setAI(false)}
                          >
                            Use prepared questions
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {pending && (
              <div className="typing-indicator" role="status">
                Looking through the knowledge shelf…
              </div>
            )}
          </div>
          <div className="chat-prompts">
            <div className="prompt-heading">
              <p>Choose a question</p>
              <div className="question-rail-actions">
                <button
                  aria-label="Previous questions"
                  onClick={() =>
                    questionRail.current?.scrollBy({
                      left: -260,
                      behavior: matchMedia("(prefers-reduced-motion: reduce)")
                        .matches
                        ? "instant"
                        : "smooth",
                    })
                  }
                >
                  Previous
                </button>
                <button
                  aria-label="More questions"
                  onClick={() =>
                    questionRail.current?.scrollBy({
                      left: 260,
                      behavior: matchMedia("(prefers-reduced-motion: reduce)")
                        .matches
                        ? "instant"
                        : "smooth",
                    })
                  }
                >
                  More
                </button>
              </div>
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
            <div
              className="question-tiles"
              ref={questionRail}
              role="group"
              aria-label="Suggested questions"
            >
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
            {chat.aiEnabled && (
              <form
                className="chat-compose"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!pending && draft.trim()) {
                    chat.askText(draft.trim());
                    setDraft("");
                    follow.current = true;
                  }
                }}
              >
                <label className="sr-only" htmlFor="music-question">
                  Your music question
                </label>
                <input
                  id="music-question"
                  type="text"
                  autoComplete="off"
                  placeholder="Ask about the music…"
                  maxLength={600}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={pending}
                  aria-describedby="chat-input-note"
                />
                <button
                  type="submit"
                  aria-label="Send question"
                  disabled={pending || !draft.trim()}
                >
                  <Send size={19} />
                  <span>Send</span>
                </button>
              </form>
            )}
            <p className="chat-note" id="chat-input-note">
              {chat.aiEnabled
                ? "Keep private details out. AI can make mistakes; check the sources."
                : "Choose a question, or explore AI in Settings. Replies are imagined, not quotations."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
