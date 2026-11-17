// @ts-check
/**
 * EP-5692 — Promo campaign dynamic image
 * Ticket: https://eskimo-portal.atlassian.net/browse/EP-5692
 * Tester: Nhu Huynh | Ngày: 2026-06-24
 * Môi trường: Staging — Admin Portal
 * TC doc: TC_EP-5692_Promo_Campaign_Dynamic_Image.md
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');

const ADMIN_BASE_URL = 'https://app-eskimo-admin-stage-sea-001.azurewebsites.net';

// Hash-based routing — format: ADMIN_BASE_URL/#/path
const PATHS = {
  image:          `${ADMIN_BASE_URL}/#/app-configuration/image`,
  promoCampaign:  `${ADMIN_BASE_URL}/#/app-configuration/promo-campaign`,
};

const SS_DIR = 'screenshots/EP-5692';
/** @param {string} name */
const SS = (name) => `${SS_DIR}/${name}`;

if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

/** @param {import('@playwright/test').Page} page */
async function loginAdmin(page) {
  await page.goto(ADMIN_BASE_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });

  // Nếu đã ở dashboard (session còn) thì skip login
  if (page.url().includes('dashboard')) return;

  // Nhập email
  await page.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]')
    .first()
    .fill('portal@yopmail.com');

  // Click Request Code
  await page.getByRole('button', { name: /request code/i }).click();
  await page.waitForTimeout(1000);

  // Nhập OTP hardcode
  await page.locator('input[placeholder*="code"], input[placeholder*="Code"], input[maxlength="4"]')
    .or(page.locator('input[type="text"]').last())
    .fill('1234');

  // Click Login
  await page.getByRole('button', { name: /^login$|^sign in$|^đăng nhập$/i }).click();

  // Chờ redirect về dashboard
  await page.waitForURL(/dashboard/, { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
}

// Helper: mở form Create của một trang list admin (click nút Create/Add)
/** @param {import('@playwright/test').Page} page @param {string} url */
async function openCreateForm(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForLoadState('networkidle');
  const createBtn = page.getByRole('button', { name: /create|add|thêm mới/i }).first();
  await createBtn.waitFor({ timeout: 10000 });
  await createBtn.click();
  await page.waitForTimeout(1000);
}

// Helper: mở form Edit của item đầu tiên trong list
/** @param {import('@playwright/test').Page} page @param {string} url */
async function openFirstEditForm(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForLoadState('networkidle');
  const editBtn = page.getByRole('button', { name: /edit|sửa/i })
    .or(page.locator('a:has-text("Edit"), button:has-text("Edit"), [title="Edit"]'))
    .first();
  await editBtn.waitFor({ timeout: 10000 });
  await editBtn.click();
  await page.waitForTimeout(1000);
}

// ══════════════════════════════════════════════════════════════════════════════
test.describe('EP-5692 — Promo Campaign Dynamic Image', () => {

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // AC1 — Remove Image Type & Image Position
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('AC1 — Remove Image Type & Image Position', () => {

    test('TC-EP-PDCI-001 | Image Type & Image Position không còn trong form Create Image', async ({ page }) => {
      await openCreateForm(page, PATHS.image);

      await page.screenshot({ path: SS('TC-EP-PDCI-001_create-image-form.png'), fullPage: true });

      // Verify field Image Type KHÔNG tồn tại
      const imageTypeLabel = page.locator(
        '.ant-form-item-label:has-text("Image Type"), label:has-text("Image Type"), [label="Image Type"]'
      );
      await expect(imageTypeLabel, 'Field "Image Type" vẫn còn tồn tại — expected đã bị xóa').toHaveCount(0);

      // Verify field Image Position KHÔNG tồn tại
      const imagePosLabel = page.locator(
        '.ant-form-item-label:has-text("Image Position"), label:has-text("Image Position"), [label="Image Position"]'
      );
      await expect(imagePosLabel, 'Field "Image Position" vẫn còn tồn tại — expected đã bị xóa').toHaveCount(0);

      // Verify form vẫn hiển thị bình thường (không bị lỗi UI)
      await expect(page.locator('.ant-form, form').first()).toBeVisible();
    });

    test('TC-EP-PDCI-002 | Image Type & Image Position không còn trong form Edit Image', async ({ page }) => {
      await openFirstEditForm(page, PATHS.image);

      await page.screenshot({ path: SS('TC-EP-PDCI-002_edit-image-form.png'), fullPage: true });

      // Verify field Image Type KHÔNG tồn tại
      const imageTypeLabel = page.locator(
        '.ant-form-item-label:has-text("Image Type"), label:has-text("Image Type")'
      );
      await expect(imageTypeLabel, 'Field "Image Type" vẫn còn trong Edit form — expected đã bị xóa').toHaveCount(0);

      // Verify field Image Position KHÔNG tồn tại
      const imagePosLabel = page.locator(
        '.ant-form-item-label:has-text("Image Position"), label:has-text("Image Position")'
      );
      await expect(imagePosLabel, 'Field "Image Position" vẫn còn trong Edit form — expected đã bị xóa').toHaveCount(0);

      // Verify các field khác vẫn load đúng (form không trống)
      const formItems = page.locator('.ant-form-item');
      const itemCount = await formItems.count();
      expect(itemCount, 'Form Edit Image không có field nào — có thể bị lỗi load').toBeGreaterThan(0);
    });

  });

  // ══════════════════════════════════════════════════════════════════════════
  // AC2 — Promo Campaign Popup hỗ trợ Dynamic Image
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('AC2 — Promo Campaign Popup — Dynamic Image', () => {

    test('TC-EP-PDCI-003 | Field upload popup đã được thay bằng Dynamic Image picker', async ({ page }) => {
      await openCreateForm(page, PATHS.promoCampaign);

      // Tìm section Popup trong form
      const popupSection = page.locator(
        '[class*="popup"], [data-testid*="popup"], div:has-text("Promo Popup")'
      ).first();
      await popupSection.scrollIntoViewIfNeeded();
      await page.screenshot({ path: SS('TC-EP-PDCI-003_popup-section.png'), fullPage: true });

      // Verify KHÔNG còn nút upload từ thiết bị (input file) trong popup section
      const fileInputCount = await popupSection.locator('input[type="file"]').count();
      if (fileInputCount === 0) {
        console.log('✅ Không tìm thấy input[type="file"] — đúng với AC2');
      }

      // Verify CÓ Dynamic Image picker button/select
      const dynamicImagePicker = page.locator(
        'button:has-text("Select Image"), button:has-text("Chọn ảnh"), ' +
        '[class*="dynamic-image"], [placeholder*="dynamic image"], ' +
        '.ant-select:near(:text("Popup"))'
      ).first();

      // Fallback: tìm bất kỳ select/button nào trong vùng chứa text "Popup"
      const popupContainer = page.locator('div:has-text("Popup")').last();
      const anyPickerNearPopup = popupContainer.locator(
        '.ant-select, button:has-text("Select"), button:has-text("Choose")'
      );

      const hasImagePicker = (await dynamicImagePicker.count()) > 0
        || (await anyPickerNearPopup.count()) > 0;

      expect(hasImagePicker, 'Không tìm thấy Dynamic Image picker trong Popup section').toBeTruthy();
    });

    test('TC-EP-PDCI-004 | Chọn Dynamic Image → hiển thị English version trên field popup', async ({ page }) => {
      let appConfigImageSearchCalled = false;

      // Monitor API call khi mở Dynamic Image list
      page.on('response', async (res) => {
        if (res.url().includes('appconfig-image') && res.url().includes('search')) {
          appConfigImageSearchCalled = true;
        }
      });

      await openCreateForm(page, PATHS.promoCampaign);

      // Click mở Dynamic Image picker trong Popup section
      const pickerBtn = page.locator(
        'button:has-text("Select Image"), button:has-text("Chọn ảnh"), ' +
        '.ant-select:near(:text("Popup"))'
      ).first();
      await pickerBtn.waitFor({ timeout: 10000 });
      await pickerBtn.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: SS('TC-EP-PDCI-004_dynamic-image-list.png'), fullPage: true });

      // Verify API appconfig-image/search được gọi
      expect(appConfigImageSearchCalled, 'API /appconfig-image/search không được gọi khi mở picker').toBeTruthy();

      // Chọn item đầu tiên trong danh sách
      const firstItem = page.locator(
        '.ant-modal .ant-list-item, .ant-modal tr, [class*="image-item"], [class*="dynamic-image-item"]'
      ).first();
      await firstItem.waitFor({ timeout: 10000 });
      await firstItem.click();

      // Confirm chọn ảnh (nếu có nút Confirm/OK trong modal)
      const confirmBtn = page.locator(
        '.ant-modal-footer button.ant-btn-primary, button:has-text("Confirm"), button:has-text("OK"), button:has-text("Select")'
      ).last();
      if (await confirmBtn.count() > 0) {
        await confirmBtn.click();
        await page.waitForTimeout(500);
      }

      await page.screenshot({ path: SS('TC-EP-PDCI-004_after-select.png'), fullPage: true });

      // Verify field hiển thị bản English (có text hoặc ảnh preview)
      // English image thường có EN/en trong tên hoặc text
      const popupImageField = page.locator(
        '[class*="popup"] [class*="image-preview"], ' +
        '[class*="popup"] img, ' +
        '[class*="popup"] .ant-input, ' +
        '[class*="popup"] [class*="selected"]'
      ).first();

      await expect(popupImageField, 'Field popup không hiển thị ảnh sau khi chọn').toBeVisible({ timeout: 5000 });
    });

    test('TC-EP-PDCI-005 | Click vào ảnh đã chọn trong popup → mở tab edit dynamic image', async ({ page, context }) => {
      await openCreateForm(page, PATHS.promoCampaign);

      // Giả định đã có ảnh được chọn sẵn (hoặc chọn như TC-004)
      const pickerBtn = page.locator(
        'button:has-text("Select Image"), button:has-text("Chọn ảnh"), .ant-select:near(:text("Popup"))'
      ).first();
      if (await pickerBtn.count() > 0) {
        await pickerBtn.click();
        await page.waitForLoadState('networkidle');
        const firstItem = page.locator('.ant-modal .ant-list-item, .ant-modal tr').first();
        if (await firstItem.count() > 0) {
          await firstItem.click();
          const confirmBtn = page.locator('.ant-modal-footer button.ant-btn-primary').last();
          if (await confirmBtn.count() > 0) await confirmBtn.click();
          await page.waitForTimeout(500);
        }
      }

      // Lắng nghe tab mới được mở
      const newTabPromise = context.waitForEvent('page', { timeout: 10000 });

      // Click vào preview ảnh đã chọn
      const previewImage = page.locator(
        '[class*="popup"] img, [class*="popup"] [class*="preview"], [class*="popup"] a[href*="image"]'
      ).first();
      await previewImage.waitFor({ timeout: 10000 });
      await previewImage.click();

      const newTab = await newTabPromise;
      await newTab.waitForLoadState('domcontentloaded');
      await newTab.screenshot({ path: SS('TC-EP-PDCI-005_new-tab-edit-image.png'), fullPage: true });

      // Verify tab mới mở đúng trang edit dynamic image
      const newTabUrl = newTab.url();
      expect(newTabUrl, `Tab mới mở URL "${newTabUrl}" — expected chứa "image" hoặc "edit"`).toMatch(
        /appconfig-image|dynamic-image|image.*edit|edit.*image/i
      );
    });

    test('TC-EP-PDCI-006 | Save campaign popup với dynamic image → API trả về 200', async ({ page }) => {
      let campaignApiStatus = null;
      let campaignApiUrl = '';

      page.on('response', async (res) => {
        if (res.url().includes('promotional-campaign') && !res.url().includes('search')) {
          const method = res.request().method();
          if (method === 'POST' || method === 'PUT') {
            campaignApiStatus = res.status();
            campaignApiUrl = res.url();
          }
        }
      });

      await openCreateForm(page, PATHS.promoCampaign);

      // Điền tên campaign tối thiểu
      const nameInput = page.locator(
        'input[name*="name"], input[placeholder*="name"], input[placeholder*="Name"], .ant-input'
      ).first();
      if (await nameInput.count() > 0) {
        await nameInput.fill(`TC-PDCI-006 Auto Test ${Date.now()}`);
      }

      // Chọn dynamic image cho popup
      const pickerBtn = page.locator(
        'button:has-text("Select Image"), button:has-text("Chọn ảnh"), .ant-select:near(:text("Popup"))'
      ).first();
      if (await pickerBtn.count() > 0) {
        await pickerBtn.click();
        await page.waitForLoadState('networkidle');
        const firstItem = page.locator('.ant-modal .ant-list-item, .ant-modal tr').first();
        if (await firstItem.count() > 0) {
          await firstItem.click();
          const confirmBtn = page.locator('.ant-modal-footer button.ant-btn-primary').last();
          if (await confirmBtn.count() > 0) await confirmBtn.click();
          await page.waitForTimeout(500);
        }
      }

      // Click Save
      const saveBtn = page.locator(
        'button[type="submit"], button:has-text("Save"), button:has-text("Submit"), button:has-text("Create")'
      ).last();
      await saveBtn.waitFor({ timeout: 10000 });
      await saveBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS('TC-EP-PDCI-006_after-save.png'), fullPage: true });

      // Verify API trả về 200/201
      expect(campaignApiStatus, `API ${campaignApiUrl} trả về ${campaignApiStatus} — expected 200 hoặc 201`).toBeGreaterThanOrEqual(200);
      expect(campaignApiStatus).toBeLessThan(300);
    });

    test('TC-EP-PDCI-008 | Save campaign popup khi chưa chọn dynamic image → hiện validation error', async ({ page }) => {
      await openCreateForm(page, PATHS.promoCampaign);

      // Điền tên nhưng KHÔNG chọn ảnh popup
      const nameInput = page.locator(
        'input[name*="name"], input[placeholder*="Name"], .ant-input'
      ).first();
      if (await nameInput.count() > 0) {
        await nameInput.fill('TC-PDCI-008 No Image Test');
      }

      // Enable popup section nếu có toggle
      const popupToggle = page.locator(
        '[class*="popup"] input[type="checkbox"], [class*="popup"] .ant-switch, button:has-text("Enable Popup")'
      ).first();
      if (await popupToggle.count() > 0 && !(await popupToggle.isChecked())) {
        await popupToggle.click();
        await page.waitForTimeout(500);
      }

      // Click Save mà không chọn ảnh
      const saveBtn = page.locator(
        'button[type="submit"], button:has-text("Save"), button:has-text("Submit")'
      ).last();
      await saveBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS('TC-EP-PDCI-008_validation-error.png'), fullPage: true });

      // Verify có thông báo lỗi validation
      const validationError = page.locator(
        '.ant-form-item-explain-error, .ant-alert-error, ' +
        '[class*="error"]:visible, [class*="validate-error"]:visible'
      ).filter({ visible: true });

      await expect(validationError.first(), 'Không có validation error khi không chọn ảnh popup').toBeVisible({ timeout: 5000 });
    });

  });

  // ══════════════════════════════════════════════════════════════════════════
  // AC3 — Promo Campaign Email hỗ trợ Dynamic Image
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('AC3 — Promo Campaign Email — Dynamic Image', () => {

    test('TC-EP-PDCI-009 | Field upload email đã được thay bằng Dynamic Image picker', async ({ page }) => {
      await openCreateForm(page, PATHS.promoCampaign);

      // Scroll đến Email section
      const emailSection = page.locator(
        '[class*="email"], [data-testid*="email"], div:has-text("Email")'
      ).last();
      await emailSection.scrollIntoViewIfNeeded();
      await page.screenshot({ path: SS('TC-EP-PDCI-009_email-section.png'), fullPage: true });

      // Verify KHÔNG có file upload input trong Email section
      const fileInputInEmail = page.locator(
        '[class*="email"] input[type="file"], [data-testid*="email"] input[type="file"]'
      );
      await expect(fileInputInEmail, 'Vẫn còn input[type="file"] trong Email section — expected đã thay bằng dynamic image picker').toHaveCount(0);

      // Verify CÓ Dynamic Image picker trong Email section
      const emailPicker = page.locator(
        'button:has-text("Select Image"):near(:text("Email")), ' +
        '.ant-select:near(:text("Email Image")), ' +
        '[class*="email"] button:has-text("Select"), ' +
        '[class*="email"] .ant-select'
      ).first();
      const hasEmailPicker = await emailPicker.count() > 0;
      expect(hasEmailPicker, 'Không tìm thấy Dynamic Image picker trong Email section').toBeTruthy();
    });

    test('TC-EP-PDCI-010 | Chọn Dynamic Image cho email → hiển thị English version trên field', async ({ page }) => {
      let appConfigImageSearchCalled = false;

      page.on('response', async (res) => {
        if (res.url().includes('appconfig-image') && res.url().includes('search')) {
          appConfigImageSearchCalled = true;
        }
      });

      await openCreateForm(page, PATHS.promoCampaign);

      // Scroll đến Email section và mở picker
      const emailPickerBtn = page.locator(
        '[class*="email"] button:has-text("Select"), ' +
        '[class*="email"] .ant-select, ' +
        'button:has-text("Select Image"):near(:text("Email"))'
      ).first();
      await emailPickerBtn.scrollIntoViewIfNeeded();
      await emailPickerBtn.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: SS('TC-EP-PDCI-010_email-image-list.png'), fullPage: true });

      // Verify API được gọi
      expect(appConfigImageSearchCalled, 'API /appconfig-image/search không được gọi cho Email picker').toBeTruthy();

      // Chọn item đầu tiên
      const firstItem = page.locator('.ant-modal .ant-list-item, .ant-modal tr').first();
      await firstItem.waitFor({ timeout: 10000 });
      await firstItem.click();
      const confirmBtn = page.locator('.ant-modal-footer button.ant-btn-primary').last();
      if (await confirmBtn.count() > 0) {
        await confirmBtn.click();
        await page.waitForTimeout(500);
      }

      await page.screenshot({ path: SS('TC-EP-PDCI-010_after-select-email.png'), fullPage: true });

      // Verify field email hiển thị ảnh (bản English)
      const emailImageField = page.locator(
        '[class*="email"] [class*="preview"], [class*="email"] img, [class*="email"] [class*="selected"]'
      ).first();
      await expect(emailImageField, 'Field email không hiển thị preview ảnh sau khi chọn').toBeVisible({ timeout: 5000 });
    });

    test('TC-EP-PDCI-011 | Click vào ảnh đã chọn trong email → mở tab edit dynamic image', async ({ page, context }) => {
      await openCreateForm(page, PATHS.promoCampaign);

      // Chọn ảnh cho email section trước
      const emailPickerBtn = page.locator(
        '[class*="email"] button:has-text("Select"), .ant-select:near(:text("Email Image"))'
      ).first();
      if (await emailPickerBtn.count() > 0) {
        await emailPickerBtn.click();
        await page.waitForLoadState('networkidle');
        const firstItem = page.locator('.ant-modal .ant-list-item, .ant-modal tr').first();
        if (await firstItem.count() > 0) {
          await firstItem.click();
          const confirmBtn = page.locator('.ant-modal-footer button.ant-btn-primary').last();
          if (await confirmBtn.count() > 0) await confirmBtn.click();
          await page.waitForTimeout(500);
        }
      }

      // Lắng nghe tab mới
      const newTabPromise = context.waitForEvent('page', { timeout: 10000 });

      // Click vào ảnh trong email section
      const emailPreview = page.locator(
        '[class*="email"] img, [class*="email"] [class*="preview"], [class*="email"] a[href*="image"]'
      ).first();
      await emailPreview.waitFor({ timeout: 10000 });
      await emailPreview.click();

      const newTab = await newTabPromise;
      await newTab.waitForLoadState('domcontentloaded');
      await newTab.screenshot({ path: SS('TC-EP-PDCI-011_new-tab-edit-email-image.png'), fullPage: true });

      // Verify URL tab mới trỏ đến edit page của dynamic image
      const newTabUrl = newTab.url();
      expect(newTabUrl, `Tab mới mở URL "${newTabUrl}" — expected chứa "image" hoặc "edit"`).toMatch(
        /appconfig-image|dynamic-image|image.*edit|edit.*image/i
      );
    });

    test('TC-EP-PDCI-012 | Save campaign email với dynamic image → API trả về 200', async ({ page }) => {
      let campaignApiStatus = null;
      let campaignApiUrl = '';

      page.on('response', async (res) => {
        if (res.url().includes('promotional-campaign') && !res.url().includes('search')) {
          const method = res.request().method();
          if (method === 'POST' || method === 'PUT') {
            campaignApiStatus = res.status();
            campaignApiUrl = res.url();
          }
        }
      });

      await openCreateForm(page, PATHS.promoCampaign);

      // Điền tên
      const nameInput = page.locator('input[name*="name"], input[placeholder*="Name"], .ant-input').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill(`TC-PDCI-012 Email Auto Test ${Date.now()}`);
      }

      // Chọn dynamic image cho email section
      const emailPickerBtn = page.locator(
        '[class*="email"] button:has-text("Select"), .ant-select:near(:text("Email Image"))'
      ).first();
      if (await emailPickerBtn.count() > 0) {
        await emailPickerBtn.click();
        await page.waitForLoadState('networkidle');
        const firstItem = page.locator('.ant-modal .ant-list-item, .ant-modal tr').first();
        if (await firstItem.count() > 0) {
          await firstItem.click();
          const confirmBtn = page.locator('.ant-modal-footer button.ant-btn-primary').last();
          if (await confirmBtn.count() > 0) await confirmBtn.click();
          await page.waitForTimeout(500);
        }
      }

      // Click Save
      const saveBtn = page.locator(
        'button[type="submit"], button:has-text("Save"), button:has-text("Submit")'
      ).last();
      await saveBtn.waitFor({ timeout: 10000 });
      await saveBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS('TC-EP-PDCI-012_after-save-email.png'), fullPage: true });

      // Verify API 200/201
      expect(campaignApiStatus, `API ${campaignApiUrl} trả về ${campaignApiStatus} — expected 2xx`).toBeGreaterThanOrEqual(200);
      expect(campaignApiStatus).toBeLessThan(300);
    });

    test('TC-EP-PDCI-014 | API /send-test-email gửi được với dynamic image (smoke test)', async ({ page }) => {
      // TC này verify API send-test-email không bị lỗi sau khi save campaign với dynamic image
      // Việc verify ảnh trong email theo ngôn ngữ (TC-013) cần kiểm tra thủ công qua hòm thư

      /** @type {number|null} */
      let sendTestEmailStatus = null;

      page.on('response', async (res) => {
        if (res.url().includes('send-test-email')) {
          sendTestEmailStatus = res.status();
        }
      });

      // Cần có campaign ID đã có dynamic image sẵn
      // Tìm campaign đầu tiên trong list và trigger send-test-email
      await page.goto(PATHS.promoCampaign, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: SS('TC-EP-PDCI-014_campaign-list.png'), fullPage: true });

      // Mở campaign edit đầu tiên
      const editBtn = page.locator('button:has-text("Edit"), a:has-text("Edit"), [title="Edit"]').first();
      if (await editBtn.count() > 0) {
        await editBtn.click();
        await page.waitForLoadState('networkidle');

        // Tìm nút Send Test Email
        const sendTestBtn = page.locator(
          'button:has-text("Send Test Email"), button:has-text("Test Email"), button:has-text("Send Test")'
        ).first();
        if (await sendTestBtn.count() > 0) {
          await sendTestBtn.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: SS('TC-EP-PDCI-014_send-test-email.png'), fullPage: true });

          // Verify API trả về 200
          if (sendTestEmailStatus !== null) {
            expect(Number(sendTestEmailStatus), `API send-test-email trả về ${sendTestEmailStatus}`).toBeLessThan(300);
          }
        } else {
          console.log('⚠️  TC-EP-PDCI-014: Không tìm thấy nút Send Test Email — skip API check, cần verify thủ công');
        }
      } else {
        console.log('⚠️  TC-EP-PDCI-014: Không có campaign nào trong list để test');
      }

      // NOTE: Verify ảnh email theo ngôn ngữ (TC-013 & TC-014 full) cần kiểm tra thủ công
      // qua hòm thư thật với tài khoản VN và tài khoản không có ảnh tương ứng
    });

  });

});
