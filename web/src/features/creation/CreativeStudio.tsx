import { BackLink } from "../../navigation/BackLink";
import { Play, Square, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { poolNotes } from "../water/model";
import { useWorkshopSound } from "../workshop/useWorkshopSound";
import "./studio.css";
export interface StudioDraft {
  notes: (number | null)[];
  bpm: number;
  accompaniment: boolean;
}
export const emptyStudio = (): StudioDraft => ({
  notes: Array(8).fill(null),
  accompaniment: false,
  bpm: 100,
});
export function CreativeStudio({
  id,
  draft,
  onChange,
  enabled,
}: {
  id: string;
  draft: StudioDraft;
  onChange: (v: StudioDraft) => void;
  enabled: boolean;
}) {
  const sound = useWorkshopSound(enabled),
    beats = id === "beats";
  if (!["beats", "melody"].includes(id))
    return (
      <main id="main" className="page-room unavailable-play" tabIndex={-1}>
        <h1>This studio is still backstage.</h1>
        <a href="#play/create">Back to Create & play</a>
      </main>
    );
  const edit = (slot: number, note: number) => {
    sound.stop();
    const notes = draft.notes.map((v, i) =>
      i === slot ? (v === note ? null : note) : v,
    );
    onChange({ ...draft, notes });
    if (notes[slot] !== null) sound.note(note);
  };
  const bpm = draft.bpm ?? 100;
  const any = draft.notes.some((n) => n !== null);
  return (
    <main
      id="main"
      tabIndex={-1}
      className={"creative-studio page-room studio-" + id}
    >
      <header className="studio-top">
        <div>
          <BackLink href="#play/create">← Back to Create & play</BackLink>
          <h1>{beats ? "Beat Studio" : "Melody Studio"}</h1>
        </div>
        <button className="studio-sound" onClick={sound.toggleMute}>
          {sound.muted ? <VolumeX /> : <Volume2 />}Sound{" "}
          {sound.muted ? "off" : "on"}
        </button>
      </header>
      <section
        className="studio-canvas"
        aria-label={beats ? "Your eight-step rhythm" : "Your melody grid"}
      >
        <header>
          <p>
            {beats
              ? "Tap a light. Leave a space. Make a groove."
              : "Tap squares to draw your tune. Higher rows sound higher."}
          </p>
          <span>No right answer. It’s yours.</span>
        </header>
        {beats ? (
          <div className="studio-beats">
            {draft.notes.map((n, i) => (
              <button
                key={i}
                disabled={!enabled}
                aria-label={"Step " + (i + 1)}
                aria-pressed={n !== null}
                className={sound.beat === i ? "studio-playing" : ""}
                onClick={() => edit(i, 0)}
              >
                <span>{n !== null ? "●" : "○"}</span>
                <small>{i + 1}</small>
              </button>
            ))}
          </div>
        ) : (
          <div
            className="studio-grid-scroll"
            tabIndex={0}
            role="region"
            aria-label="Note grid, five pitches and eight steps"
          >
            <div className="studio-note-grid">
              {[4, 3, 2, 1, 0].map((n) => (
                <div className="studio-note-row" key={n}>
                  <strong style={{ color: poolNotes[n].color }}>
                    {poolNotes[n].name}
                  </strong>
                  {draft.notes.map((value, i) => (
                    <button
                      key={i}
                      disabled={!enabled}
                      style={
                        {
                          "--note-colour": poolNotes[n].color,
                        } as React.CSSProperties
                      }
                      className={
                        (sound.beat === i ? "studio-playing " : "") +
                        (value === n ? "note-on" : "")
                      }
                      aria-label={poolNotes[n].name + ", step " + (i + 1)}
                      aria-pressed={value === n}
                      onClick={() => edit(i, n)}
                    >
                      <span />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="studio-controls">
          <label>
            Tempo{" "}
            <select
              aria-label="Studio tempo"
              disabled={!enabled}
              value={bpm}
              onChange={(e) => {
                sound.stop();
                onChange({ ...draft, bpm: Number(e.target.value) });
              }}
            >
              {[60, 80, 100, 120, 140].map((n) => (
                <option key={n} value={n}>
                  {n} bpm
                </option>
              ))}
            </select>
          </label>
          {!beats && (
            <button
              className="studio-layer"
              aria-pressed={draft.accompaniment}
              disabled={!enabled}
              onClick={() => {
                sound.stop();
                onChange({ ...draft, accompaniment: !draft.accompaniment });
              }}
            >
              Add accompaniment {draft.accompaniment ? "●" : "○"}
            </button>
          )}
        </div>
        <footer className="studio-transport">
          <div role="status">
            {sound.error ? (
              <p role="alert">{sound.error}</p>
            ) : (
              <p>
                {sound.playing
                  ? "Follow the moving light."
                  : any
                    ? "Your idea is ready. Press Play."
                    : "Tap a square to begin."}
              </p>
            )}
            <small>
              Original synth sketch · 8 steps · {bpm} bpm · 2 steps per beat
            </small>
          </div>
          <div>
            <button
              className="studio-reset"
              disabled={!enabled}
              onClick={() => {
                sound.stop();
                onChange(emptyStudio());
              }}
            >
              <RotateCcw size={18} />
              Start fresh
            </button>
            <button
              className="studio-play"
              disabled={!any || !enabled || sound.muted}
              onClick={() =>
                sound.playing
                  ? sound.stop()
                  : void sound.practice(draft.notes, {
                      bpm,
                      accompaniment: !beats && draft.accompaniment,
                      duration: beats ? 0.12 : 0.4,
                    })
              }
            >
              {sound.playing ? <Square size={20} /> : <Play size={20} />}{" "}
              {sound.playing ? "Stop" : "Play my idea"}
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
