import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateVariation, learningSteps } from "../src/content/learning.ts";
test("variation accepts every lower ending, preserves the opening and rejects missing notes", () => {
  for (const ending of [0, 1, 2])
    assert.equal(evaluateVariation([0, 1, 2, ending]).correct, true);
  for (const m of [
    [0, 1, 2, 3],
    [0, 1, 2, 4],
    [1, 1, 2, 0],
    [0, 1, 2, null],
    [0, 1, 2, -1],
  ])
    assert.equal(evaluateVariation(m).correct, false);
});
test("trail has three distinct goals and bounded eight-step original demonstrations", () => {
  assert.deepEqual(
    learningSteps.map((x) => x.id),
    ["notice", "discover", "create"],
  );
  for (const x of learningSteps) {
    assert.equal(x.demo.length, 8);
    assert.ok(x.goal && x.explanation);
  }
});
