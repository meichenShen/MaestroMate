import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { openLocalDatabase } from '../scripts/local-d1.mjs';
let browser;
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
before(async () => { browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--enable-unsafe-swiftshader'] }); });
after(async () => browser?.close());
async function page() {
  const p = await browser.newPage({ viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' });
  await p.addInitScript(() => { sessionStorage.setItem('maestromate-guide-v2', 'seen'); sessionStorage.setItem('maestromate-entry-v2', 'seen'); });
  await p.goto(base + '/#about');
  await p.getByRole('button', { name: 'Tell us how it felt' }).click();
  return p;
}
test('native feedback sends anonymously to durable SQLite, no account or external navigation', async () => {
  const p = await page();
  const message = 'Browser delivery check ' + crypto.randomUUID();
  try {
    const dialog = p.getByRole('dialog', { name: 'How did it feel?' });
    const headingSize = await dialog.locator('h2').evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    assert.ok(headingSize <= 42, 'Modal typography is independent of homepage headings');
    await dialog.getByLabel('Your note').fill(message);
    await dialog.getByLabel('Email (optional)').fill('listener@example.test');
    await dialog.getByRole('button', { name: 'Send feedback', exact: true }).click();
    await dialog.getByText('Your note is with us. Thank you.').waitFor();
    assert.equal(new URL(p.url()).origin, new URL(base).origin);
    const db = await openLocalDatabase(process.env.QA_DB_PATH || '.tmp/feedback/local.sqlite');
    try {
      const row = await db.prepare('SELECT message, email FROM feedback WHERE message=?').bind(message).first();
      assert.equal(row.message, message); assert.equal(row.email, 'listener@example.test');
    } finally { db.close(); }
    await p.keyboard.press('Escape');
    assert.equal(await p.getByRole('button', { name: 'Tell us how it felt' }).evaluate(el => el === document.activeElement), true);
    assert.equal(await p.getByRole('link', { name: 'Say hello on GitHub' }).getAttribute('href'), 'https://github.com/meichenShen/MaestroMate');
  } finally { await p.close(); }
});
test('failed submission keeps the draft; dismissing a pending request never shows false receipt', async () => {
  const p = await page();
  try {
    const dialog = p.getByRole('dialog', { name: 'How did it feel?' });
    await dialog.getByLabel('Your note').fill('Please keep this draft.');
    await p.route('**/api/feedback', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"ok":false}' }));
    await dialog.getByRole('button', { name: 'Send feedback', exact: true }).click();
    await dialog.getByRole('alert').waitFor();
    assert.equal(await dialog.getByLabel('Your note').inputValue(), 'Please keep this draft.');
    assert.equal(await dialog.getByText('Your note is with us. Thank you.').count(), 0);
    await p.unroute('**/api/feedback');
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await p.route('**/api/feedback', async route => { await gate; await route.fulfill({ status: 201, contentType: 'application/json', body: '{"ok":true,"id":"late"}' }).catch(() => {}); });
    await dialog.getByRole('button', { name: 'Send feedback', exact: true }).click();
    await dialog.getByRole('button', { name: 'Sending…' }).waitFor();
    await p.keyboard.press('Escape');
    release();
    await p.getByRole('button', { name: 'Tell us how it felt' }).click();
    assert.equal(await dialog.getByLabel('Your note').inputValue(), 'Please keep this draft.');
    assert.equal(await dialog.getByText('Your note is with us. Thank you.').count(), 0);
  } finally { await p.close(); }
});
