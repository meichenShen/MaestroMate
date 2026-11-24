import { useRef } from "react";
import { BookOpen } from "lucide-react";
import { knowledgeCards } from "../../content/knowledge/composer";
import { references } from "../../content/knowledge/sources";
import { useAudio } from "../../audio/AudioProvider";
export function KnowledgeShelf() {
  const dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null),
    audio = useAudio();
  return (
    <>
      <button
        className="knowledge-open"
        ref={opener}
        aria-label="Open the knowledge shelf"
        onClick={() => {
          audio.pause();
          dialog.current?.showModal();
        }}
      >
        <BookOpen size={18} />
        Knowledge shelf
      </button>
      <dialog
        ref={dialog}
        className="discovery-dialog knowledge-dialog"
        aria-labelledby="knowledge-title"
        data-lenis-prevent
        onClose={() => opener.current?.focus({ preventScroll: true })}
      >
        <header>
          <h2 id="knowledge-title">A little knowledge shelf</h2>
          <button onClick={() => dialog.current?.close()}>Close</button>
        </header>
        <p>Real history, listening ideas, and the difference between them.</p>
        {knowledgeCards.map((c) => (
          <section key={c.title}>
            <h3>{c.title}</h3>
            <p>{c.fact}</p>
            {c.note && <p className="knowledge-note">{c.note}</p>}
            <div>
              {c.sourceIds.map((id) => (
                <a
                  key={id}
                  href={references[id].url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {references[id].label}
                </a>
              ))}
            </div>
          </section>
        ))}
      </dialog>
    </>
  );
}
