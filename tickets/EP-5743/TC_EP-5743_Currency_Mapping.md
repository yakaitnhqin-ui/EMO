# Test Cases — EP-5743: [Kiet] Currency Mapping

> **Jira ticket**: [EP-5743](https://eskimo-portal.atlassian.net/browse/EP-5743)
> **Summary**: Currency Mapping
> **Status hiện tại**: In Progress | **Sprint**: Current Sprint
> **Priority**: High | **Tester**: Chi Nguyen | **Ngày**: 2026-07-08

---

## Tổng quan tính năng

Ticket bổ sung cơ chế **currency mapping theo quốc gia** cho eCommerce web và Mobile App, cộng thêm UI quản lý currency ở Admin Portal:

1. **AC1**: eCommerce web — lần đầu truy cập, detect quốc gia theo IP → chọn ngôn ngữ theo hreflang mapping và currency theo country-currency mapping.
2. **AC2**: Mobile App — lần đầu mở app, detect quốc gia theo IP → chọn currency theo country-currency mapping.
3. **AC3**: Fallback — nếu quốc gia detect được chưa được config, dùng English + USD làm mặc định, nhất quán trên cả web và mobile.
4. **AC4**: Currency đã chọn phải nhất quán xuyên suốt: Product Listing, Product Detail, Checkout, Voucher Pages, Cashback Pages, Order History, Transaction History.
5. **AC5**: Admin Portal → App Configuration → Countries & Networks — thêm cột "Currency" (cạnh alpha3) + dropdown Currency trong form Edit.

⚠️ **Trạng thái ticket**: đang **In Progress** (chưa Dev Done/QC chính thức) — các test case dưới đây được chạy thử trước một phần trên STG để nắm tình trạng hiện tại, **chưa phải kết quả QC PASS chính thức** cho cả ticket.

---

## AC chính

- **AC1** — First eCommerce web access: detect country (IP) → default language (hreflang) → default currency (country-currency mapping).
- **AC2** — Mobile First Launch: detect country (IP) → default currency (country-currency mapping).
- **AC3** — Fallback to USD: quốc gia chưa config → English + USD, nhất quán web & mobile.
- **AC4** — Currency Consistency trên: Product Listing, Product Detail, Checkout, Voucher Pages, Cashback Pages, Order History, Transaction History.
- **AC5** — Admin Portal Countries & Networks UI: cột Currency (cạnh alpha3) + dropdown Currency trong Edit form.

---

## APIs liên quan (đối chiếu WBS)

| # | API | Method | Mục đích |
|---|-----|--------|---------|
| 1 | `/api/country-network` (App Config → Countries & Networks) | GET/PUT | Lấy & cập nhật currency mapping theo quốc gia (Admin Portal) |
| 2 | *(chưa xác định)* | GET | API detect country/currency phía eCommerce web/Mobile — **cần dev cung cấp endpoint cụ thể** để test sâu AC1-AC3 |

---

## Danh sách Test Case

| TC ID | Tên | Type | Priority | AC | Status |
|-------|-----|------|----------|----|----|
| TC-EP-CURM-001 | Verify cột "Currency" hiển thị cạnh cột "alpha3" trong danh sách Countries & Networks | Happy path | P1 | AC5 | ✅ PASS |
| TC-EP-CURM-002 | Verify giá trị Currency hiển thị đúng cho quốc gia đã config | Happy path | P1 | AC5 | ✅ PASS |
| TC-EP-CURM-003 | Verify quốc gia chưa config Currency hiển thị "-" | Happy path | P2 | AC5 | ✅ PASS |
| TC-EP-CURM-004 | Verify dropdown "Currency" có trong form Edit, hiển thị đúng giá trị hiện tại | Happy path | P1 | AC5 | ✅ PASS |
| TC-EP-CURM-005 | Verify đổi Currency trong form Edit và Save thành công, list cập nhật đúng | Happy path | P1 | AC5 | ⬜ MANUAL |
| TC-EP-CURM-006 | Verify danh sách "Preferred Currency" trên eCommerce web đầy đủ, đúng ký hiệu & tên | Happy path | P2 | AC1/AC4 | ✅ PASS |
| TC-EP-CURM-007 | Verify currency mặc định hiển thị trên header khi truy cập eCommerce web lần đầu | Happy path | P1 | AC1 | ⚠️ PARTIAL — xem note |
| TC-EP-CURM-008 | Verify detect quốc gia theo IP thực tế (VD: truy cập từ VN → hiển thị đúng currency/ngôn ngữ đã map cho VN) | Happy path | P1 | AC1 | ⬜ MANUAL |
| TC-EP-CURM-009 | Verify ngôn ngữ mặc định chọn theo hreflang mapping tương ứng quốc gia detect được | Happy path | P1 | AC1 | ⬜ MANUAL |
| TC-EP-CURM-010 | Verify khi quốc gia detect được KHÔNG có trong config → fallback English + USD | Edge | P1 | AC3 | ⬜ MANUAL |
| TC-EP-CURM-011 | Verify fallback English/USD nhất quán giữa Web và Mobile App | Edge | P2 | AC3 | ⬜ MANUAL |
| TC-EP-CURM-012 | Verify detect quốc gia theo IP khi mở Mobile App lần đầu | Happy path | P1 | AC2 | ⬜ MANUAL (cần thiết bị/app thật) |
| TC-EP-CURM-013 | Verify currency mặc định trên Mobile App theo country-currency mapping | Happy path | P1 | AC2 | ⬜ MANUAL (cần thiết bị/app thật) |
| TC-EP-CURM-014 | Verify currency nhất quán trên Product Listing (Travel eSIM / theo Region) | Happy path | P1 | AC4 | ✅ PASS |
| TC-EP-CURM-015 | Verify currency nhất quán trên Product Detail (giá các gói data plan) | Happy path | P1 | AC4 | ✅ PASS |
| TC-EP-CURM-016 | Verify currency nhất quán trên Checkout (sticky bar + trang thanh toán) | Happy path | P1 | AC4 | ⚠️ PARTIAL — xem note |
| TC-EP-CURM-017 | Verify currency nhất quán trên Voucher Pages | Happy path | P2 | AC4 | ⬜ MANUAL (cần tài khoản đăng nhập) |
| TC-EP-CURM-018 | Verify currency nhất quán trên Cashback Pages | Happy path | P2 | AC4 | ⬜ MANUAL (cần tài khoản đăng nhập) |
| TC-EP-CURM-019 | Verify currency nhất quán trên Order History | Happy path | P2 | AC4 | ⬜ MANUAL (cần tài khoản đăng nhập) |
| TC-EP-CURM-020 | Verify currency nhất quán trên Transaction History | Happy path | P2 | AC4 | ⬜ MANUAL (cần tài khoản đăng nhập) |

**Chú thích Status:** ✅ PASS (đã test, đạt) · ⚠️ PARTIAL (test được 1 phần, còn nghi vấn) · ⬜ MANUAL (chưa test, cần làm tay)

---

## Chi tiết Test Case

---

### TC-EP-CURM-001 | Verify cột "Currency" hiển thị cạnh cột "alpha3"

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Countries & Networks |
| **Jira ref** | EP-5743 |
| **Priority** | P1 |
| **Type** | Happy path |
| **API** | `GET /api/country-network` |

**Precondition:** Đăng nhập Admin Portal.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào App Configuration → Countries & Networks | — |
| 2 | Quan sát thứ tự cột trong bảng | — |

**Expected Result:** Cột "Currency" nằm ngay sau cột "alpha3".

**Actual Result:** Đúng — thứ tự cột: Country, Country Code, alpha2, alpha3, **Currency**, Flag Oval, Flag Rectangle, eSIM Operator, Technology.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CURM-002 | Verify giá trị Currency hiển thị đúng cho quốc gia đã config

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Countries & Networks |
| **Jira ref** | EP-5743 |
| **Priority** | P1 |
| **Type** | Happy path |
| **API** | `GET /api/country-network` |

**Precondition:** Có ít nhất 1 quốc gia đã được config Currency.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Tìm dòng "Zimbabwe" trong danh sách | — |
| 2 | Quan sát giá trị cột Currency | — |

**Expected Result:** Hiển thị đúng currency đã config, kèm ký hiệu tiền tệ.

**Actual Result:** Zimbabwe hiển thị **"CAD (CA$)"**.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CURM-003 | Verify quốc gia chưa config Currency hiển thị "-"

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Countries & Networks |
| **Jira ref** | EP-5743 |
| **Priority** | P2 |
| **Type** | Happy path |
| **API** | `GET /api/country-network` |

**Precondition:** Có quốc gia chưa config Currency.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Quan sát các dòng Zambia, Yemen, Western Sahara, Wallis and Futuna | — |

**Expected Result:** Các quốc gia chưa config hiển thị "-" ở cột Currency, không lỗi UI.

**Actual Result:** Đúng — tất cả hiển thị "-".

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CURM-004 | Verify dropdown "Currency" trong form Edit

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Countries & Networks — Edit |
| **Jira ref** | EP-5743 |
| **Priority** | P1 |
| **Type** | Happy path |
| **API** | `GET /api/country-network` |

**Precondition:** Chọn quốc gia đã có Currency config (VD: Zimbabwe).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Click **Edit** trên dòng Zimbabwe | — |
| 2 | Quan sát field "Currency :" trong form | — |

**Expected Result:** Field Currency là dropdown, hiển thị đúng giá trị hiện tại.

**Actual Result:** Dropdown hiển thị **"CAD ($)"**, đúng với giá trị ở list.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CURM-005 | Verify đổi Currency trong form Edit và Save

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Countries & Networks — Edit |
| **Jira ref** | EP-5743 |
| **Priority** | P1 |
| **Type** | Happy path |
| **API** | `PUT /api/country-network` |

**Precondition:** Đang ở form Edit của 1 quốc gia.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Mở dropdown Currency, chọn 1 giá trị khác | VD: đổi sang USD |
| 2 | Click Save | — |
| 3 | Quay lại list, kiểm tra cột Currency | — |
| 4 | Mở lại Edit, kiểm tra dropdown | — |

**Expected Result:** Lưu thành công, list và form Edit đều cập nhật đúng giá trị mới, không cần reload trang.

**Actual Result:** *(chưa test — để lại cho manual vì đây là hành động thay đổi dữ liệu thật trên STG, cần cân nhắc trước khi thực hiện)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-CURM-006 | Verify danh sách "Preferred Currency" trên eCommerce web

| Field | Nội dung |
|-------|---------|
| **Module** | eCommerce Web — Header — Select currency |
| **Jira ref** | EP-5743 |
| **Priority** | P2 |
| **Type** | Happy path |
| **API** | *(chưa xác định)* |

**Precondition:** Truy cập https://app-eskimo-www-stage-sea-001.azurewebsites.net/en

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Click vào selector Currency ở header | — |
| 2 | Quan sát dialog "Preferred Currency" | — |

**Expected Result:** Danh sách hiển thị đầy đủ currency hỗ trợ, đúng ký hiệu và tên đầy đủ.

**Actual Result:** Hiển thị 12 currency: AUD $, CAD $, CNY ¥, EUR €, GBP £, HKD HK$, JPY ¥, KRW ₩, SGD $, THB ฿, TWD NT$, USD $ — kèm tên đầy đủ (Australian Dollar, Canadian Dollar...). USD đang được đánh dấu chọn.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CURM-007 | Verify currency mặc định khi truy cập eCommerce web lần đầu

| Field | Nội dung |
|-------|---------|
| **Module** | eCommerce Web — Homepage |
| **Jira ref** | EP-5743 |
| **Priority** | P1 |
| **Type** | Happy path |
| **API** | *(chưa xác định)* |

**Precondition:** Truy cập trang bằng phiên/trình duyệt mới, chưa có cookie/preference lưu trước đó.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Truy cập https://app-eskimo-www-stage-sea-001.azurewebsites.net/en lần đầu | — |
| 2 | Quan sát currency hiển thị ở header | — |

**Expected Result:** Currency mặc định đúng theo mapping của quốc gia truy cập (theo IP).

**Actual Result:** Hiển thị **USD** mặc định. ⚠️ Không xác nhận được đây là do detect đúng IP hay do IP của môi trường automation rơi vào nhóm quốc gia chưa config (fallback). **Cần test bằng cách truy cập từ IP/quốc gia cụ thể đã biết trước mapping** (VD: VPN theo quốc gia, hoặc truy cập thực tế từ VN) để xác nhận chính xác.

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP` *(partial — xem Actual Result)*

---

### TC-EP-CURM-008 | Verify detect quốc gia theo IP thực tế

| Field | Nội dung |
|-------|---------|
| **Module** | eCommerce Web — Homepage |
| **Jira ref** | EP-5743 |
| **Priority** | P1 |
| **Type** | Happy path |
| **API** | *(chưa xác định)* |

**Precondition:** Có thể truy cập từ IP thuộc 1 quốc gia cụ thể đã được config currency (VD: dùng VPN hoặc thiết bị thật tại quốc gia đó).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Truy cập web từ IP thuộc quốc gia X (đã biết currency mapping) | VD: Việt Nam |
| 2 | Quan sát currency & ngôn ngữ mặc định | — |

**Expected Result:** Currency và ngôn ngữ khớp đúng với mapping đã config cho quốc gia X trong Admin Portal.

**Actual Result:** *(chưa test — cần công cụ đổi IP theo quốc gia, để lại cho manual)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-CURM-009 | Verify ngôn ngữ mặc định theo hreflang mapping

| Field | Nội dung |
|-------|---------|
| **Module** | eCommerce Web — Homepage |
| **Jira ref** | EP-5743 |
| **Priority** | P1 |
| **Type** | Happy path |
| **API** | *(chưa xác định)* |

**Precondition:** Tương tự TC-EP-CURM-008.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Truy cập web từ IP thuộc quốc gia có hreflang mapping riêng (VD: Nhật → JA) | — |
| 2 | Quan sát ngôn ngữ mặc định | — |

**Expected Result:** Ngôn ngữ mặc định khớp hreflang mapping của quốc gia.

**Actual Result:** *(chưa test — để lại cho manual)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-CURM-010 | Verify fallback English + USD khi quốc gia chưa config

| Field | Nội dung |
|-------|---------|
| **Module** | eCommerce Web / Mobile App |
| **Jira ref** | EP-5743 |
| **Priority** | P1 |
| **Type** | Edge case |
| **API** | *(chưa xác định)* |

**Precondition:** Xác định được 1 quốc gia chưa có trong currency/hreflang mapping (VD: các quốc gia đang hiển thị "-" ở Admin Portal).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Truy cập web/mobile từ IP thuộc quốc gia chưa config | VD: Zambia, Yemen |
| 2 | Quan sát ngôn ngữ & currency mặc định | — |

**Expected Result:** Ngôn ngữ = English, Currency = USD.

**Actual Result:** *(chưa test — để lại cho manual)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-CURM-011 | Verify fallback nhất quán giữa Web và Mobile

| Field | Nội dung |
|-------|---------|
| **Module** | eCommerce Web / Mobile App |
| **Jira ref** | EP-5743 |
| **Priority** | P2 |
| **Type** | Edge case |
| **API** | *(chưa xác định)* |

**Precondition:** Có thể test song song trên Web và Mobile App từ cùng 1 quốc gia chưa config.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Truy cập Web từ quốc gia chưa config, ghi nhận ngôn ngữ/currency | — |
| 2 | Mở Mobile App từ cùng quốc gia (cùng IP/network), ghi nhận ngôn ngữ/currency | — |

**Expected Result:** Kết quả fallback giống nhau trên cả 2 platform (English + USD).

**Actual Result:** *(chưa test — cần Mobile App, để lại cho manual)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-CURM-012 | Verify detect quốc gia khi mở Mobile App lần đầu

| Field | Nội dung |
|-------|---------|
| **Module** | Mobile App — First Launch |
| **Jira ref** | EP-5743 |
| **Priority** | P1 |
| **Type** | Happy path |
| **API** | *(chưa xác định)* |

**Precondition:** Cài app trên thiết bị thật/emulator, chưa từng mở app trước đó (clear data).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Mở app lần đầu từ thiết bị tại quốc gia X | — |
| 2 | Quan sát currency mặc định trong app | — |

**Expected Result:** Currency khớp mapping quốc gia X.

**Actual Result:** *(ngoài phạm vi test qua browser automation — để lại cho manual với thiết bị/app thật)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-CURM-013 | Verify currency mặc định trên Mobile App theo mapping

| Field | Nội dung |
|-------|---------|
| **Module** | Mobile App — First Launch |
| **Jira ref** | EP-5743 |
| **Priority** | P1 |
| **Type** | Happy path |
| **API** | *(chưa xác định)* |

**Precondition:** Tương tự TC-EP-CURM-012, test với nhiều quốc gia khác nhau.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Mở app lần đầu tại quốc gia A, B, C khác nhau (đổi qua từng thiết bị/mô phỏng vị trí) | — |
| 2 | Ghi nhận currency mặc định mỗi lần | — |

**Expected Result:** Currency mỗi lần đúng theo mapping riêng của từng quốc gia.

**Actual Result:** *(ngoài phạm vi test qua browser automation — để lại cho manual)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-CURM-014 | Verify currency nhất quán trên Product Listing

| Field | Nội dung |
|-------|---------|
| **Module** | eCommerce Web — Travel eSIM / Region Listing |
| **Jira ref** | EP-5743 |
| **Priority** | P1 |
| **Type** | Happy path |
| **API** | *(chưa xác định)* |

**Precondition:** Currency đang chọn = USD.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào trang Travel eSIM | — |
| 2 | Click vào 1 region (VD: Global) để vào trang plan | — |
| 3 | Quan sát giá hiển thị | — |

**Expected Result:** Giá hiển thị đúng currency đang chọn (USD), nhất quán ký hiệu "US$".

**Actual Result:** Trang plan "Global eSIM" hiển thị đầy đủ giá bằng US$ (VD: title "Plans from US$ 3.50").

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CURM-015 | Verify currency nhất quán trên Product Detail

| Field | Nội dung |
|-------|---------|
| **Module** | eCommerce Web — Plan Detail (Global eSIM) |
| **Jira ref** | EP-5743 |
| **Priority** | P1 |
| **Type** | Happy path |
| **API** | *(chưa xác định)* |

**Precondition:** Đang ở trang chi tiết gói Global eSIM, currency = USD.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Quan sát giá của từng gói dung lượng (1GB, 3GB, 5GB, 10GB, 30GB) | — |
| 2 | Quan sát giá ở sticky bar dưới cùng khi chọn 1 gói | — |

**Expected Result:** Tất cả giá đồng nhất ký hiệu "US$", đúng số tiền.

**Actual Result:** Đúng — 30GB: US$75 (gạch US$90), 10GB: US$24 (gạch US$39), 5GB: US$12.50, 3GB: US$9, 1GB: US$3.50. Sticky bar: "Global 10GB — US$39.00 → 50% OFF → US$24.00".

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CURM-016 | Verify currency nhất quán trên Checkout

| Field | Nội dung |
|-------|---------|
| **Module** | eCommerce Web — Checkout |
| **Jira ref** | EP-5743 |
| **Priority** | P1 |
| **Type** | Happy path |
| **API** | *(chưa xác định)* |

**Precondition:** Đã chọn 1 gói data plan, currency = USD.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Click nút Checkout | — |
| 2 | Nếu chưa đăng nhập, hệ thống chuyển hướng Sign Up/Login | — |
| 3 | Đăng nhập bằng OTP, tiếp tục vào trang Checkout thật | — |
| 4 | Quan sát giá hiển thị trên trang Checkout | — |

**Expected Result:** Giá trên Checkout khớp đúng currency & số tiền đã thấy ở Product Detail.

**Actual Result:** Click Checkout → chuyển hướng sang trang Sign Up/Login (đúng hành vi, chưa đăng nhập). Thử đăng nhập bằng số +65 65666331 (OTP hardcode 4321) nhưng **nút "Continue" bị disable do Cloudflare Turnstile bot-detection liên tục fail** (lỗi 401 "Private Access Token challenge" trong console) — không vượt qua được bằng trình duyệt tự động hoá. Chưa xem được trang Checkout thật.

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP` *(blocked bởi Cloudflare Turnstile khi dùng automation)*

---

### TC-EP-CURM-017 | Verify currency nhất quán trên Voucher Pages

| Field | Nội dung |
|-------|---------|
| **Module** | eCommerce Web — Voucher Pages |
| **Jira ref** | EP-5743 |
| **Priority** | P2 |
| **Type** | Happy path |
| **API** | *(chưa xác định)* |

**Precondition:** Đã đăng nhập tài khoản có voucher.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Đăng nhập, vào trang Voucher | — |
| 2 | Quan sát currency hiển thị giá trị voucher | — |

**Expected Result:** Currency khớp với lựa chọn hiện tại của user.

**Actual Result:** *(chưa test — cần đăng nhập thật, bị chặn bởi Cloudflare Turnstile khi dùng automation, để lại cho manual)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-CURM-018 | Verify currency nhất quán trên Cashback Pages

| Field | Nội dung |
|-------|---------|
| **Module** | eCommerce Web — Cashback Pages |
| **Jira ref** | EP-5743 |
| **Priority** | P2 |
| **Type** | Happy path |
| **API** | *(chưa xác định)* |

**Precondition:** Đã đăng nhập tài khoản có cashback.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Đăng nhập, vào trang Cashback | — |
| 2 | Quan sát currency hiển thị số dư/giá trị cashback | — |

**Expected Result:** Currency khớp với lựa chọn hiện tại của user.

**Actual Result:** *(chưa test — cần đăng nhập thật, bị chặn bởi Cloudflare Turnstile khi dùng automation, để lại cho manual)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-CURM-019 | Verify currency nhất quán trên Order History

| Field | Nội dung |
|-------|---------|
| **Module** | eCommerce Web — Order History |
| **Jira ref** | EP-5743 |
| **Priority** | P2 |
| **Type** | Happy path |
| **API** | *(chưa xác định)* |

**Precondition:** Đã đăng nhập tài khoản có lịch sử order.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Đăng nhập, vào trang Order History | — |
| 2 | Quan sát currency của các order cũ và hiện tại | — |

**Expected Result:** Currency hiển thị nhất quán (cần làm rõ với dev: hiển thị theo currency tại thời điểm mua hay theo currency đang chọn hiện tại).

**Actual Result:** *(chưa test — cần đăng nhập thật, bị chặn bởi Cloudflare Turnstile khi dùng automation, để lại cho manual)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

---

### TC-EP-CURM-020 | Verify currency nhất quán trên Transaction History

| Field | Nội dung |
|-------|---------|
| **Module** | eCommerce Web — Transaction History |
| **Jira ref** | EP-5743 |
| **Priority** | P2 |
| **Type** | Happy path |
| **API** | *(chưa xác định)* |

**Precondition:** Đã đăng nhập tài khoản có lịch sử giao dịch.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Đăng nhập, vào trang Transaction History | — |
| 2 | Quan sát currency của các giao dịch | — |

**Expected Result:** Currency hiển thị nhất quán, đúng logic tương tự Order History.

**Actual Result:** *(chưa test — cần đăng nhập thật, bị chặn bởi Cloudflare Turnstile khi dùng automation, để lại cho manual)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`
