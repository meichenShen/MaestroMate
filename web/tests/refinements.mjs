import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
let browser;
const base = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
before(async () => {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
});
after(async () => {
  await browser?.close();
});
async function visit(hash) {
  const p = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await p.goto(base + "/" + hash);
  await p.locator("main").waitFor();
  return p;
}
async function messages(p) {
  for (const name of ["Why an aquarium?", "What should I listen for?"]) {
    await p.getByRole("button", { name, exact: true }).click();
    await p.waitForFunction(() => !document.querySelector(".typing-indicator"));
  }
}
test("forward ten seconds seeks and clamps without starting paused music", async () => {
  const p = await visit("#listen/aquarium");
  try {
    const forward = p.getByRole("button", {
      name: "Forward ten seconds",
      exact: true,
    });
    assert.equal(await forward.count(), 1);
    await p.waitForFunction(
      () => document.querySelector("audio").readyState >= 1,
    );
    await p.getByRole("slider", { name: "Playback position" }).fill("30");
    await forward.click();
    assert.ok(
      Math.abs((await p.locator("audio").evaluate((a) => a.currentTime)) - 40) <
        0.1,
    );
    await p.getByRole("slider", { name: "Playback position" }).fill("140");
    const limit = Number(
      await p
        .getByRole("slider", { name: "Playback position" })
        .getAttribute("max"),
    );
    await forward.click();
    assert.ok(
      Math.abs(
        (await p.locator("audio").evaluate((a) => a.currentTime)) - limit,
      ) < 0.1,
    );
    assert.ok(await p.locator("audio").evaluate((a) => a.paused));
  } finally {
    await p.close();
  }
});
test("scene motion is explicitly on by default and can be switched off", async () => {
  const p = await visit("#listen/aquarium");
  try {
    const toggle = p.getByRole("switch", { name: "Scene motion" });
    assert.equal(await toggle.count(), 1);
    assert.equal(await toggle.getAttribute("aria-checked"), "true");
    assert.equal(await toggle.innerText(), "Motion on");
    await toggle.click();
    assert.equal(await toggle.getAttribute("aria-checked"), "false");
    assert.equal(await toggle.innerText(), "Motion off");
  } finally {
    await p.close();
  }
});
test("wheel at the end of chat history continues scrolling the page", async () => {
  const p = await visit("#chat");
  try {
    await messages(p);
    const log = p.getByRole("log");
    await p.evaluate(() => scrollTo(0, 0));
    await log.evaluate((e) => (e.scrollTop = e.scrollHeight));
    await p.waitForTimeout(100);
    const r = await log.boundingBox();
    await p.mouse.move(
      r.x + r.width / 2,
      Math.max(160, Math.min(650, r.y + r.height / 2)),
    );
    const before = await p.evaluate(() => scrollY);
    await p.mouse.wheel(0, 350);
    await p.waitForTimeout(250);
    assert.ok(
      (await p.evaluate(() => scrollY)) > before + 20,
      "Thread edge must release page scrolling",
    );
  } finally {
    await p.close();
  }
});
test("latest messages respects reduced motion", async () => {
  const p = await visit("#chat");
  try {
    await messages(p);
    await p.getByRole("log").evaluate((e) => (e.scrollTop = 0));
    await p.getByRole("button", { name: "Show latest messages" }).click();
    assert.ok(
      await p
        .getByRole("log")
        .evaluate((e) => e.scrollHeight - e.clientHeight - e.scrollTop < 3),
      "Latest message appears immediately under reduced motion",
    );
  } finally {
    await p.close();
  }
});
test("composer speaks in first person with biographical sources", async () => {
  const p = await visit("#chat");
  try {
    const question = p.getByRole("button", {
      name: "How did you become a musician?",
      exact: true,
    });
    assert.equal(await question.count(), 1);
    await question.click();
    await p.locator('[data-speaker="camille"]').nth(1).waitFor();
    assert.match(
      await p.locator('[data-speaker="camille"]').nth(1).innerText(),
      /\bI\b/,
    );
    await p
      .locator('[data-speaker="camille"]')
      .nth(1)
      .getByText("Behind this reply", { exact: true })
      .click();
    assert.equal(
      await p
        .locator('[data-speaker="camille"]')
        .nth(1)
        .getByRole("link")
        .count(),
      1,
    );
  } finally {
    await p.close();
  }
});
test("room explanations reveal on keyboard focus while the entrance stays put", async () => {
  const p = await visit("#explore");
  try {
    const entrance = p.getByRole("link", {
      name: "Enter the listening room",
      exact: true,
    });
    const hint = entrance.locator(".portal-hint");
    assert.equal(await hint.count(), 1);
    assert.equal(await hint.evaluate((e) => getComputedStyle(e).opacity), "0");
    const before = await entrance.boundingBox();
    await entrance.focus();
    await p.waitForTimeout(100);
    assert.equal(await hint.evaluate((e) => getComputedStyle(e).opacity), "1");
    assert.deepEqual(await entrance.boundingBox(), before);
  } finally {
    await p.close();
  }
});
test("Program thank-you returns to an illustrated concert stage", async () => {
  const p = await visit("#program/aquarium/done");
  try {
    await p
      .getByRole("heading", { name: "Lovely wandering.", exact: true })
      .waitFor();
    assert.equal(await p.locator(".theatre-stage").count(), 1);
  } finally {
    await p.close();
  }
});
