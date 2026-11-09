import { useAudio } from "../audio/AudioProvider";
import { work, type ActivityId } from "../content/aquarium";
export function ContextPanel({ activity }: { activity: ActivityId }) {
  const { chapter } = useAudio();
  return (
    <aside
      className="context-panel"
      aria-label="Listening notes and recording credits"
    >
      <section>
        <span className="micro">A LITTLE NUDGE</span>
        <h3>{chapter.title}</h3>
        <p>{chapter.hint}</p>
      </section>
      <section>
        <span className="micro">THE WORK</span>
        <p>
          The seventh miniature in <em>The Carnival of the Animals</em>.
          Composed in France, 1886.
        </p>
        <p>
          {activity === "theater"
            ? "The scene is our interpretation. Yours can be completely different."
            : activity === "conversation"
              ? "Choose a prepared question. These are editorial notes, not the composer speaking."
              : "No timer. No score. Just another reason to listen."}
        </p>
        <details>
          <summary>Recording & sources</summary>
          <p>{work.recording}</p>
          <p>{work.recordingNote}</p>
          <a href={work.source} target="_blank" rel="noreferrer">
            Original recording ↗
          </a>
          <a href={work.license} target="_blank" rel="noreferrer">
            CC BY 4.0 ↗
          </a>
        </details>
      </section>
    </aside>
  );
}
