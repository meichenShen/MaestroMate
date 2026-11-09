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
  title: "水族馆",
  originalTitle: "Aquarium",
  composer: "卡米耶·圣桑",
  composerLatin: "Camille Saint-Saëns",
  year: "1886",
  collection: "《动物狂欢节》· 第七曲",
  duration: 148.006893,
  audio: "/audio/aquarium.mp3",
  recording:
    "Neil 与 Nancy O’Doan（钢琴）· Seattle Youth Symphony · Vilem Sokol（指挥）",
  source:
    "https://commons.wikimedia.org/wiki/File:Saint-Saens_-_The_Carnival_of_the_Animals_-_07_Aquarium.ogg",
  license: "https://creativecommons.org/licenses/by-sa/2.0/",
  recordingNote:
    "录音约于 1980 年；源文件由 Wikimedia Commons 提供。本站转码为 MP3，未剪辑作品。CC BY-SA 2.0。",
};

export const activities: {
  id: ActivityId;
  title: string;
  subtitle: string;
  number: string;
}[] = [
  {
    id: "theater",
    title: "音乐小剧场",
    subtitle: "让声音，变成眼前的风景",
    number: "01",
  },
  {
    id: "conversation",
    title: "音乐家对话",
    subtitle: "从一个问题，走近一部作品",
    number: "02",
  },
  {
    id: "detective",
    title: "音乐侦探",
    subtitle: "用耳朵，寻找藏起来的线索",
    number: "03",
  },
];

// Listening windows and artistic scene changes, not a claim about formal sections.
export const chapters: Chapter[] = [
  {
    id: "surface",
    start: 0,
    end: 36,
    title: "水光初现",
    image: "一道光，落进安静的水里。",
    hint: "先听高处细密流动的声音，再留意它下面更舒展的旋律。",
  },
  {
    id: "current",
    start: 36,
    end: 74,
    title: "随波漫游",
    image: "跟着水流，游向更远的地方。",
    hint: "把注意力在流动的伴奏与旋律之间切换，听听哪一层更容易被你追踪。",
  },
  {
    id: "deep",
    start: 74,
    end: 111,
    title: "深处回响",
    image: "同一片水域，又有新的光影。",
    hint: "听到熟悉的感觉了吗？试着找出令你产生这种感觉的声音。",
  },
  {
    id: "still",
    start: 111,
    end: 148.006893,
    title: "涟漪渐息",
    image: "最后一圈涟漪，慢慢散开。",
    hint: "留意接近结尾时的变化，以及最后一个声音之后的安静。",
  },
];

export const questions = [
  {
    id: "aquarium",
    prompt: "为什么叫“水族馆”？",
    answer:
      "《水族馆》是《动物狂欢节》的第七曲。这里不需要辨认某一种鱼；你可以把连续流动的钢琴音型和较舒展的旋律，想象成水光与游动。每个人看到的“水下世界”都可以不同。",
    sourceLabel: "乐团导赏资料",
    source:
      "https://www.vancouversymphony.ca/site-content/uploads/2025/06/Lang-Lang-Program-Notes-for-VSO-Saint-Saens.pdf",
    clip: { start: 3, end: 18, label: "听听开头的水光" },
  },
  {
    id: "layers",
    prompt: "我应该先听哪一层声音？",
    answer:
      "试着分两次听同一个片段：第一次追踪细密、快速流动的声音；第二次把注意力放到较长、较平稳的旋律上。这是两种聆听角度，没有规定你必须先听到哪一层。",
    sourceLabel: "本站聆听练习",
    source: "",
    clip: { start: 3, end: 18, label: "分两次听这个片段" },
  },
  {
    id: "composer",
    prompt: "圣桑是怎样的一位音乐家？",
    answer:
      "卡米耶·圣桑是法国作曲家、钢琴家与管风琴家，生于 1835 年，逝于 1921 年。他在 1886 年写作《动物狂欢节》。本站使用的是作品完成多年后的演奏录音。",
    sourceLabel: "作品及录音资料",
    source: work.source,
    clip: undefined,
  },
  {
    id: "scene",
    prompt: "画面就是作曲家想表达的吗？",
    answer:
      "这里的水下场景是为这次体验创作的视觉想象，并不代表圣桑留下了这样的故事。你也可以关闭动态，只听音乐，看看自己会想到什么。",
    sourceLabel: "本站场景说明",
    source: "",
    clip: undefined,
  },
];

export const detectiveQuestions = [
  {
    id: "layers",
    title: "声音里，有几种步伐？",
    prompt: "听这段开头。细密流动的声音之外，你还能听见什么？",
    clips: [{ start: 3, end: 18, label: "播放线索片段" }],
    options: ["只有一层快速的声音", "还有一条更舒展的旋律", "只有清晰的鼓点"],
    correct: 1,
    explanation:
      "细密流动的钢琴音型之上，还有较舒展的旋律。再听一次，试着只跟随那条较长的线。",
  },
  {
    id: "ending",
    title: "音乐怎样告别？",
    prompt: "比较开头 A 与结尾 B。哪一段最后留下了声音结束后的安静？",
    clips: [
      { start: 3, end: 14, label: "听片段 A · 开头" },
      { start: 135, end: 148.006893, label: "听片段 B · 结尾" },
    ],
    options: ["片段 A", "片段 B", "两段都没有"],
    correct: 1,
    explanation:
      "B 来自作品结尾。留意最后的声音怎样收住，再把它和 A 中仍在继续的音乐比较。",
  },
];
