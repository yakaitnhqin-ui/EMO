const { test, expect } = require('@playwright/test');
const { loginWithToken, BASE_URL } = require('./helpers/auth');

const SS_DIR = 'screenshots/_explore-checkout';

test('reach checkout via token login', async ({ page }) => {
  test.setTimeout(120000);
  await loginWithToken(page);
  await page.goto(`${BASE_URL}/en/plans/panama-esim`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SS_DIR}/03-panama-page.png`, fullPage: true });

  const panamaSection = page.locator('div').filter({ hasText: 'Covers Panama only' }).filter({ hasText: '10GB' }).last();
  await panamaSection.getByText('10GB', { exact: true }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SS_DIR}/04-panama-10gb-selected.png`, fullPage: true });

  await page.getByRole('button', { name: /^checkout$/i }).click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SS_DIR}/05-checkout-page.png`, fullPage: true });
  console.log('Checkout URL:', page.url());

  const colors = await page.evaluate(() => {
    function isVisible(el) {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && el.closest('script,style') === null;
    }
    function leafTextEls(re) {
      return Array.from(document.querySelectorAll('body *')).filter(el =>
        el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE' &&
        el.children.length === 0 &&
        el.textContent && el.textContent.trim() &&
        re.test(el.textContent.trim()) && isVisible(el)
      );
    }
    const amountEls = leafTextEls(/^Panama\s*10GB$/i);
    const priceEls = leafTextEls(/^(SG\$|US\$)\s*[\d.]+$/i);

    // Probe a grid of points in the top-left ~120x120 area over the hero card to find the badge element
    const probeResults = [];
    for (let x = 140; x <= 260; x += 15) {
      for (let y = 180; y <= 260; y += 15) {
        const el = document.elementFromPoint(x, y);
        if (el) {
          probeResults.push({ x, y, tag: el.tagName, cls: el.className, bg: getComputedStyle(el).backgroundColor, bgImage: getComputedStyle(el).backgroundImage.slice(0, 150) });
        }
      }
    }

    return {
      amountEls: amountEls.map(e => ({ text: e.textContent.trim(), color: getComputedStyle(e).color, tag: e.tagName, cls: e.className })),
      priceEls: priceEls.map(e => ({ text: e.textContent.trim(), color: getComputedStyle(e).color, tag: e.tagName, cls: e.className })),
      probeResults,
    };
  });
  console.log('COLORS:', JSON.stringify(colors, null, 2));
});
