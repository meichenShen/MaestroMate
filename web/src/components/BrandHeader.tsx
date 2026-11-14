import { Compass, ArrowUpRight } from "lucide-react";
import type { Route } from "../navigation/routes";
export function BrandHeader({
  route,
  onGuide,
  onEntry,
}: {
  route: Route;
  onGuide: () => void;
  onEntry: () => void;
}) {
  const active =
    route.kind === "activity"
      ? route.journey
        ? "program"
        : { theater: "listen", conversation: "chat", detective: "play" }[
            route.activity
          ]
      : route.kind === "library"
        ? route.intent
        : route.kind === "games" || route.kind === "pool"
          ? "play"
          : route.kind === "summary"
            ? "program"
            : "";
  return (
    <header className="brand-header">
      <a className="brand" href="#home" aria-label="MaestroMate home">
        MaestroMate
      </a>
      <nav aria-label="Main navigation">
        <div className="room-links">
          {[
            { id: "listen", label: "Listen" },
            { id: "chat", label: "Chat" },
            { id: "play", label: "Play" },
          ].map((item) => (
            <a
              key={item.id}
              href={"#" + item.id}
              aria-current={active === item.id ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
        <a
          className="program-link"
          href="#program"
          aria-current={active === "program" ? "page" : undefined}
        >
          Program
          <ArrowUpRight size={16} />
        </a>
        <button
          className="entry-reopen"
          aria-label="Choose a way in"
          onClick={onEntry}
        >
          <Compass size={20} />
        </button>
        <button
          className="guide-link"
          onClick={onGuide}
          aria-label="Open guide"
        >
          Guide
        </button>
      </nav>
    </header>
  );
}
