import {t,useLocale} from "../../i18n/locale";
import { Waves, AudioLines, Wind, Piano, Drum, Feather, Mail, BookOpen, CalendarDays, Fish, UserRound, Home, Sparkles, type LucideIcon, } from "lucide-react";
import type { PlayGame, GameAnswer } from "../../content/play/aquarium";
import { poolNotes } from "../water/model";
import type { WorkshopSound } from "./useWorkshopSound";
const icons: Record<string, LucideIcon> = {
    waves: Waves,
    ribbon: Wind,
    quiet: AudioLines,
    drum: Drum,
    composer: UserRound,
    calendar: CalendarDays,
    pen: Feather,
    letter: Mail,
    book: BookOpen,
    piano: Piano,
    flute: Wind,
    home: Home,
    spark: Sparkles,
    fish: Fish,
};
export function GameGlyph({ kind }: {
    kind: string;
}) {
    useLocale();
    if (kind === "strings")
        return (<svg className="game-symbol symbol-strings" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="m39 5 5 3-7 22c9 7 10 16 3 22-8 8-22 6-27-2-5-7 0-15 9-18l9-24 5-3Z"/>
        <path d="M34 14 24 45m14-29-10 30M16 42c7-4 16-1 22 5m-23-9 21 8M47 11 58 57" strokeLinecap="round"/>
      </svg>);
    const Icon = icons[kind] || Waves;
    return (<Icon className={"game-symbol symbol-" + kind} strokeWidth={1.4} aria-hidden="true"/>);
}
export function GamePieces({ game: g, answer: a, onEdit, sound, slot, onSlot, }: {
    game: PlayGame;
    answer: GameAnswer;
    onEdit: (p: Partial<GameAnswer>, instant?: boolean) => void;
    sound: WorkshopSound;
    slot: number;
    onSlot: (n: number) => void;
}) {
    useLocale();
    if (g.kind === "variation")
        return (<div className="mini-composer">
        <div className="postcard-slots" role="group" aria-label={t("Four ripple notes")}>
          {t(a.notes.map((n, i) => (<button key={i} aria-label={t(`Ripple note ${i + 1}: ${n === null ? "empty" : poolNotes[n].name}`)} aria-pressed={slot === i} onClick={() => onSlot(i)}>
              <span>{t(n === null ? "＋" : poolNotes[n].name)}</span>
              <small>{t(i < 3 ? "Keep" : "New ending")}</small>
            </button>)))}
        </div>
        <div className="palette-popup" aria-label={t("Choose a note")}>
          {t(poolNotes.map((n, i) => (<button key={n.name} style={{ color: n.color }} aria-label={t(`Add ${n.name}`)} onClick={() => {
                    onEdit({ notes: a.notes.map((v, j) => (slot === j ? i : v)) });
                    sound.note(i);
                    onSlot(Math.min(3, slot + 1));
                }}>
              {t(n.name)}
            </button>)))}
        </div>
      </div>);
    if (g.kind === "rhythm")
        return (<div className="rhythm-workbench" role="group" aria-label={t("Two matching rows of beats")}>
        {t([0, 1].map((row) => (<div className="beat-row" key={row}>
            <span>{t(row === 0 ? "Make" : "Echo")}</span>
            {t(a.beats.slice(row * 4, row * 4 + 4).map((on, i) => (<button key={i} aria-label={t(`Beat ${row * 4 + i + 1}`)} aria-pressed={on} className={sound.beat === row * 4 + i ? "beat-now" : ""} onClick={() => {
                        onEdit({
                            beats: a.beats.map((v, j) => (j === row * 4 + i ? !v : v)),
                        });
                        sound.note(0);
                    }}>
                <span>{t(on ? "●" : "·")}</span>
              </button>)))}
          </div>)))}
      </div>);
    if (g.kind === "order" || g.kind === "postcard") {
        const order = g.kind === "order" ? [2, 0, 1] : [0, 1];
        return (<div className="story-builder">
        <div className="postcard-slots" role="group" aria-label={t("Your three cards")}>
          {t([0, 1, 2].map((_, i) => (<button key={i} aria-label={t(`Card space ${i + 1}${a.picks[i] === undefined ? " empty" : ": " + g.options[a.picks[i]].label}`)} onClick={() => onEdit({ picks: a.picks.filter((_, j) => j !== i) })}>
              {t(a.picks[i] === undefined ? (<span className="empty-card">{t("\uFF0B")}</span>) : (<>
                  <GameGlyph kind={g.options[a.picks[i]].icon}/>
                  <small>{t(g.options[a.picks[i]].label)}</small>
                </>))}
            </button>)))}
        </div>
        <div className="story-tokens">
          {t(order.map((i) => (<button key={i} disabled={a.picks.length >= 3 ||
                    (g.kind === "order" && a.picks.includes(i))} aria-label={t("Place " + g.options[i].label)} onClick={() => onEdit({ picks: [...a.picks, i] })}>
              <GameGlyph kind={g.options[i].icon}/>
              <span>{t(g.options[i].label)}</span>
            </button>)))}
        </div>
      </div>);
    }
    return (<div className={`game-options count-${g.options.length} ${g.kind === "multi" ? "collect-options" : ""}`}>
      {t(g.options.map((x, i) => (<button key={x.label} aria-label={t(x.label)} aria-pressed={a.picks.includes(i)} className={a.picks.includes(i) ? "picked" : ""} onClick={() => onEdit({
                picks: g.kind === "choice"
                    ? [i]
                    : a.picks.includes(i)
                        ? a.picks.filter((v) => v !== i)
                        : [...a.picks, i],
            }, g.kind === "choice")}>
          <span className="option-art">
            <GameGlyph kind={x.icon}/>
            {t(g.kind === "multi" && a.picks.includes(i) && (<b className="collected-mark">{t("\u2713")}</b>))}
          </span>
          <strong>{t(x.label)}</strong>
          <span className="pick-affordance">
            {t(g.kind === "multi"
                ? a.picks.includes(i)
                    ? "Collected ✓"
                    : "Collect ＋"
                : "Choose ↗")}
          </span>
        </button>)))}
    </div>);
}
