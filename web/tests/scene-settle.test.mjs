import { test } from "node:test";
import assert from "node:assert/strict";
import { nearSceneStop } from "../src/navigation/scene-settle.ts";
test("settling only accepts a nearby stop, keeping a free middle position", () => {
  assert.equal(nearSceneStop(450, [0, 914, 1828], 1000), null);
  assert.equal(nearSceneStop(800, [0, 914, 1828], 1000), 914);
  assert.equal(nearSceneStop(1840, [0, 914, 1828], 1000), 1828);
  assert.equal(nearSceneStop(0, [], 1000), null);
});
