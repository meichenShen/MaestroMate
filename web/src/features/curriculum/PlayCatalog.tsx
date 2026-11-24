import { BookOpen, Music2, Waves, Check } from "lucide-react";
import {
  units,
  unitDone,
  type CurriculumProgress,
} from "../../content/curriculum";
import { LearningArt } from "./LearningArt";
import "./curriculum.css";
export type PlayArea = "works" | "lessons" | "create";
export const unitHash = (id: string, journey = false) =>
  journey
    ? "#program/aquarium/learn/" + id
    : "#play/" +
      (id.startsWith("aquarium-") ? "works/aquarium/" : "lessons/") +
      id;
export function PillarLinks({ active }: { active?: PlayArea }) {
  return (
    <nav className="pillar-links" aria-label="Play areas">
      {[
        ["works", "Explore a piece"],
        ["lessons", "Music lessons"],
        ["create", "Create & play"],
      ].map(([id, label]) => (
        <a
          key={id}
          href={"#play/" + id}
          aria-current={active === id ? "page" : undefined}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
export function PlayCatalog({
  area,
  progress,
}: {
  area?: PlayArea;
  progress: CurriculumProgress;
}) {
  if (!area)
    return (
      <main id="main" tabIndex={-1} className="play-hub page-room">
        <header className="curriculum-intro">
          <p className="eyebrow">A little curiosity goes a long way.</p>
          <h1>Hear it. Get it. Make it yours.</h1>
          <p>Start with a piece, meet a musical idea, or make a sound.</p>
        </header>
        <div className="play-pillars">
          {[
            {
              id: "works",
              title: "Explore a piece",
              kind: "work",
              Icon: Music2,
              tag: "Back inside the music",
              text: "Discover the ideas hiding in Aquarium.",
              colour: "#45D9FD",
            },
            {
              id: "lessons",
              title: "Music lessons",
              kind: "lesson",
              Icon: BookOpen,
              tag: "One idea at a time",
              text: "See it, hear it, then give it a go.",
              colour: "#EE2560",
            },
            {
              id: "create",
              title: "Create & play",
              kind: "create",
              Icon: Waves,
              tag: "Your turn to make a ripple",
              text: "A few notes. A world of possibilities.",
              colour: "#FFDA8E",
            },
          ].map((p) => (
            <a
              className="play-pillar"
              href={"#play/" + p.id}
              key={p.id}
              aria-label={p.title}
              style={{ "--unit-colour": p.colour } as React.CSSProperties}
            >
              <span className="pillar-tag">
                <p.Icon size={18} />
                {p.tag}
              </span>
              <LearningArt kind={p.kind as "work"} />
              <div>
                <h2>{p.title}</h2>
                <p>{p.text}</p>
                <span className="pill-action">Step inside</span>
              </div>
            </a>
          ))}
        </div>
        <p className="curriculum-footnote">
          No timer. No rush. Just follow your ears.
        </p>
      </main>
    );
  const work = area === "works",
    create = area === "create";
  return (
    <main id="main" tabIndex={-1} className="play-catalog page-room">
      <header className="catalog-top">
        <a href="#play">Back to Play</a>
        <PillarLinks active={area} />
      </header>
      <header className="curriculum-intro">
        <p className="eyebrow">
          {work
            ? "Camille Saint-Saëns · Aquarium"
            : create
              ? "A space for your ideas"
              : "Small lessons. Real discoveries."}
        </p>
        <h1>
          {work
            ? "Go a little deeper."
            : create
              ? "What will you make?"
              : "Music starts to make sense."}
        </h1>
        <p>
          {work
            ? "Three ideas from the piece you just heard."
            : create
              ? "Bring an idea from a lesson, or start with a splash."
              : "Learn first. Try it out. Then make something of your own."}
        </p>
      </header>
      <div className="lesson-cards">
        {create ? (
          <>
            <a
              className="lesson-cover"
              href="#play/pool"
              aria-label="Music Pool"
              style={{ "--unit-colour": "#45D9FD" } as React.CSSProperties}
            >
              <LearningArt kind="create" />
              <span className="lesson-kicker">
                Free exploration + fish echoes
              </span>
              <h2>Music Pool</h2>
              <p>Tap, paint and replay your own eight-note tune.</p>
              <span className="pill-action">Open the pool</span>
            </a>
            {["rhythm", "layers"].map((id) => {
              const u = units.find((u) => u.id === id)!;
              return (
                <a
                  className="lesson-cover"
                  key={id}
                  href={unitHash(id)}
                  aria-label={
                    id === "rhythm" ? "Ripple rhythms" : "A little duet"
                  }
                  style={{ "--unit-colour": u.colour } as React.CSSProperties}
                >
                  <LearningArt kind={u.kind} />
                  <span className="lesson-kicker">A guided making session</span>
                  <h2>
                    {id === "rhythm" ? "Ripple rhythms" : "A little duet"}
                  </h2>
                  <p>
                    {id === "rhythm"
                      ? "Place sounds and spaces on a steady beat."
                      : "Give a tune a moving accompaniment."}
                  </p>
                  <span className="pill-action">Learn & make</span>
                </a>
              );
            })}
          </>
        ) : (
          units
            .filter((u) => u.area === area)
            .map((u, i) => (
              <a
                className="lesson-cover"
                key={u.id}
                href={unitHash(u.id)}
                aria-label={u.title}
                style={{ "--unit-colour": u.colour } as React.CSSProperties}
              >
                <LearningArt kind={u.kind} />
                <span className="lesson-kicker">
                  {work ? u.concept : "Lesson " + (i + 1) + " · " + u.concept}
                  {unitDone(u, progress[u.id]) && (
                    <Check size={18} aria-label="Completed" />
                  )}
                </span>
                <h2>{u.title}</h2>
                <p>{u.subtitle}</p>
                <span className="pill-action">
                  {unitDone(u, progress[u.id])
                    ? "Visit again"
                    : "Learn · Try · Make"}
                </span>
              </a>
            ))
        )}
      </div>
      {work ? (
        <div className="catalog-connections">
          <a href="#listen/aquarium">Hear the whole Aquarium</a>
          <a href="#chat">Meet Camille</a>
          <a href="#play/aquarium">Sound Detective · extra listening clues</a>
        </div>
      ) : (
        <p className="curriculum-footnote">
          {create
            ? "Your sketches stay with you while you explore this visit."
            : "Start anywhere. Come back whenever you like."}
        </p>
      )}
    </main>
  );
}
