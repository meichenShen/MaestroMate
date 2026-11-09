import assert from "node:assert/strict";
import { chromium } from "playwright";
import fs from "node:fs/promises";

await fs.mkdir(".tmp/qa/redesign", { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const assertEnglish = async () => {
  assert.equal(
    await page.locator("html").getAttribute("lang"),
    "en",
    "The public interface must declare English",
  );
  assert.equal(
    /[\u3400-\u9fff]/.test(await page.locator("body").innerText()),
    false,
    "Visible product copy must be English",
  );
};
try {
  await page.goto(process.env.QA_BASE_URL || "http://127.0.0.1:5173");
  await page.locator("main").waitFor();
  await assertEnglish();
  await page.getByRole("dialog").waitFor();
  await page
    .getByRole("button", { name: "Skip the tour", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start with a work", exact: true })
    .click();
  const first = page.locator('[data-work="aquarium"]');
  const second = page.locator('[data-work="swan"]');
  await first.waitFor();
  await page.waitForTimeout(1200);
  const bounds = await page.evaluate(() =>
    ["aquarium", "swan"].map((id) =>
      document
        .querySelector(`[data-work="${id}"]`)
        .getBoundingClientRect()
        .toJSON(),
    ),
  );
  assert.ok(
    bounds[0].top >= 0 && bounds[1].top < 1050,
    "Two vertically stacked works should be visible together",
  );
  assert.ok(
    bounds[1].top > bounds[0].top,
    "Programme browsing must be vertical",
  );
  assert.equal(
    await second.getByRole("button").isDisabled(),
    true,
    "The placeholder work cannot start a nonexistent recording",
  );
  await page.screenshot({
    path: ".tmp/qa/redesign/programme-desktop.png",
    fullPage: false,
  });
  await page
    .getByRole("button", { name: "Enter Aquarium", exact: true })
    .click();
  await page.getByRole("heading", { name: "Aquarium", exact: true }).waitFor();
  assert.equal(await page.locator("audio").count(), 1);
  await page.getByRole("button", { name: "Play music", exact: true }).click();
  await page.waitForFunction(() => {
    const a = document.querySelector("audio");
    return !a.paused && a.currentTime > 0.2;
  });
  await page.locator("audio").evaluate((a) => {
    a.dataset.identity = "shared";
    a.currentTime = 72;
  });
  await page
    .getByRole("button", { name: "Meet the composer", exact: true })
    .first()
    .click();
  await page
    .getByRole("heading", { name: "Camille Saint-Saëns", exact: true })
    .waitFor();
  assert.equal(
    await page.locator("audio").getAttribute("data-identity"),
    "shared",
  );
  assert.ok(await page.locator("audio").evaluate((a) => a.currentTime >= 72));
  await assertEnglish();
  assert.equal(
    await page.getByRole("textbox").count(),
    0,
    "Free-text composer questions remain closed",
  );
  await page.getByRole("button", { name: /Why an aquarium/ }).click();
  await page
    .getByRole("button", { name: "Follow the clues", exact: true })
    .first()
    .click();
  await page.getByRole("radio").nth(1).check();
  await page
    .getByRole("button", { name: "Reveal the clue", exact: true })
    .click();
  await page.getByRole("status").filter({ hasText: "You found it" }).waitFor();
  await assertEnglish();
  await page.getByRole("button", { name: "Pause music", exact: true }).click();
  await page
    .getByRole("button", { name: "Back to programme", exact: true })
    .click();
  assert.equal(await page.locator("audio").evaluate((a) => a.paused), true);
  await page.getByRole("link", { name: "Experiences", exact: true }).click();
  await page
    .getByRole("button", { name: "Start with Music Detective", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enter Aquarium", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Follow the clues.", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Back to programme", exact: true })
    .click();
  await page.getByRole("button", { name: "Open guide", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(
      (process.env.QA_BASE_URL || "http://127.0.0.1:5173") + "/#programme",
    );
    await page.locator("main").waitFor();
    await page.waitForTimeout(300);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `No horizontal overflow at ${width}`,
    );
    await assertEnglish();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(process.env.QA_BASE_URL || "http://127.0.0.1:5173");
  await page.waitForTimeout(700);
  await page.screenshot({
    path: ".tmp/qa/redesign/mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto(process.env.QA_BASE_URL || "http://127.0.0.1:5173");
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: ".tmp/qa/redesign/home-desktop.png",
    fullPage: true,
  });
  assert.deepEqual(errors, [], "No uncaught runtime errors");
  console.log(
    JSON.stringify(
      {
        status: "passed",
        checks: [
          "English interface",
          "onboarding and replay",
          "vertical two-work programme",
          "guided and activity-first journeys",
          "one persistent real recording",
          "scripted composer prompts",
          "detective feedback",
          "return and pause",
          "five responsive widths",
        ],
        errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
