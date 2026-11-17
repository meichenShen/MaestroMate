import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
let browser;
const base = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
before(async () => {
  browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
});
after(async () => browser?.close());
async function visit(width = 1440, height = 900, reduce = "reduce") {
  const page = await browser.newPage({
    viewport: { width, height },
    reducedMotion: reduce,
  });
  page.setDefaultTimeout(15000);
  await page.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await page.goto(base + "/#play");
  return page;
}
test("Music Pool is a separate Play activity, builds and edits a melody, and stops on guide/navigation", async () => {
  const p = await visit();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  try {
    await p
      .getByRole("button", { name: "Play Music Pool", exact: true })
      .click();
    await p
      .getByRole("heading", { name: "Make a little ripple.", exact: true })
      .waitFor();
    assert.equal(await p.locator("audio").count(), 1);
    assert.equal(await p.locator("audio").evaluate((a) => a.paused), true);
    assert.equal(await p.locator("[data-journey-progress]").count(), 0);
    assert.equal(
      await p
        .getByRole("link", { name: "Play", exact: true })
        .getAttribute("aria-current"),
      "page",
    );
    await p.getByRole("button", { name: "Play C", exact: true }).click();
    await p.getByRole("button", { name: "Play E", exact: true }).click();
    assert.equal(
      await p.getByRole("button", { name: "Step 1: C", exact: true }).count(),
      1,
    );
    assert.equal(
      await p.getByRole("button", { name: "Step 2: E", exact: true }).count(),
      1,
    );
    await p.getByRole("button", { name: "Step 1: C", exact: true }).click();
    await p.keyboard.press("f");
    assert.equal(
      await p.getByRole("button", { name: "Step 1: G", exact: true }).count(),
      1,
    );
    await p.getByRole("button", { name: "Play melody", exact: true }).click();
    await p.getByRole("button", { name: "Stop melody", exact: true }).waitFor();
    await p.getByRole("button", { name: "Open guide", exact: true }).click();
    await p.getByRole("button", { name: "Close guide", exact: true }).click();
    await p.getByRole("button", { name: "Play melody", exact: true }).waitFor();
    await p.getByRole("button", { name: "Play melody", exact: true }).click();
    await p
      .getByRole("link", { name: "Back to the play room", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Play Music Pool", exact: true })
      .click();
    await p.getByRole("button", { name: "Step 1: G", exact: true }).waitFor();
    assert.equal(
      await p.getByRole("button", { name: "Step 1: G", exact: true }).count(),
      1,
    );
    await p.getByRole("button", { name: "Clear melody", exact: true }).click();
    assert.equal(
      await p
        .getByRole("button", { name: "Play melody", exact: true })
        .isDisabled(),
      true,
    );
    assert.deepEqual(errors, []);
  } finally {
    await p.close();
  }
});
test("pool keeps controls visible in short desktop and touch, including a WebGL fallback", async () => {
  for (const [w, h] of [
    [1366, 600],
    [1024, 768],
    [390, 844],
  ]) {
    const p = await visit(w, h);
    try {
      await p
        .getByRole("button", { name: "Play Music Pool", exact: true })
        .click();
      await p
        .getByRole("heading", { name: "Make a little ripple.", exact: true })
        .waitFor();
      assert.equal(await p.locator(".pool-pad").count(), 5);
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      if (w >= 1024)
        assert.ok(
          await p.evaluate(
            () => document.documentElement.scrollHeight <= innerHeight + 2,
          ),
          "desktop pool fits one viewport",
        );
      await p.getByRole("button", { name: "Play A", exact: true }).click();
      await p.getByRole("button", { name: "Play melody", exact: true }).click();
      await p.getByRole("button", { name: "Stop melody", exact: true }).click();
    } finally {
      await p.close();
    }
  }
  const p = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  try {
    await p.addInitScript(() => {
      sessionStorage.setItem("maestromate-guide-v2", "seen");
      sessionStorage.setItem("maestromate-entry-v2", "seen");
      HTMLCanvasElement.prototype.getContext = function () {
        return null;
      };
    });
    await p.goto(base + "/#play/pool");
    await p.locator('[data-pool-render="fallback"]').waitFor();
    await p.getByRole("button", { name: "Play D", exact: true }).click();
    assert.equal(
      await p.getByRole("button", { name: "Step 1: D", exact: true }).count(),
      1,
    );
  } finally {
    await p.close();
  }
});

test("real Web Audio emits notes, mutes, stops behind Guide and releases on leaving", async () => {
  const p = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  p.setDefaultTimeout(15000);
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
    const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (destination, ...args) {
      if (destination === this.context.destination) {
        const meter = this.context.createAnalyser();
        meter.fftSize = 1024;
        connect.call(this, meter);
        connect.call(meter, destination);
        window.__poolMeter = { meter, context: this.context };
        return destination;
      }
      return connect.call(this, destination, ...args);
    };
    window.__poolRms = () => {
      const a = window.__poolMeter?.meter;
      if (!a) return 0;
      const data = new Float32Array(a.fftSize);
      a.getFloatTimeDomainData(data);
      return Math.sqrt(data.reduce((s, x) => s + x * x, 0) / data.length);
    };
  });
  try {
    await p.goto(base + "/#listen/aquarium");
    await p.getByRole("button", { name: "Play music", exact: true }).click();
    await p.waitForFunction(() => !document.querySelector("audio").paused);
    await p.getByRole("link", { name: "Play", exact: true }).click();
    await p
      .getByRole("button", { name: "Play Music Pool", exact: true })
      .click();
    assert.equal(await p.locator("audio").evaluate((a) => a.paused), true);
    await p.locator('[data-pool-render="ready"]').waitFor();
    await p.getByRole("button", { name: "Play C", exact: true }).click();
    await p.waitForFunction(() => window.__poolRms() > 0.0001);
    await p
      .getByRole("button", { name: "Mute instrument", exact: true })
      .click();
    await p.getByRole("button", { name: "Play E", exact: true }).click();
    await p.waitForFunction(() => window.__poolRms() < 0.000001);
    await p
      .getByRole("button", { name: "Unmute instrument", exact: true })
      .click();
    await p.getByRole("button", { name: "Play melody", exact: true }).click();
    await p.waitForFunction(() => window.__poolRms() > 0.0001);
    await p.getByRole("button", { name: "Open guide", exact: true }).click();
    await p.waitForFunction(() => window.__poolRms() < 0.000001);
    await p.getByRole("button", { name: "Close guide", exact: true }).click();
    await p.waitForTimeout(300);
    assert.ok(await p.evaluate(() => window.__poolRms() < 0.000001));
    await p
      .getByRole("link", { name: "Back to the play room", exact: true })
      .click();
    await p.waitForFunction(
      () => window.__poolMeter.context.state === "closed",
    );
    assert.equal(await p.locator("audio").count(), 1);
  } finally {
    await p.close();
  }
});

test("water animation freezes on request, and a lost context leaves the instrument usable", async () => {
  const p = await visit(1280, 800, "no-preference");
  try {
    await p
      .getByRole("button", { name: "Play Music Pool", exact: true })
      .click();
    await p.locator('[data-pool-render="ready"]').waitFor();
    const host = p.locator(".pool-canvas");
    const first = Number(await host.getAttribute("data-frame"));
    await p.waitForFunction(
      (n) =>
        Number(document.querySelector(".pool-canvas").dataset.frame) > n + 2,
      first,
    );
    await p.getByRole("button", { name: "Motion on", exact: true }).click();
    await p.waitForTimeout(100);
    const frozen = await host.getAttribute("data-frame");
    await p.waitForTimeout(300);
    assert.equal(await host.getAttribute("data-frame"), frozen);
    await p
      .locator(".pool-canvas canvas")
      .evaluate((c) =>
        c.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext(),
      );
    await p.locator('[data-pool-render="fallback"]').waitFor();
    await p.getByRole("button", { name: "Play G", exact: true }).click();
    assert.equal(
      await p.getByRole("button", { name: "Step 1: G", exact: true }).count(),
      1,
    );
  } finally {
    await p.close();
  }
});
