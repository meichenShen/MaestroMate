import { test } from "node:test";
import assert from "node:assert/strict";
import { pointerHallView } from "../src/rendering/hall-view.ts";
const degrees = (r) => (r * 180) / Math.PI;
test("passive pointer travel remains a gentle local view", () => {
  const a = pointerHallView(-0.5, 0),
    b = pointerHallView(0.5, 0);
  assert.ok(degrees(b.yaw - a.yaw) <= 30, "Hover never gives a full turn");
  assert.ok(
    degrees(b.yaw - a.yaw) >= 10,
    "The gentle response remains visible",
  );
});
test("gentle hover is centered and has a small pitch envelope", () => {
  assert.deepEqual(pointerHallView(0, 0), { yaw: 0, pitch: 0 });
  assert.ok(Math.abs(pointerHallView(0, -0.5).pitch) < 0.1);
});
test("out-of-range and nonfinite pointer coordinates stay finite", () => {
  assert.deepEqual(pointerHallView(20, -20), pointerHallView(0.5, -0.5));
  for (const v of [NaN, Infinity, -Infinity])
    assert.deepEqual(pointerHallView(v, v), { yaw: 0, pitch: 0 });
});
