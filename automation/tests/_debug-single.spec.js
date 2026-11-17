const { test, expect } = require('@playwright/test');
const { loginWithToken, BASE_URL } = require('./helpers/auth');

test('debug single country panama', async ({ page }) => {
  test.setTimeout(120000);
  await loginWithToken(page);
  await page.goto(`${BASE_URL}/en/plans/panama-esim`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);

  const coversLocator = page.getByText(/Covers .* only/i).first();
  let found = false;
  for (let i = 0; i < 15; i++) {
    const c = await coversLocator.count();
    console.log(`iter ${i}: coversLocator.count() = ${c}`);
    if (c > 0) { found = true; break; }
    await page.mouse.wheel(0, 350);
    await page.waitForTimeout(250);
  }
  console.log('found =', found);
  if (found) {
    await coversLocator.scrollIntoViewIfNeeded().catch((e) => console.log('scrollIntoView error', e.message));
    await page.waitForTimeout(500);
    const txt = await coversLocator.textContent();
    console.log('coversLocator text:', txt);

    const section = page.locator('div').filter({ hasText: 'Covers Panama only' }).filter({ hasText: '10GB' }).last();
    const secCount = await section.count();
    console.log('section count:', secCount);
    if (secCount > 0) {
      const secText = await section.innerText().catch(e => 'ERR:' + e.message);
      console.log('section innerText (first 300):', secText.slice(0, 300));
    }
  }
  await page.screenshot({ path: 'screenshots/_debug-single/panama-state.png', fullPage: true });
});
