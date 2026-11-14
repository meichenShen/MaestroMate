import test from "node:test";
import assert from "node:assert/strict";
import { getPoolLayout } from "../src/features/water/layout.ts";
test("pond remains rounder than a wide platter, independent of the page aspect", () => {
  for (const [w, h] of [
    [1318, 380],
    [1200, 190],
    [940, 350],
    [346, 270],
    [276, 236],
  ]) {
    const l = getPoolLayout(w, h);
    const ratio = (l.surface.width * w) / (l.surface.height * h);
    assert.ok(ratio >= 1 && ratio <= 1.75, w + " aspect " + ratio);
    assert.ok(l.surface.width <= 94 && l.surface.height <= 90);
  }
});
test("all note targets remain distinct and in-bounds even in short and narrow stages", () => {
  for (const [w, h] of [
    [1318, 380],
    [1200, 170],
    [940, 350],
    [346, 270],
    [276, 236],
  ]) {
    const l = getPoolLayout(w, h);
    assert.equal(l.notes.length, 5);
    assert.ok(l.padSize >= 44);
    for (let i = 0; i < 5; i++) {
      const x = (l.notes[i].x * w) / 100;
      assert.ok(x - l.padSize / 2 >= 0 && x + l.padSize / 2 <= w);
      if (i) assert.ok(x - (l.notes[i - 1].x * w) / 100 >= l.padSize + 1);
    }
  }
});
