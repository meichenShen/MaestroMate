import { useRef, useState } from "react";
import { discoveries } from "../../content/discoveries";
import { unitHash } from "../curriculum/PlayCatalog";
import { useAudio } from "../../audio/AudioProvider";
export function ListeningDiscoveries({
  journey = false,
}: {
  journey?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null),
    [index, setIndex] = useState(0),
    audio = useAudio();
  const d = discoveries[index];
  return (
    <>
      <button
        ref={opener}
        className="text-button"
        onClick={() => {
          audio.pause();
          dialog.current?.showModal();
        }}
      >
        Something to listen for ↗
      </button>
      <dialog
        className="discovery-dialog"
        ref={dialog}
        aria-labelledby="discovery-title"
        data-lenis-prevent
        onClose={() => {
          audio.pause();
          opener.current?.focus();
        }}
      >
        <header>
          <h2 id="discovery-title">One little discovery</h2>
          <button onClick={() => dialog.current?.close()}>Close ×</button>
        </header>
        <nav className="discovery-tabs" aria-label="Listening discoveries">
          {discoveries.map((x, i) => (
            <button
              key={x.title}
              aria-pressed={index === i}
              onClick={() => {
                audio.pause();
                setIndex(i);
              }}
            >
              {x.title}
            </button>
          ))}
        </nav>
        <h3>{d.question}</h3>
        <p>{d.text}</p>
        <button
          onClick={() =>
            audio.playing
              ? audio.pause()
              : audio.playClip({ start: d.start, end: d.end, label: d.title })
          }
        >
          {audio.playing ? "Pause passage" : "Hear this passage ▶"}
        </button>
        {audio.error && <p role="alert">{audio.error}</p>}
        <p>
          The scene is an imagined response, not a literal picture of the score.
          Your own images are welcome.
        </p>
        <a href={d.source} target="_blank" rel="noreferrer">
          {d.label} ↗
        </a>
        <a
          href={unitHash(
            ["aquarium-layers", "aquarium-return", "aquarium-colour"][index],
            journey,
          )}
          onClick={() => dialog.current?.close()}
        >
          Try the idea in Play ↗
        </a>
      </dialog>
    </>
  );
}
