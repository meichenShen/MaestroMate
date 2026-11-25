import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { units } from "../src/content/curriculum.ts";
import { studyHash } from "../src/features/curriculum/study-flow.ts";
let browser;
const base = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
before(async () => {
  browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
});
after(async () => browser?.close());
async function visit(
  hash = "#play",
  height = 900,
  width = 1440,
  motion = "reduce",
) {
  const p = await browser.newPage({
    viewport: { width, height },
    reducedMotion: motion,
  });
  p.setDefaultTimeout(12000);
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await p.goto(base + "/" + hash);
  return p;
}
async function answer(p, q) {
  if (q.interaction === "order") {
    for (const n of q.target)
      await p
        .getByRole("button", { name: q.options[n].label, exact: true })
        .click();
  } else if (q.interaction === "pattern") {
    for (let i = 0; i < q.target.length; i++)
      if (q.target[i])
        await p
          .getByRole("button", { name: "Rhythm step " + (i + 1), exact: true })
          .click();
  } else
    await p
      .getByRole("button", { name: q.options[q.answer].label, exact: true })
      .click();
  await p.getByRole("button", { name: "Check answer", exact: true }).click();
  await p.locator("[data-feedback=correct]").waitFor();
}
test("catalogues separate all three paths and expose 6 discoveries plus 8 ordered lessons", async () => {
  const p = await visit();
  try {
    assert.equal(await p.locator(".play-pillar").count(), 3);
    for (const [area, count] of [
      ["works", 6],
      ["lessons", 8],
      ["create", 3],
    ]) {
      await p.goto(base + "/#play/" + area);
      assert.equal(await p.locator(".lesson-cover").count(), count);
      if (area === "create") {
        const hrefs = await p
          .locator(".lesson-cover")
          .evaluateAll((es) => es.map((e) => e.getAttribute("href")));
        assert.deepEqual(hrefs, [
          "#play/pool",
          "#play/create/beats",
          "#play/create/melody",
        ]);
      }
    }
  } finally {
    await p.close();
  }
});
test("every unit teaches before testing and all three check types lead to completion without making", async () => {
  const p = await visit();
  try {
    for (const u of units) {
      await p.goto(base + "/" + studyHash(u));
      await p.locator(".study-room[data-phase=learn]").waitFor();
      await p
        .getByRole("button", { name: "Start practice →", exact: true })
        .click();
      for (let i = 0; i < u.checks.length; i++) {
        await p.waitForURL("**/" + u.id + "/try/" + i);
        await answer(p, u.checks[i]);
        assert.equal(await p.locator(".study-celebration").count(), 1);
        await p
          .getByRole("button", {
            name:
              i === u.checks.length - 1
                ? "Finish discovery →"
                : "Next question →",
            exact: true,
          })
          .click();
      }
      await p.locator(".study-room[data-phase=done]").waitFor();
      assert.equal(await p.locator(".creation-board").count(), 0);
    }
  } finally {
    await p.close();
  }
});
test("Back climbs the course hierarchy and browser Back follows the real question history", async () => {
  const p = await visit("#play/lessons/rhythm");
  try {
    await p
      .getByRole("button", { name: "Start practice →", exact: true })
      .click();
    await p.getByRole("link", { name: "← Back one step", exact: true }).click();
    await p.waitForURL("**/#play/lessons/rhythm");
    await p
      .getByRole("button", { name: "Start practice →", exact: true })
      .click();
    await answer(p, units.find((u) => u.id === "rhythm").checks[0]);
    await p
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
    await p.goBack();
    await p.waitForURL("**/#play/lessons/rhythm/try/0");
    await p.getByRole("link", { name: "← Back one step", exact: true }).click();
    await p
      .getByRole("link", { name: "← Back to Music lessons", exact: true })
      .click();
    await p.waitForURL("**/#play/lessons");
  } finally {
    await p.close();
  }
});
test("independent studios preserve drafts, cancel sound on navigation, and Pool returns to Create", async () => {
  const p = await visit("#play/create/melody");
  try {
    await p.getByRole("button", { name: "C, step 1", exact: true }).click();
    await p.getByRole("button", { name: "E, step 2", exact: true }).click();
    await p.getByRole("button", { name: "Play my idea", exact: true }).click();
    await p.getByRole("button", { name: "Stop", exact: true }).waitFor();
    await p
      .getByRole("link", { name: "← Back to Create & play", exact: true })
      .click();
    await p.getByRole("link", { name: "Beat Studio", exact: true }).click();
    await p.getByRole("button", { name: "Step 2", exact: true }).click();
    await p
      .getByRole("link", { name: "← Back to Create & play", exact: true })
      .click();
    await p.getByRole("link", { name: "Melody Studio", exact: true }).click();
    assert.equal(
      await p
        .getByRole("button", { name: "C, step 1", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(
      await p
        .getByRole("button", { name: "E, step 2", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(
      await p.getByRole("button", { name: "Stop", exact: true }).count(),
      0,
    );
    await p.goto(base + "/#play/pool");
    assert.equal(
      await p.locator(".pool-back").getAttribute("href"),
      "#play/create",
    );
    assert.equal(await p.locator("audio").count(), 1);
  } finally {
    await p.close();
  }
});
test("short desktop keeps every primary action inside its page, with no vertical answering scroll", async () => {
  const p = await visit("#play/lessons/rhythm", 600, 1366);
  try {
    for (const id of [
      "pitch",
      "rhythm",
      "steps",
      "aquarium-colour",
      "aquarium-composer",
      "aquarium-return",
    ]) {
      await p.goto(base + "/" + studyHash(units.find((u) => u.id === id)));
      await p.locator(".study-stage").waitFor();
      for (const s of [".study-heading", ".study-body", ".study-dock"]) {
        const b = await p.locator(s).boundingBox();
        assert.ok(
          b && b.height > 30 && b.y >= 0 && b.y + b.height <= 601,
          id + " " + s + JSON.stringify(b),
        );
      }
      await p
        .getByRole("button", { name: "Start practice →", exact: true })
        .click();
      const dock = await p.locator(".study-dock").boundingBox();
      assert.ok(dock.y + dock.height <= 601, id);
      await p.screenshot({ path: ".tmp/qwen-chat/study-" + id + ".png" });
    }
    for (const id of ["beats", "melody"]) {
      await p.goto(base + "/#play/create/" + id);
      const b = await p.locator(".studio-transport").boundingBox();
      assert.ok(b && b.y + b.height <= 601, id + JSON.stringify(b));
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
    }
  } finally {
    await p.close();
  }
});
test("sources restore focus, reduced motion has no particles, and mobile has no page-width overflow", async () => {
  const p = await visit("#play/lessons/pitch");
  try {
    await p
      .getByRole("button", { name: "Sources & notes", exact: true })
      .click();
    await p
      .getByRole("dialog")
      .getByRole("button", { name: "Close", exact: true })
      .click();
    assert.equal(
      await p.evaluate(() => document.activeElement.textContent),
      "Sources & notes",
    );
    await p
      .getByRole("button", { name: "Start practice →", exact: true })
      .click();
    await answer(p, units.find((u) => u.id === "pitch").checks[0]);
    assert.equal(
      await p
        .locator(".study-celebration")
        .evaluate((e) => getComputedStyle(e).display),
      "none",
    );
    await p.setViewportSize({ width: 390, height: 844 });
    for (const hash of [
      "#play/create/melody",
      "#play/lessons/pitch",
      "#play/works/aquarium/aquarium-composer",
    ]) {
      await p.goto(base + "/" + hash);
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        hash,
      );
    }
  } finally {
    await p.close();
  }
});
