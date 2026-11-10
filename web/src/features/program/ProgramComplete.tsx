import { TheatreStage } from "../../components/TheatreStage";

function Fireworks() {
  return (
    <svg
      className="program-fireworks"
      viewBox="0 0 1000 650"
      aria-hidden="true"
      fill="none"
    >
      {[
        [610, 150],
        [850, 270],
        [480, 350],
      ].map(([x, y], burst) => (
        <g
          key={burst}
          className={`firework-burst burst-${burst}`}
          transform={`translate(${x} ${y})`}
        >
          {Array.from({ length: 12 }, (_, ray) => (
            <g key={ray} transform={`rotate(${ray * 30})`}>
              <path d="M0 -15V-75" />
              <circle cx="0" cy="-90" r="3" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
export function ProgramComplete({ onRestart }: { onRestart: () => void }) {
  return (
    <main id="main" tabIndex={-1} className="program-summary page-room">
      <TheatreStage />
      <Fireworks />
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
