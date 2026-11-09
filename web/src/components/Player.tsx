import { Play, Pause, RotateCcw, Volume2, VolumeX, Disc3, LoaderCircle } from 'lucide-react';
import { useAudio } from '../audio/AudioProvider';
import { formatTime } from '../audio/timeline';
import { work } from '../content/aquarium';
export function Player() {
  const audio = useAudio();
  return <footer className="player" aria-label="共享音乐播放器">
    {audio.error && <div className="audio-error" role="alert"><span>{audio.error}</span><button onClick={audio.retry}>重新加载</button></div>}
    <div className="player-inner"><div className="now-playing"><span className={`record-icon ${audio.playing ? 'is-spinning' : ''}`}><Disc3 size={28} strokeWidth={1.3} /></span><div><strong>{work.title}<span>Aquarium</span></strong><small>{audio.clipLabel || '圣桑 · 动物狂欢节'}</small></div></div>
      <div className="transport"><button className="icon-button replay-button" aria-label="后退十秒" onClick={() => audio.seek(audio.time - 10)}><RotateCcw size={18} /><span>10</span></button><button className="play-button" aria-label={audio.playing ? '暂停音乐' : '播放音乐'} onClick={audio.toggle}>{audio.loading ? <LoaderCircle className="spin" size={21} /> : audio.playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button></div>
      <div className="seek-control"><output aria-label="当前播放时间">{formatTime(audio.time)}</output><input type="range" min={0} max={audio.duration} step={0.1} value={audio.time} aria-label="播放进度" aria-valuetext={`${formatTime(audio.time)}，共 ${formatTime(audio.duration)}`} onChange={event => audio.seek(Number(event.target.value))} style={{ '--progress': `${audio.time / audio.duration * 100}%` } as React.CSSProperties} /><span>{formatTime(audio.duration)}</span></div>
      <div className="player-extras"><label className="rate-control"><span className="sr-only">播放速度</span><select aria-label="播放速度" value={audio.rate} onChange={event => audio.setRate(Number(event.target.value))}><option value={0.75}>0.75×</option><option value={1}>1.0×</option><option value={1.25}>1.25×</option></select></label><button className="icon-button" aria-label={audio.volume ? '静音' : '取消静音'} onClick={() => audio.setVolume(audio.volume ? 0 : 0.8)}>{audio.volume ? <Volume2 size={18} /> : <VolumeX size={18} />}</button><input className="volume-control" type="range" min={0} max={1} step={0.05} aria-label="音量" value={audio.volume} onChange={event => audio.setVolume(Number(event.target.value))} /></div>
    </div><span className="sr-only" role="status">{audio.playing ? '正在播放' : '已暂停'}</span>
  </footer>;
}
