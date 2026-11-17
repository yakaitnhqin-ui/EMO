# TC_EP-5991 – [Admin] Configure White Label under Corporate Program

| | |
|---|---|
| **Jira** | [EP-5991](https://eskimo-portal.atlassian.net/browse/EP-5991) |
| **Summary** | [Admin] Configure White Label under Corporate Program in partnership |
| **Status Jira** | QC |
| **Sprint** | (chưa xác nhận) |
| **Priority** | Medium |
| **Tester** | Nhu Huynh |
| **Ngày** | 12/10/2026 |
| **Bug liên quan** | EP-6055 (White Label config thiếu field AC), EP-6073 (không disable được White Label khi save) |

## 1. Feature overview

| Hạng mục | Nội dung |
|---|---|
| Thay đổi | Admin cấu hình Corporate Program **Type = White label**: Status, Start/End Date, Eskimo Email Notification, Application Fee %, Payment Method, Data Expiry, Stripe Connect status |
| Phạm vi | Admin Portal → Partnership → Partners → Edit → Corporate Program; ảnh hưởng quyền truy cập White Label website/API của Partner |
| Vị trí ảnh hưởng | Admin Portal, Partner Portal (My Website), API `/api/white-label/websites/mine`, checkout (fee) |
| Ngoài phạm vi | Network Partner Commission (%) không áp dụng cho White Label |

## 2. Related APIs

| Endpoint | Method | Mục đích |
|---|---|---|
| `/api/partner/search` | POST | Tìm partner test |
| `/api/partner/v2/{id}` | GET / PUT | Đọc/lưu `corporateSetting` (paymentMethod, isEskimoEmailNotificationEnabled, ngày, hasCorporate) |
| `/api/payment/connect/partners/{id}/fee` | PUT | Lưu `platformFeePercent` / `clearOverride` |
| `/api/payment/connect` | POST | Tạo onboarding link Stripe Connect |
| `/api/white-label/websites`, `/websites/{id}`, `/websites/mine` | GET | Website của partner, `stripeConnect`, kiểm tra truy cập |

> Chưa đối chiếu được với WBS (`docs/wbs_eskimo_updated.md`) trong phiên này. Cần rà lại.

## 3. Danh sách test case

| TC ID | Tên | Loại | Ưu tiên | AC |
|---|---|---|---|---|
| TC-EP-WLC-001 | Form Corporate Program (White label) hiển thị đủ field | Happy path | P1 | AC1 |
| TC-EP-WLC-002 | Dropdown Data Expiry (2 Years / No Expiry) hiển thị và lưu được | Happy path | P1 | AC1 |
| TC-EP-WLC-003 | Network Partner Commission (%) không hiển thị với White label | Negative | P2 | AC1 |
| TC-EP-WLC-004 | Payment Method lưu đúng: Direct Charge = 0, Eskimo Stripe Pay = 1 | Happy path | P1 | AC1 |
| TC-EP-WLC-005 | Stripe Connect status hiển thị đúng (Not Connected / Verified) | Happy path | P2 | AC1 |
| TC-EP-WLC-006 | Partner Portal → My Website bắt đầu được Stripe onboarding | Happy path | P2 | AC1 |
| TC-EP-WLC-007 | Eskimo Email Notification mặc định = False | Happy path | P1 | AC2 |
| TC-EP-WLC-008 | Eskimo Email Notification True/False lưu đúng | Happy path | P1 | AC2 |
| TC-EP-WLC-009 | Validate Application Fee %: 100, abc, -5, 12.345 bị chặn; 0, 90, 99.99 hợp lệ | Negative | P1 | AC3 |
| TC-EP-WLC-010 | Fee 90% lưu, mở lại vẫn 90, công thức Fee/Partner Benefit đúng | Happy path | P1 | AC3 |
| TC-EP-WLC-011 | Để trống fee → dùng default 10% (clearOverride) | Edge | P2 | AC3 |
| TC-EP-WLC-012 | Partner White label mới: giá trị pre-fill của Application Fee | Edge | P3 | AC3 |
| TC-EP-WLC-013 | Trước Start Date: Partner không truy cập được WL website/API | Negative | P1 | AC4 |
| TC-EP-WLC-014 | Sau End Date: Partner không truy cập được WL website/API | Negative | P1 | AC4 |
| TC-EP-WLC-015 | Admin tắt Status (Disabled) và Save thành công | Happy path | P1 | AC4 |
| TC-EP-WLC-016 | Status Disabled: Partner không truy cập được WL website/API | Negative | P1 | AC4 |
| TC-EP-WLC-017 | Bật lại chương trình: toàn bộ cấu hình cũ được giữ nguyên | Happy path | P1 | AC4 |
| TC-EP-WLC-018 | Chương trình hợp lệ (Status ON, trong Start–End): Partner truy cập được | Happy path | P1 | AC4 |

## 4. Chi tiết test case

Cột **Kết quả STG (12/10)** là kết quả tôi chạy thật. Cột **Tham chiếu báo cáo** lấy từ *Ticket EP-5991 – E2E Test Report* (12/10/2026 09:42, môi trường QA/stage API, user duc.trant), chưa tự kiểm chứng lại.

**Precondition chung:** Admin login (Admin STG `app-eskimo-admin-stage-sea-001`, `portal@yopmail.com`, OTP 1234). Partner test **WLBe2e (PN847236)**, Corporate Program đã bật, Type = White label, có 1 WL website. Partner Portal login `wlbe2e@yopmail.com`.

### TC-EP-WLC-001 – Form Corporate Program hiển thị đủ field
- **Steps:** Partners → WLBe2e → Edit → cuộn tới Corporate Program.
- **Expected:** Có Status, Type = White label (khoá sau khi confirm), Start/End Date, Eskimo Email Notification, section **Application Fee Percentage** (không phải "Discount Benefit"), Fee type Percentage (%), Payment Method (Direct Charge / Eskimo Stripe Pay), Stripe Connect status.
- **Actual (STG):** Form vẫn là bản cũ: có **Discount Benefit** (Apply To / Discount = No Discount), **Network Partner Commission (%)**, **Lifetime Account Limit**, Payment method = *Direct Credit Top Up*. Không có Application Fee, Email Notification, Stripe Connect, Data Expiry. Xem `STG_AC1_drawer_old_form.png`.
- **Status:** ❌ Fail trên STG (build EP-5991 có vẻ chưa deploy lên STG, hoặc dính EP-6055).
- **Tham chiếu báo cáo:** các field trên có đủ, trừ Data Expiry.
- **Defect:** EP-6055

### TC-EP-WLC-002 – Data Expiry dropdown
- **Steps:** Mở Corporate Program (White label); GET `/api/partner/v2/{id}` xem `corporateSetting`.
- **Expected:** Dropdown 2 Years / No Expiry; chọn → Save → GET có field lưu giá trị.
- **Actual (STG):** Không có dropdown.
- **Status:** ❌ Fail
- **Tham chiếu báo cáo:** UI không có dropdown, BE `corporateSetting` không có field data-expiry (2.1, 2.2).
- **Defect:** EP-6055

### TC-EP-WLC-003 – Network Partner Commission không hiển thị
- **Expected:** Với Type White label, ô Network Partner Commission (%) ẩn.
- **Actual (STG):** Ô **đang hiển thị** (placeholder "insert number (optional, 0-99)").
- **Status:** ❌ Fail trên STG
- **Tham chiếu báo cáo:** Ẩn đúng.

### TC-EP-WLC-004 – Payment Method persistence
- **Steps:** Chọn Direct Charge → Save → GET; chọn Eskimo Stripe Pay → Save → GET.
- **Expected:** `corporateSetting.paymentMethod` = 0 / 1. Note: Eskimo Stripe Pay chưa có tác dụng ở checkout (CLARIFY).
- **Actual (STG):** Chưa chạy (dropdown hiện là "Direct Credit Top Up", không có 2 option này).
- **Status:** ⏸ Blocked
- **Tham chiếu báo cáo:** Pass (2.3–2.5).

### TC-EP-WLC-005 – Stripe Connect status
- **Expected (AC):** chưa kết nối → "Not Connected"; đã verify → "Verified".
- **Actual (STG):** Chưa chạy (không có field).
- **Status:** ⏸ Blocked
- **Tham chiếu báo cáo:** Deployed dùng tag Not connected / Setup incomplete / Pending verification / Connected / Disconnected. **Khác wording AC**, cần BA xác nhận (CLARIFY).

### TC-EP-WLC-006 – Stripe onboarding từ Partner Portal
- **Steps:** Login Partner Portal → My Website → Continue setup.
- **Expected:** POST `/api/payment/connect` 200, có `onboardingUrl`.
- **Status:** ⏸ Blocked (không có Partner Portal STG trong phiên này)
- **Tham chiếu báo cáo:** Pass (2.8, 2.9).

### TC-EP-WLC-007 / 008 – Eskimo Email Notification
- **Steps:** 007: partner mới → đọc giá trị. 008: bật → Save → GET; tắt → Save → GET.
- **Expected:** Mặc định false; true/false lưu đúng. True: Eskimo gửi mail xác nhận + QR; False: Eskimo không gửi.
- **Status:** ⏸ Blocked trên STG (không có toggle)
- **Tham chiếu báo cáo:** Pass (3.1–3.3). Việc gửi mail thật chưa tự kiểm chứng.

### TC-EP-WLC-009 – Validate Application Fee %
- **Steps:** Nhập lần lượt 100, 99.99, 12.345, 0, 90, abc, -5.
- **Expected:** 100 / abc / -5 báo "Fee must be at least 0 and less than 100"; 12.345 báo "Value should contain just number" (tối đa 2 số thập phân); 0, 90, 99.99 hợp lệ.
- **Status:** ⏸ Blocked trên STG
- **Tham chiếu báo cáo:** Pass (4.1–4.2).

### TC-EP-WLC-010 – Fee 90% lưu và công thức
- **Steps:** Fee = 90 → Save → mở lại; GET website `stripeConnect.platformFeePercent`.
- **Expected:** PUT `/fee` `{platformFeePercent:90}`; mở lại hiện 90; Fee = giá × 90%, Partner = giá × 10% (100 → 90/10; 4.5 → 4.05/0.45; 12.99 → 11.69/1.30; 59 → 53.10/5.90).
- **Status:** ⏸ Blocked trên STG
- **Tham chiếu báo cáo:** Pass (4.3–4.5). Số tiền thực tế trên giao dịch chưa tự kiểm chứng.

### TC-EP-WLC-011 – Fee trống → default 10%
- **Expected:** PUT `/fee` `{clearOverride:true}`; `platformFeePercent` = null; hiển thị "10 (default)".
- **Status:** ⏸ Blocked trên STG
- **Tham chiếu báo cáo:** Pass (4.6–4.7).

### TC-EP-WLC-012 – Pre-fill fee khi tạo WL partner mới
- **Expected:** Trống, placeholder "Leave empty to use the default fee (10%)".
- **Tham chiếu báo cáo:** Pre-fill "0" → lưu `percentCorporateDiscount`=0, `platformFeePercent` null (CLARIFY, cần BA chốt).
- **Status:** ⏸ Blocked trên STG

### TC-EP-WLC-013 / 014 – Trước Start Date / sau End Date
- **Steps:** Đặt Start Date tương lai (hoặc End Date quá khứ) qua PUT `/api/partner/v2`; Partner JWT gọi `/api/white-label/websites/mine`; mở `/#/my-website-cms`.
- **Expected:** Partner bị chặn.
- **Status:** ⏸ Blocked trên STG
- **Tham chiếu báo cáo:** ❌ Fail: `/mine` vẫn 200, My Website vẫn mở. Giữ cấu hình sau khi bật lại thì pass (5.2, 5.5).

### TC-EP-WLC-015 – Admin tắt Status và Save
- **Steps:** Tắt Status Corporate Program → Confirm → Save.
- **Expected:** Save thành công, `hasCorporate = false`.
- **Status:** ⏸ Blocked trên STG
- **Tham chiếu báo cáo:** ❌ Fail: PUT `/api/partner/v2` trả 400 "Corporate type cannot be updated." (FE gửi `corporateSetting: null`; BE chỉ chấp nhận khi giữ corporateSetting).
- **Defect:** EP-6073

### TC-EP-WLC-016 – Status Disabled thì Partner bị chặn
- **Tham chiếu báo cáo:** ❌ Fail: `/mine` vẫn 200.
- **Status:** ⏸ Blocked trên STG (cũng phụ thuộc TC-015)

### TC-EP-WLC-017 – Bật lại giữ nguyên cấu hình
- **Expected:** Start/End, fee, email, payment method không đổi.
- **Status:** ⏸ Blocked trên STG
- **Tham chiếu báo cáo:** Pass (5.2, 5.5, 5.12).

### TC-EP-WLC-018 – Chương trình hợp lệ, Partner truy cập được
- **Expected:** `/mine` trả website; My Website mở.
- **Status:** ⏸ Blocked trên STG
- **Tham chiếu báo cáo:** Pass (5.7, 5.8).

## 5. Tổng kết lần chạy 12/10/2026

| | Số lượng |
|---|---|
| Đã chạy thật trên STG | 3 (TC-001, 002, 003), **cả 3 Fail** |
| Blocked trên STG | 15 |
| Kết quả tham chiếu từ báo cáo E2E | 18 case; Fail: 002, 013, 014, 015, 016 (cùng các GAP của EP-6055 / EP-6073); CLARIFY: 005, 012 và Eskimo Stripe Pay |

**Loại trừ cache:** đã xóa Cache Storage/service worker và tải lại bằng `?nocache=`, bundle mới (`main.39be623f.chunk.js`), drawer WLBe2e vẫn hiện form cũ (Discount Benefit, NPC, không có Application Fee / Email Notification / Stripe Connect / Data Expiry).

**Kết luận:** Admin STG chưa có giao diện White Label mới của EP-5991, nên chưa thể chạy các case còn lại ở đây. Báo cáo E2E được chạy ở môi trường khác (QA). Cần xác nhận build/môi trường có EP-5991 trước khi chạy tiếp, vì các case AC2–AC4 sửa dữ liệu partner WLBe2e.
