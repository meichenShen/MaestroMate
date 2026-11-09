import { lazy, Suspense } from "react";
import { Arrow } from "../../components/Arrow";
const Sculpture = lazy(() =>
  import("../../components/Sculpture").then((m) => ({ default: m.Sculpture })),
);
export function Programme({
  open,
  onOpen,
  onEnter,
  mode,
}: {
  open: boolean;
  onOpen: () => void;
  onEnter: () => void;
  mode: string;
}) {
  return (
    <section id="programme" className="programme-section section-anchor">
      <div className="section-side" data-reveal>
        <span className="micro">01 / THE PROGRAMME</span>
        <h2 className="display-heading">
          Pick your
          <br />
          <span>first listen.</span>
        </h2>
        <p>
          A whole world in one piece.
          <br />
          Stay curious. Take your time.
        </p>
        <span className="programme-direction">SCROLL TO EXPLORE ↓</span>
        {mode !== "theater" && (
          <p className="entry-note">
            Your way in:
            <br />
            {mode === "conversation" ? "Meet the composer" : "Music Detective"}
          </p>
        )}
      </div>
      {!open ? (
        <button
          className="programme-cover"
          onClick={onOpen}
          aria-label="Open programme"
        >
          <span className="micro">MAESTROMATE / VOLUME 01</span>
          <span className="cover-title">
            The
            <br />
            listening
            <br />
            programme.
          </span>
          <span className="cover-action">
            Open the programme <Arrow />
          </span>
        </button>
      ) : (
        <div className="programme-list">
          <article className="work-entry" data-work="aquarium">
            <div className="work-preview aquarium-preview">
              <span className="preview-index micro">
                0001 / A WORLD BENEATH THE SURFACE
              </span>
              <Suspense fallback={<div className="art-loading" />}>
                <Sculpture kind="fish" />
              </Suspense>
              <span className="preview-caption micro">
                AN INTERPRETATION, NOT AN ILLUSTRATION.
              </span>
            </div>
            <div className="work-information">
              <div>
                <h3>
                  Aquarium <span>1886</span>
                </h3>
                <p>Camille Saint-Saëns · The Carnival of the Animals</p>
                <p className="work-description">
                  Follow the ripples. Find your own picture.
                </p>
              </div>
              <button
                className="round-link"
                onClick={onEnter}
                aria-label="Enter Aquarium"
              >
                <span>
                  Enter work
                  <br />
                  <small>2 MIN 24 SEC</small>
                </span>
                <Arrow diagonal />
              </button>
            </div>
          </article>
          <article className="work-entry" data-work="swan">
            <div className="work-preview swan-preview">
              <span className="preview-index micro">
                0002 / A DIFFERENT KIND OF STILLNESS
              </span>
              <Suspense fallback={<div className="art-loading" />}>
                <Sculpture kind="swan" />
              </Suspense>
            </div>
            <div className="work-information">
              <div>
                <h3>
                  The Swan <span>1886</span>
                </h3>
                <p>Camille Saint-Saëns · The Carnival of the Animals</p>
              </div>
              <button className="coming-soon" disabled>
                Coming soon <span>↗</span>
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
