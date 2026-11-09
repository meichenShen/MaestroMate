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
      "/#work/aquarium/theater",
  );
  await page.waitForFunction(
    () =>
      document.querySelector(".aquarium-art")?.dataset.renderStatus === "ready",
  );
  await page.getByRole("button", { name: "Motion off", exact: true }).click();
  await page.getByRole("button", { name: "Play music", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector("audio").paused);
  await page.waitForTimeout(200);
  const before = await page
    .locator(".aquarium-art canvas")
    .getAttribute("data-frame");
  await page.waitForTimeout(700);
  assert.equal(
    await page.locator(".aquarium-art canvas").getAttribute("data-frame"),
    before,
    "Motion off freezes rendering while audio continues",
  );
  await page.getByRole("button", { name: "Motion on", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(180);
  const reduced = await page
    .locator(".aquarium-art canvas")
    .getAttribute("data-frame");
  await page.waitForTimeout(700);
  assert.equal(
    await page.locator(".aquarium-art canvas").getAttribute("data-frame"),
    reduced,
    "System reduced motion also stops decorative rendering during playback",
  );
  console.log(
    "Both motion controls freeze rendering without stopping audio: passed",
  );
} finally {
  await browser.close();
}
