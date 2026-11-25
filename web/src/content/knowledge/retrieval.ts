import type { ReferenceId } from "./sources.ts";
import { questions } from "./composer.ts";
export interface KnowledgeEntry {
  id: string;
  keywords: string;
  text: string;
  sourceIds: ReferenceId[];
}
// Reviewed paraphrases, not scraped passages or historical quotations. Expand this
// collection with a reviewed source when adding works; unknown topics stay unknown.
export const knowledgeEntries: KnowledgeEntry[] = [
  {
    id: "person",
    keywords:
      "born birth childhood child early pianist organist musician composer Camille Saint Saens life",
    text: "Camille Saint-Saëns (1835–1921) was a French composer, pianist, organist and teacher, born in Paris. He played piano as a child and studied at the Paris Conservatoire, including organ.",
    sourceIds: ["biography"],
  },
  {
    id: "paris",
    keywords:
      "Paris life teach teaching teacher Faure Fauré friends Madeleine organ society",
    text: "Saint-Saëns was organist at La Madeleine from 1857 to 1877, taught at the École Niedermeyer (Gabriel Fauré was a pupil), and helped found the Société nationale de musique in 1871 to support French music.",
    sourceIds: ["biography"],
  },
  {
    id: "carnival",
    keywords:
      "Carnival animals serious joke mischievous when 1886 history publish private Mardi Gras whole movement symphony",
    text: "The Carnival of the Animals dates from 1886 and has fourteen movements. Aquarium is movement VII, not a whole symphony. The Carnival began as a private amusement; Saint-Saëns restricted its publication during his lifetime. The Swan was an exception. Avoid saying none of it was published while he lived.",
    sourceIds: ["history", "score"],
  },
  {
    id: "score",
    keywords:
      "Aquarium instruments piano flute strings glass harmonica magical sound colour color orchestration score",
    text: "The original Aquarium score calls for flute, two pianos, glass harmonica, two violins, viola and cello. Its rippling piano figures and sustained melodic material provide contrasting layers. Some performances substitute another instrument for glass harmonica. Do not claim our recording has isolated acoustic stems.",
    sourceIds: ["score", "orchestra"],
  },
  {
    id: "recording",
    keywords:
      "recording performer performance hear recorded Kevin MacLeod version stems",
    text: "This site plays Kevin MacLeod’s produced Aquarium interpretation (ISRC USUAN1900026), licensed CC BY 4.0. All recorded excerpts are its full mix. This is distinct from the original instrumentation. The website does not identify the current sounding instrument from analysis of isolated stems.",
    sourceIds: ["recording"],
  },
  {
    id: "scene",
    keywords:
      "fish draw drew design designed aquarium scene imagine ocean water visual underwater picture movie",
    text: "EDITORIAL: MaestroMate designed the contemporary underwater visuals. They are not a scene or fish specified by Saint-Saëns. First-person chat is an imagined educational role, not a quotation, resurrection or evidence of the composer’s private thoughts. Any invitation to picture water is our interpretation.",
    sourceIds: ["editorial"],
  },
  {
    id: "layers",
    keywords:
      "listen listen listening melody accompaniment layer layers follow long short texture",
    text: "EDITORIAL LISTENING IDEA: Try following the sustained melody and then the quicker repeating accompaniment. It is an invitation to notice two roles, not a claim of an isolated original instrument in this recording. Play → Explore a piece → Hear the layers uses the complete recording and separately labelled original synth miniatures.",
    sourceIds: ["editorial", "score"],
  },
  {
    id: "theory",
    keywords:
      "pitch notes high low loud volume rhythm beat beats rest silence melody accompaniment variation repeat change tune lesson",
    text: "Pitch is how high or low a sound is; loudness is how loud or soft it is. A beat is a steady pulse; rhythm is a pattern of sounds and silences over time. Melody is a recognisable sequence of notes; accompaniment supports it. A variation keeps something recognisable while changing something. These are introductory definitions, not a complete analysis of Aquarium.",
    sourceIds: ["theory"],
  },
  {
    id: "making",
    keywords:
      "make create pool Play game four note variation ending tune lesson learning",
    text: "EDITORIAL: Play has Explore a piece, Music lessons, and Create & play. Learning units separate Learn, three varied checks, and completion. Music Pool, Beat Studio and Melody Studio are independent creative spaces; they are not lesson gates. The four-note tunes, smooth/sparkling synth colours, beat patterns and Music Pool are original teaching examples, not score transcriptions. Keep Aquarium examples connected to listening; general lessons can teach pitch, rhythm and layers.",
    sourceIds: ["editorial", "theory"],
  },
];
const questionNotes: Record<string, string[]> = {
  aquarium: ["carnival", "score", "layers"],
  layers: ["layers", "score"],
  composer: ["person"],
  paris: ["paris"],
  carnival: ["carnival"],
  scene: ["scene"],
  glass: ["score", "recording"],
  variation: ["theory", "making"],
  fauré: ["paris"],
  whole: ["carnival"],
};
export function retrieveKnowledge(
  question: string,
  questionId?: string,
  followUpContext = "",
): KnowledgeEntry[] {
  const suggestion =
    questionId || questions.find((q) => q.prompt === question.trim())?.id;
  const anchors =
    suggestion && Object.hasOwn(questionNotes, suggestion)
      ? questionNotes[suggestion].map(
          (id) => knowledgeEntries.find((n) => n.id === id)!,
        )
      : [];

  const words =
    (question + " " + (anchors.length ? "" : followUpContext))
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .match(/[a-z]{3,}/g) || [];
  const ranked = knowledgeEntries
    .map((entry, i) => ({
      entry,
      i,
      score: words.reduce(
        (n, w) =>
          n +
          (entry.keywords
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes(w)
            ? 1
            : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score || a.i - b.i);
  // The persona, work and editorial boundary are always available, even for follow-ups.
  const selected = [
    ...anchors,
    ...ranked
      .filter((x) => x.score > 0)
      .slice(0, 4)
      .map((x) => x.entry),
    knowledgeEntries[0],
    knowledgeEntries[2],
    knowledgeEntries[5],
  ];
  return [...new Map(selected.map((x) => [x.id, x])).values()].slice(0, 7);
}
