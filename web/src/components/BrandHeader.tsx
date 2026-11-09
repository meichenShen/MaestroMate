export function BrandHeader({
  onGuide,
  onHome,
  onSection,
}: {
  onGuide: () => void;
  onHome: () => void;
  onSection: (id: string) => void;
}) {
  return (
    <header className="brand-header">
      <a
        className="brand"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onHome();
        }}
        aria-label="MaestroMate home"
      >
        maestro<span>mate.</span>
        <small>A LISTENING ROOM</small>
      </a>
      <p className="header-caption">
        Classical music.
        <br />A different way in.
      </p>
      <nav aria-label="Main navigation">
        <a
          href="#programme"
          onClick={(e) => {
            e.preventDefault();
            onSection("programme");
          }}
        >
          Programme
        </a>
        <a
          href="#experiences"
          onClick={(e) => {
            e.preventDefault();
            onSection("experiences");
          }}
        >
          Experiences
        </a>
        <a
          href="#about"
          onClick={(e) => {
            e.preventDefault();
            onSection("about");
          }}
        >
          About
        </a>
        <button onClick={onGuide} aria-label="Open guide">
          Guide <span>↗</span>
        </button>
      </nav>
    </header>
  );
}
