/** A nearby scene may settle; a stop in the middle remains the user's choice. */
export function nearSceneStop(
  target: number,
  stops: number[],
  viewport: number,
): number | null {
  if (!Number.isFinite(target) || !stops.length) return null;
  const closest = stops.reduce((a, b) =>
    Math.abs(b - target) < Math.abs(a - target) ? b : a,
  );
  return Math.abs(closest - target) <= viewport * 0.18 ? closest : null;
}
