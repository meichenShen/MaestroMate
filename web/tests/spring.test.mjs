import { test } from "node:test";
import assert from "node:assert/strict";
import { springStep } from "../src/animation/spring.ts";
test("a released spring carries momentum then settles without nonfinite drift", () => {
  let state = { value: 0, velocity: 0 };
  for (let i = 0; i < 12; i++) state = springStep(state, 1, 1 / 60);
  assert.ok(state.value > 0.5 && state.velocity > 0);
  const released = springStep(state, 0, 1 / 60);
  assert.notEqual(released.value, 0);
  for (let i = 0; i < 180; i++) state = springStep(state, 0, 1 / 60);
  assert.ok(
    Math.abs(state.value) < 0.0001 && Math.abs(state.velocity) < 0.0001,
  );
  assert.ok(
    Number.isFinite(
      springStep({ value: NaN, velocity: Infinity }, Infinity, 1000).value,
    ),
  );
});
