import {t,useLocale} from "../../i18n/locale";
import { useRef, useState } from "react";
import { discoveries } from "../../content/discoveries";
import { unitHash } from "../curriculum/PlayCatalog";
import { useAudio } from "../../audio/AudioProvider";
export function ListeningDiscoveries({ journey = false, }: {
    journey?: boolean;
}) {
    useLocale();
    const dialog = useRef<HTMLDialogElement>(null), opener = useRef<HTMLButtonElement>(null), [index, setIndex] = useState(0), audio = useAudio();
    const d = discoveries[index];
    return (<>
      <button ref={opener} className="text-button" onClick={() => {
            audio.pause();
            dialog.current?.showModal();
        }}>{t("Something to listen for \u2197")}</button>
      <dialog className="discovery-dialog" ref={dialog} aria-labelledby="discovery-title" data-lenis-prevent onClose={() => {
            audio.pause();
            opener.current?.focus();
        }}>
        <header>
          <h2 id="discovery-title">{t("One little discovery")}</h2>
          <button onClick={() => dialog.current?.close()}>{t("Close \u00D7")}</button>
        </header>
        <nav className="discovery-tabs" aria-label={t("Listening discoveries")}>
          {t(discoveries.map((x, i) => (<button key={x.title} aria-pressed={index === i} onClick={() => {
                audio.pause();
                setIndex(i);
            }}>
              {t(x.title)}
            </button>)))}
        </nav>
        <h3>{t(d.question)}</h3>
        <p>{t(d.text)}</p>
        <button onClick={() => audio.playing
            ? audio.pause()
            : audio.playClip({ start: d.start, end: d.end, label: d.title })}>
          {t(audio.playing ? "Pause passage" : "Hear this passage ▶")}
        </button>
        {t(audio.error && <p role="alert">{t(audio.error)}</p>)}
        <p>{t("The scene is an imagined response, not a literal picture of the score. Your own images are welcome.")}</p>
        <a href={d.source} target="_blank" rel="noreferrer">
          {t(d.label)}{t(" \u2197")}</a>
        <a href={unitHash(["aquarium-layers", "aquarium-return", "aquarium-colour"][index], journey)} onClick={() => dialog.current?.close()}>{t("Try the idea in Play \u2197")}</a>
      </dialog>
    </>);
}
