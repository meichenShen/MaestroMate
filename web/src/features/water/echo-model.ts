export const echoRounds = [
  [0, 2, 1],
  [1, 3, 2, 0],
  [0, 2, 4, 3, 1],
];
export function advanceEcho(
  pattern: readonly number[],
  position: number,
  note: number,
) {
  const right =
    Number.isInteger(position) &&
    position >= 0 &&
    position < pattern.length &&
    pattern[position] === note;
  const next = right ? position + 1 : position;
  return { position: next, correct: right, complete: next === pattern.length };
}
