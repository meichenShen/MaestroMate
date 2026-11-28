import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const output = ".tmp/chat-space";
let browser;
before(async () => {
  await mkdir(output, { recursive: true });
  browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
});
after(async () => browser?.close());

async function visit({ width, height, language, motion = "reduce" }) {
  const page = await browser.newPage({
    viewport: { width, height },
    reducedMotion: motion,
  });
  await page.addInitScript((language) => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
    localStorage.setItem("maestromate-language", language);
  }, language);
  await page.route("**/api/chat/config", (route) => route.fulfill({
    json: {
      enabled: true,
      models: [
        { id: "qwen3.7-plus-2026-05-26", label: "Qwen Plus" },
        { id: "qwen3.6-flash-2026-04-16", label: "Qwen Flash" },
      ],
    },
  }));
  await page.route("**/api/chat/session", (route) => route.fulfill({
    json: { token: "layout-session", expiresAt: Date.now() + 3600000 },
  }));
  await page.goto(base + "/#work/aquarium/conversation");
  await page.getByRole("log").waitFor();
  return page;
}
async function enable(page) {
  await page.locator(".chat-settings-open").click();
  await page.locator(".enable-ai").click();
}

for (const size of [
  { width: 1440, height: 900, language: "zh" },
  { width: 1366, height: 600, language: "zh" },
  { width: 1366, height: 600, language: "en", motion: "no-preference" },
]) {
  const name = `${size.language}-${size.width}x${size.height}`;
  test(`${name}: a long latest reply starts in view, its sources remain reachable, and expansion preserves the conversation`, async () => {
    const page = await visit(size);
    try {
      const paragraph = size.language === "zh"
        ? "这是一段用于检查阅读空间的长回复。聆听时，你可以留意钢琴的流动伴奏，以及长笛和弦乐的旋律。"
        : "This long reply checks the reading space. Listen for the flowing piano accompaniment and the melody played by the flute and strings. ";
      const answer = Array.from({ length: 4 }, () => paragraph.repeat(6)).join("\n\n");
      await page.route("**/api/chat", async (route) => {
        // Keep the typing indicator present after an existing turn. It must not
        // make the pending turn disappear from the automatic-scroll selection.
        await new Promise((resolve) => setTimeout(resolve, 250));
        await route.fulfill({ json: {
          answer, mode: "ai", kind: "fact", sourceIds: ["score", "orchestra"],
        } });
      });
      await page.locator(".question-tile").first().click();
      await page.locator(".chat-turn .incoming").waitFor();
      const prepared = await page.locator(".chat-turn .incoming > p").textContent();
      await enable(page);
      await page.locator(".chat-compose input").fill("Tell me more about this piece.");
      await page.locator(".chat-compose button").click();
      const latest = page.locator(".chat-turn").last();
      await latest.locator(".incoming > p").filter({ hasText: answer }).waitFor();
      assert.equal(await latest.locator(".incoming > p").innerText(), answer);
      await page.waitForFunction(() => {
        const host = document.querySelector(".chat-thread");
        const turns = host.querySelectorAll(".chat-turn");
        const reply = turns[turns.length - 1]?.querySelector(".incoming");
        return reply && Math.abs(reply.getBoundingClientRect().top - host.getBoundingClientRect().top - 8) < 3;
      });
      // Verify the final resting position after both message entry and smooth
      // scrolling, rather than accepting an intermediate animation frame.
      await page.waitForTimeout(650);
      const replyTop = await latest.locator(".incoming").evaluate((e) =>
        e.getBoundingClientRect().top - e.closest(".chat-thread").getBoundingClientRect().top,
      );
      assert.ok(Math.abs(replyTop - 8) < 3, `reply starts at ${replyTop}`);
      const normal = await page.locator(".chat-thread").boundingBox();
      assert.ok(normal.height >= (size.height === 600 ? 200 : 350));
      await page.locator(".chat-compose input").fill("draft survives expansion");
      await page.locator(".chat-thread").evaluate((e) => { window.readingThread = e; });
      await page.screenshot({ path: `${output}/normal-${name}.png` });
      await page.locator(".chat-expand").click();
      const expanded = await page.locator(".chat-thread").boundingBox();
      assert.ok(expanded.height > normal.height && expanded.width > normal.width);
      assert.equal(await page.locator(".chat-thread").evaluate((e) => e === window.readingThread), true);
      assert.equal(await page.locator(".chat-compose input").inputValue(), "draft survives expansion");
      assert.equal(await page.locator(".chat-turn").count(), 2);
      assert.equal(await page.locator(".chat-turn").first().locator(".incoming > p").textContent(), prepared);
      const summary = latest.locator(".message-source summary");
      await summary.scrollIntoViewIfNeeded();
      await summary.click();
      const source = latest.locator(".message-source a").last();
      await source.scrollIntoViewIfNeeded();
      const sourceBox = await source.boundingBox();
      assert.ok(sourceBox.y >= expanded.y && sourceBox.y + sourceBox.height <= expanded.y + expanded.height + 1);
      assert.equal(await page.evaluate(() => window.scrollY), 0);
      const compose = await page.locator(".chat-compose").boundingBox();
      const player = await page.locator(".player").boundingBox();
      assert.ok(compose.y + compose.height < player.y);
      await page.screenshot({ path: `${output}/expanded-sources-${name}.png` });
      await page.locator(".chat-expand").click();
      assert.equal(await latest.locator(".message-source").getAttribute("open"), "");
      await page.locator(".question-rail-actions button").last().click();
      await page.waitForFunction(() => document.querySelector(".question-tiles").scrollLeft > 0);
      await page.locator(".question-tile").last().focus();
      assert.ok(await page.locator(".question-tile").last().evaluate((e) => {
        const target = e.getBoundingClientRect(), rail = e.parentElement.getBoundingClientRect();
        return target.left >= rail.left && target.right <= rail.right + 1;
      }));
      const notes = await page.locator(".notes-open").boundingBox();
      const heading = await page.locator(".chat-room-heading").boundingBox();
      assert.ok(notes.height >= 44 && notes.y + notes.height <= heading.y);
      await page.locator(".notes-open").click();
      assert.equal(await page.locator(".notes-dialog").isVisible(), true);
      await page.keyboard.press("Escape");
      await writeFile(`${output}/measurements-${name}.json`, JSON.stringify({ normal, expanded, replyTop, sourceBox, compose, player, notes }, null, 2));
    } finally {
      await page.close();
    }
  });
}

test("English AI controls fit after desktop Program Chat resizes to mobile", async () => {
  const page = await visit({ width: 1366, height: 600, language: "en" });
  try {
    await enable(page);
    await page.evaluate(() => { location.hash = "#program/aquarium/chat"; });
    await page.getByRole("log").waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator(".chat-compose input").scrollIntoViewIfNeeded();
    assert.equal(await page.locator(".chat-compose input").isVisible(), true);
    assert.ok(await page.locator(".chat-modebar").evaluate((e) => e.getBoundingClientRect().right <= innerWidth));
    await page.screenshot({ path: `${output}/mobile-program.png` });
  } finally {
    await page.close();
  }
});
