import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { units } from "../src/content/curriculum.ts";
let b;
const base = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
before(
  async () =>
    (b = await chromium.launch({
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
    })),
);
after(async () => b?.close());
async function visit(hash) {
  const p = await b.newPage({
    viewport: { width: 1366, height: 768 },
    reducedMotion: "reduce",
  });
  p.setDefaultTimeout(15000);
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await p.goto(base + "/" + hash);
  return p;
}
async function make(p, u) {
  await p.getByRole("button", { name: "Start practice", exact: true }).click();
  for (let i = 0; i < 2; i++) {
    await p
      .getByRole("button", {
        name: u.checks[i].options[u.checks[i].answer].label,
        exact: true,
      })
      .click();
    await p.getByRole("button", { name: "Check answer", exact: true }).click();
    await p
      .getByRole("button", {
        name: i ? "Make something" : "Next question",
        exact: true,
      })
      .click();
  }
}
test("work, area and unit IDs must agree, including legacy and prototype-like work URLs", async () => {
  const p = await visit("#play/learn/pitch");
  try {
    for (const h of [
      "#play/learn/pitch",
      "#play/learn/aquarium-return",
      "#play/learn/__proto__",
      "#play/works/aquarium/pitch",
      "#play/works/swan/aquarium-layers",
      "#play/lessons/aquarium-layers",
    ]) {
      await p.evaluate((h) => (location.hash = h), h);
      await p
        .getByRole("heading", { name: "This lesson is still backstage." })
        .waitFor();
      assert.equal(await p.locator(".lesson-recording").count(), 0);
    }
  } finally {
    await p.close();
  }
});
test("Program knowledge links retain journey and learning visits mark Play as visited", async () => {
  const p = await visit("#program/aquarium/chat");
  try {
    await p
      .getByRole("button", { name: "Why an aquarium?", exact: true })
      .click();
    await p.locator(".chat-play-link").waitFor();
    assert.match(
      await p.locator(".chat-play-link").getAttribute("href"),
      /^#program\/aquarium\/learn\//,
    );
    await p.locator(".chat-play-link").click();
    await p.getByRole("link", { name: "Finish visit", exact: true }).waitFor();
    await p
      .getByRole("navigation", { name: "Your Program", exact: true })
      .getByRole("link", { name: "Listen", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Something to listen for", exact: false })
      .click();
    assert.match(
      await p
        .getByRole("link", { name: "Try the idea in Play", exact: false })
        .getAttribute("href"),
      /^#program\/aquarium\/learn\//,
    );
    await p.keyboard.press("Escape");
    assert.equal(
      await p
        .getByRole("navigation", { name: "Your Program", exact: true })
        .getByRole("button", { name: /Play/ })
        .locator("svg")
        .count(),
      1,
    );
  } finally {
    await p.close();
  }
});
test("repetition display follows the sound and rhythm highlights the second four-beat cycle", async () => {
  const p = await visit("#play/works/aquarium/aquarium-return");
  try {
    await p.getByRole("button", { name: "Same + same", exact: true }).click();
    assert.deepEqual(
      await p
        .locator(".phrase-pair>div")
        .nth(1)
        .locator(".note-ribbon b")
        .allTextContents(),
      ["C", "D", "E", "G"],
    );
    await p
      .getByRole("button", { name: "Same + new ending", exact: true })
      .click();
    assert.deepEqual(
      await p
        .locator(".phrase-pair>div")
        .nth(1)
        .locator(".note-ribbon b")
        .allTextContents(),
      ["C", "D", "E", "C"],
    );
    await p.evaluate(() => (location.hash = "#play/lessons/rhythm"));
    await p
      .getByRole("button", { name: "Hear the pattern", exact: true })
      .click();
    await p.locator('[data-demo-beat="4"]').waitFor();
    assert.match(
      await p
        .getByRole("button", { name: "Demo beat 1", exact: true })
        .getAttribute("class"),
      /pulse-active/,
    );
  } finally {
    await p.close();
  }
});
test("making requires a musical decision, colour requires both characters and preserves selected character", async () => {
  for (const id of ["aquarium-layers", "layers", "rhythm", "aquarium-colour"]) {
    const u = units.find((u) => u.id === id),
      p = await visit(
        "#play/" + (u.area === "works" ? "works/aquarium/" : "lessons/") + id,
      );
    try {
      await make(p, u);
      await p
        .getByRole("button", { name: "Hear my creation", exact: true })
        .click();
      if (id === "aquarium-colour") {
        await p
          .getByRole("button", { name: "Stop my creation", exact: true })
          .waitFor({ state: "hidden" });
        assert.equal(await p.locator(".creation-kept").count(), 0);
        await p.getByRole("button", { name: "Sparkling", exact: true }).click();
        await p
          .getByRole("button", { name: "Hear my creation", exact: true })
          .click();
        await p.locator(".creation-kept").waitFor();
        await p.getByRole("button", { name: "Learn", exact: true }).click();
        await p.getByRole("button", { name: "Make", exact: false }).click();
        assert.equal(
          await p
            .getByRole("button", { name: "Sparkling", exact: true })
            .getAttribute("aria-pressed"),
          "true",
        );
      } else {
        await p.locator(".creation-nudge").waitFor();
        assert.equal(await p.locator(".creation-kept").count(), 0);
      }
    } finally {
      await p.close();
    }
  }
});
