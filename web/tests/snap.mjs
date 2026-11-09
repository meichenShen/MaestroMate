import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await p.goto(process.env.QA_BASE_URL || "http://127.0.0.1:5173");
  await p.locator(".snap-scene").first().waitFor();
  await p.locator('.theatre-stage[data-render-status="ready"]').waitFor();
  await p.evaluate(() => document.fonts.ready);
  await p.mouse.move(600, 500);
  // Send this burst inside the page. With software WebGL, awaiting two
  // Playwright wheel round trips can space them >180ms apart: two legitimate
  // gestures may then advance two scenes rather than one.
  await p.evaluate(
    () =>
      new Promise((resolve) => {
        const wheel = () =>
          document.body.dispatchEvent(
            new WheelEvent("wheel", {
              deltaY: 400,
              bubbles: true,
              cancelable: true,
            }),
          );
        wheel();
        setTimeout(() => {
          wheel();
          resolve();
        }, 60);
      }),
  );
  await p.waitForTimeout(80);
  assert.ok(
    await p.evaluate(() => scrollY > 0),
    "The page moves continuously during a gesture",
  );
  try {
    await p.waitForFunction(
      () => {
        const h = document
          .querySelector(".brand-header")
          .getBoundingClientRect().height;
        return (
          Math.abs(
            document.getElementById("explore").getBoundingClientRect().top - h,
          ) < 4
        );
      },
      null,
      { timeout: 10000 },
    );
  } catch (error) {
    console.error(
      "Snap failure state",
      await p.evaluate(() => ({
        scrollY,
        hash: location.hash,
        mode: document.documentElement.dataset.scrollMode,
        header: document.querySelector(".brand-header").getBoundingClientRect()
          .height,
        scenes: [...document.querySelectorAll(".snap-scene")].map((e) => ({
          id: e.id,
          top: e.getBoundingClientRect().top,
          height: e.clientHeight,
        })),
        dialog: !!document.querySelector("dialog[open]"),
      })),
    );
    throw error;
  }
  await p
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Chat", exact: true })
    .click();
  for (const prompt of [
    "Why an aquarium?",
    "What should I listen for?",
    "How did you become a musician?",
  ]) {
    await p.getByRole("button", { name: prompt, exact: true }).click();
    await p.waitForFunction(() => !document.querySelector(".typing-indicator"));
  }
  const log = p.getByRole("log");
  await log.evaluate((e) => (e.scrollTop = 0));
  const before = await p.evaluate(() => scrollY);
  const box = await log.boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await p.mouse.wheel(0, 400);
  await p.waitForTimeout(1000);
  assert.ok(
    await log.evaluate((e) => e.scrollTop > 0),
    "Messages scroll inside their own thread",
  );
  assert.ok(
    Math.abs((await p.evaluate(() => scrollY)) - before) < 3,
    "Home snapping never takes over the chat scroll",
  );
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.getByRole("link", { name: "MaestroMate home", exact: true }).click();
  await p.waitForFunction(
    () => document.documentElement.dataset.scrollMode === "native",
  );
  console.log(
    "Continuous wheel gesture, precise idle settling, nested chat scrolling and reduced motion: passed",
  );
} finally {
  await browser.close();
}
