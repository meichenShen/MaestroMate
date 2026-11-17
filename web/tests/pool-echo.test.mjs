import { test } from "node:test";
import assert from "node:assert/strict";
import { echoRounds, advanceEcho } from "../src/features/water/echo-model.ts";
test("fish trail grows in length; wrong notes keep place and correct notes finish", () => {
  assert.deepEqual(
    echoRounds.map((x) => x.length),
    [3, 4, 5],
  );
  for (const pattern of echoRounds) {
    let position = 0;
    for (const note of pattern) {
      const wrong = advanceEcho(pattern, position, (note + 1) % 5);
      assert.equal(wrong.position, position);
      const right = advanceEcho(pattern, position, note);
      position = right.position;
      assert.equal(right.complete, position === pattern.length);
    }
    assert.equal(position, pattern.length);
  }
});
