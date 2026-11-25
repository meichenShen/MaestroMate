import {t,useLocale} from "../../i18n/locale";
import { BackLink } from "../../navigation/BackLink";
import { BookOpen, Music2, Waves, Check } from "lucide-react";
import { units, unitDone, type CurriculumProgress, } from "../../content/curriculum";
import { LearningArt } from "./LearningArt";
import "./curriculum.css";
export type PlayArea = "works" | "lessons" | "create";
export const unitHash = (id: string, journey = false) => journey
    ? "#program/aquarium/learn/" + id
    : "#play/" +
        (id.startsWith("aquarium-") ? "works/aquarium/" : "lessons/") +
        id;
export function PillarLinks({ active }: {
    active?: PlayArea;
}) {
    useLocale();
    return (<nav className="pillar-links" aria-label={t("Play areas")}>
      {t([
            ["works", "Explore a piece"],
            ["lessons", "Music lessons"],
            ["create", "Create & play"],
        ].map(([id, label]) => (<a key={id} href={"#play/" + id} aria-current={active === id ? "page" : undefined}>
          {t(label)}
        </a>)))}
    </nav>);
}
export function PlayCatalog({ area, progress, }: {
    area?: PlayArea;
    progress: CurriculumProgress;
}) {
    useLocale();
    if (!area)
        return (<main id="main" tabIndex={-1} className="play-hub page-room">
        <header className="curriculum-intro">
          <p className="eyebrow">{t("A little curiosity goes a long way.")}</p>
          <h1>{t("Play")}</h1>
          <p>{t("Start with a piece, meet a musical idea, or make a sound.")}</p>
        </header>
        <div className="play-pillars">
          {t([
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
            ].map((p) => (<a className="play-pillar" href={"#play/" + p.id} key={p.id} aria-label={t(p.title)} style={{ "--unit-colour": p.colour } as React.CSSProperties}>
              <span className="pillar-tag">
                <p.Icon size={18}/>
                {t(p.tag)}
              </span>
              <LearningArt kind={p.kind as "work"}/>
              <div>
                <h2>{t(p.title)}</h2>
                <p>{t(p.text)}</p>
                <span className="pill-action">{t("Step inside")}</span>
              </div>
            </a>)))}
        </div>
        <p className="curriculum-footnote">{t("Choose a path. We\u2019ll guide the next little step.")}</p>
      </main>);
    const work = area === "works", create = area === "create";
    return (<main id="main" tabIndex={-1} className="play-catalog page-room">
      <header className="catalog-top">
        <BackLink href="#play">{t("Back to Play")}</BackLink>
        <PillarLinks active={area}/>
      </header>
      <header className="curriculum-intro">
        <p className="eyebrow">
          {t(work
            ? "Camille Saint-Saëns · Aquarium"
            : create
                ? "A space for your ideas"
                : "Small lessons. Real discoveries.")}
        </p>
        <h1>
          {t(work
            ? "Explore Aquarium"
            : create
                ? "Create & play"
                : "Music lessons")}
        </h1>
        <p>
          {t(work
            ? "Six ways into the piece: people, history, instruments and sound."
            : create
                ? "Three independent studios. No quizzes, no right answers."
                : "First sounds → building music → people and instruments.")}
        </p>
      </header>
      {t(area === "lessons" && (<div className="course-chapters" aria-label={t("Course progression")}>
          <span>{t("01 First sounds ")}<small>{t("Lessons 1\u20133")}</small>
          </span>
          <span>{t("02 Building music ")}<small>{t("Lessons 4\u20135")}</small>
          </span>
          <span>{t("03 People & instruments ")}<small>{t("Lessons 6\u20138")}</small>
          </span>
        </div>))}
      <div className="lesson-cards">
        {t(create ? (<>
            <a className="lesson-cover" href="#play/pool" aria-label={t("Music Pool")} style={{ "--unit-colour": "#45D9FD" } as React.CSSProperties}>
              <LearningArt kind="create"/>
              <span className="lesson-kicker">{t("Free exploration + fish echoes")}</span>
              <h2>{t("Music Pool")}</h2>
              <p>{t("Tap, paint and replay your own eight-note tune.")}</p>
              <span className="pill-action">{t("Open the pool")}</span>
            </a>
            {t([
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
            ].map((s) => (<a className="lesson-cover" key={s.id} href={"#play/create/" + s.id} aria-label={t(s.title)} style={{ "--unit-colour": s.colour } as React.CSSProperties}>
                <LearningArt kind={s.kind}/>
                <span className="lesson-kicker">{t("Free creation")}</span>
                <h2>{t(s.title)}</h2>
                <p>{t(s.text)}</p>
                <span className="pill-action">{t("Open the studio")}</span>
              </a>)))}
          </>) : (units
            .filter((u) => u.area === area)
            .map((u, i) => (<a className="lesson-cover" key={u.id} href={unitHash(u.id)} aria-label={t(u.title)} style={{ "--unit-colour": u.colour } as React.CSSProperties}>
                <LearningArt kind={u.kind}/>
                <span className="lesson-kicker">
                  {t(work ? u.concept : "Lesson " + (i + 1) + " · " + u.concept)}
                  {t(unitDone(u, progress[u.id]) && (<Check size={18} aria-label={t("Completed")}/>))}
                </span>
                <h2>{t(u.title)}</h2>
                <p>{t(u.subtitle)}</p>
                <span className="pill-action">
                  {t(unitDone(u, progress[u.id])
                ? "Visit again"
                : "Learn · Play · Discover")}
                </span>
              </a>))))}
      </div>
      {t(work ? (<div className="catalog-connections">
          <a href="#listen/aquarium">{t("Hear the whole Aquarium")}</a>
          <a href="#chat">{t("Meet Camille")}</a>
          <a href="#play/aquarium">{t("Sound Detective \u00B7 extra listening clues")}</a>
        </div>) : (<p className="curriculum-footnote">
          {t(create
                ? "Your sketches stay with you while you explore this visit."
                : "Follow the lesson numbers from the beginning, or revisit any idea.")}
        </p>))}
    </main>);
}
