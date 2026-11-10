import { test } from "node:test";
import assert from "node:assert/strict";
import { pointerHallView } from "../src/rendering/hall-view.ts";

const near = (actual, expected) =>
  assert.ok(
    Math.abs(actual - expected) < 1e-10,
    `${actual} should equal ${expected}`,
  );

test("moving across the hall gives one complete revolution", () => {
  near(pointerHallView(-0.5, 0).yaw, -Math.PI);
  near(pointerHallView(0, 0).yaw, 0);
  near(pointerHallView(0.5, 0).yaw, Math.PI);
});

test("a quarter-width move turns the hall by 90 degrees", () => {
  near(pointerHallView(0.25, 0).yaw, Math.PI / 2);
  near(pointerHallView(-0.25, 0).yaw, -Math.PI / 2);
});

test("pitch stays within a comfortable overhead view", () => {
  const top = pointerHallView(0, -0.5).pitch;
  const bottom = pointerHallView(0, 0.5).pitch;
  assert.ok(top > 0 && top < Math.PI / 3);
  assert.ok(bottom < 0 && bottom > -Math.PI / 3);
  near(top, -bottom);
});

test("out-of-range and nonfinite pointer coordinates stay finite", () => {
  near(pointerHallView(-20, 20).yaw, -Math.PI);
  near(pointerHallView(20, -20).yaw, Math.PI);
  for (const value of [NaN, Infinity, -Infinity]) {
    assert.deepEqual(pointerHallView(value, value), { yaw: 0, pitch: 0 });
  }
});
