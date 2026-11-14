export const poolCamera = { y: 9, z: 4.4, viewHeight: 7.8 };
export const poolNotePositions = [-3, -1.5, 0, 1.5, 3].map((x, i) => ({
  x,
  y: 0.02,
  z: 1.1 - i * 0.55,
}));
export interface PoolLayout {
  width: number;
  height: number;
  scaleX: number;
  padSize: number;
  notes: { x: number; y: number }[];
  surface: { left: number; top: number; width: number; height: number };
}
// One projection shared by the drawing, HTML targets and no-WebGL fallback.
// Basin shape has a physical cap; target size is independently derived.
export function getPoolLayout(width: number, height: number): PoolLayout {
  const w = Number.isFinite(width) ? Math.max(1, width) : 1;
  const h = Number.isFinite(height) ? Math.max(1, height) : 1;
  const aspect = w / h,
    scaleX = Math.min(1.5, aspect * 1.02);
  const distance = Math.hypot(poolCamera.y, poolCamera.z);
  const upY = poolCamera.z / distance,
    upZ = -poolCamera.y / distance;
  const notes = poolNotePositions.map((p) => ({
    x: 50 + ((p.x * scaleX) / (poolCamera.viewHeight * aspect)) * 100,
    y: 50 - ((p.y * upY + p.z * upZ) / poolCamera.viewHeight) * 100,
  }));
  const spacing = ((notes[1].x - notes[0].x) * w) / 100;
  const surfaceWidth = ((7 * scaleX) / (poolCamera.viewHeight * aspect)) * 100;
  const surfaceHeight = ((7 * -upZ) / poolCamera.viewHeight) * 100;
  return {
    width: w,
    height: h,
    scaleX,
    notes,
    padSize: Math.max(44, Math.min(72, spacing - 10)),
    surface: {
      left: 50 - surfaceWidth / 2,
      top: 50 - surfaceHeight / 2,
      width: surfaceWidth,
      height: surfaceHeight,
    },
  };
}
