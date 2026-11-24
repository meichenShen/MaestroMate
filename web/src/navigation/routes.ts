import type { ActivityId } from "../content/aquarium.ts";
export type HomeSection = "home" | "explore" | "journey" | "about";
export type Route =
  | { kind: "home"; section: HomeSection }
  | { kind: "library"; intent: "listen" | "program" }
  | { kind: "activity"; activity: ActivityId; journey: boolean }
  | { kind: "games" }
  | { kind: "pool" }
  | { kind: "playcatalog"; area: "works" | "lessons" | "create" }
  | { kind: "lesson"; unitId: string; journey: boolean }
  | { kind: "learning"; journey: boolean; workId?: string; level?: number }
  | { kind: "summary" };
const names: Record<string, ActivityId> = {
  listen: "theater",
  chat: "conversation",
  play: "detective",
};
export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, "");
  if (["", "home", "explore", "experiences", "journey", "about"].includes(path))
    return {
      kind: "home",
      section: (!path
        ? "home"
        : path === "experiences"
          ? "explore"
          : path) as HomeSection,
    };
  if (path === "listen") return { kind: "library", intent: "listen" };
  if (path === "program" || path === "programme")
    return { kind: "library", intent: "program" };
  if (path === "chat")
    return { kind: "activity", activity: "conversation", journey: false };
  if (path === "play") return { kind: "games" };
  const catalogue = path.match(/^play\/(works|lessons|create)$/);
  if (catalogue)
    return {
      kind: "playcatalog",
      area: catalogue[1] as "works" | "lessons" | "create",
    };
  const lesson = path.match(
    /^play\/(?:works\/aquarium|lessons)\/([a-zA-Z0-9_-]+)$/,
  );
  if (lesson) return { kind: "lesson", unitId: lesson[1], journey: false };
  const programLesson = path.match(
    /^program\/aquarium\/learn\/([a-zA-Z0-9_-]+)$/,
  );
  if (programLesson)
    return { kind: "lesson", unitId: programLesson[1], journey: true };
  if (
    path === "play/learn" ||
    path === "program/aquarium/learn" ||
    path === "program/aquarium/play"
  )
    return { kind: "learning", journey: path.startsWith("program/") };
  const playWork = path.match(/^play\/learn\/([a-z0-9-]+)(?:\/([0-2]))?$/);
  if (playWork)
    return {
      kind: "learning",
      journey: false,
      workId: playWork[1],
      level: Number(playWork[2] || 0),
    };
  if (path === "play/pool") return { kind: "pool" };
  if (path === "listen/aquarium")
    return { kind: "activity", activity: "theater", journey: false };
  if (path === "play/aquarium")
    return { kind: "activity", activity: "detective", journey: false };
  if (path === "program/aquarium/done") return { kind: "summary" };
  const program = path.match(/^program\/aquarium\/(listen|chat|play)$/);
  if (program)
    return { kind: "activity", activity: names[program[1]], journey: true };
  const legacy = path.match(
    /^work\/aquarium\/(theater|conversation|detective)$/,
  );
  if (legacy)
    return {
      kind: "activity",
      activity: legacy[1] as ActivityId,
      journey: false,
    };
  return { kind: "home", section: "home" };
}
export function activityHash(activity: ActivityId, journey = false) {
  const name = { theater: "listen", conversation: "chat", detective: "play" }[
    activity
  ];
  return journey
    ? activity === "detective"
      ? "#program/aquarium/learn"
      : "#program/aquarium/" + name
    : activity === "conversation"
      ? "#chat"
      : "#" + name + "/aquarium";
}
export function navigate(hash: string) {
  if (location.hash === hash)
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  else location.hash = hash;
}
