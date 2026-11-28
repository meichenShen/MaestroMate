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
async function ending(motion) {
  const p = await b.newPage({
    viewport: { width: 1100, height: 800 },
    reducedMotion: motion,
  });
  await p.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await p.goto(base + "/#program/aquarium/done");
  await p.locator('.theatre-stage[data-render-status="ready"]').waitFor();
  return p;
}
test("3D celebration uses the hall canvas and freezes behind Guide", async () => {
  const p = await ending("no-preference");
  try {
    const host = p.locator(".theatre-stage-canvas");
    assert.equal(await p.locator("canvas").count(), 1);
    assert.equal(await host.getAttribute("data-fireworks"), "running");
    await p.waitForFunction(
      () =>
        Number(
          document.querySelector(".theatre-stage-canvas").dataset
            .celebrationTime,
        ) > 1.4,
    );
    await p.screenshot({ path: ".tmp/qa/v9/fireworks-frame.png" });
    await p
      .getByRole("button", { name: "Open guide", exact: true })
      .evaluate((e) => e.click());
    await p.getByRole("dialog").waitFor();
    const t = Number(await host.getAttribute("data-celebration-time"));
    await p.waitForTimeout(500);
    assert.equal(
      Number(await host.getAttribute("data-celebration-time")),
      t,
      "Modal really suspends particle time",
    );
    await p
      .getByRole("button", { name: "Close guide", exact: true })
      .evaluate((e) => e.click());
    await p.getByRole("dialog").waitFor({ state: "detached" });
    await p.waitForFunction(
      (t) =>
        Number(
          document.querySelector(".theatre-stage-canvas").dataset
            .celebrationTime,
        ) >
        t + 0.2,
      t,
    );
    await p.emulateMedia({ reducedMotion: "reduce" });
    await p.waitForFunction(
      () =>
        document.querySelector(".theatre-stage-canvas").dataset.fireworks ===
        "disabled",
    );
  } finally {
    await p.close();
  }
});
test("reduced motion keeps the hall and exits while omitting fireworks", async () => {
  const p = await ending("reduce");
  try {
    const host = p.locator(".theatre-stage-canvas");
    assert.equal(await host.getAttribute("data-fireworks"), "disabled");
    assert.equal(
      await p
        .getByRole("button", { name: "Restart Program", exact: true })
        .isVisible(),
      true,
    );
    const count = await host.locator("canvas").getAttribute("data-frame");
    await p.waitForTimeout(300);
    assert.equal(
      await host.locator("canvas").getAttribute("data-frame"),
      count,
    );
  } finally {
    await p.close();
  }
});
