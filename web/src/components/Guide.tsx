import {t,useLocale} from "../i18n/locale";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "./Arrow";
const steps = [
    {
        number: "01",
        title: "Find your way in.",
        text: "Take a full Program around one piece, choose a room — Listen, Chat or Play — or just have a look around.",
    },
    {
        number: "02",
        title: "Take your time.",
        text: "On the home page, scroll and let each scene settle. Inside a room, take your time. In Chat, choose a question and explore its sources. AI is optional in Settings.",
    },
    {
        number: "03",
        title: "Make it your own.",
        text: "The rooms work on their own. Play has three spaces: Explore a piece, Music lessons and Create & play. Explore a visual idea, then try three little checks. Free creation has its own studios. A Program connects the rooms around Aquarium. Leave or come back whenever you like.",
    },
];
export function Guide({ onClose }: {
    onClose: () => void;
}) {
    useLocale();
    const ref = useRef<HTMLDialogElement>(null);
    const [step, setStep] = useState(0);
    useEffect(() => {
        if (!ref.current?.open)
            ref.current?.showModal();
    }, []);
    const dismiss = () => ref.current?.close();
    return (<dialog className="guide" ref={ref} aria-labelledby="guide-title" onClose={onClose} data-lenis-prevent>
      <button className="guide-close" aria-label={t("Close guide")} onClick={dismiss}>{t("\u00D7")}</button>
      <p className="micro">{t("A small introduction / ")}{t(steps[step].number)}{t("\u201403")}</p>
      <h2 id="guide-title">{t(steps[step].title)}</h2>
      <p>{t(steps[step].text)}</p>
      <div className="guide-actions">
        <button className="text-button" onClick={dismiss}>{t("Skip the tour")}</button>
        <button className="solid-button" onClick={() => (step < 2 ? setStep(step + 1) : dismiss())}>
          {t(step < 2 ? "Next" : "Let's begin")}
          <Arrow />
        </button>
      </div>
    </dialog>);
}
