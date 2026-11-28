import {t,useLocale} from "../i18n/locale";
import { Play } from "lucide-react";
import { useAudio } from "../audio/AudioProvider";
import { type Clip } from "../content/aquarium";
import { formatTime } from "../audio/timeline";
export function ClipButton({ clip }: {
    clip: Clip;
}) {
    useLocale();
    const { playClip } = useAudio();
    return (<button className="clip-button" onClick={() => playClip(clip)}>
      <Play size={14} fill="currentColor"/>
      <span>{t(clip.label)}</span>
      <small>
        {t(formatTime(clip.start))}{t("\u2013")}{t(formatTime(clip.end))}
      </small>
    </button>);
}
