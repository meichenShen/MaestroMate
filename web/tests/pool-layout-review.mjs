import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
let browser;
const base = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
before(async () => {
  browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
});
after(async () => browser?.close());
test("all five note targets stay distinct and each visible light receives its own tap", async () => {
  for (const width of [320, 390, 1024])
    for (const fallback of [false, true]) {
      const p = await browser.newPage({
        viewport: { width, height: 844 },
        hasTouch: width < 500,
        reducedMotion: "reduce",
      });
      p.setDefaultTimeout(15000);
      try {
        await p.addInitScript((f) => {
          sessionStorage.setItem("maestromate-guide-v2", "seen");
          sessionStorage.setItem("maestromate-entry-v2", "seen");
          if (f) HTMLCanvasElement.prototype.getContext = () => null;
        }, fallback);
        await p.goto(base + "/#play/pool");
        await p
          .locator(
            '[data-pool-render="' + (fallback ? "fallback" : "ready") + '"]',
          )
          .waitFor();
        const geometry = await p.locator(".pool-pad").evaluateAll((nodes) =>
          nodes.map((node) => {
            const b = node.getBoundingClientRect(),
              light = node
                .querySelector(".pool-pad-light")
                .getBoundingClientRect(),
              hit = document.elementFromPoint(
                light.x + light.width * 0.85,
                light.y + light.height * 0.5,
              );
            return {
              x: b.x,
              y: b.y,
              right: b.right,
              bottom: b.bottom,
              width: b.width,
              name: node.getAttribute("aria-label"),
              hit: hit?.closest(".pool-pad")?.getAttribute("aria-label"),
            };
          }),
        );
        for (let i = 0; i < geometry.length; i++) {
          assert.equal(
            geometry[i].hit,
            geometry[i].name,
            width + " " + fallback + " light owns its right edge",
          );
          assert.ok(geometry[i].width >= 44);
          for (let j = i + 1; j < geometry.length; j++)
            assert.ok(
              geometry[i].right <= geometry[j].x ||
                geometry[j].right <= geometry[i].x ||
                geometry[i].bottom <= geometry[j].y ||
                geometry[j].bottom <= geometry[i].y,
              width +
                " " +
                fallback +
                " pads " +
                i +
                "/" +
                j +
                " do not overlap",
            );
        }
      } finally {
        await p.close();
      }
    }
});
test("Program titles and entry buttons are stationary throughout opening", async () => {
  const p = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "no-preference",
  });
  try {
    await p.addInitScript(() => {
      sessionStorage.setItem("maestromate-guide-v2", "seen");
      sessionStorage.setItem("maestromate-entry-v2", "seen");
      HTMLCanvasElement.prototype.getContext = () => null;
    });
    await p.goto(base + "/#program");
    await p
      .getByRole("button", { name: "Open Program", exact: true })
      .waitFor();
    const samples = await p.evaluate(async () => {
      document.querySelector(".programme-cover").click();
      const rows = [];
      await new Promise((resolve) => {
        function ready() {
          if (document.querySelector(".programme-list")) resolve();
          else requestAnimationFrame(ready);
        }
        requestAnimationFrame(ready);
      });
      const animations = document
        .querySelector(".programme-list")
        .getAnimations({ subtree: true });
      animations.forEach((a) => a.pause());
      for (const time of [20, 80, 200, 400, 600, 900]) {
        animations.forEach((a) => (a.currentTime = time));
        await new Promise(requestAnimationFrame);
        const title = document.querySelector(".work-entry h3"),
          cta = document.querySelector(".work-entry .round-link");
        rows.push([
          title.getBoundingClientRect().y,
          cta.getBoundingClientRect().y,
        ]);
      }
      return rows;
    });
    assert.ok(samples.length > 5);
    for (const i of [0, 1])
      assert.ok(
        Math.max(...samples.map((s) => s[i])) -
          Math.min(...samples.map((s) => s[i])) <
          1,
        "opening does not move " + (i ? "CTA" : "title"),
      );
  } finally {
    await p.close();
  }
});
