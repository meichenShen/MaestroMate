import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import { chapters, work, detectiveQuestions } from "../src/content/aquarium.ts";

const output = ".tmp/qa";
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const base = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
const failures = [];
const results = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
// Optional deterministic media for testing controls while a source download is blocked.
// Never copied into public/ or deployment output; default QA always uses the real MP3.
const fixtureMode = process.env.QA_AUDIO_FIXTURE === "1";
const fixtureRoute = async (route) => {
  const sampleRate = 8000;
  const samples = Math.round(work.duration * sampleRate);
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++)
    wav.writeInt16LE(
      Math.round(Math.sin((i / sampleRate) * 440 * Math.PI * 2) * 300),
      44 + i * 2,
    );
  const range = route
    .request()
    .headers()
    .range?.match(/bytes=(\d+)-(\d*)/);
  if (range) {
    const start = Number(range[1]);
    const end = range[2]
      ? Math.min(Number(range[2]), wav.length - 1)
      : wav.length - 1;
    await route.fulfill({
      status: 206,
      contentType: "audio/wav",
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes ${start}-${end}/${wav.length}`,
      },
      body: wav.subarray(start, end + 1),
    });
  } else
    await route.fulfill({
      status: 200,
      contentType: "audio/wav",
      headers: { "Accept-Ranges": "bytes" },
      body: wav,
    });
};
if (fixtureMode) await page.route("**/audio/aquarium.mp3", fixtureRoute);
page.on("pageerror", (error) => failures.push(String(error)));
const audioState = () =>
  page.locator("audio").evaluate((audio) => ({
    time: audio.currentTime,
    paused: audio.paused,
    duration: audio.duration,
    error: audio.error?.message || null,
  }));
const seek = async (time) => {
  await page
    .getByRole("slider", { name: "播放进度", exact: true })
    .fill(String(time));
};
const nav = (title) =>
  page
    .getByRole("navigation", { name: "探索方式" })
    .getByRole("button")
    .filter({ hasText: title });
const waitUntil = async (callback, message, timeout = 6000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await callback()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(message);
};
try {
  await page.goto(base);
  await page.locator("audio").evaluate(
    (audio) =>
      audio.readyState >= 1 ||
      new Promise((resolve, reject) => {
        audio.addEventListener("loadedmetadata", resolve, { once: true });
        audio.addEventListener(
          "error",
          () => reject(new Error("Real recording did not load")),
          { once: true },
        );
        setTimeout(
          () => reject(new Error("Recording metadata timed out")),
          15000,
        );
      }),
  );
  assert.equal(await page.locator("audio").count(), 1);
  assert.equal((await audioState()).paused, true);
  assert.ok(Math.abs((await audioState()).duration - work.duration) < 0.2);
  results.push(
    `${fixtureMode ? "测试音频" : "真实录音"}加载、时长正确、初次进入不自动播放`,
  );

  await page.getByRole("button", { name: "播放音乐", exact: true }).click();
  await waitUntil(
    async () => !(await audioState()).paused && (await audioState()).time > 0.2,
    "Playback did not start",
  );
  const before = (await audioState()).time;
  await page
    .locator("audio")
    .evaluate((audio) => (audio.dataset.identity = "same-player"));
  await nav("音乐家对话").click();
  await nav("音乐侦探").click();
  assert.equal(
    await page.locator("audio").getAttribute("data-identity"),
    "same-player",
  );
  assert.ok((await audioState()).time >= before);
  assert.equal((await audioState()).paused, false);
  await page.getByRole("button", { name: "暂停音乐", exact: true }).click();
  results.push("播放、暂停及切换三个模块时音频实例和播放状态保留");

  await seek(80);
  await nav("音乐小剧场").click();
  await page.getByRole("heading", { name: "深处回响", exact: true }).waitFor();
  await page.getByRole("button", { name: "关闭动态", exact: true }).click();
  await nav("音乐家对话").click();
  await nav("音乐小剧场").click();
  await page.getByRole("button", { name: "开启动态", exact: true }).waitFor();
  await page.locator('.chapter-navigation button').nth(3).click();
  assert.ok(Math.abs((await audioState()).time - chapters[3].start) < 0.1);
  assert.equal((await audioState()).paused, true);
  await page.getByRole("button", { name: "后退十秒" }).click();
  assert.ok(Math.abs((await audioState()).time - (chapters[3].start - 10)) < 0.1);
  results.push("暂停时跳转同步场景、章节导航、后退十秒、动态偏好保留");

  await nav("音乐家对话").click();
  await page.getByRole("button", { name: "我应该先听哪一层声音？" }).click();
  await page.getByRole("heading", { name: "我应该先听哪一层声音？" }).waitFor();
  await page.getByRole("button", { name: /分两次听这个片段/ }).click();
  await waitUntil(
    async () => !(await audioState()).paused,
    "Clip did not start",
  );
  assert.ok((await audioState()).time >= 3 && (await audioState()).time < 5);
  await page.locator("audio").evaluate((audio) => {
    audio.currentTime = 17.85;
  });
  await waitUntil(
    async () => (await audioState()).paused,
    "Clip did not stop at its end",
  );
  assert.ok(Math.abs((await audioState()).time - 18) < 0.1);
  results.push("预设问答、引用及片段播放／到点停止");

  await nav("音乐侦探").click();
  assert.equal(
    await page.getByRole("button", { name: "看看我的发现" }).isDisabled(),
    true,
  );
  await page.getByRole("radio", { name: /只有一层快速的声音/ }).check();
  await page.getByRole("button", { name: "看看我的发现" }).click();
  await page.getByText("换一个角度，再听听看。", { exact: true }).waitFor();
  await page.getByRole("button", { name: "再试一次", exact: true }).click();
  await page.getByRole("radio", { name: /还有一条更舒展的旋律/ }).check();
  await page.getByRole("button", { name: "看看我的发现" }).click();
  await page.getByText("听见了，发现得很棒。", { exact: true }).waitFor();
  await page.getByRole("button", { name: /下一条线索/ }).click();
  await page.getByRole("button", { name: /听片段 B/ }).click();
  await waitUntil(
    async () => !(await audioState()).paused,
    "Final clip did not start",
  );
  assert.ok(
    (await audioState()).time >= detectiveQuestions[1].clips[1].start && (await audioState()).time < detectiveQuestions[1].clips[1].start + 2,
  );
  await page.getByRole("button", { name: "暂停音乐", exact: true }).click();
  await page.getByRole("radio", { name: /片段 B/ }).check();
  await page.getByRole("button", { name: "看看我的发现" }).click();
  await nav("音乐小剧场").click();
  await nav("音乐侦探").click();
  await page.getByRole("heading", { name: "音乐怎样告别？" }).waitFor();
  assert.equal(
    await page.getByRole("radio", { name: /片段 B/ }).isChecked(),
    true,
  );
  await page.screenshot({
    path: `${output}/detective-desktop.png`,
    fullPage: true,
  });
  results.push("两道题、未选择限制、错误反馈、重试、正确反馈及跨模块进度保留");

  await page.getByRole("combobox", { name: "播放速度" }).selectOption("1.25");
  assert.equal(
    await page.locator("audio").evaluate((audio) => audio.playbackRate),
    1.25,
  );
  await page.getByRole("button", { name: "静音", exact: true }).click();
  assert.equal(
    await page.locator("audio").evaluate((audio) => audio.volume),
    0,
  );
  await page.getByRole("button", { name: "取消静音", exact: true }).click();
  await nav("音乐小剧场").click();
  await seek(0);

  for (const width of [1440, 1024, 768, 720, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Horizontal overflow at ${width}`,
    );
    for (const title of ["音乐家对话", "音乐侦探", "音乐小剧场"]) {
      await nav(title).click();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${title} overflow at ${width}`,
      );
    }
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    assert.ok(
      await page.evaluate(
        () =>
          document.querySelector(".page-footnote").getBoundingClientRect()
            .bottom <=
          document.querySelector(".player").getBoundingClientRect().top,
      ),
      `Player obscures page ending at ${width}`,
    );
    if (width === 1440 || width === 390) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({
        path: `${output}/${width === 1440 ? "desktop" : "mobile"}.png`,
        fullPage: true,
      });
    }
  }
  results.push("六种宽度、三个活动均无横向溢出；滚动到底部时播放器不遮挡内容");
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator(".hero-fish")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto('about:blank');
  await page.goto(base);
  await page.locator('.skip-link').waitFor({ state: 'attached' });
  await page.keyboard.press("Tab");
  assert.equal(
    await page
      .locator(".skip-link")
      .evaluate((el) => el === document.activeElement),
    true,
  );
  results.push("系统减少动态偏好与键盘跳转入口");

  await page.route("**/audio/aquarium.mp3", (route) => route.abort());
  await page.reload();
  await page.getByRole("alert").waitFor();
  await page.unroute("**/audio/aquarium.mp3");
  if (fixtureMode) await page.route("**/audio/aquarium.mp3", fixtureRoute);
  await page.getByRole("button", { name: "重新加载", exact: true }).click();
  await waitUntil(
    async () => !(await audioState()).paused,
    "Recovery did not restore playback",
    15000,
  );
  assert.equal(await page.getByRole("alert").count(), 0);
  results.push("网络加载失败提示及恢复入口");
  assert.deepEqual(failures, []);
  console.log(
    JSON.stringify({ status: "passed", fixtureMode, checks: results }, null, 2),
  );
  await fs.writeFile(
    `${output}/browser-results.json`,
    JSON.stringify({ status: "passed", fixtureMode, checks: results }, null, 2),
  );
} catch (error) {
  await page.screenshot({ path: `${output}/failure.png`, fullPage: true });
  console.error(error);
  console.error(
    JSON.stringify(
      { status: "failed", completed: results, pageErrors: failures },
      null,
      2,
    ),
  );
  process.exitCode = 1;
} finally {
  await browser.close();
}
