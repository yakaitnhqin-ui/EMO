const { test, expect } = require('@playwright/test');
const { loginWithToken, BASE_URL } = require('./helpers/auth');

test('debug turkiye page structure scrolled', async ({ page }) => {
  test.setTimeout(120000);
  await loginWithToken(page);
  await page.goto(`${BASE_URL}/en/plans/turkiye-esim`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);

  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel(0, 350);
    await page.waitForTimeout(250);
  }

  const coversAll = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('body *')).filter(e =>
      e.tagName !== 'SCRIPT' && e.tagName !== 'STYLE' &&
      e.children.length === 0 && /Covers[\s\S]*only/i.test(e.textContent || '')
    );
    return els.map(e => e.textContent.trim());
  });
  console.log('All "Covers X only" matches (scrolled):', JSON.stringify(coversAll));

  await page.screenshot({ path: 'screenshots/_debug-turkiye/scrolled-full.png', fullPage: true });
});
