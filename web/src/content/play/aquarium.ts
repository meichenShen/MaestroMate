import { work, type Clip } from "../aquarium.ts";
export type GameKind =
  | "choice"
  | "multi"
  | "order"
  | "variation"
  | "rhythm"
  | "postcard";
export interface PlayOption {
  label: string;
  icon: string;
}
export interface PlayGame {
  id: string;
  level: number;
  kind: GameKind;
  title: string;
  prompt: string;
  options: PlayOption[];
  correct: number[];
  learn: string;
  hint: string;
  source: string;
  clips?: Clip[];
  practice?: boolean;
}
const score =
    "https://imslp.org/wiki/Le_Carnaval_des_Animaux_(Saint-Sa%C3%ABns,_Camille)",
  bio = "https://www.operadeparis.fr/en/artists/camille-saint-saens",
  history = "https://www.bnf.fr/sites/default/files/2021-06/DP_Saint_Saens.pdf",
  notes = "https://www.laphil.com/works/the-carnival-of-the-animals";
const opening = { start: 3, end: 18, label: "Hear Aquarium" },
  ending = { start: 130, end: work.duration, label: "Hear the ending" };
const o = (label: string, icon: string): PlayOption => ({ label, icon });
export const aquariumGames: PlayGame[] = [
  {
    id: "shimmer",
    level: 0,
    kind: "choice",
    title: "Under the ripples",
    prompt: "Hear the opening. What floats above the quick notes?",
    clips: [opening],
    options: [o("A long melody", "ribbon"), o("Only a drumbeat", "drum")],
    correct: [0],
    hint: "Follow a tune you could hum.",
    learn: "A longer melody floats over the rippling accompaniment.",
    source: notes,
  },
  {
    id: "quiet",
    level: 0,
    kind: "choice",
    title: "Catch the last ripple",
    prompt: "Which passage leaves quiet after its last sound?",
    clips: [{ start: 3, end: 14, label: "Opening" }, ending],
    options: [o("Opening", "waves"), o("Ending", "quiet")],
    correct: [1],
    hint: "Let each passage finish before you decide.",
    learn: "The ending settles into quiet. The opening keeps moving.",
    source: work.source,
  },
  {
    id: "camille",
    level: 0,
    kind: "choice",
    title: "Who made this world?",
    prompt: "Who composed Aquarium?",
    options: [
      o("Camille Saint-Saëns", "composer"),
      o("J. S. Bach", "composer"),
      o("Claude Debussy", "composer"),
    ],
    correct: [0],
    hint: "In Chat, our host is Camille: composer, pianist and organist.",
    learn: "Saint-Saëns wrote Aquarium as part of The Carnival of the Animals.",
    source: bio,
  },
  {
    id: "year",
    level: 0,
    kind: "choice",
    title: "A postcard from the past",
    prompt: "When was The Carnival of the Animals composed?",
    options: [
      o("1886", "calendar"),
      o("1986", "calendar"),
      o("2026", "calendar"),
    ],
    correct: [0],
    hint: "Our postcard comes from 1886, in the nineteenth century.",
    learn: "1886: a playful suite from the nineteenth century.",
    source: score,
  },
  {
    id: "echo",
    level: 1,
    kind: "choice",
    title: "Find the sound twin",
    prompt: "Hear A. Which window repeats exactly the same recording?",
    clips: [
      { start: 3, end: 11, label: "A · your sound" },
      { start: 70, end: 78, label: "B" },
      { start: 3, end: 11, label: "C" },
    ],
    options: [o("Window B", "waves"), o("Window C", "waves")],
    correct: [1],
    hint: "Match the whole sound, not just the underwater feeling.",
    learn: "C is the same recording window as A. B comes later in Aquarium.",
    source: work.source,
  },
  {
    id: "mix",
    level: 1,
    kind: "multi",
    title: "Build a listening picture",
    prompt: "Collect the two layers from Aquarium’s opening.",
    clips: [opening],
    options: [
      o("Rippling accompaniment", "waves"),
      o("Floating melody", "ribbon"),
      o("Marching drum", "drum"),
    ],
    correct: [0, 1],
    hint: "Listen once for quick notes, once for the slower tune.",
    learn: "Melody and accompaniment can move differently at the same time.",
    source: notes,
  },
  {
    id: "story",
    level: 1,
    kind: "order",
    title: "Camille’s secret parcel",
    prompt: "Tap the cards to put the suite’s story in order.",
    options: [
      o("Compose · 1886", "pen"),
      o("Share mostly in private", "letter"),
      o("Publish the full suite after his death", "book"),
    ],
    correct: [0, 1, 2],
    hint: "Compose first, private sharing next, publication of the full suite later.",
    learn:
      "The whole suite stayed largely private during his lifetime; The Swan was an exception.",
    source: history,
  },
  {
    id: "instruments",
    level: 1,
    kind: "multi",
    title: "Pack the Aquarium stage",
    prompt: "Collect these two instruments from Aquarium’s original score.",
    options: [o("Pianos", "piano"), o("Flute", "flute"), o("Drum kit", "drum")],
    correct: [0, 1],
    hint: "Flowing piano figures and a flute line are part of the original sound world.",
    learn:
      "Two pianos and flute join strings and glass harmonica in Aquarium; this is not the complete instrument list.",
    source: score,
  },
  {
    id: "variation",
    level: 2,
    kind: "variation",
    title: "Give a ripple a new ending",
    prompt: "Keep C–D–E. Finish on a note lower than G.",
    options: [],
    correct: [],
    practice: true,
    clips: [opening],
    hint: "Keep the first three notes. C, D or E can replace the last G.",
    learn:
      "Changing one detail of a familiar idea creates a variation. This is your miniature, not Saint-Saëns’s melody.",
    source: score,
  },
  {
    id: "rhythm",
    level: 2,
    kind: "rhythm",
    title: "Make a ripple engine",
    prompt: "Use sound and silence. Make both rows match.",
    options: [],
    correct: [],
    practice: true,
    clips: [opening],
    hint: "Light some beats in the first row. Copy that pattern into the second.",
    learn:
      "A repeating rhythmic pattern can support a melody, like an accompaniment. These beats are your own example.",
    source: notes,
  },
  {
    id: "postcard",
    level: 2,
    kind: "postcard",
    title: "Send a tune back home",
    prompt: "Build a postcard: home, somewhere new, then home again.",
    options: [o("Home · A", "home"), o("Away · B", "spark")],
    correct: [0, 1, 0],
    practice: true,
    clips: [{ start: 70, end: 88, label: "Revisit Aquarium" }],
    hint: "Try A, then B, then A. Listen to the little postcard you build.",
    learn:
      "A–B–A makes a return easy to hear. Our postcard is an invented example, not a form map of Aquarium.",
    source: score,
  },
  {
    id: "curator",
    level: 2,
    kind: "choice",
    title: "Fact or imagination?",
    prompt: "Which statement can our sources support?",
    options: [
      o("Camille designed these fish", "fish"),
      o("The original score includes glass harmonica", "spark"),
    ],
    correct: [1],
    hint: "Chat explains that the underwater scene is our imagination. The score names instruments.",
    learn:
      "Glass harmonica belongs to the original score. The fish on this website are our visual interpretation.",
    source: score,
  },
];
export interface GameAnswer {
  picks: number[];
  notes: (number | null)[];
  beats: boolean[];
  checked: boolean;
}
export const emptyAnswer = (): GameAnswer => ({
  picks: [],
  notes: [null, null, null, null],
  beats: Array(8).fill(false),
  checked: false,
});
export type WorkshopProgress = Record<string, GameAnswer>;
export const emptyWorkshop = (): WorkshopProgress => ({});
export function evaluateGame(
  g: PlayGame,
  a: GameAnswer,
): { correct: boolean; message: string } {
  if (g.kind === "variation") {
    if (
      a.notes.length !== 4 ||
      a.notes.some(
        (n) => n === null || !Number.isInteger(n) || n! < 0 || n! > 4,
      )
    )
      return { correct: false, message: "Fill four notes." };
    if (a.notes[0] !== 0 || a.notes[1] !== 1 || a.notes[2] !== 2)
      return { correct: false, message: "Keep C–D–E at the start." };
    return a.notes[3]! < 3
      ? { correct: true, message: "A familiar opening. Your own ending!" }
      : { correct: false, message: "Try C, D or E at the end." };
  }
  if (g.kind === "rhythm") {
    const valid =
      a.beats.length === 8 &&
      a.beats.slice(0, 4).some(Boolean) &&
      a.beats.slice(0, 4).some((x) => !x) &&
      a.beats.slice(0, 4).every((x, i) => x === a.beats[i + 4]);
    return {
      correct: valid,
      message: valid
        ? "Your ripple pattern repeats!"
        : "Use both sound and silence. Match the two rows.",
    };
  }
  const values =
    g.kind === "multi" ? [...new Set(a.picks)].sort((a, b) => a - b) : a.picks;
  const correct =
    values.length === g.correct.length &&
    values.every((x, i) => x === g.correct[i]);
  return {
    correct,
    message: correct
      ? "You found it!"
      : g.kind === "order"
        ? "Try a different order. Tap a placed card to take it back."
        : g.kind === "multi"
          ? "Try another mix. Tap a card to add or remove it."
          : "Another listen? Or open a little clue.",
  };
}
export function workshopDone(
  p: WorkshopProgress,
  games: PlayGame[] = aquariumGames,
) {
  return games.map(
    (g) => !!p[g.id]?.checked && evaluateGame(g, p[g.id]).correct,
  );
}
export interface WorkPlaySet {
  id: string;
  title: string;
  composer: string;
  listenHash: string;
  chatHash: string;
  games: PlayGame[];
}
export const playWorks: Record<string, WorkPlaySet | undefined> = Object.assign(
  Object.create(null),
  {
    aquarium: {
      id: "aquarium",
      title: work.title,
      composer: work.composer,
      listenHash: "#listen/aquarium",
      chatHash: "#chat",
      games: aquariumGames,
    },
  },
);
