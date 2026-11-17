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
async function visit(hash, motion = "no-preference") {
  const p = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: motion,
  });
  p.setDefaultTimeout(7000);
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await p.goto(base + "/" + hash);
  return p;
}
test("portal art stretches and eases while the link and title remain stationary", async () => {
  const p = await visit("#explore");
  try {
    const link = p.getByRole("link", {
      name: "Enter the listening room",
      exact: true,
    });
    await link.waitFor();
    await p.waitForTimeout(900);
    const box = await link.boundingBox(),
      title = await link.locator("strong").boundingBox();
    await p.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.35);
    await p.waitForTimeout(600);
    const stretch = await link.evaluate((el) =>
      Number(getComputedStyle(el).getPropertyValue("--spring-stretch")),
    );
    assert.ok(stretch > 1.02, "shape has elastic stretch");
    const next = await link.boundingBox(),
      nextTitle = await link.locator("strong").boundingBox();
    for (const k of ["x", "y", "width", "height"]) {
      assert.ok(Math.abs(next[k] - box[k]) < 1);
      assert.ok(Math.abs(nextTitle[k] - title[k]) < 1);
    }
    await p.mouse.move(5, 5);
    await p.waitForTimeout(1600);
    assert.equal(await link.getAttribute("data-spring-state"), "idle");
  } finally {
    await p.close();
  }
});
test("Program art has spatial depth, vertical two-work browsing and unchanged working entries", async () => {
  const p = await visit("#program");
  try {
    await p.getByRole("button", { name: "Open Program", exact: true }).click();
    const previews = p.locator(".work-preview");
    await previews.first().waitFor();
    await p.waitForTimeout(900);
    assert.equal(await p.locator(".work-entry").count(), 2);
    const first = await previews.nth(0).boundingBox(),
      second = await previews.nth(1).boundingBox();
    assert.ok(second.y > first.y + first.height);
    const target = p.getByRole("button", {
        name: "Start Aquarium Program",
        exact: true,
      }),
      before = await target.boundingBox();
    await p.mouse.move(
      first.x + first.width * 0.9,
      first.y + first.height * 0.25,
    );
    await p.waitForTimeout(450);
    const transform = await previews
      .first()
      .locator("[data-elastic-art]")
      .evaluate((el) => getComputedStyle(el).transform);
    assert.ok(transform.startsWith("matrix3d("));
    const after = await target.boundingBox();
    assert.ok(
      Math.abs(after.x - before.x) < 1 && Math.abs(after.y - before.y) < 1,
    );
    await p.getByRole("button", { name: "Close Program", exact: true }).click();
    await p
      .getByRole("button", { name: "Open Program", exact: true })
      .waitFor();
    await p.getByRole("button", { name: "Open Program", exact: true }).click();
    await target.click();
    assert.equal(new URL(p.url()).hash, "#program/aquarium/listen");
  } finally {
    await p.close();
  }
});
test("reduced motion leaves spatial artwork static while entry controls still work", async () => {
  const p = await visit("#explore", "reduce");
  try {
    const link = p.getByRole("link", {
      name: "Enter the listening room",
      exact: true,
    });
    const b = await link.boundingBox();
    await p.mouse.move(b.x + b.width * 0.9, b.y + b.height * 0.35);
    await p.waitForTimeout(200);
    assert.equal(await link.getAttribute("data-spring-state"), "disabled");
    await link.click();
    assert.equal(new URL(p.url()).hash, "#listen");
  } finally {
    await p.close();
  }
});
