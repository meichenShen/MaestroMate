export const poolNotes = [
  { name: "C", midi: 60, key: "A", color: "#45D9FD" },
  { name: "D", midi: 62, key: "S", color: "#A593E0" },
  { name: "E", midi: 64, key: "D", color: "#FFDA8E" },
  { name: "G", midi: 67, key: "F", color: "#EE2560" },
  { name: "A", midi: 69, key: "G", color: "#80D4F6" },
] as const;
export type Melody = (number | null)[];
export const stepSeconds = 0.3; // Two bars of eighth notes at100bpm.
export const emptyMelody = (): Melody => Array(8).fill(null);
export const midiFrequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
export function putNote(
  melody: Melody,
  slot: number,
  note: number | null,
): Melody {
  if (
    !Number.isInteger(slot) ||
    slot < 0 ||
    slot > 7 ||
    (note !== null &&
      (!Number.isInteger(note) || note < 0 || note >= poolNotes.length))
  )
    return [...melody];
  return Array.from({ length: 8 }, (_, i) =>
    i === slot ? note : (melody[i] ?? null),
  );
}
