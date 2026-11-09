import assert from "node:assert/strict";
import { chromium } from "playwright";
import fs from "node:fs/promises";
await fs.mkdir(".tmp/qa/modern", { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const base = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
page.setDefaultTimeout(12000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto(base);
  await page.locator("main").waitFor();
  await page
    .getByRole("button", { name: "Skip the tour", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "How would you like to begin?", exact: true })
    .waitFor();
  assert.equal(
    await page.locator(".entry-primary").count(),
    2,
    "Only two entrances are primary",
  );
  const sizes = await page.evaluate(() => ({
    main: parseFloat(
      getComputedStyle(document.querySelector(".entry-primary strong"))
        .fontSize,
    ),
    browse: parseFloat(
      getComputedStyle(document.querySelector(".browse-entry")).fontSize,
    ),
  }));
  assert.ok(sizes.main > sizes.browse, "Browsing must be a subordinate option");
  await page.screenshot({ path: ".tmp/qa/modern/entrance.png" });
  await page
    .getByRole("button", { name: "Just looking for now", exact: true })
    .click();
  assert.equal(
    await page.getByRole("button", { name: /Just looking/ }).count(),
    0,
    "Browsing is not a homepage feature",
  );
  assert.ok(
    (
      await page.locator("h1").evaluate((e) => getComputedStyle(e).fontFamily)
    ).includes("Outfit"),
  );
  assert.ok(
    await page
      .locator(".hero-type>p:not(.eyebrow)")
      .evaluate((e) => parseFloat(getComputedStyle(e).fontSize) >= 18),
  );
  await page
    .getByRole("button", { name: "Choose a way in", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start with a work", exact: true })
    .click();
  await page.locator('[data-work="aquarium"]').waitFor();
  await page
    .getByRole("button", { name: "Close programme", exact: true })
    .click();
  await page.locator("[data-work]").first().waitFor({ state: "detached" });
  assert.equal(await page.locator("[data-work]").count(), 0);
  await page
    .getByRole("button", { name: "Open programme", exact: true })
    .click();
  await page.locator('[data-work="swan"]').waitFor();
  await page.waitForTimeout(900);
  const bounds = await page
    .locator("[data-work]")
    .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().toJSON()));
  assert.ok(
    bounds[1].top > bounds[0].top && bounds[1].bottom <= 1050,
    "Both complete works fit together vertically on desktop",
  );
  await page.locator(".aquarium-art canvas").waitFor();
  await page.waitForFunction(
    () =>
      document.querySelector(".aquarium-art")?.dataset.renderStatus === "ready",
  );
  await page.screenshot({ path: ".tmp/qa/modern/programme.png" });
  await page
    .getByRole("button", { name: "Enter Aquarium", exact: true })
    .click();
  await page.getByRole("heading", { name: "Aquarium", exact: true }).waitFor();
  await page.locator(".aquarium-art canvas").waitFor();
  await page.getByRole("button", { name: "Play music", exact: true }).click();
  await page.waitForFunction(
    () =>
      !document.querySelector("audio").paused &&
      document.querySelector("audio").currentTime > 0.2,
  );
  await page.getByRole("button", { name: "Pause music", exact: true }).click();
  await page
    .getByRole("slider", { name: "Playback position", exact: true })
    .fill("80");
  await page
    .getByRole("heading", { name: "Familiar waters", exact: true, level: 2 })
    .waitFor();
  await page.screenshot({
    path: ".tmp/qa/modern/listening.png",
    fullPage: true,
  });
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Work page fits ${width}`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.waitForTimeout(300);
  assert.equal(
    await page.getByRole("dialog").count(),
    0,
    "Entrance and guide do not repeat after selection",
  );
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Home fits ${width}`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: ".tmp/qa/modern/home-mobile.png",
    fullPage: true,
  });
  const fallback = await browser.newPage();
  await fallback.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return String(type).startsWith("webgl")
        ? null
        : original.call(this, type, ...args);
    };
  });
  await fallback.goto(base + "/#work/aquarium/theater");
  await fallback
    .getByRole("heading", { name: "Aquarium", exact: true })
    .waitFor();
  await fallback.waitForFunction(
    () =>
      document.querySelector(".aquarium-art")?.dataset.renderStatus ===
      "fallback",
  );
  assert.ok(
    await fallback
      .locator(".aquarium-art .aquarium-poster")
      .evaluate((i) => i.complete && i.naturalWidth > 0),
    "A real rendered fallback remains visible",
  );
  assert.deepEqual(errors, []);
  console.log(
    "Modern entry hierarchy, font A, programme fold, live 3D, fallback and responsive checks: passed",
  );
} finally {
  await browser.close();
}
