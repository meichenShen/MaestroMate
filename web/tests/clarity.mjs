import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { detectiveQuestions } from "../src/content/aquarium.ts";
let browser;
const base = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
before(
  async () =>
    (browser = await chromium.launch({
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
    })),
);
after(async () => browser?.close());
async function visit(
  hash,
  width = 1440,
  height = 900,
  motion = "reduce",
  failAudio = false,
) {
  const p = await browser.newPage({
    viewport: { width, height },
    reducedMotion: motion,
  });
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  if (failAudio)
    await p.route("**/audio/aquarium.mp3", (route) => route.abort());
  await p.goto(base + "/" + hash);
  await p.locator("main").waitFor();
  return p;
}
test("questions are visible without hover and fit each fixed answer stage", async () => {
  for (const [w, h] of [
    [1440, 900],
    [1024, 768],
  ]) {
    const p = await visit("#program/aquarium/play", w, h, "reduce", w === 1024);
    if (w === 1024) await p.getByRole("alert").waitFor();
    try {
      for (let i = 0; i < detectiveQuestions.length; i++) {
        await p
          .getByRole("button", { name: `Open case ${i + 1}`, exact: true })
          .click();
        const prompt = p.locator(".case-prompt");
        assert.equal(await prompt.count(), 1);
        assert.equal(await prompt.isVisible(), true);
        assert.equal(await prompt.innerText(), detectiveQuestions[i].prompt);
        const stage = p.locator("#current-sound-case");
        await stage.getByRole("radio").nth(1).check();
        await stage
          .getByRole("button", { name: "Check answer", exact: true })
          .click();
        assert.equal(await prompt.isVisible(), true);
        assert.ok(
          await p.evaluate(() => {
            const prompt = document
                .querySelector(".case-prompt")
                .getBoundingClientRect(),
              actions = document
                .querySelector(".case-actions")
                .getBoundingClientRect(),
              options = document
                .querySelector(".answer-tiles")
                .getBoundingClientRect(),
              reveal = document
                .querySelector(".answer-reveal")
                .getBoundingClientRect(),
              nav = document
                .querySelector(".case-navigation")
                .getBoundingClientRect(),
              player = document
                .querySelector(".player")
                .getBoundingClientRect();
            return (
              document.documentElement.scrollHeight <= innerHeight + 1 &&
              prompt.bottom <= options.top + 1 &&
              options.bottom <= actions.top + 1 &&
              reveal.top >= actions.top - 1 &&
              reveal.bottom <= actions.bottom + 1 &&
              nav.bottom <= player.top
            );
          }),
          "Prompt, reveal, options and navigation do not overlap",
        );
      }
    } finally {
      await p.close();
    }
  }
});
test("case rail scrolls horizontally when its contents no longer fit", async () => {
  const p = await visit("#play/aquarium", 390, 844);
  try {
    const rail = p.locator(".case-overview");
    assert.ok(await rail.evaluate((e) => e.scrollWidth > e.clientWidth));
    await p.getByRole("button", { name: "More cases", exact: true }).click();
    await p.waitForFunction(
      () => document.querySelector(".case-overview").scrollLeft > 0,
    );
    await p.getByRole("button", { name: "Open case 3", exact: true }).click();
    assert.equal(
      await p
        .getByRole("button", { name: "Next case", exact: true })
        .isDisabled(),
      true,
    );
  } finally {
    await p.close();
  }
});
test("Program ending celebrates and provides Home, restart and another Program", async () => {
  const p = await visit("#program/aquarium/play");
  try {
    await p.locator("#current-sound-case").getByRole("radio").nth(1).check();
    await p.getByRole("button", { name: "Check answer", exact: true }).click();
    await p.locator("audio").evaluate((a) => (a.dataset.identity = "retained"));
    await p.evaluate(() => (location.hash = "#program/aquarium/done"));
    await p
      .getByRole("heading", { name: "Lovely wandering.", exact: true })
      .waitFor();
    assert.equal(await p.locator(".program-fireworks").count(), 1);
    assert.equal(
      await p
        .getByRole("link", { name: "Home", exact: true })
        .getAttribute("href"),
      "#home",
    );
    assert.equal(
      await p
        .getByRole("link", { name: "Choose another Program", exact: true })
        .getAttribute("href"),
      "#program",
    );
    await p
      .getByRole("button", { name: "Restart Program", exact: true })
      .click();
    await p.waitForURL("**/#program/aquarium/listen");
    assert.equal(
      await p.locator("audio").evaluate((a) => a.paused && a.currentTime < 0.1),
      true,
    );
    assert.equal(
      await p.locator("audio").getAttribute("data-identity"),
      "retained",
    );
    await p.evaluate(() => (location.hash = "#program/aquarium/play"));
    await p.locator("#current-sound-case").waitFor();
    assert.equal(await p.locator("input[type=radio]:checked").count(), 0);
  } finally {
    await p.close();
  }
});
test("entrance preview never covers the icon drawing", async () => {
  const p = await visit("#explore");
  try {
    for (const portal of await p.locator(".portal-node").all()) {
      await portal.focus();
      assert.ok(
        await portal.locator(".portal-hint").evaluate((e) => {
          const style = getComputedStyle(e);
          const luminance = (value) =>
            value
              .match(/[\d.]+/g)
              .slice(0, 3)
              .map(Number)
              .map((c) => c / 255)
              .map((c) =>
                c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
              )
              .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
          const a = luminance(style.color),
            b = luminance(style.backgroundColor);
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5;
        }),
        "Preview text has readable contrast",
      );
      const hint = await portal.locator(".portal-hint").boundingBox(),
        art = await portal.locator(".portal-art").boundingBox();
      assert.ok(
        hint.y + hint.height <= art.y ||
          hint.y >= art.y + art.height ||
          hint.x + hint.width <= art.x ||
          hint.x >= art.x + art.width,
        "Hint is outside the artwork",
      );
    }
  } finally {
    await p.close();
  }
});
test("home headings have readable per-letter arrival and reduced-motion fallback", async () => {
  const p = await visit("#explore");
  try {
    const h = p.getByRole("heading", {
      name: "Follow those curious ears.",
      exact: true,
    });
    assert.equal(await h.count(), 1);
    assert.ok((await h.locator(".arrival-letter").count()) > 10);
    assert.ok(
      await h
        .locator(".arrival-letter")
        .evaluateAll((els) =>
          els.every((e) => getComputedStyle(e).opacity === "1"),
        ),
    );
  } finally {
    await p.close();
  }
});
test("explicit Program restart clears composer history without a late reply", async () => {
  const p = await visit("#chat", 1440, 900, "no-preference");
  try {
    await p
      .getByRole("button", { name: "Why an aquarium?", exact: true })
      .click();
    await p.evaluate(() => (location.hash = "#program/aquarium/done"));
    await p
      .getByRole("button", { name: "Restart Program", exact: true })
      .click();
    await p.waitForURL("**/#program/aquarium/listen");
    await p.evaluate(() => (location.hash = "#chat"));
    await p.getByRole("log").waitFor();
    await p.waitForTimeout(800);
    assert.equal(await p.locator('[data-speaker="you"]').count(), 0);
    assert.equal(await p.locator('[data-speaker="camille"]').count(), 1);
    assert.equal(await p.locator(".typing-indicator").count(), 0);
  } finally {
    await p.close();
  }
});
