import { Ear, ExternalLink, BookOpen, Lightbulb } from "lucide-react";
import { useAudio } from "../audio/AudioProvider";
import { formatTime } from "../audio/timeline";
import { work, type ActivityId } from "../content/aquarium";
export function ContextPanel({ activity }: { activity: ActivityId }) {
  const { chapter } = useAudio();
  return (
    <aside className="context-panel" aria-label="听赏提示与作品资料">
      <section className="context-card listening-card">
        <span className="small-icon">
          <Ear size={20} strokeWidth={1.6} />
        </span>
        <p className="section-overline">A LITTLE NUDGE</p>
        <h2>此刻，留意什么？</h2>
        <div className="chapter-label">
          <span className="live-dot" />
          {chapter.title}
          <span>{formatTime(chapter.start)}</span>
        </div>
        <p className="context-copy">{chapter.hint}</p>
        <span className="context-bottom">不必听懂所有，先听见一点。</span>
      </section>
      <section className="context-card note-card">
        <BookOpen size={19} strokeWidth={1.5} />
        <h3>关于这部作品</h3>
        <p>
          《动物狂欢节》用声音描绘一场充满想象的动物聚会。《水族馆》是其中第七曲。
        </p>
        <dl>
          <div>
            <dt>作曲</dt>
            <dd>{work.composer}</dd>
          </div>
          <div>
            <dt>年代</dt>
            <dd>{work.year} · 法国</dd>
          </div>
          <div>
            <dt>形式</dt>
            <dd>器乐合奏</dd>
          </div>
        </dl>
        <details>
          <summary>录音与资料来源</summary>
          <p>{work.recording}</p>
          <p>{work.recordingNote}</p>
          <a href={work.source} target="_blank" rel="noreferrer">
            查看原始录音 <ExternalLink size={12} />
          </a>
          <a href={work.license} target="_blank" rel="noreferrer">
            CC BY-SA 2.0 <ExternalLink size={12} />
          </a>
        </details>
      </section>
      <div className="gentle-note">
        <Lightbulb size={17} />
        <p>
          {activity === "theater"
            ? "画面是一种想象。闭上眼睛，你也可以有自己的版本。"
            : activity === "conversation"
              ? "这里是预设问答体验。选一个问题，让好奇心带路。"
              : "答错也没关系。回去听一遍，发现的过程更有意思。"}
        </p>
      </div>
    </aside>
  );
}
