import type { ActivityId } from "../content/aquarium.ts";
export type HomeSection = "home" | "explore" | "journey" | "about";
export type Route =
  | { kind: "home"; section: HomeSection }
  | { kind: "library"; intent: "listen" | "program" }
  | { kind: "activity"; activity: ActivityId; journey: boolean }
  | { kind: "games" }
  | { kind: "pool" }
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
    ? "#program/aquarium/" + name
    : activity === "conversation"
      ? "#chat"
      : "#" + name + "/aquarium";
}
export function navigate(hash: string) {
  if (location.hash === hash)
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  else location.hash = hash;
}
