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
export const questions = [
  {
    id: "aquarium",
    prompt: "Why an aquarium?",
    answer:
      "Aquarium is the seventh movement of The Carnival of the Animals. Its rippling piano patterns and longer melodic lines offer a starting point for imagining water and movement. There is no single picture you need to see.",
    sourceLabel: "Orchestra programme notes",
    source:
      "https://www.vancouversymphony.ca/site-content/uploads/2025/06/Lang-Lang-Program-Notes-for-VSO-Saint-Saens.pdf",
    clip: { start: 3, end: 18, label: "Listen to the opening" },
  },
  {
    id: "layers",
    prompt: "What should I listen for?",
    answer:
      "Try the same passage twice. First, follow the fast, flowing notes. Then shift your attention to the more spacious melody. The recording stays the same; what you notice can change.",
    sourceLabel: "A MaestroMate listening prompt",
    source: "",
    clip: { start: 3, end: 18, label: "Listen from another angle" },
  },
  {
    id: "composer",
    prompt: "Who was Saint-Saëns?",
    answer:
      "Camille Saint-Saëns was a French composer, pianist and organist who lived from 1835 to 1921. He wrote The Carnival of the Animals in 1886. The recording used here was produced much later.",
    sourceLabel: "Work and composer information",
    source:
      "https://commons.wikimedia.org/wiki/File:Saint-Saens_-_The_Carnival_of_the_Animals_-_07_Aquarium.ogg",
    clip: undefined,
  },
  {
    id: "scene",
    prompt: "Did you imagine this scene?",
    answer:
      "The visual world here is a contemporary interpretation made for MaestroMate. It is not a story left by Saint-Saëns. You can also turn the movement off, close your eyes, and make your own picture.",
    sourceLabel: "About this interpretation",
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
