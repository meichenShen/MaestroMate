import { test } from "node:test";
import assert from "node:assert/strict";
import { swimPose } from "../src/rendering/swim.ts";
test("fish travel through the scene and keep deterministic seek positions", () => {
  const a = swimPose(0, 0, 20, 8),
    b = swimPose(4, 0, 20, 8);
  assert.ok(Math.hypot(b.x - a.x, b.y - a.y) > 2);
  assert.deepEqual(swimPose(42, 2, 20, 8), swimPose(42, 2, 20, 8));
});
test("fish paths remain finite, within water bounds and face a nonzero travel vector", () => {
  for (let i = 0; i < 8; i++)
    for (let t = 0; t < 144; t += 0.7) {
      const p = swimPose(t, i, 20, 8);
      assert.ok(Object.values(p).every(Number.isFinite));
      assert.ok(Math.abs(p.x) <= 10 && Math.abs(p.y) <= 3.5);
      assert.ok(Math.hypot(p.dx, p.dy, p.dz) > 0.05);
    }
});
