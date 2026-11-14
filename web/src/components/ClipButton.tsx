import { Play } from "lucide-react";
import { useAudio } from "../audio/AudioProvider";
import { type Clip } from "../content/aquarium";
import { formatTime } from "../audio/timeline";
export function ClipButton({ clip }: { clip: Clip }) {
  const { playClip } = useAudio();
  return (
    <button className="clip-button" onClick={() => playClip(clip)}>
      <Play size={14} fill="currentColor" />
      <span>{clip.label}</span>
      <small>
        {formatTime(clip.start)}–{formatTime(clip.end)}
      </small>
    </button>
  );
}
