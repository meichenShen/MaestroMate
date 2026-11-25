import {t,useLocale} from "../i18n/locale";
import { useEffect, useRef } from "react";
import { DrawnIcon } from "./DrawnIcon";
import { ArrowUpRight } from "lucide-react";
export type EntryRoute = "work" | "experience" | "browse";
export function EntryChoice({ onChoose, }: {
    onChoose: (route: EntryRoute) => void;
}) {
    useLocale();
    const dialog = useRef<HTMLDialogElement>(null), choice = useRef<EntryRoute>("browse");
    useEffect(() => {
        if (!dialog.current?.open)
            dialog.current?.showModal();
    }, []);
    const choose = (route: EntryRoute) => {
        choice.current = route;
        dialog.current?.close();
    };
    return (<dialog ref={dialog} className="entry-dialog" aria-labelledby="entry-title" onCancel={(event) => {
            event.preventDefault();
            choose("browse");
        }} onClose={() => onChoose(choice.current)} data-lenis-prevent>
      <p className="eyebrow">{t("Welcome to MaestroMate")}</p>
      <h2 id="entry-title">{t("How would you like to begin?")}</h2>
      <p className="entry-intro">{t("Three rooms. One little world of music.")}</p>
      <div className="entry-choices">
        <button className="entry-primary" aria-label={t("Start with a work")} onClick={() => choose("work")}>
          <DrawnIcon kind="program"/>
          <span>
            <strong>{t("Start with a piece")}</strong>
            <small>{t("Take a full Program: listen, chat, then play.")}</small>
          </span>
          <ArrowUpRight />
        </button>
        <button className="entry-primary" aria-label={t("Choose an experience")} onClick={() => choose("experience")}>
          <DrawnIcon kind="chat"/>
          <span>
            <strong>{t("Pick a room")}</strong>
            <small>{t("Listening, a chat, or a game \u2014 where shall we go?")}</small>
          </span>
          <ArrowUpRight />
        </button>
      </div>
      <button className="browse-entry" onClick={() => choose("browse")}>{t("Just looking for now")}</button>
    </dialog>);
}
