import { ArrowUpRight } from "lucide-react";
import { DrawnIcon } from "../../components/DrawnIcon";
import { AquariumView } from "../../components/AquariumView";
import { navigate } from "../../navigation/routes";
import { PoolGlyph } from "../water/PoolGlyph";
import { playWorks } from "../../content/play/aquarium";
import "./game-room.css";
export function GameRoom() {
  return (
    <main id="main" tabIndex={-1} className="game-lounge page-room">
      <div className="page-intro">
        <p className="eyebrow">Play by work</p>
        <h1>Stay in the music.</h1>
      </div>
      {Object.values(playWorks)
        .filter((w) => !!w)
        .map((w) => (
          <section
            className="work-play-cover"
            key={w!.id}
            aria-label={w!.title + " games"}
          >
            <div className="work-play-art">
              <AquariumView preview />
              <span>12 little discoveries</span>
            </div>
            <div className="work-play-copy">
              <p>{w!.composer}</p>
              <h2>{w!.title}</h2>
              <p>Hear a detail. Catch an idea. Make it yours.</p>
              <div className="work-level-doors">
                {["Notice", "Explore", "Invent"].map((name, l) => (
                  <a key={name} href={`#play/learn/${w!.id}/${l}`}>
                    <span>{["Easy", "Medium", "Hard"][l]}</span>
                    <strong>
                      {name} <ArrowUpRight />
                    </strong>
                    <small>4 games</small>
                  </a>
                ))}
              </div>
              <a className="solid-button" href={"#play/learn/" + w!.id}>
                Step into Aquarium <ArrowUpRight />
              </a>
            </div>
          </section>
        ))}
      <div className="play-activities">
        <button
          className="game-door"
          aria-label="Play Sound Detective"
          onClick={() => navigate("#play/aquarium")}
        >
          <DrawnIcon kind="play" />
          <span>
            <strong>Sound Detective</strong>
            <span className="game-cta">
              Three listening clues <ArrowUpRight size={23} />
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
            <span className="game-cta">
              Follow a fish. Paint a tune. <ArrowUpRight size={23} />
            </span>
          </span>
        </button>
      </div>
    </main>
  );
}
