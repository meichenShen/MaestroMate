import { chapters } from "../content/aquarium.ts";
export function chapterAt(time: number) {
  return (
    chapters.find((chapter) => time >= chapter.start && time < chapter.end) ??
    (time >= chapters[chapters.length - 1].end
      ? chapters[chapters.length - 1]
      : chapters[0])
  );
}
export function formatTime(time: number) {
  const seconds = Math.max(0, Math.floor(Number.isFinite(time) ? time : 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
export function clampSeek(time: number, duration: number) {
  return Math.max(0, Math.min(Number.isFinite(time) ? time : 0, duration));
}
