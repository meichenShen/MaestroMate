import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
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
test("question audio and answer actions never overlap their card or navigation in short windows", async () => {
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [1366, 640],
    [1366, 600],
  ]) {
    const p = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    await p.addInitScript(() => {
      sessionStorage.setItem("maestromate-guide-v2", "seen");
      sessionStorage.setItem("maestromate-entry-v2", "seen");
    });
    if (height < 800) await p.route("**/audio/aquarium.mp3", (r) => r.abort());
    try {
      await p.goto(base + "/#program/aquarium/play");
      if (height < 800) await p.getByRole("alert").waitFor();
      for (let i = 1; i <= 3; i++) {
        await p
          .getByRole("button", { name: "Open case " + i, exact: true })
          .click();
        const stage = p.locator("#current-sound-case");
        assert.equal(
          await stage.locator(".case-question-audio").count(),
          1,
          "Audio sits beside the actual question",
        );
        for (const reveal of [false, true]) {
          if (reveal) {
            await stage.getByRole("radio").nth(1).check();
            await stage
              .getByRole("button", { name: "Check answer", exact: true })
              .click();
          }
          const geometry = await p.evaluate(() => {
            const b = (s) =>
              document.querySelector(s).getBoundingClientRect().toJSON();
            return {
              stage: b(".active-case"),
              question: b(".case-question-row"),
              audio: b(".case-question-audio"),
              options: b(".answer-tiles"),
              actions: b(".case-actions"),
              nav: b(".case-navigation"),
              player: b(".player"),
              controls: [
                ...document.querySelectorAll(
                  ".active-case button,.active-case fieldset,.answer-reveal",
                ),
              ].map((e) => e.getBoundingClientRect().toJSON()),
            };
          });
          assert.ok(
            geometry.audio.x >=
              geometry.question.x + geometry.question.width * 0.4,
            "Audio occupies the question right side",
          );
          for (const r of geometry.controls)
            assert.ok(
              r.y >= geometry.stage.y &&
                r.y + r.height <= geometry.stage.y + geometry.stage.height + 1,
              `${width}x${height} case${i} revealed=${reveal} control${JSON.stringify(r)} in${JSON.stringify(geometry.stage)}`,
            );
          assert.ok(
            geometry.actions.y + geometry.actions.height <= geometry.nav.y - 6,
            "Actions and previous/next have a real gap",
          );
          assert.ok(
            geometry.nav.y + geometry.nav.height <= geometry.player.y,
            "Navigation stays above player",
          );
          assert.ok(
            geometry.options.y >=
              geometry.question.y + geometry.question.height - 1,
            "Answers stay below question",
          );
        }
      }
    } finally {
      await p.close();
    }
  }
});
