import {t,useLocale} from "../../i18n/locale";
import { AquariumView } from "../../components/AquariumView";
import { Play, Pause } from "lucide-react";
import { useAudio } from "../../audio/AudioProvider";
import { formatTime } from "../../audio/timeline";
import { chapters } from "../../content/aquarium";
import { ListeningDiscoveries } from "./ListeningDiscoveries";
export function Theater({ journey = false, onDiscover, motion, onMotionChange, }: {
    journey?: boolean;
    onDiscover?: () => void;
    motion: boolean;
    onMotionChange: (value: boolean) => void;
}) {
    useLocale();
    const audio = useAudio();
    return (<section aria-labelledby="theater-title" className="theater-feature">
      <div className="feature-heading">
        <span className="micro">{t("Listen & imagine")}</span>
        <h1 id="theater-title">{t("Aquarium")}</h1>
        <p>{t("Let the music take its own shape.")}</p>
        {t(onDiscover && (<button className="solid-button" onClick={onDiscover}>{t("Meet Camille \u2197")}</button>))}
      </div>
      <div className={`listening-scene phase-${audio.chapter.id}`}>
        <div className="scene-topline">
          <span className="micro">
            {t(audio.playing ? "Now listening" : "A small world, waiting")}
          </span>
          <ListeningDiscoveries journey={journey}/>
          <button role="switch" aria-label={t("Scene motion")} aria-checked={motion} onClick={() => onMotionChange(!motion)}>
            {t(motion ? "Motion on" : "Motion off")}
          </button>
        </div>
        <span className="aquarium-glass-edge" aria-hidden="true"/>
        <AquariumView time={audio.time} rate={audio.rate} playing={audio.playing} motion={motion}/>
        <div className="scene-caption" aria-live="polite">
          <span className="micro">{t("0")}{t(chapters.indexOf(audio.chapter) + 1)}{t(" / 04")}</span>
          <h2>{t(audio.chapter.title)}</h2>
          <p>{t(audio.chapter.image)}</p>
        </div>
        <button className="scene-play" aria-label={t(audio.playing ? "Pause the scene" : "Listen to the scene")} onClick={audio.toggle}>
          {t(audio.playing ? <Pause size={20}/> : <Play size={20}/>)}
        </button>
      </div>
      <nav className="chapter-navigation" aria-label={t("Listening chapters")}>
        {t(chapters.map((chapter, index) => (<button key={chapter.id} aria-current={audio.chapter.id === chapter.id ? "step" : undefined} onClick={() => audio.seek(chapter.start)}>
            <span className="micro">{t("0")}{t(index + 1)}{t(" / ")}{t(formatTime(chapter.start))}
            </span>
            <strong>{t(chapter.title)}</strong>
          </button>)))}
      </nav>
      <div className="theater-footer">
        <p>{t("An imagined scene. A real recording. Your own way in.")}</p>
      </div>
    </section>);
}
