import type { Clip } from "./aquarium.ts";
import type { ReferenceId } from "./knowledge/sources.ts";
export type LearningArea = "works" | "lessons";
export type VisualKind = "layers" | "colour" | "return" | "pitch" | "rhythm";
export interface LearningCheck {
  prompt: string;
  options: { label: string; icon: string }[];
  answer: number;
  explanation: string;
  notes?: (number | null)[];
}
export interface LearningUnit {
  id: string;
  area: LearningArea;
  title: string;
  subtitle: string;
  colour: string;
  kind: VisualKind;
  teach: string;
  invitation: string;
  concept: string;
  checks: LearningCheck[];
  makeTitle: string;
  makePrompt: string;
  starter: (number | null)[];
  sourceIds: ReferenceId[];
  clip?: Clip;
  context?: { title: string; text: string };
}
const option = (label: string, icon: string) => ({ label, icon });
export const units: LearningUnit[] = [
  {
    id: "aquarium-layers",
    area: "works",
    title: "Below the ripples",
    subtitle: "Find a tune inside Aquarium.",
    colour: "#45D9FD",
    kind: "layers",
    concept: "Melody + accompaniment",
    teach:
      "One tune floats. Smaller notes keep moving underneath. The tune is the melody; the moving support is accompaniment. Tap each layer in our little model, then hear the full Aquarium mix.",
    invitation: "Switch a layer on. What changes?",
    clip: { start: 3, end: 18, label: "Hear Aquarium · opening" },
    sourceIds: ["score", "recording"],
    checks: [
      {
        prompt: "In Aquarium’s opening, what floats above the quick notes?",
        options: [
          option("A longer tune", "ribbon"),
          option("A marching drum", "drum"),
        ],
        answer: 0,
        explanation:
          "The longer melody floats over the rippling accompaniment. Listen once more and hum that tune.",
      },
      {
        prompt: "What do the quick, rippling notes do?",
        options: [
          option("Replace every other sound", "quiet"),
          option("Support the tune", "waves"),
        ],
        answer: 1,
        explanation:
          "They are accompaniment: movement around the tune. Different layers can happen together.",
      },
    ],
    makeTitle: "Build a tiny underwater duet.",
    makePrompt: "Keep the moving layer. Add your own four-note tune.",
    starter: [2, 3, 4, 2],
    context: {
      title: "A listening lens",
      text: "This recording was produced by Kevin MacLeod. Our layer switches play an original teaching model: they do not separate instruments from the recording.",
    },
  },
  {
    id: "aquarium-colour",
    area: "works",
    title: "A glimmer of glass",
    subtitle: "Meet the colours behind the scene.",
    colour: "#EE2560",
    kind: "colour",
    concept: "Timbre · sound colour",
    teach:
      "Timbre is a sound’s character. The original score brings together two pianos, flute, strings and glass harmonica. Tap an instrument card, then imagine how its character could colour this underwater world.",
    invitation: "Meet the instruments. Listen to the full mix.",
    clip: { start: 109, end: 127, label: "Hear Aquarium · glimmer" },
    sourceIds: ["score", "orchestra", "recording"],
    checks: [
      {
        prompt: "Which pair belongs in Aquarium’s original score?",
        options: [
          option("Pianos + flute", "piano"),
          option("Drum kit + electric guitar", "drum"),
        ],
        answer: 0,
        explanation:
          "Two pianos and flute join strings and glass harmonica. We are learning the score’s instruments, not guessing isolated sounds in this mix.",
      },
      {
        prompt: "Which instrument makes sound with vibrating glass?",
        options: [option("Flute", "flute"), option("Glass harmonica", "spark")],
        answer: 1,
        explanation:
          "The glass harmonica gives this score a distinctive colour. A flute uses a vibrating column of air.",
      },
    ],
    makeTitle: "Give one tune two characters.",
    makePrompt:
      "Choose Smooth or Sparkling. Keep your notes; hear their character change.",
    starter: [0, 2, 4, 2],
    context: {
      title: "Score and recording are different things",
      text: "Performers sometimes substitute another instrument for glass harmonica. Our produced recording is not a demonstration of every original acoustic instrument. The two sound buttons are simple synthesised examples, not instrument imitations.",
    },
  },
  {
    id: "aquarium-return",
    area: "works",
    title: "A familiar ripple",
    subtitle: "Keep an idea. Change one detail.",
    colour: "#FFDA8E",
    kind: "return",
    concept: "Repetition + variation",
    teach:
      "Hear an idea twice: repetition makes it familiar. Change just its ending: that is a variation. Aquarium invites us to notice familiar gestures; our four-note model makes the idea easy to try.",
    invitation: "Hear Same. Then hear New ending.",
    clip: { start: 70, end: 86, label: "Revisit Aquarium" },
    sourceIds: ["score", "theory", "recording"],
    checks: [
      {
        prompt: "Hear both phrases. Did the second ending change?",
        notes: [0, 1, 2, 3, 0, 1, 2, 0],
        options: [
          option("Yes · a variation", "spark"),
          option("No · an exact repeat", "waves"),
        ],
        answer: 0,
        explanation:
          "C–D–E stays the same, but the last note changes. You can recognise the opening and still hear a surprise.",
      },
      {
        prompt: "Which would be an exact repetition?",
        options: [
          option("The same start, a new last note", "spark"),
          option("The same notes in the same order", "waves"),
        ],
        answer: 1,
        explanation:
          "An exact repeat keeps the notes in order. A changed ending makes a variation. This model is not a transcription or a form map of Aquarium.",
      },
    ],
    makeTitle: "Make your own ending.",
    makePrompt: "Keep C–D–E. Replace the last G with a different note.",
    starter: [0, 1, 2, 3],
  },
  {
    id: "pitch",
    area: "lessons",
    title: "Up, down, loud, soft",
    subtitle: "Lesson 1 · Meet pitch.",
    colour: "#45D9FD",
    kind: "pitch",
    concept: "Pitch ≠ loudness",
    teach:
      "Pitch tells us how high or low a note sounds. Loudness tells us how strong or soft it is. Move the height and loudness controls separately. A high note can be quiet!",
    invitation: "Change the height. Keep the loudness still.",
    sourceIds: ["theory"],
    checks: [
      {
        prompt: "The note moves higher but stays quiet. What changed?",
        options: [option("Loudness", "drum"), option("Pitch", "ribbon")],
        answer: 1,
        explanation:
          "Higher and lower describe pitch. The note does not need to get louder to rise.",
      },
      {
        prompt: "Hear these notes. Which direction do they travel?",
        notes: [4, 3, 2, 0],
        options: [
          option("Down · lower notes", "waves"),
          option("Up · higher notes", "ribbon"),
        ],
        answer: 0,
        explanation:
          "The notes descend from A towards C. Their pitch gets lower.",
      },
    ],
    makeTitle: "Send four notes upwards.",
    makePrompt: "Make each note higher than the one before it.",
    starter: [null, null, null, null],
  },
  {
    id: "rhythm",
    area: "lessons",
    title: "A heartbeat for a tune",
    subtitle: "Lesson 2 · Meet rhythm.",
    colour: "#EE2560",
    kind: "rhythm",
    concept: "Pulse + rhythm + rests",
    teach:
      "A pulse is a steady beat. A rhythm puts sounds and silences around that beat. Tap the circles to place sounds. Empty circles are rests: time keeps moving even when a note is quiet.",
    invitation: "Try sound, rest, sound, rest.",
    sourceIds: ["theory"],
    checks: [
      {
        prompt: "What keeps going during a rest?",
        options: [
          option("The steady pulse", "waves"),
          option("A note must keep sounding", "ribbon"),
        ],
        answer: 0,
        explanation:
          "A rest is a space in the rhythm, not a pause in time. The pulse carries on.",
      },
      {
        prompt: "Which pattern has both sound and a rest?",
        options: [
          option("Sound · sound · sound · sound", "drum"),
          option("Sound · rest · sound · rest", "waves"),
        ],
        answer: 1,
        explanation:
          "A rhythm can use both notes and spaces. Those spaces help shape what you hear.",
      },
    ],
    makeTitle: "Leave room for a ripple.",
    makePrompt:
      "Create a four-beat rhythm with at least one sound and one rest.",
    starter: [0, null, 0, null],
  },
  {
    id: "layers",
    area: "lessons",
    title: "Two parts, one little world",
    subtitle: "Lesson 3 · Melody and accompaniment.",
    colour: "#FFDA8E",
    kind: "layers",
    concept: "Melody + accompaniment",
    teach:
      "A melody is the tune you follow. Accompaniment supports it. Either part can be interesting! Switch between the tune, the moving pattern and both together. Watch their different shapes.",
    invitation: "Hear one part. Then put them together.",
    sourceIds: ["theory"],
    checks: [
      {
        prompt: "Which part is the tune you could hum?",
        options: [option("Melody", "ribbon"), option("Accompaniment", "waves")],
        answer: 0,
        explanation:
          "The melody is the tune. The accompaniment gives it support, movement or a setting.",
      },
      {
        prompt: "Can both parts sound at the same time?",
        options: [
          option("No · only one part can play", "quiet"),
          option("Yes · different jobs, together", "spark"),
        ],
        answer: 1,
        explanation:
          "Yes. The parts can move differently and still belong together. Try listening to each part in turn.",
      },
    ],
    makeTitle: "Give your tune some company.",
    makePrompt:
      "Choose four notes. Switch the accompaniment on and hear them together.",
    starter: [0, 2, 3, 2],
  },
];
const registry: Record<string, LearningUnit> = Object.assign(
  Object.create(null),
  Object.fromEntries(units.map((u) => [u.id, u])),
);
export const resolveUnit = (id: string) => registry[id];
export interface UnitProgress {
  answers: (number | null)[];
  checked: boolean[];
  notes: (number | null)[];
  beats: boolean[];
  made: boolean;
}
export type CurriculumProgress = Record<string, UnitProgress>;
export const emptyUnitProgress = (u: LearningUnit): UnitProgress => ({
  answers: [null, null],
  checked: [false, false],
  notes: [...u.starter],
  beats: [true, false, true, false],
  made: false,
});
export function evaluateCreation(
  u: LearningUnit,
  notes: readonly (number | null)[],
  beats: readonly boolean[],
) {
  if (u.kind === "rhythm")
    return {
      correct:
        beats.length === 4 && beats.some(Boolean) && beats.some((x) => !x),
      message: "Use at least one sound and one rest.",
    };
  const valid =
    notes.length === 4 &&
    notes.every((n) => n !== null && Number.isInteger(n) && n >= 0 && n < 5);
  if (!valid)
    return {
      correct: false,
      message: "Choose a note for each of the four spaces.",
    };
  if (u.kind === "pitch")
    return {
      correct: notes.every((n, i) => i === 0 || n! > notes[i - 1]!),
      message: "Let each note step higher than the one before it.",
    };
  if (u.kind === "return")
    return {
      correct:
        notes[0] === 0 && notes[1] === 1 && notes[2] === 2 && notes[3] !== 3,
      message: "Keep C–D–E, then choose an ending other than G.",
    };
  return { correct: true, message: "Your four notes are ready to hear." };
}
export const checksDone = (u: LearningUnit, p: UnitProgress) =>
  u.checks.every((q, i) => p.checked[i] && p.answers[i] === q.answer);
export const unitDone = (u: LearningUnit, p?: UnitProgress) =>
  !!p && checksDone(u, p) && p.made;
