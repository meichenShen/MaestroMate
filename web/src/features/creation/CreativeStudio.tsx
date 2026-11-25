import {t,useLocale} from "../../i18n/locale";
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
export function CreativeStudio({ id, draft, onChange, enabled, }: {
    id: string;
    draft: StudioDraft;
    onChange: (v: StudioDraft) => void;
    enabled: boolean;
}) {
    useLocale();
    const sound = useWorkshopSound(enabled), beats = id === "beats";
    if (!["beats", "melody"].includes(id))
        return (<main id="main" className="page-room unavailable-play" tabIndex={-1}>
        <h1>{t("This studio is still backstage.")}</h1>
        <a href="#play/create">{t("Back to Create & play")}</a>
      </main>);
    const edit = (slot: number, note: number) => {
        sound.stop();
        const notes = draft.notes.map((v, i) => i === slot ? (v === note ? null : note) : v);
        onChange({ ...draft, notes });
        if (notes[slot] !== null)
            sound.note(note);
    };
    const bpm = draft.bpm ?? 100;
    const any = draft.notes.some((n) => n !== null);
    return (<main id="main" tabIndex={-1} className={"creative-studio page-room studio-" + id}>
      <header className="studio-top">
        <div>
          <BackLink href="#play/create">{t("\u2190 Back to Create & play")}</BackLink>
          <h1>{t(beats ? "Beat Studio" : "Melody Studio")}</h1>
        </div>
        <button className="studio-sound" onClick={sound.toggleMute}>
          {t(sound.muted ? <VolumeX /> : <Volume2 />)}{t("Sound")}{t(" ")}
          {t(sound.muted ? "off" : "on")}
        </button>
      </header>
      <section className="studio-canvas" aria-label={t(beats ? "Your eight-step rhythm" : "Your melody grid")}>
        <header>
          <p>
            {t(beats
            ? "Tap a light. Leave a space. Make a groove."
            : "Tap squares to draw your tune. Higher rows sound higher.")}
          </p>
          <span>{t("No right answer. It\u2019s yours.")}</span>
        </header>
        {t(beats ? (<div className="studio-beats">
            {t(draft.notes.map((n, i) => (<button key={i} disabled={!enabled} aria-label={t("Step " + (i + 1))} aria-pressed={n !== null} className={sound.beat === i ? "studio-playing" : ""} onClick={() => edit(i, 0)}>
                <span>{t(n !== null ? "●" : "○")}</span>
                <small>{t(i + 1)}</small>
              </button>)))}
          </div>) : (<div className="studio-grid-scroll" tabIndex={0} role="region" aria-label={t("Note grid, five pitches and eight steps")}>
            <div className="studio-note-grid">
              {t([4, 3, 2, 1, 0].map((n) => (<div className="studio-note-row" key={n}>
                  <strong style={{ color: poolNotes[n].color }}>
                    {t(poolNotes[n].name)}
                  </strong>
                  {t(draft.notes.map((value, i) => (<button key={i} disabled={!enabled} style={{
                        "--note-colour": poolNotes[n].color,
                    } as React.CSSProperties} className={(sound.beat === i ? "studio-playing " : "") +
                        (value === n ? "note-on" : "")} aria-label={t(poolNotes[n].name + ", step " + (i + 1))} aria-pressed={value === n} onClick={() => edit(i, n)}>
                      <span />
                    </button>)))}
                </div>)))}
            </div>
          </div>))}
        <div className="studio-controls">
          <label>{t("Tempo")}{t(" ")}
            <select aria-label={t("Studio tempo")} disabled={!enabled} value={bpm} onChange={(e) => {
            sound.stop();
            onChange({ ...draft, bpm: Number(e.target.value) });
        }}>
              {t([60, 80, 100, 120, 140].map((n) => (<option key={n} value={n}>
                  {t(n)}{t(" bpm")}</option>)))}
            </select>
          </label>
          {t(!beats && (<button className="studio-layer" aria-pressed={draft.accompaniment} disabled={!enabled} onClick={() => {
                sound.stop();
                onChange({ ...draft, accompaniment: !draft.accompaniment });
            }}>{t("Add accompaniment ")}{t(draft.accompaniment ? "●" : "○")}
            </button>))}
        </div>
        <footer className="studio-transport">
          <div role="status">
            {t(sound.error ? (<p role="alert">{t(sound.error)}</p>) : (<p>
                {t(sound.playing
                ? "Follow the moving light."
                : any
                    ? "Your idea is ready. Press Play."
                    : "Tap a square to begin.")}
              </p>))}
            <small>{t("Original synth sketch \u00B7 8 steps \u00B7 ")}{t(bpm)}{t(" bpm \u00B7 2 steps per beat")}</small>
          </div>
          <div>
            <button className="studio-reset" disabled={!enabled} onClick={() => {
            sound.stop();
            onChange(emptyStudio());
        }}>
              <RotateCcw size={18}/>{t("Start fresh")}</button>
            <button className="studio-play" disabled={!any || !enabled || sound.muted} onClick={() => sound.playing
            ? sound.stop()
            : void sound.practice(draft.notes, {
                bpm,
                accompaniment: !beats && draft.accompaniment,
                duration: beats ? 0.12 : 0.4,
            })}>
              {t(sound.playing ? <Square size={20}/> : <Play size={20}/>)}{t(" ")}
              {t(sound.playing ? "Stop" : "Play my idea")}
            </button>
          </div>
        </footer>
      </section>
    </main>);
}
