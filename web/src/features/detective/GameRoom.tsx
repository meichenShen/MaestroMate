import { ArrowUpRight } from "lucide-react";
import { DrawnIcon } from "../../components/DrawnIcon";
import { navigate } from "../../navigation/routes";
import { PoolGlyph } from "../water/PoolGlyph";
import "./game-room.css";
export function GameRoom() {
  return (
    <main id="main" tabIndex={-1} className="game-lounge page-room">
      <div className="page-intro">
        <p className="eyebrow">The play room</p>
        <h1>A little play goes a long way.</h1>
        <p>
          Find a hidden detail. Make a melody of your own.
          <br />
          Follow whatever makes you curious.
        </p>
      </div>
      <div className="play-activities">
        <button
          className="game-door"
          aria-label="Play Sound Detective"
          onClick={() => navigate("#play/aquarium")}
        >
          <DrawnIcon kind="play" />
          <span>
            <strong>Sound Detective</strong>
            <small>Three sound clues. No rush. Just your ears.</small>
            <span className="game-cta">
              Let's play <ArrowUpRight size={23} />
            </span>
          </span>
        </button>
        <button
          className="game-door pool-door"
          aria-label="Play Music Pool"
          onClick={() => navigate("#play/pool")}
        >
          <PoolGlyph />
          <span>
            <strong>Music Pool</strong>
            <small>
              Five notes, a little water, and something only you could make.
            </small>
            <span className="game-cta">
              Make a little ripple <ArrowUpRight size={23} />
            </span>
          </span>
        </button>
      </div>
    </main>
  );
}
