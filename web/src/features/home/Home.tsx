import { lazy, Suspense } from "react";
import { Arrow } from "../../components/Arrow";
import { Mark } from "../../components/Mark";
import { Programme } from "./Programme";
import { type ActivityId } from "../../content/aquarium";
const Sculpture = lazy(() =>
  import("../../components/Sculpture").then((m) => ({ default: m.Sculpture })),
);
export function Home({
  open,
  onOpen,
  onStart,
  onExplore,
  onEnter,
  mode,
}: {
  open: boolean;
  onOpen: () => void;
  onStart: () => void;
  onExplore: (activity: ActivityId) => void;
  onEnter: () => void;
  mode: ActivityId;
}) {
  return (
    <main id="main" tabIndex={-1}>
      <section className="theatre-lobby">
        <div className="hero-topline micro">
          <span>AN INDEPENDENT SPACE FOR CURIOUS EARS</span>
          <span>NO EXPERIENCE NECESSARY.</span>
        </div>
        <div className="hero-composition">
          <div className="hero-type">
            <span className="micro">COME ON IN.</span>
            <h1>
              Hear
              <br />
              <span>something</span>
              <br />
              different.
            </h1>
            <p>
              A little listening. A little wondering.
              <br />A new way to meet classical music.
            </p>
          </div>
          <div className="hero-sculpture">
            <div className="stage-outline" aria-hidden="true" />
            <Suspense fallback={<div className="art-loading" />}>
              <Sculpture kind="ribbon" />
            </Suspense>
            <span className="hero-object-label micro">
              STUDY 001 — MUSIC IN THE MAKING
            </span>
            <Mark kind="theatre" />
          </div>
        </div>
        <div className="entrance-options">
          <button onClick={onStart} aria-label="Start with a work">
            <span className="micro">01 / THE WHOLE JOURNEY</span>
            <span>
              Start with a work <Arrow />
            </span>
          </button>
          <a href="#experiences">
            <span className="micro">02 / FOLLOW YOUR CURIOSITY</span>
            <span>
              Choose an experience <Arrow />
            </span>
          </a>
          <button onClick={onStart} aria-label="Just looking">
            <span className="micro">03 / NO PLAN NEEDED</span>
            <span>
              Just looking <Arrow />
            </span>
          </button>
        </div>
        <div className="hero-bottom micro">
          <span>SCROLL FOR A CLOSER LOOK</span>
          <span>↓</span>
        </div>
      </section>
      <Programme open={open} onOpen={onOpen} onEnter={onEnter} mode={mode} />
      <section id="experiences" className="experiences section-anchor">
        <div className="experience-intro" data-reveal>
          <span className="micro">02 / THREE WAYS IN</span>
          <h2 className="display-heading">
            Same music.
            <br />
            <span>New perspective.</span>
          </h2>
          <p>
            Follow a whole journey, or start with whatever catches your
            curiosity.
          </p>
        </div>
        <div className="experience-list">
          {[
            {
              id: "theater" as const,
              kind: "listen" as const,
              name: "Listen & imagine",
              description:
                "Give the music your attention. Let a world take shape.",
              label: "Start with immersive listening",
            },
            {
              id: "conversation" as const,
              kind: "meet" as const,
              name: "Meet the composer",
              description: "A few good questions can change the way you hear.",
              label: "Start with composer conversation",
            },
            {
              id: "detective" as const,
              kind: "discover" as const,
              name: "Music Detective",
              description: "Follow a small clue. Discover a new detail.",
              label: "Start with Music Detective",
            },
          ].map((item, i) => (
            <button
              key={item.id}
              className="experience-row"
              onClick={() => onExplore(item.id)}
              aria-label={item.label}
              data-reveal
            >
              <span className="micro">0{i + 1}</span>
              <Mark kind={item.kind} />
              <span>
                <strong>{item.name}</strong>
                <small>{item.description}</small>
              </span>
              <Arrow diagonal />
            </button>
          ))}
        </div>
      </section>
      <section id="about" className="about-section section-anchor" data-reveal>
        <span className="micro">03 / WHY WE'RE HERE</span>
        <h2>
          Music doesn't need
          <br />
          an introduction.
          <br />
          <span>But a little wonder helps.</span>
        </h2>
        <p>
          MaestroMate connects listening, context and discovery around the same
          piece. An invitation to explore at your own pace, with no right way to
          begin.
        </p>
      </section>
      <footer className="site-footer">
        <span className="footer-wordmark" aria-hidden="true">
          stay curious.
        </span>
        <div className="footer-bottom">
          <p className="micro">MAESTROMATE · AN EXPLORATION IN PROGRESS</p>
          <a
            href="https://github.com/meichenShen/MaestroMate"
            target="_blank"
            rel="noreferrer"
          >
            Project & contact ↗
          </a>
          <a
            href="https://github.com/meichenShen/MaestroMate/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            Leave feedback ↗
          </a>
          <a href="/credits/README.txt" target="_blank" rel="noreferrer">
            Credits ↗
          </a>
        </div>
      </footer>
    </main>
  );
}
