import { useEffect, useRef } from "react";
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
      <p className="entry-intro">
        A piece of music. A little curiosity. Your own way in.
      </p>
      <div className="entry-choices">
        <button
          className="entry-primary"
          aria-label="Start with a work"
          onClick={() => choose("work")}
        >
          <img src="/images/aquarium-poster.webp" alt="" />
          <span>
            <strong>Start with a work</strong>
            <small>Listen, meet the composer, then follow the clues.</small>
          </span>
          <ArrowUpRight />
        </button>
        <button
          className="entry-primary"
          aria-label="Choose an experience"
          onClick={() => choose("experience")}
        >
          <img src="/images/composer.webp" alt="" />
          <span>
            <strong>Choose an experience</strong>
            <small>Pick what interests you. Find a piece to explore.</small>
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
