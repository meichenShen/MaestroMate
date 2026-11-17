import { ArrowUpRight } from "lucide-react";
import { AquariumView } from "../../components/AquariumView";
import { DrawnIcon } from "../../components/DrawnIcon";
import { navigate } from "../../navigation/routes";
export function ListeningLibrary() {
  return (
    <main id="main" tabIndex={-1} className="listening-library page-room">
      <header className="page-intro">
        <p className="eyebrow">The listening room</p>
        <h1>Your listening room.</h1>
        <p>
          Find a piece, press play, and let your mind wander.
          <br />
          There's nothing you need to know first.
        </p>
      </header>
      <div className="listening-shelves">
        <article data-work="aquarium" className="listening-work">
          <div className="listening-art">
            <AquariumView preview />
          </div>
          <div className="work-information">
            <div>
              <h2>Aquarium</h2>
              <p>Camille Saint-Saëns · A few minutes underwater</p>
            </div>
            <button
              className="solid-button"
              aria-label="Listen to Aquarium"
              onClick={() => navigate("#listen/aquarium")}
            >
              Let's listen <ArrowUpRight size={22} />
            </button>
          </div>
        </article>
        <article data-work="swan" className="listening-work coming-work">
          <div className="listening-art swan-outline">
            <DrawnIcon kind="swan" />
          </div>
          <div className="work-information">
            <div>
              <h2>The Swan</h2>
              <p>A quiet little visit, coming soon.</p>
            </div>
            <button disabled>On its way</button>
          </div>
        </article>
      </div>
    </main>
  );
}
