import { useState, type CSSProperties } from "react";
import { Play, Square } from "lucide-react";
import type { LearningUnit } from "../../content/curriculum";
import type { WorkshopSound } from "../workshop/useWorkshopSound";
import { poolNotes } from "../water/model";
import { GameGlyph } from "../workshop/GamePieces";
export function NoteRibbon({
  notes,
  beat = null,
}: {
  notes: readonly (number | null)[];
  beat?: number | null;
}) {
  return (
    <div className="note-ribbon" aria-label="Notes shown by height">
      {notes.map((n, i) => (
        <span
          key={i}
          className={
            (beat === i ? "active-note " : "") + (n === null ? "rest-note" : "")
          }
          style={
            {
              "--note-height": `${n === null ? 50 : 78 - n * 14}%`,
              "--note-colour": n === null ? "#b5b3c1" : poolNotes[n].color,
            } as CSSProperties
          }
        >
          <i />
          <b>{n === null ? "Rest" : poolNotes[n].name}</b>
        </span>
      ))}
    </div>
  );
}
export function LessonVisual({
  unit: u,
  sound,
  enabled,
}: {
  unit: LearningUnit;
  sound: WorkshopSound;
  enabled: boolean;
}) {
  const [pitch, setPitch] = useState(2),
    [volume, setVolume] = useState(0.55),
    [part, setPart] = useState("both"),
    [instrument, setInstrument] = useState(0),
    [beats, setBeats] = useState([true, false, true, false]);
  const disabled = !enabled || sound.muted;
  const hear = (
    notes: (number | null)[],
    options?: Parameters<typeof sound.practice>[1],
  ) => (sound.playing ? sound.stop() : void sound.practice(notes, options));
  if (u.kind === "pitch")
    return (
      <div className="pitch-lab">
        <div className="pitch-orbit" aria-hidden="true">
          <span
            style={{
              bottom: `${14 + pitch * 16}%`,
              width: 52 + volume * 52,
              height: 52 + volume * 52,
              background: poolNotes[pitch].color,
            }}
          />
          <small>Low</small>
          <b>High</b>
        </div>
        <div className="pitch-controls">
          <label>
            Pitch · {poolNotes[pitch].name}
            <input
              type="range"
              aria-label="Pitch height"
              min="0"
              max="4"
              value={pitch}
              onChange={(e) => {
                sound.stop();
                setPitch(Number(e.target.value));
              }}
            />
          </label>
          <label>
            Loudness · {volume < 0.5 ? "soft" : "strong"}
            <input
              type="range"
              aria-label="Note loudness"
              min="0.15"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                sound.stop();
                setVolume(Number(e.target.value));
              }}
            />
          </label>
          <button
            className="pill-action"
            disabled={disabled}
            onClick={() =>
              hear([pitch, null, null, null], { gain: volume, duration: 0.7 })
            }
          >
            {sound.playing ? <Square size={17} /> : <Play size={17} />}Hear this
            note
          </button>
          <p>Height = pitch. Size = loudness.</p>
        </div>
      </div>
    );
  if (u.kind === "colour") {
    const instruments = [
      {
        name: "Two pianos",
        icon: "piano",
        text: "Hammers strike strings. Quick notes can give the music its rippling movement.",
      },
      {
        name: "Flute",
        icon: "flute",
        text: "A vibrating column of air gives a wind instrument its voice.",
      },
      {
        name: "Strings",
        icon: "strings",
        text: "Bowed strings can sustain a flowing line.",
      },
      {
        name: "Glass harmonica",
        icon: "spark",
        text: "Moistened fingers set glass ringing. This unusual instrument appears in the original score.",
      },
    ];
    return (
      <div className="colour-lab">
        <div className="instrument-cards">
          {instruments.map((x, i) => (
            <button
              key={x.name}
              aria-pressed={instrument === i}
              onClick={() => setInstrument(i)}
            >
              <GameGlyph kind={x.icon} />
              <span>{x.name}</span>
            </button>
          ))}
        </div>
        <p className="instrument-note" aria-live="polite">
          {instruments[instrument].text}
        </p>
        <div className="demo-actions">
          <button
            disabled={disabled}
            onClick={() =>
              hear([2, null, null, null], { colour: "smooth", duration: 0.7 })
            }
          >
            <Play size={16} />
            Smooth tone
          </button>
          <button
            disabled={disabled}
            onClick={() =>
              hear([2, null, null, null], {
                colour: "sparkling",
                duration: 0.18,
              })
            }
          >
            <Play size={16} />
            Sparkling tone
          </button>
        </div>
        <p className="example-note">
          Two synthetic colours · not instrument imitations
        </p>
      </div>
    );
  }
  if (u.kind === "rhythm")
    return (
      <div className="rhythm-lab">
        <div className="pulse-circles" aria-label="Four steady beats">
          {beats.map((on, i) => (
            <button
              key={i}
              aria-label={"Demo beat " + (i + 1)}
              aria-pressed={on}
              className={
                (on ? "sound-on " : "") +
                (sound.beat === i ? "pulse-active" : "")
              }
              onClick={() => {
                sound.stop();
                setBeats((b) => b.map((v, j) => (i === j ? !v : v)));
              }}
            >
              <span>{on ? "●" : "○"}</span>
              <small>{on ? "Sound" : "Rest"}</small>
            </button>
          ))}
        </div>
        <button
          className="pill-action"
          disabled={disabled}
          onClick={() =>
            hear([...beats, ...beats].map((on) => (on ? 0 : null)))
          }
        >
          {sound.playing ? <Square size={17} /> : <Play size={17} />}Hear the
          pattern
        </button>
        <p>The light keeps time, including the rests.</p>
      </div>
    );
  if (u.kind === "return")
    return (
      <div className="return-lab">
        <div className="phrase-pair">
          <div>
            <span>Our little idea</span>
            <NoteRibbon
              notes={[0, 1, 2, 3]}
              beat={sound.beat !== null && sound.beat < 4 ? sound.beat : null}
            />
          </div>
          <div>
            <span>A new ending</span>
            <NoteRibbon
              notes={[0, 1, 2, 0]}
              beat={
                sound.beat !== null && sound.beat >= 4 ? sound.beat - 4 : null
              }
            />
          </div>
        </div>
        <div className="demo-actions">
          <button
            disabled={disabled}
            onClick={() => hear([0, 1, 2, 3, 0, 1, 2, 3])}
          >
            <Play size={16} />
            Same + same
          </button>
          <button
            disabled={disabled}
            onClick={() => hear([0, 1, 2, 3, 0, 1, 2, 0])}
          >
            <Play size={16} />
            Same + new ending
          </button>
        </div>
      </div>
    );
  return (
    <div className={"layers-lab part-" + part}>
      <div className="layer-tune">
        <span>Melody</span>
        <NoteRibbon
          notes={[2, null, 4, null, 3, null, 2, null]}
          beat={sound.beat}
        />
      </div>
      <div className="layer-ripple">
        <span>Accompaniment</span>
        <div>
          {Array.from({ length: 8 }, (_, i) => (
            <i
              key={i}
              className={sound.beat === i ? "pulse-active" : ""}
              style={{ height: 20 + (i % 2) * 20 }}
            />
          ))}
        </div>
      </div>
      <div className="demo-actions" aria-label="Listen to layers">
        {[
          ["melody", "Tune"],
          ["ripple", "Ripples"],
          ["both", "Together"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={part === id}
            disabled={disabled}
            onClick={() => {
              setPart(id);
              sound.stop();
              void sound.practice(
                id === "ripple"
                  ? [0, 1, 0, 1, 0, 1, 0, 1]
                  : [2, null, 4, null, 3, null, 2, null],
                {
                  accompaniment: id === "both",
                  duration: id === "ripple" ? 0.12 : 0.55,
                },
              );
            }}
          >
            <Play size={16} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
