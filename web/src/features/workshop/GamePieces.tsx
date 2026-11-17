import {
  Waves,
  AudioLines,
  Wind,
  Piano,
  Drum,
  Feather,
  Mail,
  BookOpen,
  CalendarDays,
  Fish,
  UserRound,
  Home,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
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
export function GameGlyph({ kind }: { kind: string }) {
  const Icon = icons[kind] || Waves;
  return (
    <Icon
      className={"game-symbol symbol-" + kind}
      strokeWidth={1.4}
      aria-hidden="true"
    />
  );
}
export function GamePieces({
  game: g,
  answer: a,
  onEdit,
  sound,
  slot,
  onSlot,
}: {
  game: PlayGame;
  answer: GameAnswer;
  onEdit: (p: Partial<GameAnswer>, instant?: boolean) => void;
  sound: WorkshopSound;
  slot: number;
  onSlot: (n: number) => void;
}) {
  if (g.kind === "variation")
    return (
      <div className="mini-composer">
        <div
          className="postcard-slots"
          role="group"
          aria-label="Four ripple notes"
        >
          {a.notes.map((n, i) => (
            <button
              key={i}
              aria-label={`Ripple note ${i + 1}: ${n === null ? "empty" : poolNotes[n].name}`}
              aria-pressed={slot === i}
              onClick={() => onSlot(i)}
            >
              <span>{n === null ? "＋" : poolNotes[n].name}</span>
              <small>{i < 3 ? "Keep" : "New ending"}</small>
            </button>
          ))}
        </div>
        <div className="palette-popup" aria-label="Choose a note">
          {poolNotes.map((n, i) => (
            <button
              key={n.name}
              style={{ color: n.color }}
              aria-label={`Add ${n.name}`}
              onClick={() => {
                onEdit({ notes: a.notes.map((v, j) => (slot === j ? i : v)) });
                sound.note(i);
                onSlot(Math.min(3, slot + 1));
              }}
            >
              {n.name}
            </button>
          ))}
        </div>
      </div>
    );
  if (g.kind === "rhythm")
    return (
      <div
        className="rhythm-workbench"
        role="group"
        aria-label="Two matching rows of beats"
      >
        {[0, 1].map((row) => (
          <div className="beat-row" key={row}>
            <span>{row === 0 ? "Make" : "Echo"}</span>
            {a.beats.slice(row * 4, row * 4 + 4).map((on, i) => (
              <button
                key={i}
                aria-label={`Beat ${row * 4 + i + 1}`}
                aria-pressed={on}
                className={sound.beat === row * 4 + i ? "beat-now" : ""}
                onClick={() => {
                  onEdit({
                    beats: a.beats.map((v, j) => (j === row * 4 + i ? !v : v)),
                  });
                  sound.note(0);
                }}
              >
                <span>{on ? "●" : "·"}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  if (g.kind === "order" || g.kind === "postcard") {
    const order = g.kind === "order" ? [2, 0, 1] : [0, 1];
    return (
      <div className="story-builder">
        <div
          className="postcard-slots"
          role="group"
          aria-label="Your three cards"
        >
          {[0, 1, 2].map((_, i) => (
            <button
              key={i}
              aria-label={`Card space ${i + 1}${a.picks[i] === undefined ? " empty" : ": " + g.options[a.picks[i]].label}`}
              onClick={() =>
                onEdit({ picks: a.picks.filter((_, j) => j !== i) })
              }
            >
              {a.picks[i] === undefined ? (
                <span className="empty-card">＋</span>
              ) : (
                <>
                  <GameGlyph kind={g.options[a.picks[i]].icon} />
                  <small>{g.options[a.picks[i]].label}</small>
                </>
              )}
            </button>
          ))}
        </div>
        <div className="story-tokens">
          {order.map((i) => (
            <button
              key={i}
              disabled={
                a.picks.length >= 3 ||
                (g.kind === "order" && a.picks.includes(i))
              }
              aria-label={"Place " + g.options[i].label}
              onClick={() => onEdit({ picks: [...a.picks, i] })}
            >
              <GameGlyph kind={g.options[i].icon} />
              <span>{g.options[i].label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div
      className={`game-options count-${g.options.length} ${g.kind === "multi" ? "collect-options" : ""}`}
    >
      {g.options.map((x, i) => (
        <button
          key={x.label}
          aria-label={x.label}
          aria-pressed={a.picks.includes(i)}
          className={a.picks.includes(i) ? "picked" : ""}
          onClick={() =>
            onEdit(
              {
                picks:
                  g.kind === "choice"
                    ? [i]
                    : a.picks.includes(i)
                      ? a.picks.filter((v) => v !== i)
                      : [...a.picks, i],
              },
              g.kind === "choice",
            )
          }
        >
          <span className="option-art">
            <GameGlyph kind={x.icon} />
            {g.kind === "multi" && a.picks.includes(i) && (
              <b className="collected-mark">✓</b>
            )}
          </span>
          <strong>{x.label}</strong>
          <span className="pick-affordance">
            {g.kind === "multi"
              ? a.picks.includes(i)
                ? "Collected ✓"
                : "Collect ＋"
              : "Choose ↗"}
          </span>
        </button>
      ))}
    </div>
  );
}
