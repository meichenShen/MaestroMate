import {useState} from "react";
import {melodyIdeas,rhythmIdeas,drumTracks,type BackingStyle} from "./music";
import type {PitchedInstrument} from "../water/audio";
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
    instrument?: PitchedInstrument;
    backing?: BackingStyle;
    repeat?: boolean;
    drums?: (number | null)[][];
}
export const emptyStudio = (): StudioDraft => ({
    notes: Array(8).fill(null),
    accompaniment: false,
    bpm: 100,
    instrument: "piano",
    backing: "none",
    repeat: true,
});
export function CreativeStudio({ id, draft, onChange, enabled, }: {
    id: string;
    draft: StudioDraft;
    onChange: (v: StudioDraft) => void;
    enabled: boolean;
}) {
    useLocale();
    const beats = id === "beats", instrument=draft.instrument ?? "piano";
    const sound = useWorkshopSound(enabled, beats ? "drums" : instrument);
    const [idea,setIdea]=useState(0);
    const tracks=draft.drums ?? drumTracks(draft.notes);
    const changeSound=(value:PitchedInstrument)=>{sound.stop();onChange({...draft,instrument:value})};
    const startIdea=()=>{sound.stop();const ideas=beats?rhythmIdeas:melodyIdeas;const notes=[...ideas[idea % ideas.length]];onChange({...draft,notes,drums:beats?drumTracks(notes):draft.drums});setIdea(idea+1)};
    if (!["beats", "melody"].includes(id))
        return (<main id="main" className="page-room unavailable-play" tabIndex={-1}>
        <h1>{t("This studio is still backstage.")}</h1>
        <a href="#play/create">{t("Back to Create & play")}</a>
      </main>);
    const edit = (slot: number, note: number) => {
        sound.stop();
        if(beats){
          const index=[0,2,4].indexOf(note);
          const drums=tracks.map((track,i)=>i===index?track.map((n,s)=>s===slot?(n===null?note:null):n):[...track]);
          onChange({...draft,drums,notes:drums[0]});
          if(drums[index][slot]!==null)sound.note(note);
          return;
        }
        const notes = draft.notes.map((v, i) => i === slot ? (v === note ? null : note) : v);
        onChange({ ...draft, notes });
        if (notes[slot] !== null)
            sound.note(note);
    };
    const bpm = draft.bpm ?? 100;
    const any = (beats ? tracks.flat() : draft.notes).some((n) => n !== null);
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
            ? "Tap squares to build a drum pattern."
            : "Tap squares to draw your tune. Higher rows sound higher.")}
          </p>
          <div className="studio-idea-tools"><button disabled={!enabled} onClick={startIdea}>{t("Try an idea")}</button><button disabled={!enabled || !any} onClick={()=>{sound.stop();onChange({...draft,notes:[...draft.notes].reverse(),drums:beats?tracks.map(row=>[...row].reverse()):draft.drums})}}>{t("Reverse")}</button></div>
        </header>
        <div className="studio-grid-scroll" tabIndex={0} role="region" aria-label={t(beats ? "Three drum sounds and eight steps" : "Note grid, five pitches and eight steps")}>
          <div className={"studio-note-grid"+(beats ? " studio-drum-grid" : "")}>
            {(beats ? [4,2,0] : [4,3,2,1,0]).map(n=><div className="studio-note-row" key={n}>
              <strong style={{color:poolNotes[n].color}}>{t(beats ? ({0:"Kick",2:"Snare",4:"Hi-hat"} as Record<number,string>)[n] : poolNotes[n].name)}</strong>
              {(beats ? tracks[[0,2,4].indexOf(n)] : draft.notes).map((value,i)=><button key={i} disabled={!enabled} style={{"--note-colour":poolNotes[n].color} as React.CSSProperties}
                className={(sound.beat===i ? "studio-playing " : "")+(value===n ? "note-on" : "")}
                aria-label={t(beats ? (n===0 ? "Step "+(i+1) : (n===2 ? "Snare" : "Hi-hat")+", step "+(i+1)) : poolNotes[n].name+", step "+(i+1))}
                aria-pressed={value===n} onClick={()=>edit(i,n)}><span/></button>)}
            </div>)}
          </div>
        </div>
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
          {!beats && <><label>{t("Instrument")}<select aria-label={t("Creative instrument")} value={instrument} disabled={!enabled} onChange={e=>changeSound(e.target.value as PitchedInstrument)}><option value="piano">{t("Piano")}</option><option value="glass">{t("Glass bells")}</option><option value="pluck">{t("Bright pluck")}</option></select></label>
          <label>{t("Backing")}<select aria-label={t("Backing style")} disabled={!enabled} value={draft.backing ?? (draft.accompaniment ? "chords" : "none")} onChange={e=>{sound.stop();onChange({...draft,backing:e.target.value as BackingStyle,accompaniment:e.target.value!=="none"})}}>
          <option value="none">{t("Just my notes")}</option><option value="chords">{t("Soft chords")}</option><option value="arpeggio">{t("Rolling notes")}</option><option value="pulse">{t("Drum pulse")}</option></select></label></>}
          <button className="studio-layer" disabled={!enabled} aria-pressed={draft.repeat ?? true} onClick={()=>{sound.stop();onChange({...draft,repeat:!(draft.repeat ?? true)})}}>{t("Play twice")}</button>
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
            <small>{t("Your music · 8 steps · ")}{t(bpm)}{t(" bpm \u00B7 2 steps per beat")}</small>
          </div>
          <div>
            <button className="studio-reset" disabled={!enabled} onClick={() => {
            sound.stop();
            onChange(emptyStudio());
        }}>
              <RotateCcw size={18}/>{t("Start fresh")}</button>
            <button className="studio-play" disabled={!any || !enabled || sound.muted} onClick={() => sound.playing
            ? sound.stop()
            : void sound.practice(beats ? tracks[0] : draft.notes, {
                extraLayers: beats ? tracks.slice(1).map(notes=>({notes,instrument:"drums" as const,gain:.75})) : undefined,
                bpm,
                backing: beats ? "none" : (draft.backing ?? (draft.accompaniment ? "chords" : "none")),
                repeats: (draft.repeat ?? true) ? 2 : 1,
                duration: beats ? 0.12 : 0.4,
            })}>
              {t(sound.playing ? <Square size={20}/> : <Play size={20}/>)}{t(" ")}
              {t(sound.playing ? "Stop" : "Play my idea")}
            </button>
          </div>
        </footer>
        {!beats && <a className="studio-credit" href="/audio/piano/ATTRIBUTION.txt" target="_blank" rel="noreferrer">{t("Piano samples: Alexander Holm · CC BY 3.0")}</a>}
      </section>
    </main>);
}
