export const references = {
  stage: {
    label: "Paris Opera · Saint-Saëns and the stage",
    url: "https://www.operadeparis.fr/en/visits/exhibitions/saint-saens-a-free-spirit/saint-saens-and-stage",
    note: "Documented production delays and Liszt’s support for Samson et Dalila.",
  },
  portrait: {
    label: "Philharmonie de Paris · Saint-Saëns portrait",
    url: "https://pad.philharmoniedeparis.fr/0051564-biographie-camille-saint-saens.aspx?_lg=fr-FR",
    note: "Scientific and literary interests, musical contemporaries and career context.",
  },
  era: {
    label: "Paris Opera · Saint-Saëns in his time",
    url: "https://www.operadeparis.fr/visites/expositions/saint-saens-un-esprit-libre/saint-saens-en-son-temps",
    note: "Musical exchanges, travel and the distinction between an imagined setting and a visited place.",
  },
  editorial: {
    label: "MaestroMate · Listening and visual interpretation",
    url: "#about",
    note: "Contemporary educational interpretation; not a historical document or quotation.",
  },
  score: {
    label: "IMSLP · Original score and work catalogue",
    url: "https://imslp.org/wiki/Le_Carnaval_des_Animaux_(Saint-Sa%C3%ABns,_Camille)",
    note: "Instrumentation and the written score; not a description of isolated stems in our recording.",
  },
  biography: {
    label: "Paris Opera · Camille Saint-Saëns",
    url: "https://www.operadeparis.fr/en/artists/camille-saint-saens",
    note: "Biographical context: Paris, piano, organ and teaching.",
  },
  history: {
    label: "Bibliothèque nationale de France · Saint-Saëns, un esprit libre",
    url: "https://www.bnf.fr/sites/default/files/2021-06/DP_Saint_Saens.pdf",
    note: "Exhibition dossier, including Carnival history (p. 15).",
  },
  orchestra: {
    label: "Philharmonie de Paris · The Carnival of the Animals",
    url: "https://pad.philharmoniedeparis.fr/0775652-le-carnaval-des-animaux-saint-saens.aspx?_lg=fr-FR",
    note: "Context, instrumentation and the original glass harmonica colour.",
  },
  theory: {
    label: "Ableton · Learning Music",
    url: "https://learningmusic.ableton.com/",
    note: "Further exploration of beats, notes and musical patterns. Our examples and activities are original.",
  },
  analysis: {
    label: "Philharmonie de Paris · Carnival teaching dossier",
    url: "https://drop.philharmoniedeparis.fr/CMDP/Orchestre-de-Paris/2022-2023/Carnaval/festin-et-carnaval.pdf",
    note: "Movement analysis, Aquarium themes and animal contrasts. Uses a different performance with celesta; its timestamps do not apply here.",
  },
  glass: {
    label: "The Franklin Institute · Glass armonica",
    url: "https://fi.edu/en/science-and-education/collection/benjamin-franklins-glass-armonica",
    note: "Instrument construction, damp-finger excitation and Franklin's 1761 invention.",
  },
  beat: {
    label: "Ableton · Beat and tempo",
    url: "https://learningmusic.ableton.com/make-beats/beat-and-tempo.html",
    note: "Pulse and beats per minute; not a tempo measurement of our recording.",
  },
  chords: {
    label: "Ableton · Chords",
    url: "https://learningmusic.ableton.com/chords/major-triads.html",
    note: "Introductory chord examples, separate from Aquarium's score.",
  },
  scales: {
    label: "Ableton · Minor scales",
    url: "https://learningmusic.ableton.com/notes-and-scales/minor-scales.html",
    note: "Scale patterns and common descriptions of major/minor colour, not a universal emotional rule.",
  },
  timbre: {
    label: "iZotope · What is timbre?",
    url: "https://www.izotope.com/community/blog/what-is-timbre-and-why-is-it-important",
    note: "Sound quality distinguished from pitch, loudness and duration.",
  },
  recording: {
    label: "Kevin MacLeod · Aquarium recording",
    url: "https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1900026",
    note: "Produced interpretation used on this site, CC BY 4.0. Excerpts are the full mix, not isolated acoustic instruments.",
  },
} as const;
export type ReferenceId = keyof typeof references;
