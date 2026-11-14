import { useRef } from "react";
import { useAudio } from "../audio/AudioProvider";
import { work, type ActivityId } from "../content/aquarium";
export function ContextPanel({ activity }: { activity: ActivityId }) {
  const { chapter } = useAudio();
  const dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null);
  return (
    <aside
      className="context-panel"
      aria-label="Listening notes and recording credits"
    >
      <button
        className="notes-open"
        ref={opener}
        aria-label="Open listening notes"
        onClick={() => dialog.current?.showModal()}
      >
        Listening notes & credits ↗
      </button>
      <dialog
        ref={dialog}
        className="notes-dialog"
        aria-labelledby="notes-title"
        data-lenis-prevent
        onClose={() => opener.current?.focus({ preventScroll: true })}
      >
        <header>
          <h2 id="notes-title">Listening notes & recording credits</h2>
          <button
            aria-label="Close listening notes"
            onClick={() => dialog.current?.close()}
          >
            Close ×
          </button>
        </header>
        <div className="context-grid">
          <section>
            <p className="eyebrow">A little nudge</p>
            <h3>{chapter.title}</h3>
            <p>{chapter.hint}</p>
            <p>
              {activity === "theater"
                ? "The scene is our interpretation. Yours can be completely different."
                : activity === "conversation"
                  ? "Choose a prepared question. These are editorial notes, not the composer speaking."
                  : "No timer. No score. Just another reason to listen."}
            </p>
          </section>
          <section>
            <p className="eyebrow">The work</p>
            <p>
              The seventh miniature in <em>The Carnival of the Animals</em>.
              Composed in France, 1886.
            </p>
            <p>{work.recording}</p>
            <p>{work.recordingNote}</p>
            <a href={work.source} target="_blank" rel="noreferrer">
              Original recording ↗
            </a>
            <a href={work.license} target="_blank" rel="noreferrer">
              CC BY 4.0 ↗
            </a>
          </section>
        </div>
      </dialog>
    </aside>
  );
}
