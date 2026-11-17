import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await page.addInitScript(() => {
    sessionStorage.setItem("maestromate-guide-v2", "seen");
    sessionStorage.setItem("maestromate-entry-v2", "seen");
  });
  await page.goto(
    (process.env.QA_BASE_URL || "http://127.0.0.1:4173") + "/#program",
  );
  await page.getByRole("button", { name: "Open Program", exact: true }).click();
  await page.locator('.aquarium-art[data-render-status="ready"]').waitFor();
  await page.addStyleTag({
    content:
      ".work-preview {height:360px!important;animation:none!important;transform:none!important}.programme-preview-art{transform:none!important}.programme-page-back,.programme-page-edge{display:none!important}",
  });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  // Capture only the actual rendered preview canvas: no player, text or UI.
  await page
    .locator(".aquarium-canvas canvas")
    .first()
    .screenshot({ path: "public/images/program-cover.png" });
} finally {
  await browser.close();
}
