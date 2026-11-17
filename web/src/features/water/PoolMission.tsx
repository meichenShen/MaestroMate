import { useRef } from "react";
import { evaluateVariation } from "../../content/learning";
import type { Melody } from "./model";
export function PoolMission({
  melody,
  onStart,
  onOpen,
}: {
  melody: Melody;
  onStart: () => void;
  onOpen: () => void;
}) {
  const d = useRef<HTMLDialogElement>(null),
    b = useRef<HTMLButtonElement>(null);
  const opening = melody.slice(0, 4).every((n, i) => n === [0, 1, 2, 3][i]);
  const result = evaluateVariation(melody.slice(4));
  return (
    <>
      <button
        ref={b}
        onClick={() => {
          onOpen();
          d.current?.showModal();
        }}
      >
        Try a variation ↗
      </button>
      <dialog
        ref={d}
        className="discovery-dialog"
        aria-labelledby="pool-mission-title"
        onClose={() => b.current?.focus()}
      >
        <header>
          <h2 id="pool-mission-title">One tune. A new ending.</h2>
          <button onClick={() => d.current?.close()}>Close ×</button>
        </header>
        <p>
          First four spaces: C–D–E–G. Next four: the same beginning, with a
          lower final note.
        </p>
        <p>
          Load the starter, select space 8, then tap C, D or E. Replay both
          phrases and hear the change. Free play is always available.
        </p>
        <button
          onClick={() => {
            onStart();
            d.current?.close();
          }}
        >
          Load starter · replaces these eight spaces
        </button>
        <p role="status">
          {opening && result.correct
            ? "✓ Your reply keeps the opening and changes the ending. You made a variation!"
            : "Your challenge: keep the first phrase, then change only the ending of its reply."}
        </p>
        <a href="#play/learn">Explore pitch, return and variation ↗</a>
      </dialog>
    </>
  );
}
