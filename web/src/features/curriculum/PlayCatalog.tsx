import { BackLink } from "../../navigation/BackLink";
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
          <h1>Play</h1>
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
              tag: "A studio for your own ideas",
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
          Choose a path. We’ll guide the next little step.
        </p>
      </main>
    );
  const work = area === "works",
    create = area === "create";
  return (
    <main id="main" tabIndex={-1} className="play-catalog page-room">
      <header className="catalog-top">
        <BackLink href="#play">Back to Play</BackLink>
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
            ? "Explore Aquarium"
            : create
              ? "Create & play"
              : "Music lessons"}
        </h1>
        <p>
          {work
            ? "Six ways into the piece: people, history, instruments and sound."
            : create
              ? "Three independent studios. No quizzes, no right answers."
              : "First sounds → building music → people and instruments."}
        </p>
      </header>
      {area === "lessons" && (
        <div className="course-chapters" aria-label="Course progression">
          <span>
            01 First sounds <small>Lessons 1–3</small>
          </span>
          <span>
            02 Building music <small>Lessons 4–5</small>
          </span>
          <span>
            03 People & instruments <small>Lessons 6–8</small>
          </span>
        </div>
      )}
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
            {[
              {
                id: "beats",
                title: "Beat Studio",
                kind: "rhythm" as const,
                text: "Tap eight lights. Leave spaces. Hear your groove.",
                colour: "#FFDA8E",
              },
              {
                id: "melody",
                title: "Melody Studio",
                kind: "pitch" as const,
                text: "Draw a tune with notes. Give it some company.",
                colour: "#A593E0",
              },
            ].map((s) => (
              <a
                className="lesson-cover"
                key={s.id}
                href={"#play/create/" + s.id}
                aria-label={s.title}
                style={{ "--unit-colour": s.colour } as React.CSSProperties}
              >
                <LearningArt kind={s.kind} />
                <span className="lesson-kicker">Free creation</span>
                <h2>{s.title}</h2>
                <p>{s.text}</p>
                <span className="pill-action">Open the studio</span>
              </a>
            ))}
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
                    : "Learn · Play · Discover"}
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
            : "Follow the lesson numbers from the beginning, or revisit any idea."}
        </p>
      )}
    </main>
  );
}
