import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyMelody,
  putNote,
  midiFrequency,
  poolNotes,
  stepSeconds,
} from "../src/features/water/model.ts";
test("five ordered notes form a pentatonic instrument and consistent half-beat timing", () => {
  assert.deepEqual(
    poolNotes.map((n) => n.midi),
    [60, 62, 64, 67, 69],
  );
  assert.equal(midiFrequency(69), 440);
  assert.ok(Math.abs(midiFrequency(60) - 261.6256) < 0.001);
  assert.equal(stepSeconds, 0.3);
});
test("eight steps edit immutably, wrap and reject invalid positions or pitches", () => {
  const initial = emptyMelody();
  assert.equal(initial.length, 8);
  const next = putNote(initial, 7, 2);
  assert.equal(next[7], 2);
  assert.equal(initial[7], null);
  assert.deepEqual(putNote(next, 7, null), initial);
  for (const [slot, note] of [
    [-1, 0],
    [8, 0],
    [0, 5],
    [NaN, 1],
  ])
    assert.deepEqual(putNote(initial, slot, note), initial);
});
