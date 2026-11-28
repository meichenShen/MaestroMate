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
test("loading a creation starter leaves fish mode and makes the melody editable", async () => {
  const p = await visit("#play/pool");
  try {
    await p
      .getByRole("button", { name: "Follow the fish", exact: false })
      .click();
    await p
      .getByRole("button", { name: "Try a variation", exact: false })
      .click();
    await p.getByRole("button", { name: "Load starter", exact: false }).click();
    assert.equal(
      await p.locator(".pool-stage").getAttribute("data-echo-phase"),
      "free",
    );
    assert.equal(
      await p
        .getByRole("button", { name: "Step 8: G", exact: true })
        .isDisabled(),
      false,
    );
    await p.getByRole("button", { name: "Play C", exact: true }).click();
    assert.equal(
      await p.getByRole("button", { name: "Step 8: C", exact: true }).count(),
      1,
    );
  } finally {
    await p.close();
  }
});
