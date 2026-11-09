import {
  ArrowDown,
  ArrowUpRight,
  Headphones,
  MessagesSquare,
  Search,
} from "lucide-react";
import { Programme } from "./Programme";
import { type ActivityId } from "../../content/aquarium";
export function Home({
  open,
  onOpen,
  onClose,
  onStart,
  onExplore,
  onEnter,
  mode,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onStart: () => void;
  onExplore: (activity: ActivityId) => void;
  onEnter: () => void;
  mode: ActivityId;
}) {
  const entries = [
    {
      id: "theater" as const,
      name: "Listen & imagine",
      description: "Step inside a world of sound.",
      label: "Start with immersive listening",
      image: "aquarium-poster",
      Icon: Headphones,
    },
    {
      id: "conversation" as const,
      name: "Meet the composer",
      description: "Let a good question take you somewhere.",
      label: "Start with composer conversation",
      image: "composer",
      Icon: MessagesSquare,
    },
    {
      id: "detective" as const,
      name: "Music Detective",
      description: "Listen a little closer. Find a new detail.",
      label: "Start with Music Detective",
      image: "detective",
      Icon: Search,
    },
  ];
  return (
    <main id="main" tabIndex={-1}>
      <section className="theatre-lobby">
        <img
          className="theatre-backdrop"
          src="/images/theatre.webp"
          alt="A contemporary concert hall with a grand piano"
          fetchPriority="high"
        />
        <div className="hero-type">
          <p className="eyebrow">A listening room for curious minds</p>
          <h1>
            A closer kind
            <br />
            of listening.
          </h1>
          <p>
            A little listening. A little wondering.
            <br />A new way to meet classical music.
          </p>
          <div className="hero-actions">
            <button className="solid-button" onClick={onStart}>
              Open the programme <ArrowUpRight size={23} />
            </button>
            <a href="#experiences">
              Explore experiences <ArrowDown size={19} />
            </a>
          </div>
        </div>
        <p className="hero-bottom">Come in. Take your time.</p>
      </section>
      <Programme
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        onEnter={onEnter}
        mode={mode}
      />
      <section id="experiences" className="experiences section-anchor">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">Three ways into the music</p>
          <h2>Follow your curiosity.</h2>
          <p>Listen, ask, discover. Start wherever you like.</p>
        </div>
        <div className="experience-list">
          {entries.map(({ id, name, description, label, image, Icon }) => (
            <button
              key={id}
              className="experience-portal"
              aria-label={label}
              onClick={() => onExplore(id)}
              data-reveal
            >
              <div className="experience-art">
                <img src={"/images/" + image + ".webp"} alt="" loading="lazy" />
                <span className="experience-icon">
                  <Icon size={25} strokeWidth={1.5} />
                </span>
              </div>
              <span className="experience-copy">
                <strong>{name}</strong>
                <small>{description}</small>
              </span>
              <ArrowUpRight className="portal-arrow" size={26} />
            </button>
          ))}
        </div>
      </section>
      <section id="about" className="about-section section-anchor" data-reveal>
        <p className="eyebrow">A little wonder helps</p>
        <h2>
          Music is a place
          <br />
          to get curious.
        </h2>
        <p>
          MaestroMate brings listening, context and discovery together around
          the same piece. An invitation to explore at your own pace, with no
          right way to begin.
        </p>
      </section>
      <footer className="site-footer">
        <span className="footer-wordmark">Stay curious.</span>
        <div className="footer-bottom">
          <p>MaestroMate · An exploration in progress</p>
          <a
            href="https://github.com/meichenShen/MaestroMate"
            target="_blank"
            rel="noreferrer"
          >
            Project & contact <ArrowUpRight size={15} />
          </a>
          <a
            href="https://github.com/meichenShen/MaestroMate/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            Leave feedback <ArrowUpRight size={15} />
          </a>
          <a href="/credits/README.txt" target="_blank" rel="noreferrer">
            Credits <ArrowUpRight size={15} />
          </a>
        </div>
      </footer>
    </main>
  );
}
