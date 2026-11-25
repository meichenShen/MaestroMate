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
// Reviewed additions: facts are deliberately split by topic so a question does
// not get answered with an unrelated biography paragraph. Source review: 2026-11-25.
knowledgeEntries.push(
  {id:"aquarium-analysis",keywords:"Aquarium analysis form structure theme themes chromatic descending contrary motion muted strings flowing water rippling",text:"The Philharmonie teaching dossier describes a sustained, singing flute-and-muted-string theme above rapid piano figures in contrary motion, contrasted with descending chromatic piano material. This describes musical writing, not literal recorded water or a specific fish. The dossier discusses a performance using celesta: distinguish that substitute from the original glass-harmonica part. Its excerpt times do not apply to this site. A complete bar-by-bar harmonic analysis is not supplied here.",sourceIds:["analysis","score"]},
  {id:"animal-contrasts",keywords:"animals movements lion tortoise elephant kangaroo cuckoo aviary fossils Swan cello contrast",text:"The Carnival presents contrasting short movements: the lion is introduced by a stately march; tortoises use a slowed-down cancan quotation; the elephant features double bass; The Swan features cello with two pianos. These are examples from the whole Carnival, not the instrumentation of Aquarium. Their source recording and excerpt times differ from ours.",sourceIds:["analysis","score"]},
  {id:"works",keywords:"works wrote other pieces compositions opera symphony concerto Samson Dalila Danse macabre organ third",text:"Saint-Saëns wrote across genres. Examples include the opera Samson et Dalila (1877), the symphonic poem Danse macabre (1875), Symphony No. 3 with organ (1886), and five piano concertos. Aquarium is only one movement of one work, not a summary of his output.",sourceIds:["biography"]},
  {id:"film",keywords:"film cinema movie soundtrack Guise assassination 1908",text:"In 1908 Saint-Saëns composed music for the film The Assassination of the Duke of Guise. This is a different work from Aquarium. Do not claim Aquarium was composed for cinema or that he invented film music.",sourceIds:["biography"]},
  {id:"travel",keywords:"travel travelled traveled abroad outside France Algeria Egypt Algiers death died 1921",text:"Saint-Saëns toured internationally as a pianist and composer, and regularly visited Algeria and Egypt from 1873. He died in Algiers on 16 December 1921. These facts do not establish what he thought or felt on any particular journey.",sourceIds:["biography"]},
  {id:"glass",keywords:"glass harmonica armonica Franklin friction vibrate vibration sound wet fingers bowls spinning invention 1761",text:"Franklin completed his glass armonica in 1761. It uses graduated glass bowls on a rotating spindle, sounded by damp fingers touching the glass. Friction makes the glass vibrate. It is not a mouth-blown harmonica, nor the same instrument as a celesta. The original Aquarium calls for glass harmonica; our produced recording does not provide isolated proof of each instrument.",sourceIds:["glass","score"]},
  {id:"tempo",keywords:"tempo speed fast slow bpm beat pulse rhythm rest silence steady duration",text:"A beat is a recurring pulse. Tempo is its speed, measured in beats per minute (BPM): at 60 BPM one beat lasts a second, at 120 BPM there are two beats per second. Rhythm is the arrangement of sounds and rests in time; different rhythms can share one tempo. These examples explain concepts, not the measured tempo of this site's recording.",sourceIds:["beat"]},
  {id:"harmony",keywords:"harmony chord chords triad triads simultaneous melody arpeggio broken",text:"A chord groups pitches heard together; a basic triad uses three notes. A melody unfolds as a sequence of pitches. An arpeggio plays chord tones successively rather than all at once. C–E–G is a C-major triad used here as a general example, not a transcription of Aquarium.",sourceIds:["chords"]},
  {id:"scales",keywords:"scale scales major minor key keys happy sad emotion mood intervals semitone whole tone tonal",text:"Major and natural-minor scales arrange whole steps and half steps differently. For C major the notes are C D E F G A B; for C natural minor they are C D E-flat F G A-flat B-flat. Major is often described as bright and minor as dark, but these are common associations, not rules for a listener's feelings. Do not infer an exact Aquarium key or harmonic analysis from these introductory examples.",sourceIds:["scales"]},
  {id:"timbre",keywords:"timbre tone colour color distinguish flute violin piano pitch loudness volume high low",text:"Pitch describes how high or low a sound is (on a piano keyboard pitches get higher from left to right); loudness describes how loud or soft it seems. Timbre is the sound quality that helps distinguish, for example, a flute and a violin even at a similar pitch and loudness. Timbre is not the same as pitch or loudness. General comparisons do not identify individual sources in the site's produced mix.",sourceIds:["timbre"]},
);
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
  followUpContext: string | string[] = "",
): KnowledgeEntry[] {
  const suggestion =
    questionId || questions.find((q) => q.prompt === question.trim())?.id;
  const anchors =
    suggestion && Object.hasOwn(questionNotes, suggestion)
      ? questionNotes[suggestion].map(
          (id) => knowledgeEntries.find((n) => n.id === id)!,
        )
      : [];

  const current = tokens(question);
  // Expand Chinese context too: pronouns such as 它 otherwise lose their topic.
  const previous = (Array.isArray(followUpContext) ? followUpContext : [followUpContext]).slice(-3).reverse().map(tokens);
  const ranked = knowledgeEntries.map((entry, i) => {
    const keywords = tokens(entry.keywords);
    const score = [...current].reduce((n, w) => n + (keywords.has(w) ? 1 : 0), 0);
    const context = anchors.length ? 0 : previous.reduce((total, words, age) => total + [...words].filter(w=>keywords.has(w)).length/(age+1),0);
    return {entry, i, score, context};
  }).filter(x=>x.score>0||x.context>0).sort((a,b)=>b.score-a.score||b.context-a.context||a.i-b.i);
  const baseIds = ["person","carnival","scene"];
  const topics = [...anchors, ...ranked.slice(0,5).map(x=>x.entry)].filter(x=>!baseIds.includes(x.id));
  const selected = [...new Map(topics.map(x=>[x.id,x])).values()].slice(0,6);
  // Reserve the persona and interpretation boundary; never truncate them away.
  for(const id of baseIds)
    selected.push(knowledgeEntries.find(n=>n.id===id)!);
  return [...new Map(selected.map(x=>[x.id,x])).values()].slice(0,9);
}
const aliases:Record<string,string> = {
  水族馆:"Aquarium",开头:"theme layers",乐器:"instruments",玻璃:"glass harmonica",发声:"vibration",钢琴:"piano",长笛:"flute",小提琴:"violin",
  音色:"timbre",音高:"pitch",响度:"loudness",音量:"volume",旋律:"melody",伴奏:"accompaniment",
  教堂:"Madeleine",巴黎:"Paris",福雷:"Faure teaching",学生:"teaching",老师:"teaching",生平:"life",小时候:"childhood",童年:"childhood",出生:"born",
  拍点:"beat pulse",一拍:"beat pulse",节奏:"rhythm",节拍:"beat",拍子:"beat",速度:"tempo",快慢:"tempo",休止:"rest",谁演奏:"recording performer",谁做的:"recording",录制:"recording",录音:"recording",版本:"recording",演奏者:"performer",
  鱼:"fish scene",画面:"scene",创作:"compositions",作品:"works",写过:"works",歌剧:"opera",交响曲:"symphony",协奏曲:"concerto",骷髅:"macabre",
  结构:"structure",曲式:"form",主题:"theme",半音:"chromatic",水流:"flowing water",海水:"water",乌龟:"tortoise",大象:"elephant",狮子:"lion",大提琴:"cello",狂欢节:"Carnival history",天鹅:"Swan",乐章:"movement",出版:"publish",遗憾:"regret",后悔:"regret",电影:"film",配乐:"soundtrack",
  去过:"travel",国家:"abroad",法国以外:"abroad outside France",旅行:"travel",去世:"death",埃及:"Egypt",阿尔及利亚:"Algeria",
  和弦:"chord",三和弦:"triad",分解和弦:"arpeggio",和声:"harmony",大调:"major scale",小调:"minor scale",音阶:"scale",快乐:"happy",悲伤:"sad",变奏:"variation",
};
const stopwords = new Set("what which when where why how would could should can did does have has had you your yours tell about something anything please more this that these those with from were was the and for are not its into want like know music musical composer saint saens camille".split(" "));
function tokens(text:string):Set<string> {
  const expanded=text+" "+Object.entries(aliases).filter(([term])=>text.includes(term)).map(([,value])=>value).join(" ");
  return new Set((expanded.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").match(/[a-z]{3,}/g)||[]).filter(w=>!stopwords.has(w)));
}
