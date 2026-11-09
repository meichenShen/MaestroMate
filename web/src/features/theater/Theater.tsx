import { Play, Pause, Sparkles, MoveRight, CircleHelp } from "lucide-react";
import { useAudio } from "../../audio/AudioProvider";
import { formatTime } from "../../audio/timeline";
import { chapters } from "../../content/aquarium";
import { AquariumScene } from "./AquariumScene";
import "./theater.css";
export function Theater({
  onDiscover,
  motion,
  onMotionChange,
}: {
  onDiscover: () => void;
  motion: boolean;
  onMotionChange: (value: boolean) => void;
}) {
  const audio = useAudio();
  return (
    <section className="theater-feature" aria-labelledby="theater-title">
      <div className="feature-heading">
        <div>
          <span className="section-overline">LISTEN & IMAGINE</span>
          <h2 id="theater-title">让耳朵，带你潜入水底。</h2>
        </div>
        <span className="feature-badge">
          <Sparkles size={12} /> 音乐小剧场
        </span>
      </div>
      <div className="scene-frame">
        <AquariumScene
          moving={audio.playing && motion}
          phase={audio.chapter.id}
        />
        <div className="scene-topline">
          <span>
            <i className={audio.playing ? "live-dot" : ""} />
            {audio.playing ? "正在聆听" : "等待一场声音的旅行"}
          </span>
          <button
            aria-pressed={!motion}
            onClick={() => onMotionChange(!motion)}
          >
            {motion ? "关闭动态" : "开启动态"}
          </button>
        </div>
        <div className="scene-caption">
          <span>0{chapters.indexOf(audio.chapter) + 1} / 04</span>
          <h3>{audio.chapter.title}</h3>
          <p>{audio.chapter.image}</p>
        </div>
        <button
          className="scene-play"
          aria-label={audio.playing ? "暂停小剧场音乐" : "开始小剧场音乐"}
          onClick={audio.toggle}
        >
          {audio.playing ? (
            <Pause size={19} fill="currentColor" />
          ) : (
            <Play size={19} fill="currentColor" />
          )}
        </button>
      </div>
      <div className="chapter-navigation" aria-label="聆听段落">
        {chapters.map((chapter, index) => (
          <button
            key={chapter.id}
            className={chapter.id === audio.chapter.id ? "is-current" : ""}
            onClick={() => audio.seek(chapter.start)}
            aria-current={chapter.id === audio.chapter.id ? "step" : undefined}
          >
            <span className="chapter-progress" />
            <small>
              0{index + 1}
              <span>{formatTime(chapter.start)}</span>
            </small>
            <strong>{chapter.title}</strong>
          </button>
        ))}
      </div>
      <div className="theater-footer">
        <p>
          <CircleHelp size={15} /> 场景是艺术想象，你也可以只听音乐。
        </p>
        <button onClick={onDiscover}>
          去发现声音线索 <MoveRight size={17} />
        </button>
      </div>
    </section>
  );
}
