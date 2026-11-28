import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
let release;
const gate = new Promise((resolve) => (release = resolve));
try {
  const page = await browser.newPage();
  await page.addInitScript(() =>
    sessionStorage.setItem("maestromate-guide-v2", "seen"),
  );
  await page.route("**/models/barramundi.glb", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto(
    (process.env.QA_BASE_URL || "http://127.0.0.1:5173") +
      "/#work/aquarium/theater",
    { waitUntil: "domcontentloaded" },
  );
  await page.locator(".aquarium-art canvas").waitFor();
  await page.locator(".aquarium-art canvas").evaluate((canvas) => {
    const gl = canvas.getContext("webgl2");
    gl.getExtension("WEBGL_lose_context").loseContext();
  });
  await page.waitForFunction(
    () =>
      document.querySelector(".aquarium-art")?.dataset.renderStatus ===
      "fallback",
  );
  const response = page.waitForResponse((r) =>
    r.url().endsWith("/models/barramundi.glb"),
  );
  release();
  await response;
  await page.waitForTimeout(1500);
  assert.equal(
    await page.locator(".aquarium-art").getAttribute("data-render-status"),
    "fallback",
    "A late model response cannot hide fallback after context loss",
  );
  assert.equal(await page.locator(".aquarium-poster").isVisible(), true);
  await page.getByRole("button", { name: "Play music", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector("audio").paused);
  console.log(
    "Context loss during model load retains fallback and audio: passed",
  );
} finally {
  release();
  await browser.close();
}
