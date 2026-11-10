import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
let b;
const base = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
before(
  async () =>
    (b = await chromium.launch({
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
    })),
);
after(async () => b?.close());
async function page(hash, motion = "reduce") {
  const p = await b.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: motion,
  });
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await p.goto(base + "/" + hash);
  await p.locator("main").waitFor();
  return p;
}
test("three case overviews retain independent answers in the same stage", async () => {
  const p = await page("#play/aquarium");
  try {
    assert.equal(await p.getByRole("article").count(), 3);
    const stage = p.locator("#current-sound-case");
    for (let i = 0; i < 3; i++) {
      await p
        .getByRole("button", { name: `Open case ${i + 1}`, exact: true })
        .click();
      await stage.getByRole("radio").nth(1).check();
      await stage
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      assert.equal(await stage.getByRole("radio").nth(1).isChecked(), true);
      if (i < 2) assert.equal(await p.locator(".game-completion").count(), 0);
    }
    assert.equal(await p.locator(".game-completion").count(), 1);
    await p.getByRole("button", { name: "Previous case", exact: true }).click();
    await stage.getByRole("button", { name: "Try again", exact: true }).click();
    assert.equal(await p.locator(".game-completion").count(), 0);
  } finally {
    await p.close();
  }
});
test("activity information really reveals on pointer hover and keyboard focus", async () => {
  const p = await page("#play/aquarium");
  try {
    const h = p.getByRole("button", { name: "About case 1", exact: true });
    assert.equal(await h.count(), 1);
    const tip = p.locator("#case-layers-hint");
    assert.equal(
      await tip.evaluate((e) => getComputedStyle(e).visibility),
      "hidden",
    );
    await h.hover();
    await p.waitForFunction(
      () =>
        getComputedStyle(document.querySelector("#case-layers-hint"))
          .visibility === "visible",
    );
    assert.equal(
      await tip.evaluate((e) => getComputedStyle(e).visibility),
      "visible",
    );
    await p.mouse.move(10, 90);
    await h.focus();
    await p.waitForFunction(
      () =>
        getComputedStyle(document.querySelector("#case-layers-hint"))
          .visibility === "visible",
    );
    assert.equal(
      await tip.evaluate((e) => getComputedStyle(e).visibility),
      "visible",
    );
    const r = await tip.boundingBox();
    assert.ok(r.x >= 0 && r.x + r.width <= 1440);
  } finally {
    await p.close();
  }
});
test("composer topic navigation changes prompts without losing messages", async () => {
  const p = await page("#chat");
  try {
    const life = p.getByRole("button", { name: "Life", exact: true });
    assert.equal(await life.count(), 1);
    await life.click();
    assert.equal(await p.locator(".question-tile").count(), 2);
    await p
      .getByRole("button", {
        name: "How did you become a musician?",
        exact: true,
      })
      .click();
    await p.waitForFunction(
      () => document.querySelectorAll('[data-speaker="camille"]').length === 2,
    );
    await p.getByRole("button", { name: "Music", exact: true }).click();
    assert.equal(await p.locator('[data-speaker="you"]').count(), 1);
    assert.equal(
      await p
        .getByRole("button", { name: "Why an aquarium?", exact: true })
        .count(),
      1,
    );
  } finally {
    await p.close();
  }
});
test("room drawings use distinct bright reference colours without green", async () => {
  const p = await page("#explore");
  try {
    const colours = [];
    for (const icon of await p.locator(".portal-field .drawn-icon svg").all()) {
      const rgb = await icon.evaluate((e) =>
        getComputedStyle(e)
          .color.match(/[\d.]+/g)
          .slice(0, 3)
          .map(Number),
      );
      assert.ok(Math.max(...rgb) >= 230);
      assert.ok(
        !(rgb[1] > rgb[0] * 1.18 && rgb[1] > rgb[2] * 1.05),
        `No green drawing: ${rgb}`,
      );
      colours.push(rgb.join(","));
    }
    assert.equal(new Set(colours).size, 3);
  } finally {
    await p.close();
  }
});
test("concert-hall pointer control spans a wide actual camera angle", async () => {
  const p = await page("#home", "no-preference");
  try {
    await p.locator('.theatre-stage[data-render-status="ready"]').waitFor();
    const host = p.locator(".theatre-stage-canvas"),
      r = await host.boundingBox();
    await p.mouse.move(r.x + r.width * 0.12, r.y + r.height * 0.4);
    await p.waitForFunction(
      () =>
        Math.abs(
          Number(document.querySelector(".theatre-stage-canvas").dataset.yaw) +
            136.8,
        ) < 3,
    );
    const a = Number(await host.getAttribute("data-yaw"));
    assert.ok(Number.isFinite(a));
    await p.mouse.move(r.x + r.width * 0.88, r.y + r.height * 0.4);
    await p.waitForFunction(
      () =>
        Math.abs(
          Number(document.querySelector(".theatre-stage-canvas").dataset.yaw) -
            136.8,
        ) < 3,
    );
    const z = Number(await host.getAttribute("data-yaw"));
    assert.ok(Math.abs(z - a) > 200, `Actual camera yaw ${a}→${z}`);
  } finally {
    await p.close();
  }
});
