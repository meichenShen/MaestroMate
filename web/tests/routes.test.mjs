import assert from "node:assert/strict";
import test from "node:test";
import { parseRoute, activityHash } from "../src/navigation/routes.ts";
test("three independent rooms never become a guided Program by accident", () => {
  assert.deepEqual(parseRoute("#listen"), {
    kind: "library",
    intent: "listen",
  });
  assert.deepEqual(parseRoute("#chat"), {
    kind: "activity",
    activity: "conversation",
    journey: false,
  });
  assert.deepEqual(parseRoute("#play"), { kind: "games" });
  assert.deepEqual(parseRoute("#listen/aquarium"), {
    kind: "activity",
    activity: "theater",
    journey: false,
  });
  assert.equal(activityHash("detective", false), "#play/aquarium");
});
test("Program routes explicitly retain journey intent and legacy links stay standalone", () => {
  assert.deepEqual(parseRoute("#program"), {
    kind: "library",
    intent: "program",
  });
  assert.deepEqual(parseRoute("#program/aquarium/chat"), {
    kind: "activity",
    activity: "conversation",
    journey: true,
  });
  assert.equal(activityHash("theater", true), "#program/aquarium/listen");
  assert.deepEqual(parseRoute("#work/aquarium/detective"), {
    kind: "activity",
    activity: "detective",
    journey: false,
  });
  assert.deepEqual(parseRoute("#not-a-page"), {
    kind: "home",
    section: "home",
  });
});
