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
  const p = await page("#chat");
  try {
    const h = p.getByRole("button", {
      name: "About this conversation",
      exact: true,
    });
    assert.equal(await h.count(), 1);
    const tip = p.locator("#conversation-note");
    assert.equal(
      await tip.evaluate((e) => getComputedStyle(e).visibility),
      "hidden",
    );
    await h.hover();
    await p.waitForFunction(
      () =>
        getComputedStyle(document.querySelector("#conversation-note"))
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
        getComputedStyle(document.querySelector("#conversation-note"))
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
test("concert-hall hover is gentle, while a deliberate mesh drag gives a wide orbit", async () => {
  const p = await page("#home", "no-preference");
  await p.setViewportSize({ width: 1100, height: 800 });
  try {
    await p.locator('.theatre-stage[data-render-status="ready"]').waitFor();
    const host = p.locator(".theatre-stage-canvas"),
      r = await host.boundingBox();
    await p.mouse.move(r.x + r.width * 0.2, r.y + r.height * 0.45);
    await p.waitForTimeout(800);
    const a = Number(await host.getAttribute("data-yaw"));
    await p.mouse.move(r.x + r.width * 0.9, r.y + r.height * 0.45);
    await p.waitForTimeout(800);
    const z = Number(await host.getAttribute("data-yaw"));
    assert.ok(Math.abs(z - a) < 30, `Passive yaw stays gentle: ${a}→${z}`);
    assert.ok(z < a, "The camera reverses so the opening follows the pointer");
    await p.mouse.move(r.x + r.width * 0.98, r.y + r.height * 0.02);
    await p.mouse.down();
    assert.notEqual(
      await host.evaluate((e) => e.style.cursor),
      "grabbing",
      "Blank canvas never starts an orbit",
    );
    await p.mouse.up();
    let origin;
    for (const [x, y] of [
      [0.6, 0.6],
      [0.65, 0.7],
      [0.5, 0.65],
      [0.7, 0.55],
    ]) {
      const point = { x: r.x + r.width * x, y: r.y + r.height * y };
      await p.mouse.move(point.x, point.y);
      await p.mouse.down();
      if ((await host.evaluate((e) => e.style.cursor)) === "grabbing") {
        origin = point;
        break;
      }
      await p.mouse.up();
    }
    assert.ok(origin, "A press on actual hall geometry starts drag");
    await p.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    assert.notEqual(
      await host.evaluate((e) => e.style.cursor),
      "grabbing",
      "Hiding the tab cancels an interrupted drag",
    );
    await p.mouse.up();
    await p.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: false,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await p.mouse.move(origin.x, origin.y);
    await p.mouse.down();
    assert.equal(await host.evaluate((e) => e.style.cursor), "grabbing");
    const before = Number(await host.getAttribute("data-yaw"));
    await p.mouse.move(origin.x + r.width * 0.4, origin.y, { steps: 3 });
    await p.waitForFunction(
      (value) =>
        Math.abs(
          Number(document.querySelector(".theatre-stage-canvas").dataset.yaw) -
            value,
        ) > 90,
      before,
    );
    await p
      .getByRole("button", { name: "Open guide", exact: true })
      .evaluate((e) => e.click());
    await p.getByRole("dialog").waitFor();
    const pausedYaw = Number(await host.getAttribute("data-yaw"));
    assert.notEqual(await host.evaluate((e) => e.style.cursor), "grabbing");
    await p
      .getByRole("button", { name: "Close guide", exact: true })
      .evaluate((e) => e.click());
    await p.getByRole("dialog").waitFor({ state: "detached" });
    await p.mouse.up();
    await p.mouse.move(origin.x + r.width * 0.4 - 1, origin.y);
    await p.waitForTimeout(1000);
    const resumedYaw = Number(await host.getAttribute("data-yaw"));
    assert.ok(
      Math.abs(resumedYaw - pausedYaw) < 30,
      `Modal interruption preserves the chosen orbit: ${pausedYaw}→${resumedYaw}`,
    );
    assert.ok(
      Math.abs(resumedYaw - before) > 70,
      "Releasing preserves the chosen orbit",
    );
  } finally {
    await p.close();
  }
});
test("revealed cases replay their explained reference passage", async () => {
  const p = await page("#play/aquarium");
  try {
    const stage = p.locator("#current-sound-case");
    for (const [index, start] of [
      [1, 130],
      [0, 3],
      [2, 3],
    ]) {
      await p
        .getByRole("button", { name: `Open case ${index + 1}`, exact: true })
        .click();
      await stage.getByRole("radio").nth(1).check();
      await stage
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await stage.getByRole("button", { name: /Hear it again/ }).click();
      await p.waitForFunction(() => !document.querySelector("audio").paused);
      const time = await p.locator("audio").evaluate((a) => a.currentTime);
      assert.ok(
        time >= start && time < start + 2,
        `Case ${index + 1} replays ${start}s, got ${time}`,
      );
      await p.getByRole("button", { name: "Pause music", exact: true }).click();
    }
  } finally {
    await p.close();
  }
});
