import type { Clip } from "../aquarium";
import type { ReferenceId } from "./sources";
export interface PreparedQuestion {
  id: string;
  prompt: string;
  answer: string;
  sourceLabel: string;
  source: string;
  clip?: Clip;
  playUnit: string;
}
// Fictional first-person adaptations, not authentic quotations. Historical
// facts are paraphrased from the linked institutions; listening advice is ours.
const preparedQuestions = [
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
      "Not always! I wrote the Carnival in 1886 for a Mardi Gras gathering among friends. I kept most of it from publication during my lifetime, with The Swan an exception; I was concerned it might overshadow my other music. A private musical joke took on a life far beyond that room.",
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
  {
    id: "glass",
    prompt: "What gives Aquarium its magical colour?",
    answer:
      "My original score asks for two pianos, flute, strings and glass harmonica. That last instrument makes glass ring under the fingers. Performers sometimes use a substitute. The recording here is a produced interpretation; it cannot show you each original instrument on its own.",
    sourceLabel: "Original score and Philharmonie de Paris · instrumentation",
    source:
      "https://imslp.org/wiki/Le_Carnaval_des_Animaux_(Saint-Sa%C3%ABns,_Camille)",
    clip: undefined,
  },
  {
    id: "variation",
    prompt: "How can I change a tune without losing it?",
    answer:
      "Try keeping its beginning and changing one small thing at the end. You may still recognise your idea! We call that a variation. In Play, you can try an original four-note example. Those four notes are a teaching model, not a melody copied from Aquarium.",
    sourceLabel:
      "MaestroMate listening invitation · further exploration with Ableton Learning Music",
    source: "https://learningmusic.ableton.com/",
    clip: undefined,
  },
  {
    id: "fauré",
    prompt: "Did you help other musicians learn?",
    answer:
      "Yes. I taught at the École Niedermeyer in Paris, where Gabriel Fauré was one of my pupils. I also helped found the Société nationale de musique in 1871, which encouraged French music. Music was a life of playing, writing, teaching and sharing.",
    sourceLabel: "Paris Opera · Saint-Saëns biography",
    source: "https://www.operadeparis.fr/en/artists/camille-saint-saens",
    clip: undefined,
  },
  {
    id: "whole",
    prompt: "Is Aquarium a whole symphony?",
    answer:
      "It is a short movement: number seven of fourteen in The Carnival of the Animals. Each movement opens another little world. You do not need to know every musical term to begin. Listen for one detail, and let that be your doorway.",
    sourceLabel:
      "Original score · movement list; invitation written by MaestroMate",
    source:
      "https://imslp.org/wiki/Le_Carnaval_des_Animaux_(Saint-Sa%C3%ABns,_Camille)",
    clip: undefined,
  },
];
export const questionPresentation: Record<
  string,
  { topic: string; label: string }
> = {
  aquarium: { topic: "music", label: "Why Aquarium?" },
  layers: { topic: "music", label: "A closer listen" },
  composer: { topic: "life", label: "Early years" },
  paris: { topic: "life", label: "Paris life" },
  carnival: { topic: "play", label: "A little mischief" },
  scene: { topic: "play", label: "Whose ocean?" },
  glass: { topic: "music", label: "A glimmer of glass" },
  variation: { topic: "music", label: "Make it yours" },
  fauré: { topic: "life", label: "Teaching & friends" },
  whole: { topic: "music", label: "One little movement" },
};

const playLinks: Record<string, string> = {
  aquarium: "aquarium-layers",
  layers: "aquarium-layers",
  glass: "aquarium-colour",
  variation: "aquarium-return",
  scene: "aquarium-colour",
};
export const questions: PreparedQuestion[] = preparedQuestions.map((q) => ({
  ...q,
  playUnit: playLinks[q.id] || "aquarium-layers",
}));
export const knowledgeCards: {
  title: string;
  fact: string;
  sourceIds: ReferenceId[];
  note?: string;
}[] = [
  {
    title: "The person behind the piece",
    fact: "Camille Saint-Saëns (1835–1921) was a French composer, pianist, organist and teacher. Gabriel Fauré was among his pupils.",
    sourceIds: ["biography"],
  },
  {
    title: "A small part of a playful whole",
    fact: "Aquarium is the seventh of fourteen movements in The Carnival of the Animals, composed in 1886.",
    sourceIds: ["score", "history"],
  },
  {
    title: "The score and our recording",
    fact: "The original Aquarium score calls for two pianos, flute, strings and glass harmonica. Our Kevin MacLeod recording is a produced interpretation, and excerpts play its complete mix.",
    sourceIds: ["score", "orchestra", "recording"],
    note: "We do not present synthesised examples as original instrument recordings or isolated stems.",
  },
  {
    title: "A listening idea, not a historical quote",
    fact: "Following a melody above rippling accompaniment is one way to explore this music. The underwater scene and first-person replies are contemporary interpretations written by MaestroMate.",
    sourceIds: ["score"],
    note: "Imagined dialogue is labelled. It is not evidence of what the composer actually said or pictured.",
  },
  {
    title: "From listening to making",
    fact: "Our short examples teach pitch, rhythm, melody, accompaniment and variation. They are original miniatures, not transcriptions or a complete formal analysis of Aquarium.",
    sourceIds: ["theory"],
  },
];
