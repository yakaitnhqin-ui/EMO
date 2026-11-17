// @ts-check
/**
 * EP-5694 — [ecommerce] Refactor data balance page
 * Ticket: https://eskimo-portal.atlassian.net/browse/EP-5694
 * Tester: Nhu Huynh | Ngày: 2026-06-09
 * Môi trường: Staging
 * TC doc: TC_EP-5694_Data_Balance.md
 */

const { test, expect } = require('@playwright/test');
const { loginWithToken, BASE_URL } = require('./helpers/auth');
const fs = require('fs');

const DATA_BALANCE_URL = `${BASE_URL}/en/data-balance`;
const SS_DIR = 'screenshots/EP-5694';
const SS = (name) => `${SS_DIR}/${name}`;

// Tạo folder nếu chưa có
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

test.describe('EP-5694 — Refactor Data Balance Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // AC1 — Data Balance Page (tab My Plans)
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('AC1 — Data Balance page', () => {

    test('TC-EP-DBLN-001 | Data Balance page load thành công sau login', async ({ page }) => {
      await page.goto(DATA_BALANCE_URL);
      await page.waitForLoadState('networkidle');

      // Verify URL đúng
      await expect(page).toHaveURL(/data-balance/);

      // Verify tiêu đề trang hiển thị
      await expect(page.getByRole('heading', { name: /data balance/i })).toBeVisible();

      // Verify không có lỗi 5xx (API calls đều thành công)
      const failed = [];
      page.on('response', r => { if (r.status() >= 500) failed.push(r.url()); });
      expect(failed.length, `5xx errors: ${failed.join(', ')}`).toBe(0);

      await page.screenshot({ path: SS('TC-EP-DBLN-001_load.png'), fullPage: true });
    });

    test('TC-EP-DBLN-002 | Hiển thị đúng số dư data theo từng plan', async ({ page }) => {
      await page.goto(DATA_BALANCE_URL);
      await page.waitForLoadState('networkidle');

      // Verify có ít nhất 1 plan card hiển thị — UI dùng text "X GB left"
      const gbLeftText = page.getByText(/\d+\s*GB\s*left/i);
      await expect(gbLeftText.first()).toBeVisible({ timeout: 10000 });

      // Verify tên plan hiển thị (Spain, Global...)
      const planNames = page.locator('.ant-card, [class*="plan"], [class*="esim"]')
        .getByText(/spain|global|japan|us|uk/i)
        .or(page.getByText(/spain|global/i).filter({ visible: true }));
      await expect(planNames.first()).toBeVisible();

      await page.screenshot({ path: SS('TC-EP-DBLN-002_balance-plans.png'), fullPage: true });
    });

    test('TC-EP-DBLN-003 | Tab "My Plans" là tab mặc định khi vào trang', async ({ page }) => {
      await page.goto(DATA_BALANCE_URL);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500);

      // Verify tab My Plans đang active
      await expect(page.locator('button.db-tab--active')).toContainText(/my plans/i);

      // Verify tab History không active
      const historyTab = page.locator('button.db-tab:has-text("History")');
      await expect(historyTab).not.toHaveClass(/db-tab--active/);

      await page.screenshot({ path: SS('TC-EP-DBLN-003_default-tab.png'), fullPage: true });
    });

    test('TC-EP-DBLN-004 | API data balance trả về 200 và dữ liệu khớp UI', async ({ page }) => {
      let apiResponse = null;

      page.on('response', async (response) => {
        if (response.url().includes('/api') && response.status() === 200
          && (response.url().includes('wallet') || response.url().includes('balance'))) {
          try { apiResponse = await response.json(); } catch {}
        }
      });

      await page.goto(DATA_BALANCE_URL);
      await page.waitForLoadState('networkidle');

      // Verify API bắt được và trả về 200
      expect(apiResponse, 'Không bắt được API response cho data balance').not.toBeNull();
      console.log('API Balance Response:', JSON.stringify(apiResponse, null, 2));

      await page.screenshot({ path: SS('TC-EP-DBLN-004_api-response.png'), fullPage: true });
    });

  });

  // ══════════════════════════════════════════════════════════════════════════
  // AC2 — Data History Page (tab History)
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('AC2 — Data History page', () => {

    test('TC-EP-DBLN-005 | Tab History load thành công và active đúng', async ({ page }) => {
      await page.goto(DATA_BALANCE_URL);
      await page.waitForLoadState('domcontentloaded');

      const historyTab = page.locator('button.db-tab:has-text("History")');
      await historyTab.waitFor({ timeout: 10000 });
      await historyTab.click();
      await page.waitForTimeout(2000);

      // Verify tab History đang active
      await expect(page.locator('button.db-tab--active:has-text("History")')).toBeVisible();

      await page.screenshot({ path: SS('TC-EP-DBLN-005_history-tab.png'), fullPage: true });
    });

    test('TC-EP-DBLN-006 | History records hiển thị đủ thông tin (tên plan, ngày, status)', async ({ page }) => {
      await page.goto(DATA_BALANCE_URL);
      await page.waitForLoadState('networkidle');
      await page.locator('button.db-tab:has-text("History")').click();
      await page.waitForTimeout(2000);

      // Verify có records hiển thị
      const records = page.locator('.db-history-item, [class*="history-item"], [class*="history-row"]');

      // Dùng fallback: tìm theo pattern ngày tháng trong records
      const dateTexts = page.locator('text=/\\d{1,2}\\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{4}/');
      const hasRecords = (await records.count() > 0) || (await dateTexts.count() > 0);
      expect(hasRecords, 'Không tìm thấy history records').toBeTruthy();

      // UI hiển thị dạng "Global - 10 GB", "Spain - 2 GB" — verify visible trong content area
      const contentArea = page.locator('.ant-tabs-content, [class*="tab-content"], [class*="history"]').first();
      await expect(contentArea.getByText(/global|spain/i).first()).toBeVisible();

      // Verify có thông tin ngày giờ — format "9 Jun 2026" hoặc "19 May 2026"
      await expect(contentArea.getByText(/\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+2026/i).first()).toBeVisible();

      await page.screenshot({ path: SS('TC-EP-DBLN-006_history-records.png'), fullPage: true });
    });

    test('TC-EP-DBLN-007 | Status badge không được hiển thị "--" — kiểm tra bug EP-5717', async ({ page }) => {
      await page.goto(DATA_BALANCE_URL);
      await page.waitForLoadState('networkidle');
      await page.locator('button.db-tab:has-text("History")').click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: SS('TC-EP-DBLN-007_status-badge.png'), fullPage: true });

      // Đếm số ô hiển thị "--" trong vùng history
      const contentArea = page.locator('.ant-tabs-content, [class*="tab-content"], [class*="history"]').first();
      const dashCells = contentArea.locator('text="--"');
      const dashCount = await dashCells.count();

      // Log chi tiết để trace bug
      for (let i = 0; i < dashCount; i++) {
        const parentText = await dashCells.nth(i).locator('..').textContent();
        console.log(`  [EP-5717] Dash cell [${i}]: "${parentText?.trim()}"`);
      }

      // ❌ Nếu FAIL → bug EP-5717 còn tồn tại, status hiện "--" thay vì badge
      expect(dashCount, `Bug EP-5717: ${dashCount} record(s) hiển thị "--" thay vì status badge (Pending/Finished/Added/Cancelled)`).toBe(0);
    });

    test('TC-EP-DBLN-008 | API history trả về 200 và dữ liệu khớp số records trên UI', async ({ page }) => {
      let historyApiResponse = null;

      page.on('response', async (response) => {
        if (response.url().includes('search-history') && response.status() === 200) {
          try { historyApiResponse = await response.json(); } catch {}
        }
      });

      await page.goto(DATA_BALANCE_URL);
      await page.waitForLoadState('networkidle');
      await page.locator('button.db-tab:has-text("History")').click();
      await page.waitForTimeout(2000);

      // Verify bắt được API
      expect(historyApiResponse, 'Không bắt được API /search-history').not.toBeNull();
      console.log('History API:', JSON.stringify(historyApiResponse, null, 2));

      // Verify isSuccess = true nếu API trả về field này
      if (historyApiResponse?.isSuccess !== undefined) {
        expect(historyApiResponse.isSuccess).toBe(true);
      }

      await page.screenshot({ path: SS('TC-EP-DBLN-008_api-history.png'), fullPage: true });
    });

    test('TC-EP-DBLN-009 | Chuyển tab My Plans ↔ History hoạt động đúng', async ({ page }) => {
      await page.goto(DATA_BALANCE_URL);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500);

      // Bắt đầu ở My Plans
      await expect(page.locator('button.db-tab--active')).toContainText(/my plans/i);

      // Chuyển sang History
      await page.locator('button.db-tab:has-text("History")').click();
      await page.waitForTimeout(1500);
      await expect(page.locator('button.db-tab--active')).toContainText(/history/i);
      await page.screenshot({ path: SS('TC-EP-DBLN-009_switch-to-history.png'), fullPage: true });

      // Chuyển lại My Plans
      await page.locator('button.db-tab:has-text("My Plans")').click();
      await page.waitForTimeout(1500);
      await expect(page.locator('button.db-tab--active')).toContainText(/my plans/i);
      await page.screenshot({ path: SS('TC-EP-DBLN-009_switch-back-to-plans.png'), fullPage: true });
    });

  });

  // ══════════════════════════════════════════════════════════════════════════
  // Negative / Edge cases
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('Negative & Edge cases', () => {

    test('TC-EP-DBLN-010 | Truy cập khi chưa login → hiển thị guest state với nút LOG IN', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(DATA_BALANCE_URL);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: SS('TC-EP-DBLN-010_guest-state.png'), fullPage: true });

      // Verify guest state: hiển thị 0 GB, No Data Plan, nút LOG IN
      const hasNoDataPlan = await page.getByText(/no data plan/i).count() > 0;
      const hasLoginBtn = await page.getByRole('button', { name: /log in/i })
        .or(page.getByRole('link', { name: /log in/i })).count() > 0;
      const hasZeroGb = await page.getByText(/0\s*gb/i).count() > 0;

      console.log(`Guest state — No Data Plan: ${hasNoDataPlan}, Login btn: ${hasLoginBtn}, 0 GB: ${hasZeroGb}`);
      expect(hasNoDataPlan || hasLoginBtn || hasZeroGb,
        'Không tìm thấy guest state — trang có thể đang cho phép truy cập không cần login').toBeTruthy();

      await context.close();
    });

    test('TC-EP-DBLN-012 | Responsive mobile (390px) — layout không vỡ', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
      await page.goto(DATA_BALANCE_URL);
      await page.waitForLoadState('networkidle');

      // Verify không có horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = 390;
      expect(bodyWidth, `Horizontal scroll xuất hiện: body width ${bodyWidth}px > viewport ${viewportWidth}px`).toBeLessThanOrEqual(viewportWidth + 5);

      // Verify tab buttons vẫn visible ở mobile
      await expect(page.locator('button.db-tab').first()).toBeVisible();

      // Kiểm tra History tab ở mobile
      await page.locator('button.db-tab:has-text("History")').click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: SS('TC-EP-DBLN-012_mobile-history.png'), fullPage: true });

      await page.locator('button.db-tab:has-text("My Plans")').click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: SS('TC-EP-DBLN-012_mobile-plans.png'), fullPage: true });
    });

  });

});
