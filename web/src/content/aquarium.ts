export type ActivityId = "theater" | "conversation" | "detective";
export interface Chapter {
  id: string;
  start: number;
  end: number;
  title: string;
  image: string;
  hint: string;
}
export interface Clip {
  start: number;
  end: number;
  label: string;
}
export const work = {
  id: "saint-saens-aquarium",
  title: "Aquarium",
  originalTitle: "Aquarium",
  composer: "Camille Saint-Saëns",
  composerLatin: "Camille Saint-Saëns",
  year: "1886",
  collection: "The Carnival of the Animals · VII",
  duration: 144.039184,
  audio: "/audio/aquarium.mp3",
  recording: "Recording produced by Kevin MacLeod · ISRC USUAN1900026",
  source:
    "https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1900026",
  license: "https://creativecommons.org/licenses/by/4.0/",
  recordingNote:
    "Aquarium by Kevin MacLeod (incompetech.com). CC BY 4.0. Recompressed for this website; the music has not been edited.",
};
export const activities: {
  id: ActivityId;
  title: string;
  subtitle: string;
  number: string;
}[] = [
  {
    id: "theater",
    title: "Listen & imagine",
    subtitle: "Step inside the music.",
    number: "01",
  },
  {
    id: "conversation",
    title: "Meet the composer",
    subtitle: "A little context. A new connection.",
    number: "02",
  },
  {
    id: "detective",
    title: "Follow the clues",
    subtitle: "Find something you missed.",
    number: "03",
  },
];
export const chapters: Chapter[] = [
  {
    id: "surface",
    start: 0,
    end: 34,
    title: "First light",
    image: "A little light slips beneath the surface.",
    hint: "Find the quick, rippling notes. Then listen for the longer melody moving above them.",
  },
  {
    id: "current",
    start: 34,
    end: 70,
    title: "In the current",
    image: "Let the current carry your attention.",
    hint: "Switch your attention between the flowing accompaniment and the melody. Which can you follow?",
  },
  {
    id: "deep",
    start: 70,
    end: 106,
    title: "Familiar waters",
    image: "Something familiar, seen a little differently.",
    hint: "Does anything sound familiar? Find the sound that gives you that feeling.",
  },
  {
    id: "still",
    start: 106,
    end: work.duration,
    title: "The last ripple",
    image: "Stay for the quiet after the final note.",
    hint: "Notice how the music comes to rest, and listen to the silence that follows.",
  },
];
export { questions, questionPresentation } from "./knowledge/composer.ts";
export const detectiveQuestions = [
  {
    id: "layers",
    title: "Hear the layers",
    prompt:
      "Beyond the quick, flowing notes, what else can you hear in this opening?",
    clips: [{ start: 3, end: 18, label: "Play the clue" }],
    replayClipIndex: 0,
    options: ["Only quick notes", "A longer melody", "Only a drum"],
    correct: 1,
    explanation:
      "A spacious melody floats above the rippling piano. Try following just that line.",
  },
  {
    id: "ending",
    title: "The last ripple",
    prompt:
      "Compare the opening (A) and the ending (B). Which leaves quiet after the last sound?",
    clips: [
      { start: 3, end: 14, label: "Passage A · opening" },
      { start: 130, end: work.duration, label: "Passage B · ending" },
    ],
    replayClipIndex: 1,
    options: ["Passage A", "Passage B"],
    correct: 1,
    explanation: "B is the ending. Stay for the quiet after its last note.",
  },
  {
    id: "match",
    title: "Find its echo",
    prompt:
      "Listen to A, then B and C. Which repeats the exact same moment as A?",
    clips: [
      { start: 3, end: 11, label: "Listen A" },
      { start: 70, end: 78, label: "Listen B" },
      { start: 3, end: 11, label: "Listen C" },
    ],
    replayClipIndex: 2,
    options: ["Clip B", "Clip C"],
    correct: 1,
    explanation: "C repeats A's recording window. B begins later in the piece.",
  },
];
