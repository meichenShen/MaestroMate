/** Pointer coordinates are centered in the viewport: −0.5…0.5 gives gentle parallax; wide rotation requires a drag. */
export function pointerHallView(
  x: number,
  y: number,
): { yaw: number; pitch: number } {
  const finiteClamp = (value: number) =>
    Number.isFinite(value) ? Math.max(-0.5, Math.min(0.5, value)) : 0;
  return {
    yaw: finiteClamp(x) * 0.44,
    pitch: -finiteClamp(y) * 0.12 || 0,
  };
}
