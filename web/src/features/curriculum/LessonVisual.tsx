import {t,useLocale} from "../../i18n/locale";
import { useState, type CSSProperties } from "react";
import { Play, Square } from "lucide-react";
import type { LearningUnit } from "../../content/curriculum";
import type { WorkshopSound } from "../workshop/useWorkshopSound";
import { poolNotes } from "../water/model";
import { GameGlyph } from "../workshop/GamePieces";
export function NoteRibbon({ notes, beat = null, }: {
    notes: readonly (number | null)[];
    beat?: number | null;
}) {
    useLocale();
    return (<div className="note-ribbon" aria-label={t("Notes shown by height")}>
      {t(notes.map((n, i) => (<span key={i} className={(beat === i ? "active-note " : "") + (n === null ? "rest-note" : "")} style={{
                "--note-height": `${n === null ? 50 : 78 - n * 14}%`,
                "--note-colour": n === null ? "#b5b3c1" : poolNotes[n].color,
            } as CSSProperties}>
          <i />
          <b>{t(n === null ? "Rest" : poolNotes[n].name)}</b>
        </span>)))}
    </div>);
}
export function LessonVisual({ unit: u, sound, enabled, }: {
    unit: LearningUnit;
    sound: WorkshopSound;
    enabled: boolean;
}) {
    useLocale();
    const [pitch, setPitch] = useState(2), [volume, setVolume] = useState(0.55), [part, setPart] = useState("both"), [instrument, setInstrument] = useState(0), [ending, setEnding] = useState<"same" | "new">("new"), [beats, setBeats] = useState([true, false, true, false]);
    const disabled = !enabled || sound.muted;
    const hear = (notes: (number | null)[], options?: Parameters<typeof sound.practice>[1]) => (sound.playing ? sound.stop() : void sound.practice(notes, options));
    if (u.kind === "pitch")
        return (<div className="pitch-lab">
        <div className="pitch-orbit" aria-hidden="true">
          <span style={{
                bottom: `${14 + pitch * 16}%`,
                width: 52 + volume * 52,
                height: 52 + volume * 52,
                background: poolNotes[pitch].color,
            }}/>
          <small>{t("Low")}</small>
          <b>{t("High")}</b>
        </div>
        <div className="pitch-controls">
          <label>{t("Pitch \u00B7 ")}{t(poolNotes[pitch].name)}
            <input type="range" aria-label={t("Pitch height")} min="0" max="4" value={pitch} onChange={(e) => {
                sound.stop();
                setPitch(Number(e.target.value));
            }}/>
          </label>
          <label>{t("Loudness \u00B7 ")}{t(volume < 0.5 ? "soft" : "strong")}
            <input type="range" aria-label={t("Note loudness")} min="0.15" max="1" step="0.05" value={volume} onChange={(e) => {
                sound.stop();
                setVolume(Number(e.target.value));
            }}/>
          </label>
          <button className="pill-action" disabled={disabled} onClick={() => hear([pitch, null, null, null], { gain: volume, duration: 0.7 })}>
            {t(sound.playing ? <Square size={17}/> : <Play size={17}/>)}{t("Hear this note")}</button>
          <p>{t("Height = pitch. Size = loudness.")}</p>
        </div>
      </div>);
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
        return (<div className="colour-lab">
        <div className="instrument-cards">
          {t(instruments.map((x, i) => (<button key={x.name} aria-pressed={instrument === i} onClick={() => setInstrument(i)}>
              <GameGlyph kind={x.icon}/>
              <span>{t(x.name)}</span>
            </button>)))}
        </div>
        <p className="instrument-note" aria-live="polite">
          {t(instruments[instrument].text)}
        </p>
        <div className="demo-actions">
          <button disabled={disabled} onClick={() => hear([2, null, null, null], { colour: "smooth", duration: 0.7 })}>
            <Play size={16}/>{t("Smooth tone")}</button>
          <button disabled={disabled} onClick={() => hear([2, null, null, null], {
                colour: "sparkling",
                duration: 0.18,
            })}>
            <Play size={16}/>{t("Sparkling tone")}</button>
        </div>
        <p className="example-note">{t("Two synthetic colours \u00B7 not instrument imitations")}</p>
      </div>);
    }
    if (u.kind === "rhythm")
        return (<div className="rhythm-lab" data-demo-beat={sound.beat}>
        <div className="pulse-circles" aria-label={t("Four steady beats")}>
          {t(beats.map((on, i) => (<button key={i} aria-label={t("Demo beat " + (i + 1))} aria-pressed={on} className={(on ? "sound-on " : "") +
                    (sound.beat !== null && sound.beat % 4 === i
                        ? "pulse-active"
                        : "")} onClick={() => {
                    sound.stop();
                    setBeats((b) => b.map((v, j) => (i === j ? !v : v)));
                }}>
              <span>{t(on ? "●" : "○")}</span>
              <small>{t(on ? "Sound" : "Rest")}</small>
            </button>)))}
        </div>
        <button className="pill-action" disabled={disabled} onClick={() => hear([...beats, ...beats].map((on) => (on ? 0 : null)))}>
          {t(sound.playing ? <Square size={17}/> : <Play size={17}/>)}{t("Hear the pattern")}</button>
        <p>{t("The light keeps time, including the rests.")}</p>
      </div>);
    if (u.kind === "return")
        return (<div className="return-lab">
        <div className="phrase-pair">
          <div>
            <span>{t("Our little idea")}</span>
            <NoteRibbon notes={[0, 1, 2, 3]} beat={sound.beat !== null && sound.beat < 4 ? sound.beat : null}/>
          </div>
          <div>
            <span>{t(ending === "same" ? "The same again" : "A new ending")}</span>
            <NoteRibbon notes={[0, 1, 2, ending === "same" ? 3 : 0]} beat={sound.beat !== null && sound.beat >= 4 ? sound.beat - 4 : null}/>
          </div>
        </div>
        <div className="demo-actions">
          <button disabled={disabled} onClick={() => {
                setEnding("same");
                hear([0, 1, 2, 3, 0, 1, 2, 3]);
            }}>
            <Play size={16}/>{t("Same + same")}</button>
          <button disabled={disabled} onClick={() => {
                setEnding("new");
                hear([0, 1, 2, 3, 0, 1, 2, 0]);
            }}>
            <Play size={16}/>{t("Same + new ending")}</button>
        </div>
      </div>);
    return (<div className={"layers-lab part-" + part}>
      <div className="layer-tune">
        <span>{t("Melody")}</span>
        <NoteRibbon notes={[2, null, 4, null, 3, null, 2, null]} beat={sound.beat}/>
      </div>
      <div className="layer-ripple">
        <span>{t("Accompaniment")}</span>
        <div>
          {t(Array.from({ length: 8 }, (_, i) => (<i key={i} className={sound.beat === i ? "pulse-active" : ""} style={{ height: 20 + (i % 2) * 20 }}/>)))}
        </div>
      </div>
      <div className="demo-actions" aria-label={t("Listen to layers")}>
        {t([
            ["melody", "Tune"],
            ["ripple", "Ripples"],
            ["both", "Together"],
        ].map(([id, label]) => (<button key={id} aria-pressed={part === id} disabled={disabled} onClick={() => {
                setPart(id);
                sound.stop();
                void sound.practice(id === "ripple"
                    ? [0, 1, 0, 1, 0, 1, 0, 1]
                    : [2, null, 4, null, 3, null, 2, null], {
                    accompaniment: id === "both",
                    duration: id === "ripple" ? 0.12 : 0.55,
                });
            }}>
            <Play size={16}/>
            {t(label)}
          </button>)))}
      </div>
    </div>);
}
