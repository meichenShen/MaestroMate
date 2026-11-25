import {t,useLocale} from "../i18n/locale";
import { useLayoutEffect, useRef } from "react";
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Disc3, LoaderCircle, } from "lucide-react";
import { useAudio } from "../audio/AudioProvider";
import { formatTime } from "../audio/timeline";
import { work } from "../content/aquarium";
export function Player() {
    useLocale();
    const audio = useAudio();
    const footer = useRef<HTMLElement>(null);
    useLayoutEffect(() => {
        const resize = () => {
            if (footer.current) {
                document.documentElement.style.setProperty("--player-height", `${Math.ceil(footer.current.getBoundingClientRect().height)}px`);
            }
        };
        resize();
        const observer = new ResizeObserver(resize);
        if (footer.current)
            observer.observe(footer.current);
        return () => {
            observer.disconnect();
            document.documentElement.style.removeProperty("--player-height");
        };
    }, []);
    return (<footer ref={footer} className="player" aria-label={t("Music player", "media")}>
      {t(audio.error && (<div className="audio-error" role="alert">
          <span>{t(audio.error, "media")}</span>
          <button onClick={audio.retry}>{t("Retry audio", "media")}</button>
        </div>), "media")}
      <div className="player-inner">
        <div className="now-playing">
          <span className={`record-icon ${audio.playing ? "is-spinning" : ""}`}>
            <Disc3 size={28} strokeWidth={1.3}/>
          </span>
          <div>
            <strong>{t(work.title, "media")}</strong>
            <small>
              {t(audio.clipLabel || "Saint-Saëns · The Carnival of the Animals", "media")}
            </small>
          </div>
        </div>
        <div className="transport">
          <button className="icon-button replay-button" aria-label={t("Back ten seconds", "media")} onClick={() => audio.seek(audio.time - 10)}>
            <RotateCcw size={18}/>
            <span>{t("10", "media")}</span>
          </button>
          <button className="play-button" aria-label={t(audio.playing ? "Pause music" : "Play music", "media")} onClick={audio.toggle}>
            {t(audio.loading ? (<LoaderCircle className="spin" size={21}/>) : audio.playing ? (<Pause size={20} fill="currentColor"/>) : (<Play size={20} fill="currentColor"/>), "media")}
          </button>
          <button className="icon-button replay-button" aria-label={t("Forward ten seconds", "media")} onClick={() => audio.seek(audio.time + 10)}>
            <RotateCw size={18}/>
            <span>{t("10", "media")}</span>
          </button>
        </div>
        <div className="seek-control">
          <output aria-label={t("Current playback time", "media")}>
            {t(formatTime(audio.time), "media")}
          </output>
          <input type="range" min={0} max={audio.duration} step={0.1} value={audio.time} aria-label={t("Playback position", "media")} aria-valuetext={`${formatTime(audio.time)} of ${formatTime(audio.duration)}`} onChange={(event) => audio.seek(Number(event.target.value))} style={{
            "--progress": `${(audio.time / audio.duration) * 100}%`,
        } as React.CSSProperties}/>
          <span>{t(formatTime(audio.duration), "media")}</span>
        </div>
        <div className="player-extras">
          <label className="rate-control">
            <span className="sr-only">{t("Playback speed", "media")}</span>
            <select aria-label={t("Playback speed", "media")} value={audio.rate} onChange={(event) => audio.setRate(Number(event.target.value))}>
              <option value={0.75}>{t("0.75\u00D7", "media")}</option>
              <option value={1}>{t("1.0\u00D7", "media")}</option>
              <option value={1.25}>{t("1.25\u00D7", "media")}</option>
            </select>
          </label>
          <button className="icon-button" aria-label={t(audio.volume ? "Mute" : "Unmute", "media")} onClick={() => audio.setVolume(audio.volume ? 0 : 0.8)}>
            {t(audio.volume ? <Volume2 size={18}/> : <VolumeX size={18}/>, "media")}
          </button>
          <input className="volume-control" type="range" min={0} max={1} step={0.05} aria-label={t("Volume", "media")} value={audio.volume} onChange={(event) => audio.setVolume(Number(event.target.value))}/>
        </div>
      </div>
      <span className="sr-only" role="status">
        {t(audio.playing ? "Playing" : "Paused", "media")}
      </span>
    </footer>);
}
