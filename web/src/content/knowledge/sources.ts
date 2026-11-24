export const references = {
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
  recording: {
    label: "Kevin MacLeod · Aquarium recording",
    url: "https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1900026",
    note: "Produced interpretation used on this site, CC BY 4.0. Excerpts are the full mix, not isolated acoustic instruments.",
  },
} as const;
export type ReferenceId = keyof typeof references;
