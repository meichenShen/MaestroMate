import { BackLink } from "./navigation/BackLink";
import { resetProgramProgress } from "./features/curriculum/study-flow";
import {
  CreativeStudio,
  emptyStudio,
  type StudioDraft,
} from "./features/creation/CreativeStudio";
import { useCallback, useEffect, useRef, useState } from "react";
import { AudioProvider, useAudio } from "./audio/AudioProvider";
import type { ActivityId } from "./content/aquarium";
import { BrandHeader } from "./components/BrandHeader";
import { ContextPanel } from "./components/ContextPanel";
import { Player } from "./components/Player";
import { Guide } from "./components/Guide";
import { EntryChoice, type EntryRoute } from "./components/EntryChoice";
import { ProgramComplete } from "./features/program/ProgramComplete";
import { JourneyProgress } from "./components/JourneyProgress";
import { Home } from "./features/home/Home";
import { Programme } from "./features/home/Programme";
import { Theater } from "./features/theater/Theater";
import { Conversation } from "./features/conversation/Conversation";
import { useComposerChat } from "./features/conversation/useComposerChat";
import { Detective, initialProgress } from "./features/detective/Detective";
import { ListeningLibrary } from "./features/library/ListeningLibrary";
import { MusicPool } from "./features/water/MusicPool";
import { emptyMelody } from "./features/water/model";
import { useSmoothPage } from "./hooks/useSmoothPage";
import { useRoute } from "./navigation/useRoute";
import { activityHash, navigate } from "./navigation/routes";
import { LessonRoom } from "./features/curriculum/LessonRoom";
import { PlayCatalog } from "./features/curriculum/PlayCatalog";
import {
  resolveUnitInArea,
  type CurriculumProgress,
} from "./content/curriculum";
import "./features/learning/learning.css";

