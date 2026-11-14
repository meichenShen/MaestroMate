/** Pointer coordinates are centered in the viewport: −0.5…0.5 gives gentle parallax; wide rotation requires a drag. */
export function pointerHallView(
  x: number,
  y: number,
): { yaw: number; pitch: number } {
  const finiteClamp = (value: number) =>
    Number.isFinite(value) ? Math.max(-0.5, Math.min(0.5, value)) : 0;
  return {
    yaw: -finiteClamp(x) * 0.6 || 0,
    pitch: finiteClamp(y) * 0.15 || 0,
  };
}

/** Shared camera pose keeps pointer mapping and the projected opening consistent. */
export function hallCameraPose(yaw: number, pitch: number) {
  const azimuth = 0.34 + yaw,
    elevation = 0.66 + pitch,
    horizontal = 60 * Math.cos(elevation);
  return {
    x: Math.sin(azimuth) * horizontal,
    y: 4 + Math.sin(elevation) * 60,
    z: -0.3 + Math.cos(azimuth) * horizontal,
  };
}
