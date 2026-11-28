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
async function visit(hash, width = 1440, height = 900) {
  const p = await b.newPage({
    viewport: { width, height },
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
async function fits(p) {
  assert.ok(
    await p.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight + 1,
    ),
    "Activity never needs document scrolling",
  );
  for (const el of await p
    .locator(
      ".case-navigation button,.case-check,.question-tile,.scene-play,.chapter-navigation button,.notes-open",
    )
    .all()) {
    const r = await el.boundingBox();
    if (r) {
      const top = await p
        .locator(".player")
        .evaluate((e) => e.getBoundingClientRect().top);
      assert.ok(
        r.y >= 80 && r.y + r.height <= top + 1,
        `Reachable control: ${await el.innerText()} at ${r.y + r.height}, player ${top}`,
      );
    }
  }
}
test("answer, reveal, previous and next all stay inside one desktop workspace", async () => {
  const p = await visit("#play/aquarium");
  try {
    assert.equal(
      await p.getByRole("button", { name: "Next case", exact: true }).count(),
      1,
    );
    assert.equal(await p.getByRole("article").count(), 3);
    await fits(p);
    const stage = p.locator("#current-sound-case");
    await stage.getByRole("radio").nth(1).check();
    await stage
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await stage.getByText("You found it.", { exact: true }).waitFor();
    await fits(p);
    await p.getByRole("button", { name: "Next case", exact: true }).click();
    await stage
      .getByRole("heading", { name: "The last ripple", exact: true })
      .waitFor();
    await fits(p);
    await p.getByRole("button", { name: "Previous case", exact: true }).click();
    assert.ok(await stage.getByRole("radio").nth(1).isChecked());
    await fits(p);
  } finally {
    await p.close();
  }
});
test("all three activities fit desktop and short-laptop heights", async () => {
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
  ]) {
    const p = await visit("#chat", width, height);
    try {
      for (const hash of ["#chat", "#listen/aquarium", "#play/aquarium"]) {
        await p.goto(base + "/" + hash);
        await p.locator(".work-room").waitFor();
        await p.evaluate(
          () =>
            new Promise((r) =>
              requestAnimationFrame(() => requestAnimationFrame(r)),
            ),
        );
        await fits(p);
      }
    } finally {
      await p.close();
    }
  }
});
test("notes open as a separate dialog and return focus without moving the page", async () => {
  const p = await visit("#chat");
  try {
    const open = p.getByRole("button", {
      name: "Open listening notes",
      exact: true,
    });
    assert.equal(await open.count(), 1);
    await open.click();
    await p
      .getByRole("dialog", {
        name: "Listening notes & recording credits",
        exact: true,
      })
      .waitFor();
    await p.keyboard.press("Escape");
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    assert.ok(await open.evaluate((e) => e === document.activeElement));
    await fits(p);
  } finally {
    await p.close();
  }
});
