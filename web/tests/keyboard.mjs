import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage();
  await page.addInitScript(() =>
    sessionStorage.setItem("maestromate-guide-v2", "seen"),
  );
  await page.goto(
    (process.env.QA_BASE_URL || "http://127.0.0.1:5173") +
      "/#work/aquarium/detective",
  );
  await page
    .getByRole("heading", { name: "Follow the clues.", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Play music", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector("audio").paused);
  await page.locator(".skip-link").focus();
  await page.keyboard.press("Enter");
  assert.equal(
    await page.evaluate(() => location.hash),
    "#work/aquarium/detective",
    "Skipping to content must not navigate away from the current activity",
  );
  assert.equal(
    await page.locator("main").evaluate((e) => e === document.activeElement),
    true,
    "The main region receives keyboard focus",
  );
  assert.equal(
    await page.locator("audio").evaluate((a) => a.paused),
    false,
    "Skipping content preserves audio",
  );
  for (const close of ["Close guide", "Skip the tour", "finish"]) {
    await page.getByRole("button", { name: "Open guide", exact: true }).click();
    if (close === "finish") {
      await page.getByRole("button", { name: "Next", exact: true }).click();
      await page.getByRole("button", { name: "Next", exact: true }).click();
      await page
        .getByRole("button", { name: "Let's begin", exact: true })
        .click();
    } else await page.getByRole("button", { name: close, exact: true }).click();
    await page.getByRole("dialog").waitFor({ state: "detached" });
    assert.equal(
      await page
        .getByRole("button", { name: "Open guide", exact: true })
        .evaluate((e) => e === document.activeElement),
      true,
      `Focus returns to Guide after ${close}`,
    );
  }
  await page
    .getByRole("button", { name: "Follow the clues", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Meet the composer", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Camille Saint-Saëns", exact: true })
    .waitFor();
  await page.goBack();
  await page
    .getByRole("heading", { name: "Follow the clues.", exact: true })
    .waitFor();
  assert.equal(
    await page.locator("audio").evaluate((a) => a.paused),
    false,
    "Browser back between activities preserves playback",
  );
  console.log(
    "Keyboard navigation, all guide dismissals and browser back: passed",
  );
} finally {
  await browser.close();
}
