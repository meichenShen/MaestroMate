import {t,useLocale} from "../../i18n/locale";
import { useRef } from "react";
import { evaluateVariation } from "../../content/learning";
import type { Melody } from "./model";
export function PoolMission({ melody, onStart, onOpen, }: {
    melody: Melody;
    onStart: () => void;
    onOpen: () => void;
}) {
    useLocale();
    const d = useRef<HTMLDialogElement>(null), b = useRef<HTMLButtonElement>(null);
    const opening = melody.slice(0, 4).every((n, i) => n === [0, 1, 2, 3][i]);
    const result = evaluateVariation(melody.slice(4));
    return (<>
      <button ref={b} onClick={() => {
            onOpen();
            d.current?.showModal();
        }}>{t("Try a variation \u2197")}</button>
      <dialog ref={d} className="discovery-dialog" aria-labelledby="pool-mission-title" onClose={() => b.current?.focus()}>
        <header>
          <h2 id="pool-mission-title">{t("One tune. A new ending.")}</h2>
          <button onClick={() => d.current?.close()}>{t("Close \u00D7")}</button>
        </header>
        <p>{t("First four spaces: C\u2013D\u2013E\u2013G. Next four: the same beginning, with a lower final note.")}</p>
        <p>{t("Load the starter, select space 8, then tap C, D or E. Replay both phrases and hear the change. Free play is always available.")}</p>
        <button onClick={() => {
            onStart();
            d.current?.close();
        }}>{t("Load starter \u00B7 replaces these eight spaces")}</button>
        <p role="status">
          {t(opening && result.correct
            ? "✓ Your reply keeps the opening and changes the ending. You made a variation!"
            : "Your challenge: keep the first phrase, then change only the ending of its reply.")}
        </p>
        <a href="#play/works/aquarium/aquarium-return">{t("Learn about repetition & variation")}</a>
      </dialog>
    </>);
}
