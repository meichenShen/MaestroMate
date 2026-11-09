import { ArrowUpRight } from "lucide-react";
import { DrawnIcon } from "../../components/DrawnIcon";
import { navigate } from "../../navigation/routes";
export function GameRoom() {
  return (
    <main id="main" tabIndex={-1} className="game-lounge page-room">
      <div className="page-intro">
        <p className="eyebrow">The play room</p>
        <h1>A little play goes a long way.</h1>
        <p>
          There's a tiny detail hiding in the music.
          <br />
          Fancy finding it?
        </p>
      </div>
      <button
        className="game-door"
        aria-label="Play Sound Detective"
        onClick={() => navigate("#play/aquarium")}
      >
        <DrawnIcon kind="play" />
        <span>
          <strong>Sound Detective</strong>
          <small>Two sound clues. No rush. Just your ears.</small>
          <span className="game-cta">
            Let's play <ArrowUpRight size={23} />
          </span>
        </span>
      </button>
    </main>
  );
}
