import { ArrowDown, ArrowUpRight } from "lucide-react";
import { DrawnIcon } from "../../components/DrawnIcon";
import { RoomPortal } from "../../components/RoomPortal";
import { TheatreStage } from "../../components/TheatreStage";
import { LetterHeading } from "../../components/LetterHeading";
import { FeedbackEntry } from "../feedback/FeedbackEntry";
const scenes = [
  { id: "home", name: "Welcome" },
  { id: "explore", name: "The rooms" },
  { id: "journey", name: "A full Program" },
  { id: "about", name: "Our little idea" },
];
export function Home({ motion }: { motion: boolean }) {
  return (
    <main id="main" tabIndex={-1} className="home-scenes">
      <div className="scene-navigation" aria-label="Home scenes">
        {scenes.map((s, i) => (
          <a
            key={s.id}
            href={"#" + s.id}
            data-scene-link={s.id}
            aria-label={"Go to " + s.name}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            <i />
          </a>
        ))}
      </div>
      <section id="home" className="snap-scene welcome-scene">
        <TheatreStage motion={motion} />
        <div className="welcome-copy" data-enter="left">
          <p className="eyebrow">A little music. A little curiosity.</p>
          <LetterHeading as="h1" text={"Make yourself\nat home."} />
          <p>
            Listen for a while. Ask a question.
            <br />
            Or come and play. There's no wrong way in.
          </p>
          <a className="solid-button" href="#explore">
            Where shall we go? <ArrowUpRight size={23} />
          </a>
        </div>
        <a className="scene-scroll" href="#explore">
          Have a look around <ArrowDown size={18} />
        </a>
      </section>
      <section id="explore" className="snap-scene rooms-scene">
        <div className="scene-title" data-enter="top">
          <p className="eyebrow">Three rooms. Yours to wander.</p>
          <LetterHeading text="Follow those curious ears." />
        </div>
        <div className="portal-field">
          <RoomPortal
            kind="listen"
            title="Listen"
            hint="Choose a piece and step into its world."
            href="#listen"
            label="Enter the listening room"
            direction="left"
          />
          <RoomPortal
            kind="chat"
            title="Chat"
            hint="Pull up a chair with the person behind the music."
            href="#chat"
            label="Enter composer chat"
            direction="right"
          />
          <RoomPortal
            kind="play"
            title="Play"
            hint="A sound, a hunch, a small discovery. Follow your ears."
            href="#play"
            label="Enter music games"
            direction="bottom"
          />
        </div>
      </section>
      <section id="journey" className="snap-scene program-scene">
        <a
          className="floating-book"
          href="#program"
          aria-label="Explore the full Program"
          data-enter="left"
        >
          <DrawnIcon kind="program" />
        </a>
        <div className="program-teaser" data-enter="right">
          <p className="eyebrow">Fancy the whole little adventure?</p>
          <LetterHeading text={"One piece.\nThree ways in."} />
          <p>
            A Program brings the rooms together.
            <br />
            Listen first, have a chat, then follow a sound clue.
            <br />
            We'll keep you company along the way.
          </p>
          <a className="solid-button" href="#program">
            Take a Program <ArrowUpRight size={22} />
          </a>
          <span className="teaser-note">Aquarium, by Camille Saint-Saëns</span>
        </div>
      </section>
      <section id="about" className="snap-scene about-scene">
        <div data-enter="bottom">
          <p className="eyebrow">No music lessons needed.</p>
          <LetterHeading text={"Just bring\nyour curiosity."} />
          <p>
            We made MaestroMate for the moments when a piece catches your ear,
            <br className="desktop-break" /> and you want to stay a little
            longer.
          </p>
          <div className="about-actions">
          <FeedbackEntry />
            <a
              href="https://github.com/meichenShen/MaestroMate"
              target="_blank"
              rel="noreferrer"
            >
            Say hello on GitHub <ArrowUpRight size={18} />
            </a>
            <a href="/credits/README.txt" target="_blank" rel="noreferrer">
              Credits
            </a>
          </div>
        </div>
        <p className="home-signoff">A work in progress. A space to play.</p>
      </section>
    </main>
  );
}
