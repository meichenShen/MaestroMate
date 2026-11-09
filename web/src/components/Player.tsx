import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Disc3,
  LoaderCircle,
} from "lucide-react";
import { useAudio } from "../audio/AudioProvider";
import { formatTime } from "../audio/timeline";
import { work } from "../content/aquarium";
export function Player() {
  const audio = useAudio();
  return (
    <footer className="player" aria-label="Music player">
      {audio.error && (
        <div className="audio-error" role="alert">
          <span>{audio.error}</span>
          <button onClick={audio.retry}>Retry audio</button>
        </div>
      )}
      <div className="player-inner">
        <div className="now-playing">
          <span className={`record-icon ${audio.playing ? "is-spinning" : ""}`}>
            <Disc3 size={28} strokeWidth={1.3} />
          </span>
          <div>
            <strong>{work.title}</strong>
            <small>
              {audio.clipLabel || "Saint-Saëns · The Carnival of the Animals"}
            </small>
          </div>
        </div>
        <div className="transport">
          <button
            className="icon-button replay-button"
            aria-label="Back ten seconds"
            onClick={() => audio.seek(audio.time - 10)}
          >
            <RotateCcw size={18} />
            <span>10</span>
          </button>
          <button
            className="play-button"
            aria-label={audio.playing ? "Pause music" : "Play music"}
            onClick={audio.toggle}
          >
            {audio.loading ? (
              <LoaderCircle className="spin" size={21} />
            ) : audio.playing ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
          </button>
          <button
            className="icon-button replay-button"
            aria-label="Forward ten seconds"
            onClick={() => audio.seek(audio.time + 10)}
          >
            <RotateCw size={18} />
            <span>10</span>
          </button>
        </div>
        <div className="seek-control">
          <output aria-label="Current playback time">
            {formatTime(audio.time)}
          </output>
          <input
            type="range"
            min={0}
            max={audio.duration}
            step={0.1}
            value={audio.time}
            aria-label="Playback position"
            aria-valuetext={`${formatTime(audio.time)} of ${formatTime(audio.duration)}`}
            onChange={(event) => audio.seek(Number(event.target.value))}
            style={
              {
                "--progress": `${(audio.time / audio.duration) * 100}%`,
              } as React.CSSProperties
            }
          />
          <span>{formatTime(audio.duration)}</span>
        </div>
        <div className="player-extras">
          <label className="rate-control">
            <span className="sr-only">Playback speed</span>
            <select
              aria-label="Playback speed"
              value={audio.rate}
              onChange={(event) => audio.setRate(Number(event.target.value))}
            >
              <option value={0.75}>0.75×</option>
              <option value={1}>1.0×</option>
              <option value={1.25}>1.25×</option>
            </select>
          </label>
          <button
            className="icon-button"
            aria-label={audio.volume ? "Mute" : "Unmute"}
            onClick={() => audio.setVolume(audio.volume ? 0 : 0.8)}
          >
            {audio.volume ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <input
            className="volume-control"
            type="range"
            min={0}
            max={1}
            step={0.05}
            aria-label="Volume"
            value={audio.volume}
            onChange={(event) => audio.setVolume(Number(event.target.value))}
          />
        </div>
      </div>
      <span className="sr-only" role="status">
        {audio.playing ? "Playing" : "Paused"}
      </span>
    </footer>
  );
}
