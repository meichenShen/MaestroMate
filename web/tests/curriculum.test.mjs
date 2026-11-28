import { test } from "node:test";
import assert from "node:assert/strict";
import {
  units,
  resolveUnit,
  emptyUnitProgress,
  evaluateCreation,
  unitDone,
} from "../src/content/curriculum.ts";
import { work } from "../src/content/aquarium.ts";
test("fourteen focused units teach three varied checks with bounded recording passages and real sources", () => {
  assert.equal(units.length, 14);
  assert.equal(units.filter((u) => u.area === "works").length, 6);
  for (const u of units) {
    assert.equal(u.checks.length, 3);
    assert.ok(u.teach.length < 330);
    assert.ok(u.sourceIds.length);
    for (const q of u.checks) {
      assert.ok(q.prompt.length < 100);
      if (q.interaction) assert.ok(q.target.length);
      else assert.ok(q.answer >= 0 && q.answer < q.options.length);
    }
    if (u.clip)
      assert.ok(
        u.clip.start >= 0 &&
          u.clip.end > u.clip.start &&
          u.clip.end <= work.duration,
      );
  }
  for (const id of ["constructor", "toString", "__proto__", "swan", "missing"])
    assert.equal(resolveUnit(id), undefined);
});
test("learning completion is independent of creation and requires all three correct checks", () => {
  const u = units[0],
    p = emptyUnitProgress(u);
  assert.equal(unitDone(u, p), false);
  p.answers = u.checks.map((q) => q.answer);
  p.responses = u.checks.map((q) => q.target || []);
  p.checked = u.checks.map(() => true);
  assert.equal(p.made, false);
  assert.equal(unitDone(u, p), true);
  p.checked[1] = false;
  assert.equal(unitDone(u, p), false);
});
test("creative assessment accepts multiple musical solutions but rejects silence and malformed notes", () => {
  const rise = resolveUnit("pitch"),
    variation = resolveUnit("aquarium-return"),
    rhythm = resolveUnit("rhythm");
  for (const n of [
    [0, 1, 2, 4],
    [1, 2, 3, 4],
  ])
    assert.equal(evaluateCreation(rise, n, []).correct, true);
  assert.equal(evaluateCreation(rise, [4, 3, 2, 0], []).correct, false);
  assert.equal(
    evaluateCreation(rise, [null, null, null, null], []).correct,
    false,
  );
  for (const last of [0, 1, 2, 4])
    assert.equal(
      evaluateCreation(variation, [0, 1, 2, last], []).correct,
      true,
    );
  assert.equal(evaluateCreation(variation, [0, 1, 2, 3], []).correct, false);
  assert.equal(evaluateCreation(variation, [0, 1, 99, 0], []).correct, false);
  assert.equal(
    evaluateCreation(rhythm, [], [true, false, true, false]).correct,
    true,
  );
  assert.equal(
    evaluateCreation(rhythm, [], [true, true, true, true]).correct,
    false,
  );
});
