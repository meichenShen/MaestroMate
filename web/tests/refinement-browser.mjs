import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
let b;
const base = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
before(async () => {
  b = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
});
after(async () => b?.close());
async function page(hash, motion = "reduce") {
  const p = await b.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: motion,
  });
  p.setDefaultTimeout(10000);
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await p.goto(base + "/" + hash);
  return p;
}
test("first Program visit exposes the cover and opens into two vertical works", async () => {
  const p = await page("#program");
  try {
    await p
      .getByRole("button", { name: "Open Program", exact: true })
      .waitFor();
    assert.ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "cover and paper leaves stay inside the viewport",
    );
    assert.equal(await p.locator(".work-entry").count(), 0);
    await p.getByRole("button", { name: "Open Program", exact: true }).click();
    await p
      .getByRole("button", { name: "Start Aquarium Program", exact: true })
      .waitFor();
    assert.equal(await p.locator(".work-entry").count(), 2);
    const a = await p.locator(".work-entry").nth(0).boundingBox(),
      c = await p.locator(".work-entry").nth(1).boundingBox();
    assert.ok(c.y > a.y + a.height);
    await p.getByRole("button", { name: "Close Program", exact: true }).click();
    await p
      .getByRole("button", { name: "Open Program", exact: true })
      .waitFor();
  } finally {
    await p.close();
  }
});
test("opened Program paper leaves fit desktop and phone viewports", async () => {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const p = await page("#program");
    try {
      await p.setViewportSize({ width, height: 900 });
      await p
        .getByRole("button", { name: "Open Program", exact: true })
        .click();
      await p
        .getByRole("button", { name: "Start Aquarium Program", exact: true })
        .waitFor();
      const bounds = await p.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        viewport: innerWidth,
      }));
      assert.ok(
        bounds.document <= bounds.viewport,
        `${width}px opened pages overflow: ${JSON.stringify(bounds)}`,
      );
    } finally {
      await p.close();
    }
  }
});
test("portal has a visible local bulge while its click target and title stay fixed", async () => {
  const p = await page("#explore", "no-preference");
  try {
    const link = p.getByRole("link", {
      name: "Enter the listening room",
      exact: true,
    });
    await link.waitFor();
    await p.waitForTimeout(1100);
    await link.evaluate((el) => {
      el.getAnimations({ subtree: true }).forEach((a) => {
        try {
          a.finish();
        } catch {}
      });
      el.querySelector(".portal-art").style.setProperty(
        "transform",
        "none",
        "important",
      );
    });
    const before = await link.boundingBox(),
      title = await link.locator("strong").boundingBox();
    const art = link.locator(".portal-art");
    const png = await art.screenshot();
    await p.mouse.move(
      before.x + before.width * 0.8,
      before.y + before.height * 0.35,
    );
    await p.waitForFunction(
      () =>
        Number(
          document
            .querySelector(".listen-node feDisplacementMap")
            ?.getAttribute("scale"),
        ) > 40,
    );
    await p.waitForTimeout(100);
    assert.notDeepEqual(await art.screenshot(), png);
    const after = await link.boundingBox(),
      t = await link.locator("strong").boundingBox();
    assert.ok(
      Math.abs(before.x - after.x) < 1 &&
        Math.abs(before.y - after.y) < 1 &&
        Math.abs(title.y - t.y) < 1,
    );
  } finally {
    await p.close();
  }
});
