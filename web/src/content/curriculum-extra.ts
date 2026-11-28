import type { LearningUnit, LearningCheck } from "./curriculum.ts";
const o = (label: string, icon: string) => ({ label, icon });
const pick = (
  prompt: string,
  labels: [string, string, string?],
  icons: string[],
  answer: number,
  explanation: string,
): LearningCheck => ({
  prompt,
  options: labels.filter((x): x is string => !!x).map((l, i) => o(l, icons[i])),
  answer,
  explanation,
});
const order = (
  prompt: string,
  labels: string[],
  target: number[],
  icons: string[],
  explanation: string,
): LearningCheck => ({
  prompt,
  interaction: "order",
  options: labels.map((l, i) => o(l, icons[i])),
  target,
  answer: 0,
  explanation,
});
const lesson = (
  v: Pick<
    LearningUnit,
    "id" | "area" | "title" | "kind" | "teach" | "checks" | "sourceIds"
  > &
    Partial<LearningUnit>,
): LearningUnit => ({
  subtitle: "One small discovery, then three playful checks.",
  colour: "#A593E0",
  invitation: "Tap a picture to find out.",
  concept: "Music & people",
  makeTitle: "",
  makePrompt: "",
  starter: [0, 1, 2, 4],
  ...v,
});
export const expansionUnits: LearningUnit[] = [
  lesson({
    id: "aquarium-composer",
    area: "works",
    title: "Meet the person behind the music",
    kind: "people",
    concept: "Camille Saint-Saëns",
    colour: "#FFDA8E",
    teach:
      "Camille Saint-Saëns was a French composer, pianist and organist. He lived from 1835 to 1921 and wrote the Carnival in 1886. He was born in Paris and taught other musicians, including Gabriel Fauré.",
    sourceIds: ["biography"],
    checks: [
      pick(
        "Who wrote Aquarium?",
        ["Camille Saint-Saëns", "Kevin MacLeod"],
        ["composer", "piano"],
        0,
        "Saint-Saëns composed the work. Kevin MacLeod made the recording we hear here.",
      ),
      pick(
        "Which two instruments did Camille play?",
        ["Piano + organ", "Drum kit + guitar"],
        ["piano", "drum"],
        0,
        "He was a pianist and organist, as well as a composer and teacher.",
      ),
      order(
        "Put his story in time order.",
        ["Writes Carnival · 1886", "Born in Paris · 1835", "Dies · 1921"],
        [1, 0, 2],
        ["pen", "composer", "calendar"],
        "1835 → 1886 → 1921. Aquarium belongs to his adult composing life.",
      ),
    ],
  }),
  lesson({
    id: "aquarium-carnival",
    area: "works",
    title: "A small piece in a big Carnival",
    kind: "timeline",
    concept: "A private musical joke",
    colour: "#A593E0",
    teach:
      "Aquarium is number seven of fourteen short movements in The Carnival of the Animals, written in 1886. Saint-Saëns made the Carnival as a private amusement. Each movement opens a different animal world.",
    sourceIds: ["history", "score"],
    checks: [
      pick(
        "Is Aquarium a whole symphony?",
        ["One short movement", "A whole symphony"],
        ["fish", "book"],
        0,
        "It is movement VII in a set of fourteen movements.",
      ),
      pick(
        "How did the Carnival begin?",
        ["A private musical amusement", "Music for this website"],
        ["home", "book"],
        0,
        "The Carnival began among friends in 1886, long before this website.",
      ),
      pick(
        "What is Aquarium’s place in the Carnival?",
        ["Seventh", "First", "Fourteenth"],
        ["fish", "piano", "calendar"],
        0,
        "Aquarium is the seventh movement. You can explore just one movement without hearing all fourteen.",
      ),
    ],
  }),
  lesson({
    id: "aquarium-recording",
    clip: { start: 3, end: 18, label: "Hear this recording" },
    area: "works",
    title: "One score, many ways to hear it",
    kind: "recording",
    concept: "Composer · performer · interpretation",
    colour: "#80D4F6",
    teach:
      "A score is the composer’s written music. A recording is one way of making it sound. Here we hear Kevin MacLeod’s produced interpretation; every excerpt plays the complete mix, not isolated instruments. MaestroMate made the underwater visuals; the fish are not a scene left by the composer.",
    sourceIds: ["score", "recording", "editorial"],
    checks: [
      pick(
        "Who made the recording on this website?",
        ["Kevin MacLeod", "MaestroMate’s fish"],
        ["piano", "fish"],
        0,
        "Kevin MacLeod made this produced interpretation of Aquarium.",
      ),
      pick(
        "What does our replay button play?",
        ["The complete recorded mix", "An isolated original flute"],
        ["waves", "flute"],
        0,
        "The excerpts are the full mix. We cannot separate the original acoustic instruments here.",
      ),
      pick(
        "Did Saint-Saëns draw these exact fish?",
        ["No · our visual interpretation", "Yes · a historical drawing"],
        ["fish", "pen"],
        0,
        "The contemporary underwater scene was designed for this website. It is not evidence of his private thoughts.",
      ),
    ],
  }),
  lesson({
    id: "steps",
    area: "lessons",
    title: "Small steps, big leaps",
    kind: "steps",
    concept: "Distance between pitches",
    colour: "#80D4F6",
    teach:
      "A tune can move a little or a lot. Hear C to D: a small move. Hear C to A: a bigger leap. The distance between two pitches is an interval. Watch the distance, not how loudly a note plays.",
    sourceIds: ["theory"],
    checks: [
      {
        ...pick(
          "Which is the bigger leap?",
          ["C to A", "C to D"],
          ["ribbon", "waves"],
          0,
          "C to A travels farther in pitch than C to D.",
        ),
        notes: [0, 4, 0, 1],
      },
      order(
        "Tap the notes from low to high.",
        ["E · middle", "A · high", "C · low"],
        [2, 0, 1],
        ["ribbon", "ribbon", "ribbon"],
        "C → E → A. The notes climb in pitch.",
      ),
      {
        ...pick(
          "What changes when a tune leaps?",
          ["The distance between pitches", "The composer’s birthday"],
          ["ribbon", "calendar"],
          0,
          "An interval describes the distance between two pitches.",
        ),
        notes: [0, 4],
      },
    ],
  }),
  lesson({
    id: "patterns",
    area: "lessons",
    title: "An idea comes back",
    kind: "return",
    concept: "Repetition → variation",
    colour: "#A593E0",
    teach:
      "Repetition means hearing an idea again. Variation keeps something familiar and changes something else. In this original four-note model, the first three notes stay the same and the last note changes.",
    sourceIds: ["theory"],
    checks: [
      {
        ...pick(
          "Did the ending change?",
          ["Yes · variation", "No · exact repeat"],
          ["spark", "waves"],
          0,
          "The beginning stays familiar, but the final note changes.",
        ),
        notes: [0, 1, 2, 3, 0, 1, 2, 0],
      },
      pick(
        "What would an exact repeat keep?",
        ["All four notes", "Only the first note"],
        ["waves", "ribbon"],
        0,
        "An exact repeat keeps the whole idea the same.",
      ),
      order(
        "Arrange a way to make a variation.",
        [
          "Change one detail",
          "Begin with an idea",
          "Hear what stayed familiar",
        ],
        [1, 0, 2],
        ["spark", "pen", "waves"],
        "Start with an idea, change one detail, then listen for the connection.",
      ),
    ],
  }),
  lesson({
    id: "ensemble",
    area: "lessons",
    title: "Meet an ensemble",
    kind: "families",
    concept: "How instruments make sound",
    colour: "#FFDA8E",
    teach:
      "An ensemble is a group making music together. A bowed violin sets strings vibrating. A flute uses a column of air. A piano uses hammers striking strings. Different ways of making sound give instruments different characters.",
    sourceIds: ["orchestra", "score"],
    checks: [
      pick(
        "Which instrument uses a bow on strings?",
        ["Violin", "Flute"],
        ["strings", "flute"],
        0,
        "A violin’s bow makes its strings vibrate.",
      ),
      pick(
        "What starts a flute’s sound?",
        ["Moving air", "A hammer"],
        ["flute", "piano"],
        0,
        "The player’s air sets a column of air vibrating.",
      ),
      pick(
        "Can different instruments play together?",
        ["Yes · an ensemble", "No · one at a time only"],
        ["spark", "quiet"],
        0,
        "An ensemble brings different players and sound colours together.",
      ),
    ],
  }),
  lesson({
    id: "music-makers",
    area: "lessons",
    title: "Who makes the music happen?",
    kind: "people",
    concept: "Composer · performer · conductor",
    colour: "#EE2560",
    teach:
      "A composer creates music. A performer makes it sound. A conductor helps a group play together. A person can have more than one role: Saint-Saëns composed and played piano and organ.",
    sourceIds: ["biography", "editorial"],
    checks: [
      pick(
        "Who creates the musical work?",
        ["Composer", "Audience"],
        ["pen", "home"],
        0,
        "The composer creates the work; performers bring it to sound.",
      ),
      pick(
        "Who helps an orchestra play together?",
        ["Conductor", "The printed programme"],
        ["composer", "book"],
        0,
        "A conductor guides the ensemble. The players still listen to each other.",
      ),
      pick(
        "Could one person compose and perform?",
        ["Yes", "No"],
        ["spark", "quiet"],
        0,
        "Yes. Saint-Saëns was both a composer and an instrumental performer.",
      ),
    ],
  }),
  lesson({
    id: "music-in-time",
    area: "lessons",
    title: "Music travels through time",
    kind: "timeline",
    concept: "A work and its later life",
    colour: "#A593E0",
    teach:
      "Saint-Saëns lived from 1835 to 1921. He wrote The Carnival of the Animals in 1886. Today people perform, record and imagine it in new ways. A score records the written notes. A modern recording or animation is a later interpretation.",
    sourceIds: ["biography", "history", "recording", "editorial"],
    checks: [
      order(
        "Put these moments in time order.",
        [
          "Our website today",
          "Carnival is written · 1886",
          "Camille is born · 1835",
        ],
        [2, 1, 0],
        ["book", "pen", "composer"],
        "The person and the work came first; our modern interpretation came much later.",
      ),
      pick(
        "Which can tell us what notes were written?",
        ["The original score", "Our swimming fish"],
        ["book", "fish"],
        0,
        "The score is written musical evidence. The fish are a modern visual interpretation.",
      ),
      pick(
        "Can an old piece inspire a new performance?",
        ["Yes", "No"],
        ["spark", "quiet"],
        0,
        "Yes. Performers and listeners can discover new possibilities without changing the work’s historical origins.",
      ),
    ],
  }),
];
export const extraChecks: Record<string, LearningCheck> = {
  "aquarium-layers": order(
    "Tap the two musical jobs: tune, then support.",
    ["Accompaniment", "Melody"],
    [1, 0],
    ["waves", "ribbon"],
    "The melody is the tune; accompaniment gives it support.",
  ),
  "aquarium-colour": pick(
    "Are our Smooth and Sparkling buttons real instrument recordings?",
    ["No · simple synth examples", "Yes · isolated original instruments"],
    ["spark", "flute"],
    0,
    "The buttons are teaching examples. Use the recording button to hear the complete produced mix.",
  ),
  "aquarium-return": pick(
    "Are these four-note examples copied from Aquarium?",
    ["No · a teaching model", "Yes · the original melody"],
    ["pen", "fish"],
    0,
    "The original miniatures make repetition and variation easier to notice.",
  ),
  pitch: order(
    "Tap the notes from low to high.",
    ["A · high", "C · low", "E · middle"],
    [1, 2, 0],
    ["ribbon", "ribbon", "ribbon"],
    "C is lower than E, and E is lower than A in our example.",
  ),
  rhythm: {
    prompt: "Build this echo: sound, rest, sound, rest.",
    interaction: "pattern",
    options: [],
    answer: 0,
    target: [1, 0, 1, 0],
    explanation: "The empty beats are rests. Time keeps moving through them.",
    notes: [0, null, 0, null],
  },
  layers: pick(
    "Does the support have to copy the tune?",
    ["No · it can move differently", "Yes · every note must match"],
    ["waves", "ribbon"],
    0,
    "Different patterns can work together. Melody and accompaniment have different jobs.",
  ),
};
