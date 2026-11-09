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
// Fictional first-person adaptations, not authentic quotations. Historical
// facts are paraphrased from the linked institutions; listening advice is ours.
export const questions = [
  {
    id: "aquarium",
    prompt: "Why an aquarium?",
    answer:
      "I placed Aquarium seventh in my Carnival of the Animals. Listen to the piano's rippling figures beneath that long melody. You might hear water, glass, or something entirely your own. Shall we try the opening together?",
    sourceLabel:
      "BnF: Saint-Saëns, un esprit libre (p.15); listening interpretation by MaestroMate",
    source: "https://www.bnf.fr/sites/default/files/2021-06/DP_Saint_Saens.pdf",
    clip: { start: 3, end: 18, label: "Listen to the opening" },
  },
  {
    id: "layers",
    prompt: "What should I listen for?",
    answer:
      "Let me suggest a small experiment. Follow the quick notes once, then return and give your attention to the longer melody. I can offer the notes; the discovery is yours. What changes when you listen again?",
    sourceLabel: "An imagined listening invitation written by MaestroMate",
    source: "",
    clip: { start: 3, end: 18, label: "Listen from another angle" },
  },
  {
    id: "composer",
    prompt: "How did you become a musician?",
    answer:
      "I was born in Paris in 1835, and music entered my life very early. As a child I played the piano; later, at the Conservatoire, I studied the organ. Those two instruments would remain companions throughout my working life.",
    sourceLabel: "Paris Opera: Camille Saint-Saëns biography",
    source: "https://www.operadeparis.fr/en/artists/camille-saint-saens",
    clip: undefined,
  },
  {
    id: "paris",
    prompt: "What was your life in Paris like?",
    answer:
      "For twenty years, from 1857, I was organist at La Madeleine. I also taught piano — Gabriel Fauré was among my pupils. Beyond the organ loft, I wrote for the concert hall and the stage. Paris held many musical lives at once.",
    sourceLabel: "Paris Opera: appointments, teaching and works",
    source: "https://www.operadeparis.fr/en/artists/camille-saint-saens",
    clip: undefined,
  },
  {
    id: "carnival",
    prompt: "Was your music always so serious?",
    answer:
      "Not always! I wrote the Carnival in 1886 for a Mardi Gras gathering among friends. Yet I kept it from publication during my lifetime, concerned that it might overshadow my other music. A private musical joke took on a life far beyond that room.",
    sourceLabel: "BnF exhibition: private origins and publication (p.15)",
    source: "https://www.bnf.fr/sites/default/files/2021-06/DP_Saint_Saens.pdf",
    clip: undefined,
  },
  {
    id: "scene",
    prompt: "Did you imagine this scene?",
    answer:
      "This underwater world belongs to MaestroMate's imagination, rather than a scene I left behind. Let it be an invitation. You may turn the movement off, close your eyes, and find a different picture in the same music.",
    sourceLabel:
      "Fictional dialogue; contemporary visual interpretation by MaestroMate",
    source: "",
    clip: undefined,
  },
];
export const detectiveQuestions = [
  {
    id: "layers",
    title: "Two ways of moving.",
    prompt:
      "Beyond the quick, flowing notes, what else can you hear in this opening?",
    clips: [{ start: 3, end: 18, label: "Play the clue" }],
    options: [
      "Only one fast-moving line",
      "A longer, more spacious melody",
      "Only a steady drum beat",
    ],
    correct: 1,
    explanation:
      "You found it. A more spacious melody sits alongside the rippling piano pattern. Replay the passage and follow only that longer line.",
  },
  {
    id: "ending",
    title: "How does it say goodbye?",
    prompt:
      "Compare the opening (A) and the ending (B). Which finishes with the quiet after the final sound?",
    clips: [
      { start: 3, end: 14, label: "Passage A · opening" },
      { start: 130, end: work.duration, label: "Passage B · ending" },
    ],
    options: ["Passage A", "Passage B", "Neither passage"],
    correct: 1,
    explanation:
      "You found it. B comes from the end of the work. Hear how the last sound settles, then compare it with the music still moving in A.",
  },
];
