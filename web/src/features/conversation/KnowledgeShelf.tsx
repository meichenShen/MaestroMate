import {t,useLocale} from "../../i18n/locale";
import { useRef } from "react";
import { BookOpen } from "lucide-react";
import { knowledgeCards } from "../../content/knowledge/composer";
import { references } from "../../content/knowledge/sources";
import { useAudio } from "../../audio/AudioProvider";
export function KnowledgeShelf() {
    useLocale();
    const dialog = useRef<HTMLDialogElement>(null), opener = useRef<HTMLButtonElement>(null), audio = useAudio();
    return (<>
      <button className="knowledge-open" ref={opener} aria-label={t("Open the knowledge shelf")} onClick={() => {
            audio.pause();
            dialog.current?.showModal();
        }}>
        <BookOpen size={18}/>{t("Knowledge shelf")}</button>
      <dialog ref={dialog} className="discovery-dialog knowledge-dialog" aria-labelledby="knowledge-title" data-lenis-prevent onClose={() => opener.current?.focus({ preventScroll: true })}>
        <header>
          <h2 id="knowledge-title">{t("A little knowledge shelf")}</h2>
          <button onClick={() => dialog.current?.close()}>{t("Close")}</button>
        </header>
        <p>{t("Real history, listening ideas, and the difference between them.")}</p>
        {t(knowledgeCards.map((c) => (<section key={c.title}>
            <h3>{t(c.title)}</h3>
            <p>{t(c.fact)}</p>
            {t(c.note && <p className="knowledge-note">{t(c.note)}</p>)}
            <div>
              {t(c.sourceIds.map((id) => (<a key={id} href={references[id].url} target="_blank" rel="noreferrer">
                  {t(references[id].label)}
                </a>)))}
            </div>
          </section>)))}
      </dialog>
    </>);
}
