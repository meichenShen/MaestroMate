import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
let b;
const base = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
before(
  async () =>
    (b = await chromium.launch({
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
    })),
);
after(async () => b?.close());
async function visit(hash = "#play/learn", width = 1440, height = 900) {
  const p = await b.newPage({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await p.goto(base + "/" + hash);
  return p;
}
test("three related stages give specific feedback, retain discoveries and allow multiple creative answers", async () => {
  const p = await visit();
  try {
    await p
      .getByRole("button", { name: "Down — towards lower notes", exact: true })
      .click();
    await p.getByRole("button", { name: "Check my discovery" }).click();
    assert.match(await p.getByRole("status").innerText(), /Not quite/);
    await p
      .getByRole("button", { name: "Up — towards higher notes", exact: true })
      .click();
    await p.getByRole("button", { name: "Check my discovery" }).click();
    assert.match(await p.getByRole("status").innerText(), /Pitch means/);
    await p.getByRole("button", { name: "Next discovery" }).click();
    await p
      .getByRole("button", { name: "The last phrase", exact: true })
      .click();
    await p.getByRole("button", { name: "Check my discovery" }).click();
    assert.match(await p.getByRole("status").innerText(), /A–B–A/);
    await p.getByRole("button", { name: "Next discovery" }).click();
    assert.equal(
      await p.getByRole("button", { name: "Check my discovery" }).isDisabled(),
      true,
    );
    for (const note of ["C", "D", "E", "G"])
      await p.getByRole("button", { name: "Add " + note, exact: true }).click();
    await p.getByRole("button", { name: "Check my discovery" }).click();
    assert.match(await p.getByRole("status").innerText(), /Try C, D or E/);
    await p
      .getByRole("button", { name: "Reply space 4: G", exact: true })
      .click();
    await p.getByRole("button", { name: "Add D", exact: true }).click();
    await p.getByRole("button", { name: "Try my answer" }).count();
    await p.getByRole("button", { name: "Check my discovery" }).click();
    assert.match(await p.getByRole("status").innerText(), /made a variation/);
    await p.evaluate(() => (location.hash = "#play"));
    await p.getByRole("link", { name: "Explore the learning trail" }).click();
    assert.match(await p.locator(".learning-heading").innerText(), /3\/3/);
    await p.evaluate(() => (location.hash = "#program/aquarium/done"));
    assert.equal(await p.locator(".learning-recap").getByText(/✓/).count(), 3);
  } finally {
    await p.close();
  }
});
test("all core actions fit a short desktop and mobile has no horizontal overflow", async () => {
  for (const [w, h] of [
    [1440, 900],
    [1366, 600],
    [390, 844],
  ]) {
    const p = await visit("#play/learn", w, h);
    try {
      for (let i = 0; i < 3; i++) {
        await p.locator(".learning-levels button").nth(i).click();
        if (i < 2) await p.getByRole("button", {name:i===0?"Up — towards higher notes":"The last phrase",exact:true}).click();
        else for (const n of ["C","D","E","D"]) await p.getByRole("button",{name:"Add "+n,exact:true}).click();
        await p.getByRole("button",{name:"Check my discovery"}).click();
        const r = await p.locator(".learning-footer").boundingBox();
        assert.ok(
          await p.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        if (w > 900) {
          const feedback = await p.locator(".learning-feedback").boundingBox();
          const card = await p.locator(".learning-card").boundingBox();
          assert.ok(feedback.y + feedback.height <= card.y + card.height + 1, "feedback stays within its card");
          assert.ok(feedback.y + feedback.height < r.y, "feedback does not overlap navigation");
        }
        if (w > 900)
          assert.ok(
            r.y + r.height <= h,
            `${w} stage${i}: ${JSON.stringify(r)}`,
          );
      }
      await p.screenshot({
        path: `.tmp/learning/trail-${w}.png`,
        fullPage: true,
      });
    } finally {
      await p.close();
    }
  }
});
test("listening discoveries use the persistent recording and close with focus return", async () => {
  const p = await visit("#listen/aquarium");
  try {
    await p.getByRole("button", { name: "Something to listen for" }).click();
    await p.getByRole("button", { name: "Hear this passage" }).click();
    await p.waitForTimeout(400);
    assert.equal(await p.locator("audio").count(), 1);
    await p
      .getByRole("button", { name: "Behind the glass", exact: true })
      .click();
    assert.equal(await p.locator("audio").evaluate((a) => a.paused), true);
    await p.keyboard.press("Escape");
    assert.equal(await p.locator("dialog[open]").count(), 0);
    assert.equal(
      await p
        .getByRole("button", { name: "Something to listen for" })
        .evaluate((e) => document.activeElement === e),
      true,
    );
  } finally {
    await p.close();
  }
});
test("a delayed sound permission never replaces a newly checked answer", async () => {
  const p = await visit();
  try {
    await p.evaluate(() => {
      const Real = window.AudioContext;
      window.AudioContext = function () {
        const ctx = new Real();
        let resumed = false;
        Object.defineProperty(ctx, "state", {
          get: () => (resumed ? "running" : "suspended"),
        });
        ctx.resume = () =>
          new Promise((resolve) => {
            window.releaseLearningAudio = () => {
              resumed = true;
              resolve();
            };
          });
        return ctx;
      };
    });
    await p.getByRole("button", { name: "Listen to the example" }).click();
    await p.waitForFunction(
      () => typeof window.releaseLearningAudio === "function",
    );
    await p
      .getByRole("button", { name: "Up — towards higher notes", exact: true })
      .click();
    await p.getByRole("button", { name: "Check my discovery" }).click();
    await p.evaluate(() => window.releaseLearningAudio());
    await p.waitForTimeout(120);
    assert.match(await p.getByRole("status").innerText(), /Pitch means/);
    assert.match(await p.locator(".learning-heading").innerText(), /1\/3/);
  } finally {
    await p.close();
  }
});
test('Pool starter transfers variation into eight steps and guided Back returns to Program',async()=>{
 const p=await visit('#play/pool');try{
 await p.getByRole('button',{name:'Try a variation'}).click();await p.getByRole('button',{name:'Load starter'}).click();await p.getByRole('button',{name:'Step 8: G',exact:true}).waitFor();await p.getByRole('button',{name:'Play C',exact:true}).click();await p.getByRole('button',{name:'Try a variation'}).click();assert.match(await p.getByRole('dialog').getByRole('status').innerText(),/made a variation/);await p.keyboard.press('Escape');
 await p.evaluate(()=>location.hash='#program/aquarium/learn');assert.equal(await p.getByRole('link',{name:'Back to your Program'}).getAttribute('href'),'#program');assert.equal(await p.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Program',exact:true}).getAttribute('aria-current'),'page');
 }finally{await p.close()}
});
