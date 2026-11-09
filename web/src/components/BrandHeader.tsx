import { ArrowUpRight, Compass } from "lucide-react";
export function BrandHeader({
  onGuide,
  onHome,
  onSection,
  onEntry,
}: {
  onGuide: () => void;
  onHome: () => void;
  onSection: (id: string) => void;
  onEntry: () => void;
}) {
  return (
    <header className="brand-header">
      <a
        className="brand"
        href="#"
        onClick={(event) => {
          event.preventDefault();
          onHome();
        }}
        aria-label="MaestroMate home"
      >
        MaestroMate
      </a>
      <nav aria-label="Main navigation">
        <a
          href="#programme"
          onClick={(event) => {
            event.preventDefault();
            onSection("programme");
          }}
        >
          Programme
        </a>
        <a
          href="#experiences"
          onClick={(event) => {
            event.preventDefault();
            onSection("experiences");
          }}
        >
          Experiences
        </a>
        <a
          className="about-link"
          href="#about"
          onClick={(event) => {
            event.preventDefault();
            onSection("about");
          }}
        >
          About
        </a>
        <button
          className="entry-reopen"
          aria-label="Choose a way in"
          onClick={onEntry}
        >
          <Compass size={21} />
          <span>Start here</span>
        </button>
        <button onClick={onGuide} aria-label="Open guide">
          Guide <ArrowUpRight size={17} />
        </button>
      </nav>
    </header>
  );
}
