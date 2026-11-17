# Test Cases — EP-5884: [Lâm][Admin] Add "Percentage of Corporate Work Account Data Plan Purchase" Commission Scheme (Network Corporate program Partner)

> **Jira ticket**: [EP-5884](https://eskimo-portal.atlassian.net/browse/EP-5884)
> **Summary**: Thêm commission scheme mới cho Network Partner: % trên Data Plan Purchase của Corporate Work Account
> **Status hiện tại**: QC | **Priority**: High | **Tester**: Chi Nguyen | **Ngày**: 2026-08-07
> **BE link**: [EA-4175](https://eskimoapi.atlassian.net/browse/EA-4175)
> **Test partner**: *chưa xác định* — cần 1 Network Partner có Network Program bật, liên kết với ít nhất 1 Corporate Partner có Work Account đang active và có Data Plan để mua/nhận. Xem ghi chú "Dữ liệu test cần chuẩn bị" bên dưới.

---

## Tổng quan tính năng

Bổ sung 1 commission scheme mới cho **Network Partner** trong chương trình Corporate: **"Percentage of Corporate Work Account Data Plan Purchase (%)"**. Khi bật, Network Partner nhận hoa hồng mỗi khi Work Account (thuộc Corporate Partner nằm dưới Network đó) mua/nhận Data Plan qua Direct Payment, Credit, hoặc Partner Top Up. Tỷ lệ hoa hồng được cấu hình riêng theo từng Data Plan (field mới **"Network Partner Commission (%)"**) tại phần Work Account Data Plan Discount trong Corporate Program Setup.

**Vị trí:** Admin Portal → Partnership → Partner Detail → Network Program (AC1) và Corporate Program Setup → Work Account Data Plan Discount (AC2).

---

## AC chính

- **AC1**: Thêm option scheme "Percentage of Corporate Work Account Data Plan Purchase (%)" cho Network Program. Công thức: `Commission = Original Data Plan Price × Network Partner Commission Rate`. Áp dụng cho giao dịch Direct Payment, Credit, Partner Top Up. Khi chọn scheme này, ẩn field percentage cũ trên UI.
- **AC2**: Thêm field optional **"Network Partner Commission (%)"** trong Work Account Data Plan Discount config, range 0–99%, có thể để trống. Corporate Program cũ mặc định blank sau release. Commission chỉ phát sinh khi CẢ HAI điều kiện đúng: Network Owner đã bật scheme AC1 cho Corporate Partner đó, VÀ rate đã cấu hình cho đúng Data Plan đó. Payout theo hierarchy/rules đã định nghĩa ở [EP-4399](https://eskimo-portal.atlassian.net/browse/EP-4399).

**Ghi chú kỹ thuật (comment Jira 2026-07-29):**
- Scheme marker: `networkAffiliateSetting.partners[].isCorporateWorkAccountDataPlanPurchaseCommissionEnabled` (boolean, nullable)
- Rate áp dụng chung: `corporateSetting.networkPartnerCommissionPercentage` (decimal, nullable)
- Rate riêng theo plan: `corporateSetting.plans[].networkPartnerCommissionPercentage` (decimal, nullable)
- Chỉ 1 Corporate Network commission scheme được chọn tại 1 thời điểm; khi đổi scheme, FE phải gửi marker cũ về `null` (khuyến nghị) hoặc `false`.

---

## APIs liên quan (đối chiếu WBS)

| # | API | Method | Mục đích |
|---|-----|--------|---------|
| 1 | `/api/partner/v2` | PUT | Lưu scheme selection (AC1) và Network Partner Commission rate theo plan (AC2) — nested trong payload partner, không có endpoint riêng trong WBS |
| 2 | `/api/partner/v2/{partnerId}` | GET | Lấy chi tiết partner — đối chiếu `networkAffiliateSetting`/`corporateSetting` đã lưu đúng chưa |
| 3 | `/api/data-plan/corporate/get-purchase-discount` | POST | Lấy config discount/commission theo từng Data Plan trong Corporate Program Setup |
| 4 | `/api/network-affiliate-transaction/search` | POST | Tra cứu giao dịch commission Network đã phát sinh — đối chiếu số tiền = Original Price × Rate |
| 5 | `/api/partner/corporate/purchase-credit` | POST | Trigger mua Credit (1 trong 3 loại giao dịch tính commission) |
| 6 | `/api/partner/corporate/users/{userId}/top-up` | POST | Trigger Partner Top Up cho Work Account (1 trong 3 loại giao dịch tính commission) |
| 7 | *(ngoài WBS)* Data Plan purchase — Direct Payment | POST | Luồng mua trực tiếp phía ecommerce/Work Account, không nằm trong WBS Partnership — cần xác nhận endpoint khi test |

> Lưu ý: WBS chưa có dòng riêng cho "Corporate Program Setup" / "Work Account Data Plan Discount" — có khả năng đây là 1 phần payload lồng trong Partner v2 (API #1, #2) chứ không phải endpoint độc lập. Cần xác nhận lại qua DevTools khi thao tác UI thật.

---

## Danh sách Test Case

| TC ID | Tên | Type | Priority | AC | Status |
|-------|-----|------|----------|----|--------|
| TC-EP-NCC-001 | Verify chọn scheme mới → field percentage cũ bị ẩn | Happy path | P1 | AC1 | Chưa test |
| TC-EP-NCC-002 | Verify chỉ 1 Corporate Network scheme được chọn tại 1 thời điểm | Happy path | P1 | AC1 | Chưa test |
| TC-EP-NCC-003 | Verify đổi sang scheme khác → marker scheme cũ gửi về null/false | Edge | P2 | AC1 | Chưa test |
| TC-EP-NCC-004 | Verify field "Network Partner Commission (%)" hiển thị optional trong Work Account Data Plan Discount | Happy path | P1 | AC2 | Chưa test |
| TC-EP-NCC-005 | Verify validation range 0–99% (boundary 0, 99) | Edge | P1 | AC2 | Chưa test |
| TC-EP-NCC-006 | Verify reject giá trị ngoài range (âm, ≥100, không phải số) | Negative | P1 | AC2 | Chưa test |
| TC-EP-NCC-007 | Verify field có thể để trống (optional) và lưu thành công | Happy path | P2 | AC2 | Chưa test |
| TC-EP-NCC-008 | Verify Corporate Program cũ (tạo trước release) có field mặc định blank | Happy path | P2 | AC2 | Chưa test |
| TC-EP-NCC-009 | Verify commission phát sinh đúng công thức khi Work Account mua Data Plan bằng Direct Payment | Happy path | P1 | AC1/AC2 | Chưa test |
| TC-EP-NCC-010 | Verify commission phát sinh đúng công thức khi mua bằng Credit | Happy path | P1 | AC1/AC2 | Chưa test |
| TC-EP-NCC-011 | Verify commission phát sinh đúng khi nhận Data Plan qua Partner Top Up | Happy path | P1 | AC1/AC2 | Chưa test |
| TC-EP-NCC-012 | Verify KHÔNG phát sinh commission khi Network Owner chưa bật scheme (dù rate đã cấu hình) | Negative | P1 | AC2 | Chưa test |
| TC-EP-NCC-013 | Verify KHÔNG phát sinh commission khi rate chưa cấu hình cho Data Plan đó (dù scheme đã bật) | Negative | P1 | AC2 | Chưa test |
| TC-EP-NCC-014 | Verify các Data Plan khác nhau áp dụng đúng rate riêng của từng plan | Edge | P2 | AC2 | Chưa test |

---

## Chi tiết Test Case

---

### TC-EP-NCC-001 | Verify chọn scheme mới → field percentage cũ bị ẩn

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Partner Detail — Network Program |
| **Jira ref** | EP-5884 (AC1) |
| **Priority** | P1 |
| **Type** | Happy path |

**Precondition:** Có Network Partner test, option Corporate đang cấu hình 1 scheme khác (có field percentage hiển thị).

**Test Steps:**
1. Admin Portal → Partnership → Partner Detail (Network Partner) → tab Network Program.
2. Ở phần Corporate, chọn scheme **"Percentage of Corporate Work Account Data Plan Purchase (%)"**.
3. Quan sát field percentage cũ.

**Expected Result:** Field percentage cũ bị ẩn ngay khi chọn scheme mới, đúng UI trong ticket.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-NCC-002 | Verify chỉ 1 Corporate Network scheme được chọn tại 1 thời điểm

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Partner Detail — Network Program |
| **Jira ref** | EP-5884 (AC1, comment kỹ thuật) |
| **Priority** | P1 |
| **Type** | Happy path |

**Test Steps:**
1. Chọn scheme "Percentage of Corporate Work Account Data Plan Purchase (%)".
2. Kiểm tra các scheme Corporate khác (nếu có) có bị disable/uncheck tự động không.

**Expected Result:** Chỉ 1 scheme được active tại 1 thời điểm — chọn scheme mới tự bỏ chọn scheme cũ.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-NCC-003 | Verify đổi sang scheme khác → marker scheme cũ gửi về null/false

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Network Program (kiểm tra qua DevTools payload) |
| **Jira ref** | EP-5884 (comment kỹ thuật) |
| **Priority** | P2 |
| **Type** | Edge |

**Test Steps:**
1. Bật scheme mới, save.
2. Mở lại, đổi sang scheme khác (VD: Percent of Credit Top Up Value), save.
3. Bắt request PUT `/api/partner/v2` bằng DevTools.

**Expected Result:** Payload có `isCorporateWorkAccountDataPlanPurchaseCommissionEnabled: null` (hoặc `false`) khi không còn chọn scheme này; field scheme mới active = true/giá trị tương ứng.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-NCC-004 | Verify field "Network Partner Commission (%)" hiển thị optional trong Work Account Data Plan Discount

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Corporate Program Setup — Work Account Data Plan Discount |
| **Jira ref** | EP-5884 (AC2) |
| **Priority** | P1 |
| **Type** | Happy path |

**Test Steps:**
1. Vào Corporate Program Setup của 1 Corporate Partner test.
2. Mở phần cấu hình Work Account Data Plan Discount.
3. Quan sát field mới "Network Partner Commission (%)".

**Expected Result:** Field xuất hiện, không có dấu bắt buộc (*), có thể submit form khi để trống.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-NCC-005 | Verify validation range 0–99% (boundary 0, 99)

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Corporate Program Setup |
| **Jira ref** | EP-5884 (AC2) |
| **Priority** | P1 |
| **Type** | Edge |

**Test Steps:**
1. Nhập `0` vào field Network Partner Commission (%), save.
2. Nhập `99`, save.

**Expected Result:** Cả 2 giá trị boundary được chấp nhận và lưu thành công.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-NCC-006 | Verify reject giá trị ngoài range (âm, ≥100, không phải số)

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Corporate Program Setup |
| **Jira ref** | EP-5884 (AC2) |
| **Priority** | P1 |
| **Type** | Negative |

**Test Steps:**
1. Nhập `100`, quan sát validation.
2. Nhập `-5`, quan sát validation.
3. Nhập ký tự chữ (nếu field không tự chặn input), quan sát validation.

**Expected Result:** Tất cả bị chặn/hiện lỗi, không cho save với giá trị ngoài khoảng 0–99.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-NCC-007 | Verify field có thể để trống (optional) và lưu thành công

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Corporate Program Setup |
| **Jira ref** | EP-5884 (AC2) |
| **Priority** | P2 |
| **Type** | Happy path |

**Test Steps:**
1. Để trống field Network Partner Commission (%), save toàn bộ Work Account Data Plan Discount config.

**Expected Result:** Save thành công, không có lỗi required field.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-NCC-008 | Verify Corporate Program cũ (tạo trước release) có field mặc định blank

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Corporate Program Setup |
| **Jira ref** | EP-5884 (AC2) |
| **Priority** | P2 |
| **Type** | Happy path |

**Precondition:** Cần 1 Corporate Program đã tồn tại từ trước khi feature này release lên môi trường test.

**Test Steps:**
1. Mở Corporate Program Setup của 1 partner cũ (đã có trước release).
2. Kiểm tra field Network Partner Commission (%).

**Expected Result:** Field hiển thị blank/empty; các config khác giữ nguyên không đổi.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

**Note / Evidence:** Cần xác định được 1 Corporate Program "cũ" trên môi trường test — nếu STG đã seed lại toàn bộ data thì có thể không phân biệt được cũ/mới, cần hỏi Dev/BA cách xác nhận.

---

### TC-EP-NCC-009 | Verify commission phát sinh đúng công thức khi Work Account mua Data Plan bằng Direct Payment

| Field | Nội dung |
|-------|---------|
| **Module** | End-to-end: Work Account purchase flow → Admin Network commission report |
| **Jira ref** | EP-5884 (AC1) |
| **Priority** | P1 |
| **Type** | Happy path |

**Precondition:** Network Partner đã bật scheme mới cho Corporate Partner test; Data Plan đã cấu hình Network Partner Commission Rate (VD 10%).

**Test Steps:**
1. Đăng nhập Work Account thuộc Corporate Partner test.
2. Mua 1 Data Plan bằng Direct Payment, ghi nhận Original Data Plan Price.
3. Vào Admin Portal → tra cứu Network commission (API #4) theo Corporate Partner/Work Account vừa giao dịch.

**Expected Result:** Xuất hiện 1 record commission mới, số tiền = Original Data Plan Price × Rate đã cấu hình.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-NCC-010 | Verify commission phát sinh đúng công thức khi mua bằng Credit

| Field | Nội dung |
|-------|---------|
| **Module** | End-to-end: Work Account purchase flow (Credit) → Admin Network commission report |
| **Jira ref** | EP-5884 (AC1) |
| **Priority** | P1 |
| **Type** | Happy path |

**Test Steps:** Tương tự TC-EP-NCC-009, nhưng chọn phương thức thanh toán **Credit** thay vì Direct Payment.

**Expected Result:** Commission phát sinh đúng công thức, giống hành vi Direct Payment.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-NCC-011 | Verify commission phát sinh đúng khi nhận Data Plan qua Partner Top Up

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Worker/Work Account Top-up → Admin Network commission report |
| **Jira ref** | EP-5884 (AC1) |
| **Priority** | P1 |
| **Type** | Happy path |

**Test Steps:**
1. Từ Admin/Partner Portal, thực hiện Partner Top Up Data Plan cho Work Account test (API #6).
2. Tra cứu Network commission report.

**Expected Result:** Commission phát sinh đúng công thức, giống 2 luồng thanh toán trên.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-NCC-012 | Verify KHÔNG phát sinh commission khi Network Owner chưa bật scheme (dù rate đã cấu hình)

| Field | Nội dung |
|-------|---------|
| **Module** | End-to-end |
| **Jira ref** | EP-5884 (AC2) |
| **Priority** | P1 |
| **Type** | Negative |

**Precondition:** Data Plan đã có Network Partner Commission Rate cấu hình, nhưng Network Owner CHƯA bật scheme "Percentage of Corporate Work Account Data Plan Purchase (%)".

**Test Steps:** Thực hiện mua Data Plan (Direct Payment) từ Work Account, sau đó tra cứu Network commission report.

**Expected Result:** Không có commission nào phát sinh cho Network Partner.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-NCC-013 | Verify KHÔNG phát sinh commission khi rate chưa cấu hình cho Data Plan đó (dù scheme đã bật)

| Field | Nội dung |
|-------|---------|
| **Module** | End-to-end |
| **Jira ref** | EP-5884 (AC2) |
| **Priority** | P1 |
| **Type** | Negative |

**Precondition:** Scheme đã bật ở Network Program, nhưng Data Plan cụ thể được mua KHÔNG có Network Partner Commission Rate cấu hình (để trống).

**Test Steps:** Mua Data Plan này từ Work Account, tra cứu Network commission report.

**Expected Result:** Không có commission nào phát sinh.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-NCC-014 | Verify các Data Plan khác nhau áp dụng đúng rate riêng của từng plan

| Field | Nội dung |
|-------|---------|
| **Module** | End-to-end |
| **Jira ref** | EP-5884 (AC2) |
| **Priority** | P2 |
| **Type** | Edge |

**Precondition:** 2 Data Plan khác nhau (VD Plan A rate 5%, Plan B rate 20%) cùng thuộc Corporate Partner test.

**Test Steps:** Mua lần lượt Plan A và Plan B từ Work Account, đối chiếu commission mỗi lần.

**Expected Result:** Mỗi giao dịch tính đúng theo rate riêng của Data Plan tương ứng — Plan A × 5%, Plan B × 20%.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

## Dữ liệu test cần chuẩn bị

Trước khi execute bộ test case này, cần xác nhận/chuẩn bị trên môi trường test (STG):

1. **1 Network Partner** có Network Program active, đứng trên ít nhất 1 Corporate Partner.
2. **1 Corporate Partner** thuộc Network trên, có Corporate Program Setup, có ít nhất **2 Data Plan** khác nhau để test TC-014 (rate khác nhau).
3. **1 Work Account** active thuộc Corporate Partner, có thể thực hiện cả 3 loại giao dịch: Direct Payment, Credit, Partner Top Up.
4. Xác nhận cách xem **Network commission report** trong Admin Portal (khả năng ở Partnership → Affiliate → Network tab, dựa theo API `/api/network-affiliate-transaction/search`) để đối chiếu số tiền commission.
5. 1 Corporate Program **đã tồn tại trước khi feature release** trên STG (cho TC-EP-NCC-008) — nếu không có sẵn, note SKIP và giải thích lý do.

**Đề xuất:** Nhờ Dev/BA cung cấp hoặc trỏ tới bộ data có sẵn (partner ID cụ thể) thay vì tự tạo mới từ đầu, để tránh lệch với cách BE đã seed/test nội bộ.

---

## Feedback cho BA (2026-08-19)

Ghi nhận từ thực tế setup test (Network Partner **UGC** → Corporate Partner **Corporate - QC**, PN613866 / PN539085), xác nhận đúng rủi ro "AND-gate 2 module không có cảnh báo" đã note ở flow diagram (mục Rủi ro QC phía trên). 3 điểm cần BA confirm/clarify:

1. **Ticket dễ đọc nhầm thành "chỉ setup 1 phía".** 3 scheme Network Affiliate cũ chỉ cần cấu hình tại Network Program của partner cha (chọn scheme + nhập rate) là xong. Scheme thứ 4 (EP-5884) lại yêu cầu **2 bước bắt buộc ở 2 partner khác nhau**: (a) chọn scheme "Percentage of Corporate Work Account Data Plan Purchase (%)" ở Network Program của partner cha, VÀ (b) vào Corporate Program Setup của partner con set "Network Partner Commission (%)" theo từng Data Plan. AC1/AC2 không nêu rõ đây là 2 bước tách biệt bắt buộc — dễ hiểu nhầm theo pattern 3 scheme cũ.
2. **Field "Network Partner Commission (%)" hiện ra cho MỌI Corporate Partner**, không lọc theo việc partner đó có thuộc Network nào hay không. Với Corporate Partner không có Network owner phía trên, field này không có tác dụng nhưng vẫn hiển thị trong Work Account Data Plan Discount — dễ gây nhầm admin tưởng phải điền, hoặc để trống mà không hiểu vì sao. Cần hỏi: field này có nên chỉ hiện khi partner thuộc 1 Network, hay giữ hiển thị luôn (cho linh hoạt gắn Network sau) nhưng cần tooltip giải thích rõ điều kiện áp dụng?
3. **Thiếu tooltip điều hướng ở bước 1 (Network Program, partner cha).** Khi Network Owner chọn scheme thứ 4, nên có tooltip/note ngay tại đó nhắc: phải qua Corporate Program Setup của Corporate Partner để cấu hình rate theo Data Plan, nếu không commission sẽ không phát sinh (hệ thống không báo lỗi gì khi thiếu bước này — xem TC-EP-NCC-012/013).

**Trạng thái:** Đã đưa 3 điểm này cho BA, chờ confirm hướng xử lý (update AC / update UI hay chỉ là note vận hành).
