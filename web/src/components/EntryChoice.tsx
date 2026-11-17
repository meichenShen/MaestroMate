import { useEffect, useRef } from "react";
import { DrawnIcon } from "./DrawnIcon";
import { ArrowUpRight } from "lucide-react";
export type EntryRoute = "work" | "experience" | "browse";
export function EntryChoice({
  onChoose,
}: {
  onChoose: (route: EntryRoute) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    choice = useRef<EntryRoute>("browse");
  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);
  const choose = (route: EntryRoute) => {
    choice.current = route;
    dialog.current?.close();
  };
  return (
    <dialog
      ref={dialog}
      className="entry-dialog"
      aria-labelledby="entry-title"
      onCancel={(event) => {
        event.preventDefault();
        choose("browse");
      }}
      onClose={() => onChoose(choice.current)}
      data-lenis-prevent
    >
      <p className="eyebrow">Welcome to MaestroMate</p>
      <h2 id="entry-title">How would you like to begin?</h2>
      <p className="entry-intro">Three rooms. One little world of music.</p>
      <div className="entry-choices">
        <button
          className="entry-primary"
          aria-label="Start with a work"
          onClick={() => choose("work")}
        >
          <DrawnIcon kind="program" />
          <span>
            <strong>Start with a piece</strong>
            <small>Take a full Program: listen, chat, then play.</small>
          </span>
          <ArrowUpRight />
        </button>
        <button
          className="entry-primary"
          aria-label="Choose an experience"
          onClick={() => choose("experience")}
        >
          <DrawnIcon kind="chat" />
          <span>
            <strong>Pick a room</strong>
            <small>Listening, a chat, or a game — where shall we go?</small>
          </span>
          <ArrowUpRight />
        </button>
      </div>
      <button className="browse-entry" onClick={() => choose("browse")}>
        Just looking for now
      </button>
    </dialog>
  );
}
