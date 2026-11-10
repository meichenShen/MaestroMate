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
import { GameRoom } from "./features/detective/GameRoom";
import { ListeningLibrary } from "./features/library/ListeningLibrary";
import { useSmoothPage } from "./hooks/useSmoothPage";
import { useRoute } from "./navigation/useRoute";
import { activityHash, navigate } from "./navigation/routes";
function Site() {
  const audio = useAudio(),
    route = useRoute();
  const previousHash = useRef(location.hash);
  const scrollTo = useSmoothPage(route.kind === "home");
  const chat = useComposerChat();
  const [bookOpen, setBookOpen] = useState(true),
    [progress, setProgress] = useState(initialProgress),
    [motion, setMotion] = useState(true),
    [visited, setVisited] = useState<ActivityId[]>([]);
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
  }, [route, audio.pause, scrollTo]);
  const chooseEntry = (choice: EntryRoute) => {
    setEntrance(false);
    try {
      sessionStorage.setItem("maestromate-entry-v2", "seen");
    } catch {}
    if (choice === "work") {
      setBookOpen(true);
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
      ) : route.kind === "games" ? (
        <GameRoom />
      ) : route.kind === "summary" ? (
        <ProgramComplete
          motion={!guide && !entrance}
          onRestart={() => {
            setProgress(initialProgress);
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
              <a
                href={
                  route.activity === "theater"
                    ? "#listen"
                    : route.activity === "detective"
                      ? "#play"
                      : "#explore"
                }
              >
                ←{" "}
                {route.activity === "theater"
                  ? "Choose another piece"
                  : route.activity === "detective"
                    ? "Back to the play room"
                    : "Back to the rooms"}
              </a>
            </div>
          )}
          <div className="room-layout">
            <div id="activity-panel" className="activity-panel">
              {activity === "theater" ? (
                <Theater
                  onDiscover={
                    route.journey
                      ? undefined
                      : () => navigate(activityHash("conversation", false))
                  }
                  motion={motion}
                  onMotionChange={setMotion}
                />
              ) : activity === "conversation" ? (
                <Conversation
                  turns={chat.turns}
                  pending={chat.pending}
                  onAsk={chat.ask}
                />
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
                        ? activityHash("detective", true)
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
