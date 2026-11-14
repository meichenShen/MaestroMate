import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  await page.addInitScript(() =>
    sessionStorage.setItem("maestromate-guide-v2", "seen"),
  );
  await page.goto(
    (process.env.QA_BASE_URL || "http://127.0.0.1:5173") + "/#chat",
  );
  await page
    .getByRole("heading", { name: "Camille Saint-Saëns", exact: true })
    .waitFor();
  await page.waitForTimeout(200);
  await page.keyboard.press("Tab");
  assert.equal(
    await page
      .locator(".skip-link")
      .evaluate((e) => e === document.activeElement),
    true,
    "First Tab on a deep link reaches Skip to content",
  );
  await page.keyboard.press("Enter");
  assert.equal(
    await page.locator("main").evaluate((e) => e === document.activeElement),
    true,
  );
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Play", exact: true })
    .click();
  await page.waitForFunction(
    () => document.activeElement === document.querySelector("main"),
  );
  assert.equal(await page.evaluate(() => location.hash), "#play");
  console.log("Initial deep-link keyboard entry and route focus: passed");
} finally {
  await browser.close();
}