function Site() {
  const audio = useAudio(),
    route = useRoute();
  const previousHash = useRef(location.hash);
  const scrollTo = useSmoothPage(route.kind === "home");
  const chat = useComposerChat();
  const [bookOpen, setBookOpen] = useState(false),
    [progress, setProgress] = useState(initialProgress),
    [motion, setMotion] = useState(true),
    [visited, setVisited] = useState<ActivityId[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumProgress>({});
  const [studioDrafts, setStudioDrafts] = useState<Record<string, StudioDraft>>(
    {},
  );
  const [melody, setMelody] = useState(emptyMelody);
  const [guide, setGuide] = useState(() => {
    try {
      return sessionStorage.getItem("maestromate-guide-v2") !== "seen";
    } catch {
      return true;
    }
  });
  const [entrance, setEntrance] = useState(() => {
    try {
      return (
        !location.hash &&
        sessionStorage.getItem("maestromate-entry-v2") !== "seen"
      );
    } catch {
      return !location.hash;
    }
  });
  const lessonSelection =
    route.kind === "lesson"
      ? route
      : route.kind === "learning"
        ? {
            unitId:
              route.journey && route.level === undefined
                ? "aquarium-composer"
                : ["aquarium-layers", "aquarium-colour", "aquarium-return"][
                    route.level || 0
                  ],
            area: "works" as const,
            workId: route.workId || "aquarium",
            journey: route.journey,
          }
        : null;
  const selectedLesson =
    lessonSelection &&
    resolveUnitInArea(
      lessonSelection.unitId,
      lessonSelection.area,
      lessonSelection.workId,
    );
  const closeGuide = useCallback(() => {
    setGuide(false);
    try {
      sessionStorage.setItem("maestromate-guide-v2", "seen");
    } catch {}
  }, []);
  useEffect(() => {
    const changed = previousHash.current !== location.hash;
    previousHash.current = location.hash;
    if (route.kind !== "activity") audio.pause();
    if (route.kind === "activity" && route.journey)
      setVisited((items) =>
        items.includes(route.activity) ? items : [...items, route.activity],
      );
    if (lessonSelection?.journey && selectedLesson)
      setVisited((items) =>
        items.includes("detective") ? items : [...items, "detective"],
      );
    let frame = 0;
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (route.kind === "home") {
          scrollTo(document.getElementById(route.section) || 0, true);
        } else {
          window.scrollTo({ top: 0, behavior: "instant" });
          if (changed && !document.querySelector("dialog[open]"))
            document.getElementById("main")?.focus({ preventScroll: true });
        }
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [route, audio.pause, scrollTo, selectedLesson]);
  const chooseEntry = (choice: EntryRoute) => {
    setEntrance(false);
    try {
      sessionStorage.setItem("maestromate-entry-v2", "seen");
    } catch {}
    if (choice === "work") {
      setBookOpen(false);
      navigate("#program");
    } else if (choice === "experience") navigate("#explore");
  };
  const startProgram = () => {
    setVisited([]);
    audio.pause();
    audio.seek(0);
    navigate(activityHash("theater", true));
  };
  const activity = route.kind === "activity" ? route.activity : null;
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main");
          main?.focus({ preventScroll: true });
          main?.scrollIntoView({ block: "start" });
        }}
      >
        Skip to content
      </a>
      <BrandHeader
        route={route}
        onGuide={() => setGuide(true)}
        onEntry={() => setEntrance(true)}
      />
      {route.kind === "home" ? (
        <Home motion={!guide && !entrance} />
      ) : route.kind === "library" ? (
        route.intent === "listen" ? (
          <ListeningLibrary />
        ) : (
          <main id="main" tabIndex={-1} className="program-library page-room">
            <header className="page-intro">
              <p className="eyebrow">Take the whole little adventure</p>
              <h1>
                One piece.
                <br />
                Three ways to get closer.
              </h1>
              <p>
                A Program brings listening, a chat and a little play together.
                <br />
                Choose a piece. We'll keep you company along the way.
              </p>
            </header>
            <Programme
              open={bookOpen}
              onOpen={() => setBookOpen(true)}
              onClose={() => setBookOpen(false)}
              onEnter={startProgram}
            />
          </main>
        )
      ) : route.kind === "games" || route.kind === "playcatalog" ? (
        <PlayCatalog
          area={route.kind === "playcatalog" ? route.area : undefined}
          progress={curriculum}
        />
      ) : route.kind === "learning" || route.kind === "lesson" ? (
        <LessonRoom
          unitId={lessonSelection!.unitId}
          area={lessonSelection!.area}
          workId={lessonSelection!.workId}
          progress={curriculum}
          onChange={(id, p) =>
            setCurriculum((previous) => ({ ...previous, [id]: p }))
          }
          enabled={!guide && !entrance}
          journey={route.journey}
          phase={route.kind === "lesson" ? route.phase : undefined}
          question={route.kind === "lesson" ? route.question : undefined}
        />
      ) : route.kind === "studio" ? (
        <CreativeStudio
          key={route.studioId}
          id={route.studioId}
          draft={studioDrafts[route.studioId] || emptyStudio()}
          onChange={(v) =>
            setStudioDrafts((old) => ({ ...old, [route.studioId]: v }))
          }
          enabled={!guide && !entrance}
        />
      ) : route.kind === "pool" ? (
        <MusicPool
          melody={melody}
          onChange={setMelody}
          enabled={!guide && !entrance}
        />
      ) : route.kind === "summary" ? (
        <ProgramComplete
          curriculum={curriculum}
          motion={!guide && !entrance}
          onRestart={() => {
            setProgress(initialProgress);
            setCurriculum(resetProgramProgress);
            chat.reset();
            startProgram();
          }}
        />
      ) : (
        <main
          id="main"
          tabIndex={-1}
          className={
            "work-room " + (route.journey ? "in-program" : "standalone-room")
          }
          data-room={activity}
        >
          {route.journey ? (
            <JourneyProgress active={route.activity} visited={visited} />
          ) : (
            <div className="room-back">
              <BackLink
                href={
                  route.activity === "theater"
                    ? "#listen"
                    : route.activity === "detective"
                      ? "#play/works"
                      : "#explore"
                }
              >
                ←{" "}
                {route.activity === "theater"
                  ? "Choose another piece"
                  : route.activity === "detective"
                    ? "Back to the play room"
                    : "Back to the rooms"}
              </BackLink>
            </div>
          )}
          <div className="room-layout">
            <div id="activity-panel" className="activity-panel">
              {activity === "theater" ? (
                <Theater
                  journey={route.journey}
                  onDiscover={
                    route.journey
                      ? undefined
                      : () => navigate(activityHash("conversation", false))
                  }
                  motion={motion}
                  onMotionChange={setMotion}
                />
              ) : activity === "conversation" ? (
                <Conversation journey={route.journey} chat={chat} />
              ) : (
                <Detective progress={progress} onChange={setProgress} />
              )}
            </div>
          </div>
          {route.journey && (
            <div className="journey-next">
              <p>
                {activity === "theater"
                  ? "Ready to meet the person behind the music?"
                  : activity === "conversation"
                    ? "Fancy finding a little detail for yourself?"
                    : "That was a lovely little visit."}
              </p>
              <button
                className="solid-button"
                aria-label={
                  activity === "theater"
                    ? "Continue to chat"
                    : activity === "conversation"
                      ? "Continue to play"
                      : "Finish this visit"
                }
                onClick={() =>
                  navigate(
                    activity === "theater"
                      ? activityHash("conversation", true)
                      : activity === "conversation"
                        ? "#program/aquarium/learn"
                        : "#program/aquarium/done",
                  )
                }
              >
                {activity === "theater"
                  ? "Continue to chat"
                  : activity === "conversation"
                    ? "Continue to play"
                    : "Finish this visit"}{" "}
                ↗
              </button>
              <a href="#program">Leave this Program</a>
            </div>
          )}
          <ContextPanel activity={route.activity} />
        </main>
      )}
      {route.kind === "activity" && <Player />}
      {guide && <Guide onClose={closeGuide} />}{" "}
      {entrance && !guide && <EntryChoice onChoose={chooseEntry} />}
    </>
  );
}
export function App() {
  return (
    <AudioProvider>
      <Site />
    </AudioProvider>
  );
}
