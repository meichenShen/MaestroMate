import { TheatreStage } from "../../components/TheatreStage";

import {
  units,
  unitDone,
  type CurriculumProgress,
} from "../../content/curriculum";
export function ProgramComplete({
  curriculum,
  onRestart,
  motion = true,
}: {
  curriculum: CurriculumProgress;
  onRestart: () => void;
  motion?: boolean;
}) {
  return (
    <main id="main" tabIndex={-1} className="program-summary page-room">
      <TheatreStage celebrate motion={motion} />
      <div className="completion-copy">
        <p className="eyebrow">Your Aquarium Program · Visit complete</p>
        <h1>Lovely wandering.</h1>
        <p>
          One piece. A few new discoveries.
          <br />
          Thank you for following your ears.
        </p>
        <div className="learning-recap">
          <p>
            Your discoveries this visit ·{" "}
            {
              units.filter(
                (u) => u.area === "works" && unitDone(u, curriculum[u.id]),
              ).length
            }
            /3 explored
          </p>
          {units
            .filter((u) => u.area === "works")
            .map((u) => (
              <p key={u.id}>
                {u.title} ·{" "}
                {unitDone(u, curriculum[u.id])
                  ? "Learned, tried & made"
                  : "Still yours to explore"}
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
