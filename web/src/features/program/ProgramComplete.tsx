import { TheatreStage } from "../../components/TheatreStage";

import { completedTrail, type TrailProgress } from "../../content/learning";
export function ProgramComplete({
  trail,
  onRestart,
  motion = true,
}: {
  trail: TrailProgress;
  onRestart: () => void;
  motion?: boolean;
}) {
  return (
    <main id="main" tabIndex={-1} className="program-summary page-room">
      <TheatreStage celebrate motion={motion} />
      <div className="completion-copy">
        <p className="eyebrow">Your Aquarium Program · Complete</p>
        <h1>Lovely wandering.</h1>
        <p>
          One piece. A few new discoveries.
          <br />
          Thank you for following your ears.
        </p>
        <div className="learning-recap">
          <p>Your discoveries this visit</p>
          {completedTrail(trail).map((done, i) => (
            <p key={i}>
              {done ? "✓" : "○"}{" "}
              {
                [
                  "Followed pitch: high and low",
                  "Recognised a returning phrase",
                  "Created a musical variation",
                ][i]
              }
              {done ? "" : " · ready to explore"}
            </p>
          ))}
          <a href="#program/aquarium/learn">Revisit your discoveries ↗</a>
        </div>
        <div className="completion-actions">
          <a className="solid-button" href="#home" aria-label="Home">
            Home ↗
          </a>
          <button
            className="completion-restart"
            onClick={onRestart}
            aria-label="Restart Program"
          >
            Restart Program ↻
          </button>
          <a
            className="completion-another"
            href="#program"
            aria-label="Choose another Program"
          >
            Choose another Program ↗
          </a>
        </div>
      </div>
    </main>
  );
}
