import { TheatreStage } from "../../components/TheatreStage";

export function ProgramComplete({
  onRestart,
  motion = true,
}: {
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
