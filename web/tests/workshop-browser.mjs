import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { aquariumGames } from "../src/content/play/aquarium.ts";
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
async function visit(hash = "#play/learn", w = 1440, h = 900) {
  const p = await b.newPage({
    viewport: { width: w, height: h },
    reducedMotion: "reduce",
  });
  p.setDefaultTimeout(12000);
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await p.goto(base + "/" + hash);
  return p;
}
async function go(p, g) {
  await p.locator(".workshop-levels button").nth(g.level).click();
  await p.getByRole("button", { name: g.title, exact: true }).click();
}
async function solve(p, g) {
  if (g.kind === "choice")
    await p
      .getByRole("button", { name: g.options[g.correct[0]].label, exact: true })
      .click();
  else {
    if (g.kind === "multi")
      for (const n of g.correct)
        await p
          .getByRole("button", { name: g.options[n].label, exact: true })
          .click();
    if (g.kind === "order" || g.kind === "postcard")
      for (const n of g.correct)
        await p
          .getByRole("button", {
            name: "Place " + g.options[n].label,
            exact: true,
          })
          .click();
    if (g.kind === "variation")
      await p.getByRole("button", { name: "Add D", exact: true }).click();
    if (g.kind === "rhythm")
      for (const n of [1, 5])
        await p.getByRole("button", { name: "Beat " + n, exact: true }).click();
    await p.getByRole("button", { name: "Try it", exact: false }).click();
  }
  assert.match(
    await p.locator(".workshop-stage").getAttribute("class"),
    /discovered/,
    g.id,
  );
}
test("all twelve Aquarium games work, with sources, immediate answers, creation and honest progress", async () => {
  const p = await visit();
  try {
    for (const g of aquariumGames) {
      await go(p, g);
      await solve(p, g);
    }
    assert.match(
      await p.getByLabel("Discoveries completed").innerText(),
      /12\/12/,
    );
    await p.evaluate(() => (location.hash = "#play"));
    await p.getByRole("link", { name: "Step into Aquarium" }).click();
    assert.match(
      await p.getByLabel("Discoveries completed").innerText(),
      /12\/12/,
    );
    await p.getByRole("button", { name: "Open a little clue" }).click();
    assert.match(await p.getByRole("dialog").innerText(), /hum/);
    await p.keyboard.press("Escape");
    assert.equal(
      await p
        .getByRole("button", { name: "Open a little clue" })
        .evaluate((e) => document.activeElement === e),
      true,
    );
    await p.evaluate(() => (location.hash = "#program/aquarium/done"));
    assert.equal(
      await p.locator(".learning-recap").getByText(/4\/4/).count(),
      3,
    );
  } finally {
    await p.close();
  }
});
test("every answered game keeps choices, feedback and navigation apart on desktop; phone fits", async () => {
  for (const [w, h] of [
    [1366, 600],
    [1024, 768],
    [390, 844],
    [320, 740],
  ]) {
    const p = await visit("#play/learn", w, h);
    try {
      for (const g of aquariumGames) {
        await go(p, g);
        await solve(p, g);
        assert.ok(
          await p.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${w}:${g.id} overflow`,
        );
        if (w > 900) {
          const boxes = await p.evaluate(() => {
            const r = (s) => {
              const x = document.querySelector(s).getBoundingClientRect();
              return { y: x.y, bottom: x.bottom };
            };
            const dock = r(".workshop-dock");
            return {
              dock,
              stage: r(".workshop-stage"),
              footer: r(".workshop-footer"),
              buttons: [
                ...document.querySelectorAll(".game-playfield button"),
              ].map((e) => e.getBoundingClientRect().bottom),
            };
          });
          assert.ok(boxes.footer.bottom <= h, `${w}:${g.id} footer`);
          assert.ok(
            boxes.dock.bottom <= boxes.stage.bottom + 1,
            `${w}:${g.id} dock`,
          );
          assert.ok(
            boxes.buttons.every((bottom) => bottom <= boxes.dock.y + 1),
            `${w}:${g.id} game overlaps feedback ${JSON.stringify(boxes)}`,
          );
        }
      }
      await p.screenshot({
        path: `.tmp/workshop/games-${w}.png`,
        fullPage: true,
      });
    } finally {
      await p.close();
    }
  }
});
test("Aquarium recording uses one audio element and switching/help/Guide stops it", async () => {
  const p = await visit();
  try {
    await p.getByRole("button", { name: "Hear Aquarium", exact: true }).click();
    await p.waitForFunction(() => !document.querySelector("audio").paused);
    assert.equal(await p.locator("audio").count(), 1);
    assert.ok(await p.locator("audio").evaluate((a) => a.currentTime >= 3));
    await p.getByRole("button", { name: "Open a little clue" }).click();
    assert.equal(await p.locator("audio").evaluate((a) => a.paused), true);
    await p.keyboard.press("Escape");
    await p.getByRole("button", { name: "Hear Aquarium", exact: true }).click();
    await p
      .getByRole("button", { name: "Catch the last ripple", exact: true })
      .click();
    assert.equal(await p.locator("audio").evaluate((a) => a.paused), true);
    await p.getByRole("button", { name: "Ending", exact: true }).click();
    await p.getByRole("button", { name: "Open guide", exact: true }).click();
    assert.equal(await p.locator("audio").evaluate((a) => a.paused), true);
  } finally {
    await p.close();
  }
});
test("difficulty entry and unsupported works do not silently show Aquarium", async () => {
  const p = await visit("#play/learn/aquarium/2");
  try {
    assert.equal(
      await p.locator(".workshop").getAttribute("data-game"),
      "variation",
    );
    await p.evaluate(() => (location.hash = "#play/learn/swan"));
    await p
      .getByRole("heading", { name: "This work is still backstage." })
      .waitFor();
    assert.equal(await p.locator(".recording-bubbles").count(), 0);
  } finally {
    await p.close();
  }
});
test("fish echo is responsive, checks the trail, preserves melody and cancels behind Guide", async () => {
  const p = await visit("#play/pool");
  try {
    await p.getByRole("button", { name: "Play A", exact: true }).click();
    await p
      .getByRole("button", { name: "Follow the fish", exact: false })
      .click();
    await p.waitForFunction(
      () =>
        document.querySelector(".pool-stage").dataset.echoPhase === "answer",
      {},
      { timeout: 1700 },
    );
    for (const n of ["C", "E", "D"])
      await p.getByRole("button", { name: "Play " + n, exact: true }).click();
    await p.getByRole("button", { name: "Another trail" }).waitFor();
    assert.equal(
      await p.getByRole("button", { name: "Step 1: A", exact: true }).count(),
      1,
    );
    await p.getByRole("button", { name: "Another trail" }).click();
    await p.getByRole("button", { name: "Open guide", exact: true }).click();
    await p.getByRole("button", { name: "Close guide", exact: true }).click();
    assert.equal(
      await p.locator(".pool-stage").getAttribute("data-echo-phase"),
      "idle",
    );
    await p.getByRole("button", { name: "Paint a tune", exact: true }).click();
    await p.getByRole("button", { name: "Play C", exact: true }).click();
    assert.equal(
      await p.getByRole("button", { name: "Step 2: C", exact: true }).count(),
      1,
    );
    await p.screenshot({ path: ".tmp/workshop/pool-fish.png", fullPage: true });
  } finally {
    await p.close();
  }
});
test("same-work difficulty URLs and history show the requested game", async () => {
  const p = await visit("#play/learn/aquarium/0");
  try {
    await p.evaluate(() => (location.hash = "#play/learn/aquarium/2"));
    await p.waitForFunction(
      () => document.querySelector(".workshop")?.dataset.game === "variation",
      {},
      { timeout: 1500 },
    );
    await p.goBack();
    await p.waitForFunction(
      () => document.querySelector(".workshop")?.dataset.game === "shimmer",
      {},
      { timeout: 1500 },
    );
    await p.evaluate(() => (location.hash = "#play/learn/constructor"));
    await p
      .getByRole("heading", { name: "This work is still backstage." })
      .waitFor();
  } finally {
    await p.close();
  }
});
test('delayed practice or fish sound cannot revive after leaving the activity',async()=>{const p=await visit('#play/learn/aquarium/2');try{
 await p.evaluate(()=>{const Real=window.AudioContext;window.startedVoices=0;window.AudioContext=function(){const ctx=new Real();let resumed=false;Object.defineProperty(ctx,'state',{get:()=>resumed?'running':'suspended'});ctx.resume=()=>new Promise(resolve=>{window.releaseSound=()=>{resumed=true;resolve()}});const create=ctx.createOscillator.bind(ctx);ctx.createOscillator=()=>{const v=create();const start=v.start.bind(v);v.start=(...args)=>{window.startedVoices++;return start(...args)};return v};return ctx}});
 await p.getByRole('button',{name:'Add D',exact:true}).click();await p.waitForFunction(()=>typeof window.releaseSound==='function');await p.locator('.workshop-levels button').nth(0).click();await p.evaluate(()=>window.releaseSound());await p.waitForTimeout(120);assert.equal(await p.evaluate(()=>window.startedVoices),0);assert.equal(await p.locator('.workshop').getAttribute('data-game'),'shimmer');
 await p.evaluate(()=>location.hash='#play/pool');await p.getByRole('button',{name:'Follow the fish',exact:false}).click();await p.getByRole('button',{name:'Paint a tune',exact:true}).click();await p.evaluate(()=>window.releaseSound());await p.waitForTimeout(120);assert.equal(await p.evaluate(()=>window.startedVoices),0);assert.equal(await p.locator('.pool-stage').getAttribute('data-echo-phase'),'free');
 }finally{await p.close()}});
test('loading a creation starter leaves fish mode and makes the melody editable',async()=>{const p=await visit('#play/pool');try{await p.getByRole('button',{name:'Follow the fish',exact:false}).click();await p.getByRole('button',{name:'Try a variation',exact:false}).click();await p.getByRole('button',{name:'Load starter',exact:false}).click();assert.equal(await p.locator('.pool-stage').getAttribute('data-echo-phase'),'free');assert.equal(await p.getByRole('button',{name:'Step 8: G',exact:true}).isDisabled(),false);await p.getByRole('button',{name:'Play C',exact:true}).click();assert.equal(await p.getByRole('button',{name:'Step 8: C',exact:true}).count(),1)}finally{await p.close()}});
