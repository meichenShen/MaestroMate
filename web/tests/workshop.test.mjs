import { work } from "../src/content/aquarium.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  aquariumGames,
  playWorks,
  evaluateGame,
  emptyAnswer,
} from "../src/content/play/aquarium.ts";
test("Aquarium has four games per level and real recording clips have provenance", () => {
  assert.equal(aquariumGames.length, 12);
  for (let i = 0; i < 3; i++)
    assert.equal(aquariumGames.filter((g) => g.level === i).length, 4);
  assert.equal(playWorks.aquarium.games, aquariumGames);
  assert.equal(playWorks.swan, undefined);
  for (const g of aquariumGames) {
    assert.ok(g.source && g.prompt && g.learn);
    assert.ok(g.prompt.length < 110);
    for (const c of g.clips || []) {
      assert.ok(c.start >= 0 && c.end > c.start && c.end <= work.duration);
    }
  }
});
test("all game answers are deliberate; incomplete and wrong selections cannot complete", () => {
  for (const g of aquariumGames) {
    assert.equal(evaluateGame(g, emptyAnswer()).correct, false, g.id);
    if (g.kind === "choice") {
      const a = emptyAnswer();
      a.picks = [g.correct[0]];
      assert.equal(evaluateGame(g, a).correct, true, g.id);
    }
  }
});
test("mix/order/rhythm/variation accept their rules rather than one arbitrary creative answer", () => {
  let g = aquariumGames.find((x) => x.id === "mix");
  let a = emptyAnswer();
  a.picks = [1, 0];
  assert.equal(evaluateGame(g, a).correct, true);
  a.picks = [0, 1, 2];
  assert.equal(evaluateGame(g, a).correct, false);
  g = aquariumGames.find((x) => x.id === "story");
  a.picks = [0, 1, 2];
  assert.equal(evaluateGame(g, a).correct, true);
  a.picks = [2, 1, 0];
  assert.equal(evaluateGame(g, a).correct, false);
  g = aquariumGames.find((x) => x.id === "rhythm");
  a.beats = [true, false, false, true, true, false, false, true];
  assert.equal(evaluateGame(g, a).correct, true);
  a.beats = Array(8).fill(true);
  assert.equal(evaluateGame(g, a).correct, false);
  g = aquariumGames.find((x) => x.id === "variation");
  for (const n of [0, 1, 2]) {
    a.notes = [0, 1, 2, n];
    assert.equal(evaluateGame(g, a).correct, true);
  }
  a.notes = [0, 1, 2, null];
  assert.equal(evaluateGame(g, a).correct, false);
});
test("unregistered work names cannot resolve through object prototypes", () => {
  for (const id of ["constructor", "toString", "__proto__", "swan"])
    assert.equal(playWorks[id], undefined, id);
});
