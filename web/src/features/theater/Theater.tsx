import { lazy, Suspense } from "react";
import { Play, Pause } from "lucide-react";
import { useAudio } from "../../audio/AudioProvider";
import { formatTime } from "../../audio/timeline";
import { chapters } from "../../content/aquarium";
const Sculpture = lazy(() =>
  import("../../components/Sculpture").then((m) => ({ default: m.Sculpture })),
);
export function Theater({
  onDiscover,
  motion,
  onMotionChange,
}: {
  onDiscover: () => void;
  motion: boolean;
  onMotionChange: (value: boolean) => void;
}) {
  const audio = useAudio();
  return (
    <section aria-labelledby="theater-title" className="theater-feature">
      <div className="feature-heading">
        <span className="micro">01 / LISTEN & IMAGINE</span>
        <h1 id="theater-title">Aquarium</h1>
        <p>Let the music take its own shape.</p>
      </div>
      <div className={`listening-scene phase-${audio.chapter.id}`}>
        <div className="scene-topline">
          <span className="micro">
            {audio.playing ? "NOW LISTENING" : "A SMALL WORLD, WAITING"}
          </span>
          <button
            aria-pressed={!motion}
            onClick={() => onMotionChange(!motion)}
          >
            {motion ? "Motion off" : "Motion on"}
          </button>
        </div>
        <Suspense fallback={<span className="micro">SETTING THE SCENE</span>}>
          <Sculpture kind="fish" motion={motion && audio.playing} />
        </Suspense>
        <div className="scene-caption" aria-live="polite">
          <span className="micro">
            0{chapters.indexOf(audio.chapter) + 1} / 04
          </span>
          <h2>{audio.chapter.title}</h2>
          <p>{audio.chapter.image}</p>
        </div>
        <button
          className="scene-play"
          aria-label={audio.playing ? "Pause the scene" : "Listen to the scene"}
          onClick={audio.toggle}
        >
          {audio.playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>
      <nav className="chapter-navigation" aria-label="Listening chapters">
        {chapters.map((chapter, index) => (
          <button
            key={chapter.id}
            aria-current={audio.chapter.id === chapter.id ? "step" : undefined}
            onClick={() => audio.seek(chapter.start)}
          >
            <span className="micro">
              0{index + 1} / {formatTime(chapter.start)}
            </span>
            <strong>{chapter.title}</strong>
          </button>
        ))}
      </nav>
      <div className="theater-footer">
        <p>An imagined scene. A real recording. Your own way in.</p>
        <button className="text-button" onClick={onDiscover}>
          Meet the composer ↗
        </button>
      </div>
    </section>
  );
}
