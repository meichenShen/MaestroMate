import {t,useLocale} from "../i18n/locale";
import { useRef } from "react";
import { useAudio } from "../audio/AudioProvider";
import { work, type ActivityId } from "../content/aquarium";
export function ContextPanel({ activity }: {
    activity: ActivityId;
}) {
    useLocale();
    const { chapter } = useAudio();
    const dialog = useRef<HTMLDialogElement>(null), opener = useRef<HTMLButtonElement>(null);
    return (<aside className="context-panel" aria-label={t("Listening notes and recording credits")}>
      <button className="notes-open" ref={opener} aria-label={t("Open listening notes")} onClick={() => dialog.current?.showModal()}>{t("Listening notes & credits \u2197")}</button>
      <dialog ref={dialog} className="notes-dialog" aria-labelledby="notes-title" data-lenis-prevent onClose={() => opener.current?.focus({ preventScroll: true })}>
        <header>
          <h2 id="notes-title">{t("Listening notes & recording credits")}</h2>
          <button aria-label={t("Close listening notes")} onClick={() => dialog.current?.close()}>{t("Close \u00D7")}</button>
        </header>
        <div className="context-grid">
          <section>
            <p className="eyebrow">{t("A little nudge")}</p>
            <h3>{t(chapter.title)}</h3>
            <p>{t(chapter.hint)}</p>
            <p>
              {t(activity === "theater"
            ? "The scene is our interpretation. Yours can be completely different."
            : activity === "conversation"
                ? "Choose a question or try AI in Settings. This is imagined dialogue, with sources to explore."
                : "No timer. No score. Just another reason to listen.")}
            </p>
          </section>
          <section>
            <p className="eyebrow">{t("The work")}</p>
            <p>{t("The seventh miniature in ")}<em>{t("The Carnival of the Animals")}</em>{t(". Composed in 1886.")}</p>
            <p>{t(work.recording)}</p>
            <p>{t(work.recordingNote)}</p>
            <a href={work.source} target="_blank" rel="noreferrer">{t("Original recording \u2197")}</a>
            <a href={work.license} target="_blank" rel="noreferrer">{t("CC BY 4.0 \u2197")}</a>
          </section>
        </div>
      </dialog>
    </aside>);
}
