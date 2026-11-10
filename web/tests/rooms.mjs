import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const base = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
await fs.mkdir(".tmp/qa/rooms", { recursive: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await page.goto(base + "/#chat");
  await page
    .getByRole("heading", { name: "Camille Saint-Saëns", exact: true })
    .waitFor({ timeout: 5000 });
  assert.equal(
    await page.locator("[data-journey-progress]").count(),
    0,
    "Standalone chat has no Program progress",
  );
  await page
    .getByRole("button", { name: "Why an aquarium?", exact: true })
    .click();
  await page.waitForFunction(
    () => document.querySelectorAll('[data-speaker="camille"]').length === 2,
  );
  await page
    .getByRole("button", { name: "What should I listen for?", exact: true })
    .click();
  await page.waitForFunction(
    () => document.querySelectorAll('[data-speaker="camille"]').length === 3,
  );
  assert.equal(
    await page.locator('[data-speaker="you"]').count(),
    2,
    "Questions accumulate as outgoing messages",
  );
  assert.ok(
    await page
      .getByRole("log")
      .getByText("Why an aquarium?", { exact: true })
      .isVisible(),
    "Earlier messages remain in history",
  );
  assert.equal(
    await page.getByRole("textbox").count(),
    0,
    "Only suggested questions are enabled",
  );
  await page.screenshot({
    path: ".tmp/qa/rooms/chat-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Listen", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Your listening room.", exact: true })
    .waitFor();
  assert.equal(await page.locator("[data-journey-progress]").count(), 0);
  await page
    .getByRole("button", { name: "Listen to Aquarium", exact: true })
    .click();
  await page.getByRole("heading", { name: "Aquarium", exact: true }).waitFor();
  assert.equal(await page.locator("audio").count(), 1);
  await page.getByRole("button", { name: "Play music", exact: true }).click();
  await page.waitForFunction(
    () =>
      !document.querySelector("audio").paused &&
      document.querySelector("audio").currentTime > 0.2,
  );
  await page.locator("audio").evaluate((a) => {
    a.dataset.identity = "one";
    a.currentTime = 40;
  });
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Chat", exact: true })
    .click();
  assert.equal(await page.locator('[data-speaker="you"]').count(), 2);
  assert.equal(
    await page.locator("audio").getAttribute("data-identity"),
    "one",
  );
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Play", exact: true })
    .click();
  await page
    .getByRole("heading", {
      name: "A little play goes a long way.",
      exact: true,
    })
    .waitFor();
  await page
    .getByRole("button", { name: "Play Sound Detective", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Follow the clues.", exact: true })
    .waitFor();
  assert.equal(await page.locator("[data-journey-progress]").count(), 0);
  await page.locator("#current-sound-case").getByRole("radio").nth(1).check();
  await page
    .locator("#current-sound-case")
    .getByRole("button", { name: "Check answer", exact: true })
    .click();
  await page.getByRole("status").filter({ hasText: "You found it" }).waitFor();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Program", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start Aquarium Program", exact: true })
    .click();
  await page.getByRole("navigation", { name: "Your Program" }).waitFor();
  assert.ok(
    await page.evaluate(() => location.hash === "#program/aquarium/listen"),
  );
  await page
    .getByRole("link", { name: /Next: Chat/ })
    .click();
  await page
    .getByRole("heading", { name: "Camille Saint-Saëns", exact: true })
    .waitFor();
  assert.ok(
    await page.evaluate(() => location.hash === "#program/aquarium/chat"),
  );
  await page
    .getByRole("link", { name: /Next: Play/ })
    .click();
  await page
    .getByRole("heading", { name: "Follow the clues.", exact: true })
    .waitFor();
  await page
    .getByRole("link", { name: /Finish your visit/ })
    .click();
  await page
    .getByRole("heading", { name: "Lovely wandering.", exact: true })
    .waitFor();
  await page
    .getByRole("link", { name: "MaestroMate home", exact: true })
    .click();
  await page.locator(".snap-scene").first().waitFor();
  await page.waitForTimeout(300);
  await page.mouse.move(800, 500);
  await page.mouse.wheel(0, 600);
  await page.waitForFunction(
    () => {
      const e = document.getElementById("explore");
      const h = document.querySelector("header").getBoundingClientRect().height;
      return Math.abs(e.getBoundingClientRect().top - h) < 4;
    },
    {},
    { timeout: 8000 },
  );
  assert.equal(
    await page.locator(".portal-field [data-drawn-icon]").count(),
    3,
  );
  await page.screenshot({ path: ".tmp/qa/rooms/doors-desktop.png" });
  await page.getByRole("link", { name: "Chat", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: ".tmp/qa/rooms/chat-mobile.png",
    fullPage: true,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .getByRole("link", { name: "MaestroMate home", exact: true })
    .click();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  assert.deepEqual(errors, []);
  console.log(
    "Independent rooms, persistent scripted messages, optional Program, audio ownership, home settling and mobile: passed",
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
