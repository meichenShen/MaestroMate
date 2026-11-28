import assert from "node:assert/strict";
import { chromium } from "playwright";
const b = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const base = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
try {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto(base);
  await p.getByRole("dialog").waitFor();
  await p.getByRole("button", { name: "Skip the tour", exact: true }).click();
  await p
    .getByRole("dialog", { name: "How would you like to begin?", exact: true })
    .waitFor();
  assert.equal(await p.locator(".entry-primary").count(), 2);
  assert.ok(
    await p.evaluate(
      () =>
        parseFloat(
          getComputedStyle(document.querySelector(".entry-primary strong"))
            .fontSize,
        ) >
        parseFloat(
          getComputedStyle(document.querySelector(".browse-entry")).fontSize,
        ),
    ),
  );
  await p
    .getByRole("button", { name: "Just looking for now", exact: true })
    .click();
  assert.equal(
    await p.getByRole("button", { name: /Just looking/ }).count(),
    0,
  );
  await p.getByRole("button", { name: "Choose a way in", exact: true }).click();
  await p
    .getByRole("button", { name: "Choose an experience", exact: true })
    .click();
  await p.getByRole("dialog").waitFor({ state: "detached" });
  await p.waitForURL("**/#explore");
  assert.equal(await p.evaluate(() => location.hash), "#explore");
  await p.getByRole("button", { name: "Choose a way in", exact: true }).click();
  await p
    .getByRole("button", { name: "Start with a work", exact: true })
    .click();
  await p.getByRole("button", { name: "Open Program", exact: true }).click();
  await p
    .getByRole("button", { name: "Start Aquarium Program", exact: true })
    .waitFor();
  await p.getByRole("button", { name: "Close Program", exact: true }).click();
  await p.locator("[data-work]").first().waitFor({ state: "detached" });
  await p.getByRole("button", { name: "Open Program", exact: true }).click();
  await p.locator('[data-work="swan"]').waitFor();
  await p.waitForTimeout(750);
  assert.equal(await p.locator('[data-work="swan"] button').isDisabled(), true);
  await p.getByRole("button", { name: "Choose a way in", exact: true }).click();
  await p.keyboard.press("Escape");
  await p.getByRole("dialog").waitFor({ state: "detached" });
  assert.equal(
    await p
      .getByRole("button", { name: "Choose a way in", exact: true })
      .evaluate((e) => e === document.activeElement),
    true,
  );
  assert.equal(await p.locator("html").getAttribute("lang"), "en");
  assert.equal(
    /[\u3400-\u9fff]/.test(await p.locator("body").innerText()),
    false,
  );
  console.log(
    "First entry hierarchy, browse-only placement, Program fold, Escape focus and English: passed",
  );
} finally {
  await b.close();
}
