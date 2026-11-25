import { test } from "node:test";
import assert from "node:assert/strict";
import {
  units,
  emptyUnitProgress,
  checksDone,
  unitDone,
  checkCorrect,
} from "../src/content/curriculum.ts";
import { parseRoute } from "../src/navigation/routes.ts";
import {
  studyHash,
  studyParent,
} from "../src/features/curriculum/study-flow.ts";
test("three paths separate completed learning from free creation, with a varied ordered curriculum", () => {
  assert.equal(units.filter((u) => u.area === "works").length, 6);
  assert.equal(units.filter((u) => u.area === "lessons").length, 8);
  assert.ok(
    units.some((u) => u.checks.some((q) => q.interaction === "pattern")),
  );
  assert.ok(units.some((u) => u.checks.some((q) => q.interaction === "order")));
  for (const u of units) {
    assert.equal(u.checks.length, 3);
    const p = emptyUnitProgress(u);
    p.checked = u.checks.map(() => true);
    p.answers = u.checks.map((q) => q.answer);
    p.responses = u.checks.map((q) => q.target || []);
    assert.equal(checksDone(u, p), true);
    assert.equal(
      unitDone(u, p),
      true,
      "making is independent of lesson completion",
    );
  }
});
test("non-choice checks require the actual target, not a checked flag or arbitrary option", () => {
  const q = {
    interaction: "pattern",
    target: [1, 0, 1, 0],
    answer: 0,
    options: [],
    prompt: "Echo",
    explanation: "x",
  };
  assert.equal(checkCorrect(q, null, [1, 0, 1, 0]), true);
  assert.equal(checkCorrect(q, 0, [1, 1, 1, 1]), false);
  assert.equal(checkCorrect(q, 0, []), false);
});
test("route-level Back climbs one local level and preserves Program identity", () => {
  const u = units.find((u) => u.id === "pitch");
  assert.equal(studyHash(u, false, "try", 1), "#play/lessons/pitch/try/1");
  assert.equal(studyParent(u, false, "try", 1), "#play/lessons/pitch/try/0");
  assert.equal(studyParent(u, false, "try", 0), "#play/lessons/pitch");
  assert.equal(studyParent(u, false, "learn", 0), "#play/lessons");
  assert.equal(
    studyParent(u, true, "done", 0),
    "#program/aquarium/learn/pitch/try/2",
  );
  assert.equal(parseRoute("#play/create/beats").kind, "studio");
  assert.equal(parseRoute("#play/lessons/pitch/try/1").phase, "try");
  assert.equal(
    parseRoute("#program/aquarium/learn/aquarium-composer/try/2").question,
    2,
  );
});
test("every locally tested historical fact is taught locally, and replay has an actual recording affordance", () => {
  const u = (id) => units.find((u) => u.id === id);
  assert.match(u("aquarium-composer").teach, /1886/);
  assert.match(u("aquarium-composer").teach, /1921/);
  assert.ok(u("aquarium-recording").clip);
  assert.match(u("aquarium-recording").teach, /full mix|complete mix/i);
  assert.match(u("music-in-time").teach, /score.*notes/i);
});
test("Program reset preserves unrelated course progress", async () => {
  const { resetProgramProgress } = await import(
    "../src/features/curriculum/study-flow.ts"
  );
  assert.equal(typeof resetProgramProgress, "function");
  const general = emptyUnitProgress(units.find((u) => u.id === "pitch")),
    work = emptyUnitProgress(units.find((u) => u.id === "aquarium-layers"));
  const reset = resetProgramProgress({
    pitch: general,
    "aquarium-layers": work,
  });
  assert.equal(reset.pitch, general);
  assert.equal(reset["aquarium-layers"], undefined);
});
