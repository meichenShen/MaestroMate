import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
let browser;
const base = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
before(async () => {
  browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
});
after(async () => browser?.close());
async function visit(height = 900, enabled = true) {
  const p = await browser.newPage({
    viewport: { width: 1366, height },
    reducedMotion: "reduce",
  });
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await p.route("**/api/chat/config", (r) =>
    r.fulfill({
      json: {
        enabled,
        models: [{ id: "qwen3.7-plus-2026-05-26", label: "Qwen Plus" }],
      },
    }),
  );
  await p.route("**/api/chat/session", (r) =>
    r.fulfill({ json: { token: "session", expiresAt: Date.now() + 3600000 } }),
  );
  await p.goto(base + "/#work/aquarium/conversation");
  return p;
}
async function enable(p) {
  await p.getByRole("button", { name: "Chat settings", exact: true }).click();
  await p
    .getByRole("button", { name: "Enable AI conversation", exact: true })
    .click();
}
test("prepared mode works by default and AI opt-in, sources, history and free question are visible", async () => {
  const p = await visit();
  try {
    let calls = 0;
    await p.route("**/api/chat", async (r) => {
      calls++;
      await r.fulfill({
        json: {
          answer: "My original score asks for glass harmonica.",
          mode: "ai",
          kind: "fact",
          sourceIds: ["score", "orchestra"],
        },
      });
    });
    await p
      .getByRole("button", { name: "Why an aquarium?", exact: true })
      .click();
    await p.getByText("I placed Aquarium seventh", { exact: false }).waitFor();
    assert.equal(calls, 0);
    await enable(p);
    await p
      .getByRole("textbox", { name: "Your music question" })
      .fill("What instruments did you choose?");
    await p.getByRole("button", { name: "Send question", exact: true }).click();
    await p
      .getByText("My original score asks for glass harmonica.", { exact: true })
      .waitFor();
    assert.equal(calls, 1);
    await p.locator(".chat-turn").last().getByText("Behind this reply").click();
    assert.equal(
      await p
        .locator(".chat-turn")
        .last()
        .getByRole("link", { name: /IMSLP/ })
        .count(),
      1,
    );
    assert.equal(await p.locator(".chat-turn").count(), 2);
    await p.screenshot({ path: ".tmp/qwen-chat/chat-desktop.png" });
  } finally {
    await p.close();
  }
});
test("600px desktop keeps prompt rail, input and shared player separate", async () => {
  const p = await visit(600);
  try {
    await enable(p);
    for (const s of [
      ".chat-thread",
      ".question-tiles",
      ".chat-compose",
      ".player",
    ]) {
      const e = p.locator(s).first();
      const b = await e.boundingBox();
      assert.ok(b && b.height > 20, s);
      assert.ok(b.y >= 0 && b.y + b.height <= 605, JSON.stringify({ s, b }));
    }
    const form = await p.locator(".chat-compose").boundingBox(),
      player = await p.locator(".player").boundingBox();
    assert.ok(form.y + form.height <= player.y);
    assert.ok(
      await p.locator(".chat-thread").evaluate((e) => e.clientHeight >= 65),
    );
    await p.screenshot({ path: ".tmp/qwen-chat/chat-short.png" });
  } finally {
    await p.close();
  }
});
test("failed AI gives explicit retry and prepared fallback; missing server key cannot enable AI", async () => {
  const p = await visit();
  try {
    await p.route("**/api/chat", (r) =>
      r.fulfill({ status: 502, json: { error: "answer_unavailable" } }),
    );
    await enable(p);
    await p
      .getByRole("button", { name: "Why an aquarium?", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Read the prepared reply", exact: true })
      .click();
    await p.getByText("I placed Aquarium seventh", { exact: false }).waitFor();
  } finally {
    await p.close();
  }
  const off = await visit(900, false);
  try {
    await off
      .getByRole("button", { name: "Chat settings", exact: true })
      .click();
    assert.equal(
      await off
        .getByRole("button", { name: "Enable AI conversation" })
        .isDisabled(),
      true,
    );
    await off
      .getByText("AI is not configured on this server.", { exact: false })
      .waitFor();
  } finally {
    await off.close();
  }
});
test("pending AI survives a room change and cannot repopulate chat after Program restart", async () => {
  const p = await visit();
  try {
    let release, start;
    const started = new Promise((resolve) => {
      start = resolve;
    });
    let requested = false;
    await p.route("**/api/chat", async (r) => {
      requested = true;
      start();
      await new Promise((resolve) => {
        release = resolve;
      });
      try {
        await r.fulfill({
          json: {
            answer: "A late reply.",
            mode: "ai",
            kind: "fact",
            sourceIds: ["score"],
          },
        });
      } catch {}
    });
    await enable(p);
    await p
      .getByRole("button", { name: "Why an aquarium?", exact: true })
      .click();
    await p.waitForFunction(
      () => !!document.querySelector(".typing-indicator"),
    );
    await started;
    await p.getByRole("link", { name: "Play", exact: true }).first().click();
    await p.getByRole("link", { name: "Chat", exact: true }).first().click();
    await p.getByRole("log").waitFor();
    assert.equal(await p.locator(".chat-turn").count(), 1);
    assert.equal(await p.locator(".typing-indicator").count(), 1);
    await p.evaluate(() => (location.hash = "#program/aquarium/done"));
    await p
      .getByRole("button", { name: "Restart Program", exact: true })
      .click();
    await p.waitForURL("**/#program/aquarium/listen");
    release?.();
    await p.evaluate(() => (location.hash = "#chat"));
    await p.getByRole("log").waitFor();
    await p.waitForTimeout(300);
    assert.equal(requested, true);
    assert.equal(await p.locator(".chat-turn").count(), 0);
    assert.equal(await p.locator(".typing-indicator").count(), 0);
  } finally {
    await p.close();
  }
});
test("mobile and short Program keep essential chat controls accessible", async () => {
  const p = await visit(600);
  try {
    await enable(p);
    await p.evaluate(() => (location.hash = "#program/aquarium/chat"));
    await p.getByRole("log").waitFor();
    for (const name of ["Chat settings", "Send question", "More questions"]) {
      const b = await p
        .getByRole("button", { name, exact: true })
        .boundingBox();
      assert.ok(b && b.y >= 0 && b.y + b.height <= 600, name);
    }
    await p.setViewportSize({ width: 390, height: 844 });
    assert.ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await p
      .getByRole("textbox", { name: "Your music question" })
      .scrollIntoViewIfNeeded();
    assert.equal(
      await p.getByRole("textbox", { name: "Your music question" }).isVisible(),
      true,
    );
    await p.getByRole("button", { name: "Chat settings" }).click();
    assert.equal(await p.getByRole("dialog").isVisible(), true);
    await p.screenshot({ path: ".tmp/qwen-chat/chat-mobile-settings.png" });
  } finally {
    await p.close();
  }
});
test("retry stays in place and uses only earlier context; prepared mode hides AI retry", async () => {
  const p = await visit();
  try {
    const submitted = [];
    let n = 0;
    await p.route("**/api/chat", async (r) => {
      submitted.push(r.request().postDataJSON());
      n++;
      await r.fulfill(
        n === 1
          ? { status: 502, json: { error: "answer_unavailable" } }
          : {
              json: {
                answer: "Checked reply " + n,
                mode: "ai",
                kind: "fact",
                sourceIds: ["score"],
              },
            },
      );
    });
    await enable(p);
    const input = p.getByRole("textbox", { name: "Your music question" });
    await input.fill("My first question");
    await p.getByRole("button", { name: "Send question", exact: true }).click();
    await p
      .getByRole("button", { name: "Try that question again", exact: true })
      .waitFor();
    await input.fill("My later question");
    await p.getByRole("button", { name: "Send question", exact: true }).click();
    await p.getByText("Checked reply 2", { exact: true }).waitFor();
    await p
      .getByRole("button", { name: "Try that question again", exact: true })
      .click();
    await p.getByText("Checked reply 3", { exact: true }).waitFor();
    assert.deepEqual(
      await p.locator(".chat-turn .outgoing p").allTextContents(),
      ["My first question", "My later question"],
    );
    assert.deepEqual(submitted[2].history, []);
    await p.route("**/api/chat", (r) =>
      r.fulfill({ status: 502, json: { error: "answer_unavailable" } }),
    );
    await input.fill("Another question");
    await p.getByRole("button", { name: "Send question", exact: true }).click();
    await p
      .getByRole("button", { name: "Try that question again", exact: true })
      .waitFor();
    await p.getByRole("button", { name: "Chat settings" }).click();
    await p
      .getByRole("button", { name: "Use prepared questions", exact: true })
      .click();
    assert.equal(
      await p
        .getByRole("button", { name: "Try that question again", exact: true })
        .count(),
      0,
    );
  } finally {
    await p.close();
  }
});
