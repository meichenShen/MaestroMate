export const learningSteps = [
  {
    id: "notice",
    name: "Notice",
    level: "Easy",
    title: "Where does the melody go?",
    goal: "Listen to five notes. Follow their height, not their loudness.",
    demo: [0, 1, 2, 3, 4, null, null, null],
    question: "Do the notes travel up or down?",
    choices: ["Up — towards higher notes", "Down — towards lower notes"],
    answer: 0,
    explanation:
      "The notes rise from C to A. Pitch means how high or low a sound is. A high note can be quiet, too.",
  },
  {
    id: "discover",
    name: "Discover",
    level: "Medium",
    title: "Have we met this tune before?",
    goal: "Listen to three little phrases. Find the one that brings the opening back.",
    demo: [0, 2, 4, 3, 0, 2, null, null],
    question: "Which phrase repeats the opening?",
    choices: ["The middle phrase", "The last phrase"],
    answer: 1,
    explanation:
      "The first and last phrases use the same notes in the same order: A–B–A. Returning music can feel familiar. This tiny example teaches return; it is not a formal analysis of Aquarium.",
  },
  {
    id: "create",
    name: "Create",
    level: "A little further",
    title: "The same, with a surprise.",
    goal: "Keep C–D–E. Replace the final G with a lower note. Then hear your variation.",
    demo: [0, 1, 2, 3, null, null, null, null],
    question: "Build a four-note reply: C, D, E, then a note lower than G.",
    choices: [],
    answer: -1,
    explanation:
      "Keeping a familiar beginning and changing one detail makes a variation. C, D or E can all replace the final G here. There is more than one musical answer.",
  },
] as const;
export function evaluateVariation(notes: readonly (number | null)[]) {
  if (
    notes.length !== 4 ||
    notes.some((n) => n === null || !Number.isInteger(n) || n! < 0 || n! > 4)
  )
    return { correct: false, message: "Fill all four spaces first." };
  if (notes[0] !== 0 || notes[1] !== 1 || notes[2] !== 2)
    return {
      correct: false,
      message: "Keep the opening C–D–E. Only the last note needs to change.",
    };
  return notes[3]! < 3
    ? {
        correct: true,
        message:
          "You made a variation! The opening stays familiar, and the new ending is lower than the original G.",
      }
    : {
        correct: false,
        message:
          "Your opening is ready. Try C, D or E at the end — each is lower than G.",
      };
}
export interface TrailProgress {
  choices: (number | null)[];
  checked: boolean[];
  heard: boolean[];
  reply: (number | null)[];
}
export const emptyTrail = (): TrailProgress => ({
  choices: [null, null, null],
  checked: [false, false, false],
  heard: [false, false, false],
  reply: [null, null, null, null],
});
export function completedTrail(p: TrailProgress) {
  return p.checked.map(
    (v, i) =>
      v &&
      (i === 2
        ? evaluateVariation(p.reply).correct
        : p.choices[i] === learningSteps[i].answer),
  );
}
