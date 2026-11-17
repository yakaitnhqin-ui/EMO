const { test, expect } = require('@playwright/test');
const { loginWithToken, BASE_URL } = require('./helpers/auth');

const SS_DIR = 'screenshots/_scan-checkout-flags';

const COUNTRIES = [
  'panama', 'vietnam', 'united-states', 'japan', 'china', 'thailand', 'italy', 'australia',
  'south-korea', 'france', 'malaysia', 'netherlands', 'hong-kong', 'germany', 'spain',
  'turkiye', 'bulgaria', 'hawaii', 'martinique', 'guatemala', 'guinea', 'romania',
  'saint-lucia', 'cameroon', 'monaco', 'sudan', 'zimbabwe', 'tonga', 'samoa', 'nauru',
  'aland-islands', 'bhutan', 'chile', 'colombia', 'costa-rica', 'jamaica', 'morocco',
  'slovenia', 'san-marino', 'vanuatu', 'timor-leste', 'honduras',
];

async function selectSmallestCountryOnlyTile(page) {
  const section = page.locator('div').filter({ hasText: /Covers [\s\S]*? only/i }).filter({ hasText: /\d+GB/ }).last();
  if (await section.count() === 0) return false;
  const tiles = section.getByText(/^\d+GB$/);
  const tileCount = await tiles.count();
  if (tileCount === 0) return false;
  await tiles.last().click();
  return true;
}

test('scan flag badges across countries', async ({ page }) => {
  test.setTimeout(1800000);
  await loginWithToken(page);

  const results = [];

  for (const slug of COUNTRIES) {
    try {
      try {
        await page.goto(`${BASE_URL}/en/plans/${slug}-esim`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      } catch (e) {
        await page.goto(`${BASE_URL}/en/plans/${slug}-esim`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      }
      await page.waitForTimeout(1500);
      const coversLocator = page.getByText(/Covers [\s\S]*? only/i).first();
      let found = false;
      for (let i = 0; i < 15; i++) {
        if (await coversLocator.count() > 0) { found = true; break; }
        await page.mouse.wheel(0, 350);
        await page.waitForTimeout(250);
      }
      if (found) await coversLocator.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(500);

      const ok = await selectSmallestCountryOnlyTile(page);
      if (!ok) {
        await page.screenshot({ path: `${SS_DIR}/DEBUG-${slug}-notfound.png`, fullPage: true }).catch(() => {});
        results.push({ slug, error: 'country-only section not found' });
        continue;
      }
      await page.waitForTimeout(800);

      const checkoutBtn = page.getByRole('button', { name: /^checkout$/i });
      await checkoutBtn.click({ timeout: 10000 });
      await page.waitForTimeout(2000);

      if (!page.url().includes('/checkout')) {
        results.push({ slug, error: 'did not reach checkout, url=' + page.url() });
        continue;
      }

      const info = await page.evaluate(() => {
        const flagEls = Array.from(document.querySelectorAll('.__flag'));
        const flag = flagEls[0];
        const bgImage = flag ? getComputedStyle(flag).backgroundImage : null;
        const urlMatch = bgImage && bgImage.match(/url\("([^"]+)"\)/);
        const priceEl = Array.from(document.querySelectorAll('span.price-data'))[0];
        const nameEl = Array.from(document.querySelectorAll('span.name-data'))[0];
        return {
          imageUrl: urlMatch ? urlMatch[1] : bgImage,
          priceColor: priceEl ? getComputedStyle(priceEl).color : null,
          nameText: nameEl ? nameEl.textContent.trim() : null,
        };
      });

      await page.locator('.__flag').first().screenshot({ path: `${SS_DIR}/${slug}-badge.png` }).catch(() => {});

      results.push({ slug, ...info });
      console.log(`[OK] ${slug}: name="${info.nameText}" image=${info.imageUrl}`);
    } catch (e) {
      results.push({ slug, error: String(e).slice(0, 200) });
      console.log(`[ERR] ${slug}: ${String(e).slice(0, 200)}`);
    }
  }

  console.log('\n=== IMAGE URL DUPLICATES ===');
  const byUrl = {};
  for (const r of results) {
    if (r.imageUrl) {
      byUrl[r.imageUrl] = byUrl[r.imageUrl] || [];
      byUrl[r.imageUrl].push(r.slug);
    }
  }
  for (const [url, slugs] of Object.entries(byUrl)) {
    if (slugs.length > 1) console.log(`DUPLICATE IMAGE across [${slugs.join(', ')}]: ${url}`);
  }

  console.log('\n=== FULL RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
});
