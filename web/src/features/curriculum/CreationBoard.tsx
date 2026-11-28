import {t,useLocale} from "../../i18n/locale";
import { useState, type CSSProperties } from "react";
import { Play, Square, Check, Waves } from "lucide-react";
import { evaluateCreation, type LearningUnit, type UnitProgress, } from "../../content/curriculum";
import { poolNotes } from "../water/model";
import type { WorkshopSound } from "../workshop/useWorkshopSound";
export function CreationBoard({ unit: u, progress: p, onChange, sound, enabled, onSend, }: {
    unit: LearningUnit;
    progress: UnitProgress;
    onChange: (p: UnitProgress) => void;
    sound: WorkshopSound;
    enabled: boolean;
    onSend: (notes: (number | null)[]) => void;
}) {
    useLocale();
    const [slot, setSlot] = useState(u.kind === "return" ? 3 : 0), [attempted, setAttempted] = useState(false);
    const colour = p.colour, withLayer = p.accompaniment;
    const result = u.kind === "layers" && !withLayer
        ? {
            correct: false,
            message: "Turn the accompaniment on, then hear both parts together.",
        }
        : evaluateCreation(u, p.notes, p.beats), rhythm = u.kind === "rhythm", layer = u.kind === "layers";
    const edit = (patch: Partial<UnitProgress>) => {
        sound.stop();
        setAttempted(false);
        onChange({ ...p, ...patch, made: false, heardColours: [] });
    };
    const notes = rhythm
        ? [...p.beats, ...p.beats].map((on) => (on ? 0 : null))
        : [...p.notes, ...p.notes];
    const hear = () => {
        if (sound.playing)
            return sound.stop();
        setAttempted(true);
        if (!result.correct)
            return;
        void sound.practice(notes, {
            accompaniment: layer && withLayer,
            colour,
            duration: colour === "sparkling" ? 0.12 : 0.4,
            onDone: () => {
                const heardColours = Array.from(new Set([...p.heardColours, colour]));
                onChange({
                    ...p,
                    heardColours,
                    made: u.kind !== "colour" || heardColours.length === 2,
                });
            },
        });
    };
    return (<div className={"creation-board creation-" + u.kind}>
      {t(rhythm ? (<div className="pulse-circles">
          {t(p.beats.map((on, i) => (<button key={i} aria-label={t("Creation beat " + (i + 1))} aria-pressed={on} className={(on ? "sound-on " : "") +
                    (sound.beat !== null && sound.beat % 4 === i
                        ? "pulse-active"
                        : "")} onClick={() => edit({ beats: p.beats.map((v, j) => (j === i ? !v : v)) })}>
              <span>{t(on ? "●" : "○")}</span>
              <small>{t(on ? "Sound" : "Rest")}</small>
            </button>)))}
        </div>) : (<>
          <div className="creation-slots" aria-label={t("Your four-note idea")}>
            {t(p.notes.map((n, i) => (<button key={i} aria-label={t("Note space " + (i + 1))} aria-pressed={slot === i} className={sound.beat !== null && sound.beat % 4 === i
                    ? "pulse-active"
                    : ""} style={{
                    "--note-colour": n === null ? "#b5b3c1" : poolNotes[n].color,
                    "--note-height": n === null ? "50%" : `${75 - n * 13}%`,
                } as CSSProperties} onClick={() => setSlot(i)}>
                <i />
                <strong>{t(n === null ? "+" : poolNotes[n].name)}</strong>
                <small>
                  {t(u.kind === "return" && i < 3 ? "Keep" : "Note " + (i + 1))}
                </small>
              </button>)))}
          </div>
          <div className="note-picker" aria-label={t("Choose a note")}>
            {t(poolNotes.map((n, i) => (<button key={n.name} aria-label={t("Choose " + n.name)} style={{ "--note-colour": n.color } as CSSProperties} onClick={() => {
                    edit({ notes: p.notes.map((v, j) => (j === slot ? i : v)) });
                    sound.note(i);
                    setSlot(u.kind === "return" ? 3 : Math.min(3, slot + 1));
                }}>
                {t(n.name)}
              </button>)))}
          </div>
        </>))}
      {t(u.kind === "colour" && (<div className="demo-actions">
          {t((["smooth", "sparkling"] as const).map((c) => (<button key={c} aria-pressed={colour === c} onClick={() => {
                    sound.stop();
                    onChange({ ...p, colour: c, made: false });
                }}>
              {t(c === "smooth" ? "Smooth" : "Sparkling")}
            </button>)))}
        </div>))}
      {t(layer && (<button className="accompaniment-switch" aria-pressed={withLayer} onClick={() => {
                sound.stop();
                onChange({ ...p, accompaniment: !withLayer, made: false });
            }}>
          <Waves size={20}/>{t("Accompaniment ")}{t(withLayer ? "on" : "off")}
        </button>))}
      <div className="creation-actions">
        <button className="pill-action" disabled={!enabled || sound.muted} aria-label={t(sound.playing ? "Stop my creation" : "Hear my creation")} onClick={hear}>
          {t(sound.playing ? <Square size={18}/> : <Play size={18}/>)}{t(" ")}
          {t(sound.playing ? "Stop" : "Hear my creation")}
        </button>
        {t(p.made && (<span className="creation-kept" role="status">
            <Check size={18}/>{t("You made it your own.")}</span>))}
        {t(u.kind === "colour" && !p.made && (<span className="creation-nudge" role="status">
            {t(p.heardColours.length === 0
                ? "Hear Smooth, then try Sparkling."
                : `You heard ${p.heardColours[0]}. Now hear ${p.heardColours[0] === "smooth" ? "Sparkling" : "Smooth"} with the same notes.`)}
          </span>))}
        {t(attempted && !result.correct && (<span className="creation-nudge" role="status">
            {t(result.message)}
          </span>))}
      </div>
      {t(p.made && (<button className="pool-handoff" onClick={() => {
                sound.stop();
                onSend(notes);
            }}>{t("Take this idea to Music Pool")}</button>))}
      <p className="example-note">{t("Your own teaching miniature \u00B7 not the Aquarium melody.")}</p>
    </div>);
}
