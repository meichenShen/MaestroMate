import {t,useLocale} from "../../i18n/locale";
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
export function Home({ motion }: {
    motion: boolean;
}) {
    useLocale();
    return (<main id="main" tabIndex={-1} className="home-scenes">
      <div className="scene-navigation" aria-label={t("Home scenes")}>
        {t(scenes.map((s, i) => (<a key={s.id} href={"#" + s.id} data-scene-link={s.id} aria-label={t("Go to " + s.name)}>
            <span>{t(String(i + 1).padStart(2, "0"))}</span>
            <i />
          </a>)))}
      </div>
      <section id="home" className="snap-scene welcome-scene">
        <TheatreStage motion={motion}/>
        <div className="welcome-copy" data-enter="left">
          <p className="eyebrow">{t("A little music. A little curiosity.")}</p>
          <LetterHeading as="h1" text={t("Explore\nmusic.")}/>
          <p>{t("Listen for a while. Ask a question.")}<br />{t("Or come and play. There's no wrong way in.")}</p>
          <a className="solid-button" href="#explore">{t("Where shall we go? ")}<ArrowUpRight size={23}/>
          </a>
        </div>
        <a className="scene-scroll" href="#explore">{t("Have a look around ")}<ArrowDown size={18}/>
        </a>
      </section>
      <section id="explore" className="snap-scene rooms-scene">
        <div className="scene-title" data-enter="top">
          <p className="eyebrow">{t("Three rooms. Yours to wander.")}</p>
          <LetterHeading text={t("Follow those curious ears.")}/>
        </div>
        <div className="portal-field">
          <RoomPortal kind="listen" title={t("Listen")} hint="Choose a piece and step into its world." href="#listen" label={t("Enter the listening room")} direction="left"/>
          <RoomPortal kind="chat" title={t("Chat")} hint="Pull up a chair with the person behind the music." href="#chat" label={t("Enter composer chat")} direction="right"/>
          <RoomPortal kind="play" title={t("Play")} hint="A sound, a hunch, a small discovery. Follow your ears." href="#play" label={t("Enter music games")} direction="bottom"/>
        </div>
      </section>
      <section id="journey" className="snap-scene program-scene">
        <a className="floating-book" href="#program" aria-label={t("Explore the full Program")} data-enter="left">
          <DrawnIcon kind="program"/>
        </a>
        <div className="program-teaser" data-enter="right">
          <p className="eyebrow">{t("Fancy the whole little adventure?")}</p>
          <LetterHeading text={t("One piece.\nThree ways in.")}/>
          <p>{t("A Program brings the rooms together.")}<br />{t("Listen first, have a chat, then follow a sound clue.")}<br />{t("We'll keep you company along the way.")}</p>
          <a className="solid-button" href="#program">{t("Take a Program ")}<ArrowUpRight size={22}/>
          </a>
          <span className="teaser-note">{t("Aquarium, by Camille Saint-Sa\u00EBns")}</span>
        </div>
      </section>
      <section id="about" className="snap-scene about-scene">
        <div data-enter="bottom">
          <p className="eyebrow">{t("No music lessons needed.")}</p>
          <LetterHeading text={t("Just bring\nyour curiosity.")}/>
          <p>{t("We made MaestroMate for the moments when a piece catches your ear,")}<br className="desktop-break"/>{t(" and you want to stay a little longer.")}</p>
          <div className="about-actions">
          <FeedbackEntry />
            <a href="https://github.com/meichenShen/MaestroMate" target="_blank" rel="noreferrer">{t("Say hello on GitHub ")}<ArrowUpRight size={18}/>
            </a>
            <a href="/credits/README.txt" target="_blank" rel="noreferrer">{t("Credits")}</a>
          </div>
        </div>
        <p className="home-signoff">{t("A work in progress. A space to play.")}</p>
      </section>
    </main>);
}
