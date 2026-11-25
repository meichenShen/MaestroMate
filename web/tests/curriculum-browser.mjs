import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { units } from "../src/content/curriculum.ts";
let browser;
const base = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
before(async () => {
  browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
});
after(async () => browser?.close());
async function visit(hash = "#play", width = 1440, height = 900) {
  const p = await browser.newPage({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  p.setDefaultTimeout(15000);
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await p.goto(base + "/" + hash);
  return p;
}
async function practice(p, u) {
  await p.getByRole("button", { name: "Start practice", exact: true }).click();
  for (let i = 0; i < 2; i++) {
    await p
      .getByRole("button", {
        name: u.checks[i].options[u.checks[i].answer].label,
        exact: true,
      })
      .click();
    await p.getByRole("button", { name: "Check answer", exact: true }).click();
    await p.locator('[data-feedback="correct"]').waitFor();
    await p
      .getByRole("button", {
        name: i === 0 ? "Next question" : "Make something",
        exact: true,
      })
      .click();
  }
}
async function prepareCreation(p, u) {
  if (u.kind === "layers")
    for (let i = 0; i < 4; i++) {
      await p
        .getByRole("button", { name: "Note space " + (i + 1), exact: true })
        .click();
      await p
        .getByRole("button", {
          name: "Choose " + ["C", "D", "E", "A"][i],
          exact: true,
        })
        .click();
    }
  if (u.kind === "rhythm")
    await p
      .getByRole("button", { name: "Creation beat 1", exact: true })
      .click();
  if (u.kind === "colour") {
    await p
      .getByRole("button", { name: "Hear my creation", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Stop my creation", exact: true })
      .waitFor();
    await p
      .getByRole("button", { name: "Stop my creation", exact: true })
      .waitFor({ state: "hidden" });
    await p.getByRole("button", { name: "Sparkling", exact: true }).click();
  }
}
test("Play has three clear pillars and separate work, theory and creation catalogues", async () => {
  const p = await visit();
  try {
    for (const name of ["Explore a piece", "Music lessons", "Create & play"])
      await p.getByRole("link", { name, exact: true }).waitFor();
    assert.equal(await p.locator(".play-pillar").count(), 3);
    await p.getByRole("link", { name: "Explore a piece", exact: true }).click();
    await p
      .getByRole("link", { name: "Below the ripples", exact: true })
      .click();
    assert.equal(
      await p.locator(".lesson-room").getAttribute("data-phase"),
      "learn",
    );
  } finally {
    await p.close();
  }
});
test("all six units teach, assess twice and apply; wrong answers never complete and sources restore focus", async () => {
  const p = await visit();
  try {
    for (const u of units) {
      await p.goto(
        base +
          "/#play/" +
          (u.area === "works" ? "works/aquarium/" : "lessons/") +
          u.id,
      );
      await p.locator('.lesson-room[data-phase="learn"]').waitFor();
      await p
        .getByRole("button", { name: "Start practice", exact: true })
        .click();
      const wrong = (u.checks[0].answer + 1) % u.checks[0].options.length;
      await p
        .getByRole("button", {
          name: u.checks[0].options[wrong].label,
          exact: true,
        })
        .click();
      await p
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await p.locator('[data-feedback="retry"]').waitFor();
      assert.equal(
        await p
          .getByRole("button", { name: "Next question", exact: true })
          .count(),
        0,
      );
      await p.getByRole("button", { name: "Learn", exact: true }).click();
      await practice(p, u);
      await prepareCreation(p, u);
      if (u.id === "pitch") {
        for (let i = 0; i < 4; i++) {
          await p
            .getByRole("button", { name: "Note space " + (i + 1), exact: true })
            .click();
          await p
            .getByRole("button", {
              name: "Choose " + ["C", "D", "E", "A"][i],
              exact: true,
            })
            .click();
        }
      }
      if (u.kind === "return") {
        await p
          .getByRole("button", { name: "Note space 4", exact: true })
          .click();
        await p.getByRole("button", { name: "Choose C", exact: true }).click();
      }
      if (u.kind === "layers") {
        await p
          .getByRole("button", { name: "Accompaniment on", exact: true })
          .click();
        await p
          .getByRole("button", { name: "Hear my creation", exact: true })
          .click();
        await p.locator(".creation-nudge").waitFor();
        assert.equal(await p.locator(".creation-kept").count(), 0);
        await p
          .getByRole("button", { name: "Accompaniment off", exact: true })
          .click();
      }
      await p
        .getByRole("button", { name: "Hear my creation", exact: true })
        .click();
      await p.locator(".creation-kept").waitFor();
      await p.locator(".creation-actions .pill-action").hover();
      const contrast = await p
        .locator(".creation-actions .pill-action")
        .evaluate((e) => {
          const s = getComputedStyle(e),
            ctx = document.createElement("canvas").getContext("2d");
          const rgb = (c) => {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = c;
            ctx.fillRect(0, 0, 1, 1);
            return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).join(",");
          };
          return [rgb(s.color), rgb(s.backgroundColor)];
        });
      assert.notEqual(
        contrast[0],
        contrast[1],
        "hovered primary action must retain readable text",
      );
      await p
        .getByRole("button", { name: "Sources & notes", exact: true })
        .click();
      await p.getByRole("dialog").waitFor();
      assert.ok((await p.getByRole("dialog").getByRole("link").count()) > 0);
      await p.keyboard.press("Escape");
      assert.equal(
        await p
          .getByRole("button", { name: "Sources & notes", exact: true })
          .evaluate((e) => document.activeElement === e),
        true,
      );
    }
  } finally {
    await p.close();
  }
});
test("core lesson controls fit desktop and phone; new questions replace content without document scrolling", async () => {
  for (const [w, h] of [
    [1366, 600],
    [1024, 768],
    [390, 844],
    [320, 740],
  ]) {
    const p = await visit("#play/lessons/pitch", w, h);
    try {
      await p.locator(".lesson-room").waitFor();
      await practice(
        p,
        units.find((u) => u.id === "pitch"),
      );
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      if (w > 950) {
        assert.ok(
          await p.evaluate(
            () => document.documentElement.scrollHeight <= innerHeight + 2,
          ),
          "desktop viewport " + w,
        );
        const boxes = await p.evaluate(() =>
          [
            ...document.querySelectorAll(
              ".lesson-room button,.lesson-room input",
            ),
          ]
            .filter((e) => e.getClientRects().length)
            .map((e) => {
              const r = e.getBoundingClientRect();
              return { top: r.top, bottom: r.bottom };
            }),
        );
        assert.ok(
          boxes.every((r) => r.top >= 0 && r.bottom <= h + 1),
          JSON.stringify(boxes),
        );
      }
    } finally {
      await p.close();
    }
  }
});
test("Chat shows full prompts, prepared mode and local knowledge sources without calling AI", async () => {
  const p = await visit("#chat");
  const calls = [];
  p.on("request", (r) => {
    if (/\/api\/chat$|\/api\/responses|api\.openai|apinebula/.test(r.url()))
      calls.push(r.url());
  });
  try {
    await p
      .getByText("Prepared conversation · Imagined replies, with sources", { exact: true })
      .waitFor();
    const q = p.getByRole("button", { name: "Why an aquarium?", exact: true });
    await q.waitFor();
    assert.ok(await q.locator(".question-full").isVisible());
    await q.click();
    await p.locator(".chat-turn .incoming").waitFor();
    await p.locator(".chat-turn .incoming summary").click();
    assert.ok((await p.locator(".chat-turn .incoming a").count()) > 0);
    await p
      .getByRole("button", { name: "Open the knowledge shelf", exact: true })
      .click();
    await p.getByRole("dialog", { name: "A little knowledge shelf" }).waitFor();
    assert.ok(
      await p
        .getByRole("dialog")
        .getByText("The score and our recording", { exact: true })
        .count(),
    );
    assert.deepEqual(calls, []);
  } finally {
    await p.close();
  }
});
test("invalid unit names are unavailable and old learning URLs enter the new curriculum", async () => {
  const p = await visit("#play/lessons/constructor");
  try {
    await p
      .getByRole("heading", { name: "This lesson is still backstage." })
      .waitFor();
    await p.goto(base + "/#play/learn/aquarium/1");
    assert.equal(
      await p.locator(".lesson-room").getAttribute("data-unit"),
      "aquarium-colour",
    );
  } finally {
    await p.close();
  }
});
test("creation transfers notes, route changes retain progress, Program summary is honest and restart clears it", async () => {
  const p = await visit("#program/aquarium/learn");
  try {
    const u = units[0];
    await p
      .getByRole("navigation", { name: "Your Program", exact: true })
      .waitFor();
    await practice(p, u);
    await prepareCreation(p, u);
    await p
      .getByRole("button", { name: "Hear my creation", exact: true })
      .click();
    await p.locator(".creation-kept").waitFor();
    await p
      .getByRole("button", {
        name: "Take this idea to Music Pool",
        exact: true,
      })
      .click();
    await p.getByRole("button", { name: "Step 1: C", exact: true }).waitFor();
    assert.equal(await p.locator("audio").count(), 1);
    await p.evaluate(() => (location.hash = "#program/aquarium/done"));
    await p.locator(".learning-recap").waitFor();
    assert.match(
      await p.locator(".learning-recap").innerText(),
      /1\/3 explored/,
    );
    await p
      .getByRole("button", { name: "Restart Program", exact: true })
      .click();
    await p.getByRole("link", { name: /Next: Chat/ }).click();
    assert.equal(await p.locator(".chat-turn").count(), 0);
    await p.getByRole("link", { name: /Next: Play/ }).click();
    await p.locator('.lesson-room[data-phase="learn"]').waitFor();
    await p.getByRole("link", { name: "Finish visit", exact: true }).click();
    assert.match(
      await p.locator(".learning-recap").innerText(),
      /0\/3 explored/,
    );
  } finally {
    await p.close();
  }
});
test("lessons cancel full-mix clips and pending synthesis on Guide, phase change and leaving", async () => {
  const p = await visit("#play/works/aquarium/aquarium-layers");
  try {
    const recording = p.getByRole("button", {
      name: "Hear Aquarium · opening",
      exact: true,
    });
    await recording.click();
    await p.waitForFunction(() => !document.querySelector("audio").paused);
    assert.equal(await p.locator("audio").count(), 1);
    await p
      .getByRole("button", { name: "Sources & notes", exact: true })
      .click();
    assert.equal(await p.locator("audio").evaluate((a) => a.paused), true);
    await p.keyboard.press("Escape");
    await recording.click();
    await p.getByRole("button", { name: "Open guide", exact: true }).click();
    assert.equal(await p.locator("audio").evaluate((a) => a.paused), true);
    await p.getByRole("button", { name: "Close guide", exact: true }).click();
    await p.evaluate(() => {
      const Real = window.AudioContext;
      window.startedVoices = 0;
      window.AudioContext = function () {
        const ctx = new Real();
        let resumed = false;
        Object.defineProperty(ctx, "state", {
          get: () => (resumed ? "running" : "suspended"),
        });
        ctx.resume = () =>
          new Promise((resolve) => {
            window.releaseSound = () => {
              resumed = true;
              resolve();
            };
          });
        const create = ctx.createOscillator.bind(ctx);
        ctx.createOscillator = () => {
          const voice = create();
          const start = voice.start.bind(voice);
          voice.start = (...args) => {
            window.startedVoices++;
            return start(...args);
          };
          return voice;
        };
        return ctx;
      };
    });
    await p.getByRole("button", { name: "Together", exact: true }).click();
    await p.waitForFunction(() => typeof window.releaseSound === "function");
    await p
      .getByRole("button", { name: "Start practice", exact: true })
      .click();
    await p.evaluate(() => window.releaseSound());
    await p.waitForTimeout(100);
    assert.equal(await p.evaluate(() => window.startedVoices), 0);
  } finally {
    await p.close();
  }
});
test("short desktop keeps every creation, feedback and onward action separated after success", async () => {
  const p = await visit("#play/works/aquarium/aquarium-layers", 1366, 600);
  try {
    for (const u of units) {
      await p.evaluate(
        (id) =>
          (location.hash =
            "#play/" +
            (id.startsWith("aquarium-") ? "works/aquarium/" : "lessons/") +
            id),
        u.id,
      );
      await p.locator('.lesson-room[data-phase="learn"]').waitFor();
      await practice(p, u);
      await prepareCreation(p, u);
      if (u.id === "pitch") {
        for (let i = 0; i < 4; i++) {
          await p
            .getByRole("button", { name: "Note space " + (i + 1), exact: true })
            .click();
          await p
            .getByRole("button", {
              name: "Choose " + ["C", "D", "E", "A"][i],
              exact: true,
            })
            .click();
        }
      }
      if (u.kind === "return") {
        await p.getByRole("button", { name: "Choose C", exact: true }).click();
      }
      await p
        .getByRole("button", { name: "Hear my creation", exact: true })
        .click();
      await p.locator(".creation-kept").waitFor();
      const boxes = await p.evaluate(() => {
        const r = (s) => {
          const b = document.querySelector(s).getBoundingClientRect();
          return { top: b.top, bottom: b.bottom };
        };
        return {
          content: r(".lesson-content"),
          dock: r(".lesson-dock"),
          items: [...document.querySelectorAll(".creation-board button")]
            .filter((e) => e.getClientRects().length)
            .map((e) => {
              const b = e.getBoundingClientRect();
              return { text: e.textContent, top: b.top, bottom: b.bottom };
            }),
        };
      });
      assert.ok(
        boxes.items.every(
          (b) =>
            b.top >= boxes.content.top - 1 && b.bottom <= boxes.dock.top - 5,
        ),
        u.id + JSON.stringify(boxes),
      );
      assert.ok(boxes.dock.bottom <= 600);
    }
  } finally {
    await p.close();
  }
});
