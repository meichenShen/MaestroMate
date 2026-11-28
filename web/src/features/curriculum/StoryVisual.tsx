import {t,useLocale} from "../../i18n/locale";
import { useState } from "react";
import { GameGlyph } from "../workshop/GamePieces";
import type { LearningUnit } from "../../content/curriculum";
import type { WorkshopSound } from "../workshop/useWorkshopSound";
import { NoteRibbon } from "./LessonVisual";
export function StoryVisual({ unit: u, sound, enabled, }: {
    unit: LearningUnit;
    sound: WorkshopSound;
    enabled: boolean;
}) {
    useLocale();
    const [selected, setSelected] = useState(0);
    if (u.kind === "steps")
        return (<div className="story-steps">
        <NoteRibbon notes={selected ? [0, 4] : [0, 1]} beat={sound.beat}/>
        <div className="demo-actions">
          {t(["Small move · C–D", "Big leap · C–A"].map((label, i) => (<button key={label} disabled={!enabled || sound.muted} aria-pressed={selected === i} onClick={() => {
                    setSelected(i);
                    void sound.practice(i ? [0, 4] : [0, 1]);
                }}>
              {t(label)}{t(" \u25B7")}</button>)))}
        </div>
      </div>);
    const cards = u.kind === "timeline"
        ? u.id === "aquarium-carnival"
            ? [
                ["1886", "A private amusement", "home"],
                ["VII", "Aquarium · movement seven", "fish"],
                ["14", "Fourteen movements altogether", "book"],
            ]
            : [
                ["1835", "Born in Paris", "composer"],
                ["1886", "The Carnival is written", "pen"],
                ["Today", "New performances and interpretations", "waves"],
            ]
        : u.kind === "recording"
            ? [
                ["Score", "Written musical instructions", "book"],
                ["Recording", "Kevin MacLeod’s produced interpretation", "piano"],
                ["Scene", "MaestroMate’s modern visual interpretation", "fish"],
            ]
            : u.kind === "families"
                ? [
                    ["Violin", "A bow sets strings vibrating", "strings"],
                    ["Flute", "A column of air vibrates", "flute"],
                    ["Piano", "Hammers strike strings", "piano"],
                ]
                : u.area === "works"
                    ? [
                        ["Composer", "Camille Saint-Saëns wrote the work", "pen"],
                        ["Player", "He played piano and organ", "piano"],
                        ["Teacher", "Gabriel Fauré was one of his pupils", "composer"],
                    ]
                    : [
                        ["Composer", "Creates the musical work", "pen"],
                        ["Performer", "Makes the music sound", "piano"],
                        ["Conductor", "Helps the group play together", "composer"],
                    ];
    return (<div className={"story-visual story-" + u.kind}>
      <div className="story-cards">
        {t(cards.map(([label, text, icon], i) => (<button key={label} aria-pressed={selected === i} onClick={() => setSelected(i)}>
            <GameGlyph kind={icon}/>
            <strong>{t(label)}</strong>
          </button>)))}
      </div>
      <p className="story-caption" aria-live="polite">
        {t(cards[selected][1])}
      </p>
      <span className="story-invitation">{t("Tap another picture to discover more.")}</span>
    </div>);
}
