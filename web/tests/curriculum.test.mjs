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
test("six focused units teach two checks with bounded recording passages and real sources", () => {
  assert.equal(units.length, 6);
  assert.equal(units.filter((u) => u.area === "works").length, 3);
  for (const u of units) {
    assert.equal(u.checks.length, 2);
    assert.ok(u.teach.length < 330);
    assert.ok(u.sourceIds.length);
    for (const q of u.checks) {
      assert.ok(q.prompt.length < 100);
      assert.ok(q.answer >= 0 && q.answer < q.options.length);
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
test("completion needs both correct checked answers and an actually successful creative application", () => {
  const u = units[0],
    p = emptyUnitProgress(u);
  assert.equal(unitDone(u, p), false);
  p.answers = u.checks.map((q) => q.answer);
  p.checked = [true, true];
  assert.equal(unitDone(u, p), false);
  p.notes = [0, 1, 2, 4];
  p.made = true;
  assert.equal(unitDone(u, p), true);
  p.answers[1] = -1;
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
