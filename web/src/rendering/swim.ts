/** Absolute audio time gives repeatable travel, turning and depth after a seek. */
export function swimPose(
  time: number,
  index: number,
  width: number,
  height: number,
) {
  const speed = 0.2 + (index % 3) * 0.025,
    a = time * speed + index * 0.96;
  const x = Math.sin(a) * width * 0.38,
    y = Math.sin(a * 0.71 + index * 0.8) * height * 0.21 + 0.3,
    z = Math.cos(a + index * 0.3) * 1.8;
  return {
    x,
    y,
    z,
    dx: Math.cos(a) * width * 0.38 * speed,
    dy: Math.cos(a * 0.71 + index * 0.8) * height * 0.21 * 0.71 * speed,
    dz: -Math.sin(a + index * 0.3) * 1.8 * speed,
  };
}
