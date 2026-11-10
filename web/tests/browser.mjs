import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import { work, chapters } from "../src/content/aquarium.ts";
await fs.mkdir(".tmp/qa/rooms", { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const base = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
const checks = [];
try {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  const nav = (name) =>
    p
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name, exact: true });
  const state = () =>
    p.locator("audio").evaluate((a) => ({
      time: a.currentTime,
      paused: a.paused,
      duration: a.duration,
      rate: a.playbackRate,
      volume: a.volume,
    }));
  const wait = (callback) => p.waitForFunction(callback);
  await p.goto(base + "/#listen/aquarium");
  await p.waitForFunction(
    () => document.querySelector("audio").readyState >= 1,
  );
  assert.ok(Math.abs((await state()).duration - work.duration) < 0.2);
  assert.equal((await state()).paused, true);
  await p.getByRole("button", { name: "Play music", exact: true }).click();
  await wait(
    () =>
      !document.querySelector("audio").paused &&
      document.querySelector("audio").currentTime > 0.2,
  );
  await p.locator("audio").evaluate((a) => {
    a.dataset.identity = "same";
    a.currentTime = 80;
  });
  await nav("Chat").click();
  assert.equal(await p.locator("audio").getAttribute("data-identity"), "same");
  assert.equal((await state()).paused, false);
  await p.getByRole("button", { name: "Pause music", exact: true }).click();
  checks.push(
    "Real MP3, correct duration, playback and persistent audio across rooms",
  );
  await nav("Listen").click();
  await p
    .getByRole("button", { name: "Listen to Aquarium", exact: true })
    .click();
  await p
    .getByRole("slider", { name: "Playback position", exact: true })
    .fill("80");
  await p
    .getByRole("heading", { name: "Familiar waters", exact: true, level: 2 })
    .waitFor();
  await p.getByRole("switch", { name: "Scene motion", exact: true }).click();
  await nav("Chat").click();
  await nav("Listen").click();
  await p
    .getByRole("button", { name: "Listen to Aquarium", exact: true })
    .click();
  assert.equal(
    await p
      .getByRole("switch", { name: "Scene motion", exact: true })
      .getAttribute("aria-checked"),
    "false",
  );
  await p.locator(".chapter-navigation button").nth(3).click();
  assert.ok(Math.abs((await state()).time - chapters[3].start) < 0.1);
  await p
    .getByRole("button", { name: "Back ten seconds", exact: true })
    .click();
  assert.ok(Math.abs((await state()).time - (chapters[3].start - 10)) < 0.1);
  checks.push(
    "Paused seeking, chapter sync, back ten seconds and motion preference",
  );
  await nav("Chat").click();
  await p
    .getByRole("button", { name: "What should I listen for?", exact: true })
    .click();
  await p.getByRole("button", { name: /Listen from another angle/ }).waitFor();
  await p.getByRole("button", { name: /Listen from another angle/ }).click();
  await wait(() => !document.querySelector("audio").paused);
  assert.ok((await state()).time >= 3 && (await state()).time < 6);
  await p.locator("audio").evaluate((a) => (a.currentTime = 17.85));
  await wait(() => document.querySelector("audio").paused);
  assert.ok(Math.abs((await state()).time - 18) < 0.1);
  checks.push(
    "Prepared chat response and clip replay stopping at the exact end",
  );
  await nav("Play").click();
  await p
    .getByRole("button", { name: "Play Sound Detective", exact: true })
    .click();
  const stage = p.locator("#current-sound-case");
  assert.equal(await p.getByRole("article").count(), 3);
  assert.equal(
    await stage
      .getByRole("button", { name: "Check answer", exact: true })
      .isDisabled(),
    true,
  );
  await stage.getByRole("radio").nth(0).check();
  await stage
    .getByRole("button", { name: "Check answer", exact: true })
    .click();
  await stage.getByText("Try a different angle.", { exact: true }).waitFor();
  await stage.getByRole("button", { name: "Try again", exact: true }).click();
  await stage.getByRole("radio").nth(1).check();
  await stage
    .getByRole("button", { name: "Check answer", exact: true })
    .click();
  await p.getByRole("button", { name: "Next case", exact: true }).click();
  await stage.getByRole("button", { name: /Passage B · ending/ }).click();
  await wait(() => !document.querySelector("audio").paused);
  assert.ok((await state()).time >= 130 && (await state()).time < 133);
  await p.getByRole("button", { name: "Pause music", exact: true }).click();
  for (let i = 1; i < 3; i++) {
    await p
      .getByRole("button", { name: `Open case ${i + 1}`, exact: true })
      .click();
    await stage.getByRole("radio").nth(1).check();
    await stage
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
  }
  await p.locator(".game-completion").waitFor();
  await nav("Chat").click();
  await nav("Play").click();
  await p
    .getByRole("button", { name: "Play Sound Detective", exact: true })
    .click();
  await p.getByRole("button", { name: "Previous case", exact: true }).click();
  assert.equal(await stage.getByRole("radio").nth(1).isChecked(), true);
  checks.push(
    "Three independent cases in a fixed stage, retry, ending replay and retained progress",
  );
  await p
    .getByRole("combobox", { name: "Playback speed", exact: true })
    .selectOption("1.25");
  assert.equal((await state()).rate, 1.25);
  await p.getByRole("button", { name: "Mute", exact: true }).click();
  assert.equal((await state()).volume, 0);
  await p.getByRole("button", { name: "Unmute", exact: true }).click();
  checks.push("Playback rate and mute");
  for (const width of [1440, 1024, 768, 720, 390, 320]) {
    await p.setViewportSize({ width, height: 900 });
    for (const hash of ["#listen/aquarium", "#chat", "#play/aquarium"]) {
      await p.goto(base + "/" + hash);
      await p.locator(".work-room").waitFor();
      await p.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${hash} fits ${width}`,
      );
      await p.evaluate(() => scrollTo(0, document.body.scrollHeight));
      await p.waitForTimeout(50);
      assert.ok(
        await p.evaluate(
          () =>
            document.querySelector(".context-panel").getBoundingClientRect()
              .bottom <=
            document.querySelector(".player").getBoundingClientRect().top,
        ),
        "Player leaves room below content",
      );
    }
  }
  checks.push(
    "All three rooms fit six widths and the player does not hide the page ending",
  );
  // A fresh page forces a recording request. Hash navigation intentionally keeps
  // the existing, already-loaded audio element and cannot simulate load failure.
  const failure = await browser.newPage();
  await failure.addInitScript(() =>
    sessionStorage.setItem("maestromate-guide-v2", "seen"),
  );
  failure.on("pageerror", (e) => errors.push(e.message));
  await failure.route("**/audio/aquarium.mp3", (route) => route.abort());
  await failure.goto(base + "/#listen/aquarium");
  await failure.getByRole("alert").waitFor();
  await failure.unroute("**/audio/aquarium.mp3");
  await failure
    .getByRole("button", { name: "Retry audio", exact: true })
    .click();
  await failure.waitForFunction(() => !document.querySelector("audio").paused);
  assert.equal(await failure.getByRole("alert").count(), 0);
  await failure.close();
  assert.deepEqual(errors, []);
  checks.push("Recording error and recovery, no uncaught errors");
  console.log(
    JSON.stringify({ status: "passed", realRecording: true, checks }, null, 2),
  );
  await fs.writeFile(
    ".tmp/qa/rooms/audio-results.json",
    JSON.stringify({ status: "passed", checks }, null, 2),
  );
} finally {
  await browser.close();
}
