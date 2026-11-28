import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
let b;
const base = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
before(
  async () =>
    (b = await chromium.launch({
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox"],
    })),
);
after(async () => b?.close());
async function visit(h) {
  const p = await b.newPage({ reducedMotion: "reduce" });
  p.setDefaultTimeout(12000);
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await p.goto(base + "/" + h);
  return p;
}
test("unit, area and work must agree, and an unearned completion URL cannot mark progress", async () => {
  const p = await visit("#play");
  try {
    for (const h of [
      "#play/works/swan/aquarium-layers",
      "#play/lessons/aquarium-layers",
      "#play/works/aquarium/pitch",
      "#program/aquarium/learn/pitch",
      "#play/lessons/constructor",
    ]) {
      await p.goto(base + "/" + h);
      await p
        .getByRole("heading", { name: "This lesson is still backstage." })
        .waitFor();
    }
    await p.goto(base + "/#play/lessons/pitch/done");
    assert.equal(
      await p.locator(".study-room").getAttribute("data-phase"),
      "try",
    );
    assert.equal(await p.locator(".study-complete").count(), 0);
  } finally {
    await p.close();
  }
});
test("Chat keeps guided Play links and Program summary uses the actual discovery count", async () => {
  const p = await visit("#program/aquarium/chat");
  try {
    await p
      .getByRole("button", { name: "Why an aquarium?", exact: true })
      .click();
    await p.locator(".chat-play-link").click();
    assert.match(p.url(), /#program\/aquarium\/learn\/aquarium-layers$/);
    await p.getByRole("link", { name: "Finish visit", exact: true }).click();
    await p.getByText("/6 explored", { exact: false }).waitFor();
    assert.equal(
      await p
        .locator(".completion-actions a,.completion-actions button")
        .count(),
      3,
    );
  } finally {
    await p.close();
  }
});
test("normal Program starts with the first of six discoveries and follows the complete ordered path", async () => {
  const p = await visit("#program/aquarium/learn");
  try {
    const { units } = await import("../src/content/curriculum.ts");
    for (const u of units.filter((u) => u.area === "works")) {
      await p.locator('.study-room[data-unit="' + u.id + '"]').waitFor();
      await p
        .getByRole("button", { name: "Start practice →", exact: true })
        .click();
      for (const q of u.checks) {
        if (q.interaction === "order") {
          for (const n of q.target)
            await p
              .getByRole("button", { name: q.options[n].label, exact: true })
              .click();
        } else
          await p
            .getByRole("button", {
              name: q.options[q.answer].label,
              exact: true,
            })
            .click();
        await p
          .getByRole("button", { name: "Check answer", exact: true })
          .click();
        await p
          .getByRole("button", {
            name:
              q === u.checks.at(-1) ? "Finish discovery →" : "Next question →",
            exact: true,
          })
          .click();
      }
      await p.locator(".study-complete").waitFor();
      await p.locator(".study-action a").click();
    }
    await p.waitForURL("**/#program/aquarium/done");
    await p.getByText("6/6 explored", { exact: false }).waitFor();
  } finally {
    await p.close();
  }
});
test("in-app Back followed by browser Back continues upwards instead of reopening the child", async () => {
  const p = await visit("#play");
  try {
    const { units } = await import("../src/content/curriculum.ts");
    await p.getByRole("link", { name: "Music lessons", exact: true }).click();
    await p
      .getByRole("link", {
        name: units.find((u) => u.id === "pitch").title,
        exact: true,
      })
      .click();
    await p
      .getByRole("button", { name: "Start practice →", exact: true })
      .click();
    await p.getByRole("link", { name: "← Back one step", exact: true }).click();
    await p.waitForURL("**/#play/lessons/pitch");
    await p.goBack();
    await p.waitForURL("**/#play/lessons");
    await p.goBack();
    await p.waitForURL("**/#play");
  } finally {
    await p.close();
  }
});
test("creative tempo persists per studio and every note row fits without vertical grid scrolling", async () => {
  const p = await visit("#play/create/melody");
  try {
    await p.setViewportSize({ width: 1366, height: 600 });
    await p
      .getByRole("combobox", { name: "Studio tempo", exact: true })
      .selectOption("60");
    assert.equal(
      await p
        .locator(".studio-grid-scroll")
        .evaluate((e) => e.scrollHeight <= e.clientHeight),
      true,
    );
    await p
      .getByRole("link", { name: "← Back to Create & play", exact: true })
      .click();
    await p.getByRole("link", { name: "Beat Studio", exact: true }).click();
    await p
      .getByRole("combobox", { name: "Studio tempo", exact: true })
      .selectOption("140");
    await p
      .getByRole("link", { name: "← Back to Create & play", exact: true })
      .click();
    await p.getByRole("link", { name: "Melody Studio", exact: true }).click();
    assert.equal(
      await p
        .getByRole("combobox", { name: "Studio tempo", exact: true })
        .inputValue(),
      "60",
    );
  } finally {
    await p.close();
  }
});
test("restarting Aquarium preserves independently completed general lessons and Detective Back stays local", async () => {
  const p = await visit("#play/lessons/pitch");
  try {
    const { units } = await import("../src/content/curriculum.ts");
    const u = units.find((u) => u.id === "pitch");
    await p
      .getByRole("button", { name: "Start practice →", exact: true })
      .click();
    for (const q of u.checks) {
      if (q.interaction === "order") {
        for (const n of q.target)
          await p
            .getByRole("button", { name: q.options[n].label, exact: true })
            .click();
      } else
        await p
          .getByRole("button", { name: q.options[q.answer].label, exact: true })
          .click();
      await p
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await p
        .getByRole("button", {
          name:
            q === u.checks.at(-1) ? "Finish discovery →" : "Next question →",
          exact: true,
        })
        .click();
    }
    await p.evaluate(() => (location.hash = "#program/aquarium/done"));
    await p
      .getByRole("button", { name: "Restart Program", exact: true })
      .click();
    await p.waitForURL("**/#program/aquarium/listen");
    await p.evaluate(() => (location.hash = "#play/lessons"));
    await p
      .getByRole("link", { name: u.title, exact: true })
      .locator("svg[aria-label=Completed]")
      .waitFor();
    await p.evaluate(() => (location.hash = "#play/works"));
    await p
      .getByRole("link", {
        name: "Sound Detective · extra listening clues",
        exact: true,
      })
      .click();
    await p.locator(".room-back a").click();
    await p.waitForURL("**/#play/works");
  } finally {
    await p.close();
  }
});
