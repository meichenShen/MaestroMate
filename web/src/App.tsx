import { useCallback, useEffect, useState } from "react";
import { AudioProvider, useAudio } from "./audio/AudioProvider";
import { type ActivityId } from "./content/aquarium";
import { BrandHeader } from "./components/BrandHeader";
import { ActivityNav } from "./components/ActivityNav";
import { ContextPanel } from "./components/ContextPanel";
import { Player } from "./components/Player";
import { Guide } from "./components/Guide";
import { EntryChoice, type EntryRoute } from "./components/EntryChoice";
import { Home } from "./features/home/Home";
import { Theater } from "./features/theater/Theater";
import { Conversation } from "./features/conversation/Conversation";
import { Detective, initialProgress } from "./features/detective/Detective";
import { useSmoothPage } from "./hooks/useSmoothPage";
function routeFromHash() {
  const match = location.hash.match(
    /^#work\/aquarium\/(theater|conversation|detective)$/,
  );
  return match ? (match[1] as ActivityId) : null;
}
function Site() {
  const audio = useAudio();
  useSmoothPage();
  const [activity, setActivity] = useState<ActivityId>(
    routeFromHash() || "theater",
  );
  const [inWork, setInWork] = useState(!!routeFromHash());
  const [bookOpen, setBookOpen] = useState(location.hash === "#programme");
  const [mode, setMode] = useState<ActivityId>("theater");
  const [selectedQuestion, setSelectedQuestion] = useState("aquarium");
  const [progress, setProgress] = useState(initialProgress);
  const [motion, setMotion] = useState(true);
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
        sessionStorage.getItem("maestromate-entry-v1") !== "seen"
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
  const toWork = (id: ActivityId) => {
    location.hash = "work/aquarium/" + id;
  };
  const toSection = (id: string) => {
    setInWork(false);
    audio.pause();
    if (id === "programme") setBookOpen(true);
    location.hash = id;
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      ),
    );
  };
  useEffect(() => {
    const sync = () => {
      const next = routeFromHash();
      setInWork(!!next);
      if (next) {
        setActivity(next);
        window.scrollTo({ top: 0, behavior: "instant" });
      } else {
        audio.pause();
        if (location.hash === "#programme") setBookOpen(true);
        const id = location.hash.slice(1);
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            id
              ? document
                  .getElementById(id)
                  ?.scrollIntoView({ block: "start", behavior: "instant" })
              : window.scrollTo({ top: 0, behavior: "instant" }),
          ),
        );
      }
    };
    window.addEventListener("hashchange", sync);
    sync();
    return () => window.removeEventListener("hashchange", sync);
  }, [audio.pause]);
  const chooseEntry = (route: EntryRoute) => {
    setEntrance(false);
    try {
      sessionStorage.setItem("maestromate-entry-v1", "seen");
    } catch {}
    if (route === "work") {
      setMode("theater");
      toSection("programme");
    } else if (route === "experience") toSection("experiences");
  };
  const onHome = () => {
    audio.pause();
    setInWork(false);
    location.hash = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <>
      <a
        href="#main"
        className="skip-link"
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
        onGuide={() => setGuide(true)}
        onEntry={() => setEntrance(true)}
        onHome={onHome}
        onSection={toSection}
      />
      {inWork ? (
        <main id="main" tabIndex={-1} className="work-room">
          <div className="room-topline">
            <button
              className="text-button"
              aria-label="Back to programme"
              onClick={() => toSection("programme")}
            >
              ← <span>Back to programme</span>
            </button>
            <span className="micro">Saint-Saëns · Aquarium</span>
          </div>
          <ActivityNav active={activity} onChange={toWork} />
          <div className="room-layout">
            <div id="activity-panel" className="activity-panel">
              {activity === "theater" ? (
                <Theater
                  onDiscover={() => toWork("conversation")}
                  motion={motion}
                  onMotionChange={setMotion}
                />
              ) : activity === "conversation" ? (
                <Conversation
                  selected={selectedQuestion}
                  onSelect={setSelectedQuestion}
                />
              ) : (
                <Detective progress={progress} onChange={setProgress} />
              )}
            </div>
            <ContextPanel activity={activity} />
          </div>
          <div className="room-next">
            <span className="micro">Keep exploring</span>
            <button
              onClick={() =>
                toWork(
                  activity === "theater"
                    ? "conversation"
                    : activity === "conversation"
                      ? "detective"
                      : "theater",
                )
              }
            >
              {activity === "theater"
                ? "Next: meet the composer"
                : activity === "conversation"
                  ? "Next: follow the clues"
                  : "Listen again"}{" "}
              <span>↗</span>
            </button>
          </div>
        </main>
      ) : (
        <Home
          open={bookOpen}
          onOpen={() => setBookOpen(true)}
          onClose={() => setBookOpen(false)}
          onStart={() => {
            setMode("theater");
            toSection("programme");
          }}
          onExplore={(id) => {
            setMode(id);
            toSection("programme");
          }}
          onEnter={() => toWork(mode)}
          mode={mode}
        />
      )}
      {inWork && <Player />}
      {guide && <Guide onClose={closeGuide} />}
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
