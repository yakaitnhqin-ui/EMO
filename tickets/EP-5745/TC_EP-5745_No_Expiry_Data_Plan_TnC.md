# TC_EP-5745 — [No Expiry Data Plan] Update Term & Condition

| Trường | Nội dung |
|--------|---------|
| **Jira** | [EP-5745](https://eskimo-portal.atlassian.net/browse/EP-5745) |
| **Tóm tắt** | [No Expiry Data Plan] Update Term & Condition |
| **Trạng thái ticket** | QC |
| **Sprint** | Sprint 98 (active) |
| **Priority** | High |
| **Tester** | Nhu Huynh |
| **Ngày test** | 2026-07-08 |
| **Ticket liên quan** | Sub-task [EP-5746](https://eskimo-portal.atlassian.net/browse/EP-5746) — [FE] No-Expiry Data Plan · BE ref: EA-4069 (eskimoapi.atlassian.net, khác workspace) |
| **Tài liệu tham chiếu** | Attachment Jira: `No Expiry - New Policy.docx` (nội dung T&C mới — cần mở trực tiếp trong Jira để đối chiếu từng chữ, không thể tự động tải qua MCP) |

> ⚠️ File `No Expiry - New Policy.docx` đính kèm trong ticket không thể fetch tự động (yêu cầu auth Atlassian). Trước khi test AC-4, **tải thủ công file này từ Jira** để đối chiếu wording chính xác với nội dung hiển thị trên UI.

---

## Tổng quan tính năng

| Hạng mục | Nội dung |
|----------|---------|
| **Thay đổi** | Thay đổi chính sách hết hạn (expiry) của Data Plan: Data Plan mua sau 01/06/2026 sẽ **không có ngày hết hạn** (No-Expiry). Data lot phát hành trước 01/06/2026 giữ hạn 2 năm cho tới khi có purchase mới → khi đó convert toàn bộ sang No-Expiry. Trạng thái No-Expiry được giữ nguyên khi transfer data. Cập nhật nội dung Terms & Condition tương ứng. |
| **Phạm vi** | eCommerce site / Mobile App — trang mua Data Plan, My Data/Data Balance, Transfer Data, trang Terms & Condition. Admin Portal — quản lý nội dung Content Page (T&C). |
| **Vị trí ảnh hưởng** | Purchase flow (point-of-purchase confirm screen), Data Balance / My Plans, Transfer Data flow, trang T&C (web + app), Admin CMS Content Page |
| **AC chính** | AC-1: No-Expiry cho plan mua sau 01/06/2026 · AC-2: Giữ hạn 2 năm cho lot cũ tới khi có purchase mới → convert toàn bộ · AC-3: Transfer giữ nguyên No-Expiry, kéo theo convert plan còn lại của người nhận · AC-4: Update nội dung T&C |
| **Note phạm vi QC** | AC-1/2/3 là logic nghiệp vụ chủ yếu do BE xử lý (EA-4069, khác Jira project/workspace) — QC tại đây tập trung verify **kết quả hiển thị trên UI + response API** phía Eskimo Portals. Logic tính toán chi tiết ở BE nên cross-check thêm với team BE nếu phát hiện sai lệch. |

---

## API liên quan

| # | Endpoint | Method | Mục đích |
|---|----------|--------|---------|
| 1 | `/api/data-plan-sale-transaction/search-by-user` | POST | Lấy lịch sử/transaction mua plan của user, kiểm tra field expiry sau khi mua |
| 2 | `/api/Esims/add-data-plan/{id}` | POST | Thêm data plan vào eSIM sau khi mua — kiểm tra expiry trả về |
| 3 | `/api/Esims/transfer-data-plan` | POST | Transfer data plan giữa 2 user — kiểm tra No-Expiry status sau transfer |
| 4 | `/api/Esims/cancel-data-plan/{id}` | POST | Cancel data plan (dùng để dựng lại state test nếu cần) |
| 5 | `/api/Esims/extend-subscription-expire-date-by-user-data-plan` | POST | Extend expiry — kiểm tra hành vi khi áp dụng lên plan đã No-Expiry |
| 6 | `/api/data-plan/details/{dataplanIdOrSlug}` | GET | Chi tiết data plan, đối chiếu field expiry hiển thị |
| 7 | `/api/data-wallet` (hoặc tương đương) | GET | Số dư + danh sách lot data hiện có của user, kiểm tra expiry từng lot |
| 8 | `/api/content-page/customer` | GET | Lấy nội dung Content Page (T&C) hiển thị cho customer — verify nội dung mới |
| 9 | `/api/content-page` | PUT | Admin cập nhật nội dung Content Page T&C |
| 10 | `/api/content-page/detail/{requestId}` | GET | Admin xem chi tiết content page T&C hiện tại |

---

## Danh sách test case

| TC ID | Tên | Loại | Priority | AC |
|-------|-----|------|----------|----|
| TC-EP-NOEXP-001 | Mua Fixed Data Plan mới sau 01/06/2026 → không có ngày hết hạn | Happy path | P1 | AC1 |
| TC-EP-NOEXP-002 | API response sau khi mua trả về đúng field/flag No-Expiry | Happy path | P1 | AC1 |
| TC-EP-NOEXP-003 | Loại plan không phải Fixed Data Plan → hành vi expiry không bị ảnh hưởng ngoài ý muốn | Edge | P2 | AC1 |
| TC-EP-NOEXP-004 | Lot issued trước 01/06/2026, chưa mua gì mới → vẫn giữ hạn 2 năm | Happy path | P1 | AC2 |
| TC-EP-NOEXP-005 | Mua paid plan mới → TẤT CẢ lot cũ (paid+free) convert ngay sang No-Expiry | Happy path | P1 | AC2 |
| TC-EP-NOEXP-006 | Point-of-purchase screen hiển thị disclosure conversion trước khi confirm | Happy path | P1 | AC2 |
| TC-EP-NOEXP-007 | Account chỉ có free lot cũ → mua paid mới → free lot cũng được convert | Edge | P2 | AC2 |
| TC-EP-NOEXP-008 | User hủy purchase (không confirm) → lot cũ KHÔNG bị convert | Negative | P1 | AC2 |
| TC-EP-NOEXP-009 | API danh sách data plan trả đúng flag No-Expiry sau khi convert | Happy path | P1 | AC2 |
| TC-EP-NOEXP-010 | Transfer data No-Expiry từ User A → User B giữ nguyên No-Expiry | Happy path | P1 | AC3 |
| TC-EP-NOEXP-011 | Sau transfer, toàn bộ plan còn hạn 2 năm khác của User B cũng convert sang No-Expiry | Happy path | P1 | AC3 |
| TC-EP-NOEXP-012 | User B chưa có plan nào trước khi nhận transfer No-Expiry | Edge | P2 | AC3 |
| TC-EP-NOEXP-013 | Transfer data còn hạn 2 năm bình thường (không phải No-Expiry) → không tự convert ngoài phạm vi AC3 | Negative | P2 | AC3 |
| TC-EP-NOEXP-014 | API transfer-data-plan trả đúng expiry status cho cả 2 account | Happy path | P1 | AC3 |
| TC-EP-NOEXP-015 | Trang T&C hiển thị nội dung mới đúng theo file đính kèm | Happy path | P1 | AC4 |
| TC-EP-NOEXP-016 | Nội dung T&C cập nhật đúng ở các ngôn ngữ khác (nếu đa ngôn ngữ) | Edge | P2 | AC4 |
| TC-EP-NOEXP-017 | API `content-page/customer` trả về nội dung T&C đã update | Happy path | P2 | AC4 |
| TC-EP-NOEXP-018 | Admin chỉnh sửa/xem nội dung T&C qua CMS Content Page | Happy path | P2 | AC4 |

---

## Chi tiết test case

---

### TC-EP-NOEXP-001 | Mua Fixed Data Plan mới sau 01/06/2026 → không có ngày hết hạn

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:**
- Đã đăng nhập tài khoản test (chưa có Fixed Data Plan nào, hoặc không quan trọng)
- Ngày hệ thống hiện tại sau 01/06/2026 (mặc định đúng vì hôm nay là 2026-07-08)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Đăng nhập, vào trang mua Data Plan | eSIM/Fixed Data Plan bất kỳ |
| 2 | Chọn 1 Fixed Data Plan và hoàn tất mua | VD: Spain 2GB |
| 3 | Vào My Data → Data Balance, quan sát plan vừa mua | |
| 4 | Kiểm tra thông tin ngày hết hạn hiển thị trên UI | |

**Expected Result:**
- Plan vừa mua hiển thị **không có ngày hết hạn** (VD: "No Expiry" / ẩn hoàn toàn field ngày hết hạn thay vì hiển thị ngày cụ thể)
- Không hiển thị nhầm "Expires on ..." như trước đây

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NOEXP-002 | API response sau khi mua trả về đúng field/flag No-Expiry

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Có thể mở DevTools Network khi thực hiện mua plan

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Mở DevTools Network | |
| 2 | Thực hiện mua 1 Fixed Data Plan mới | |
| 3 | Tìm API call `add-data-plan` hoặc data-plan-sale-transaction liên quan | |
| 4 | Kiểm tra response body | |

**Expected Result:**
- HTTP 200, `isSuccess: true`
- Field expiry (VD: `expiredDate`, `expiryDate`) trả về `null` hoặc flag riêng (VD: `isNoExpiry: true`) xác nhận No-Expiry
- Không có ngày hết hạn dạng "+2 years" như policy cũ

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NOEXP-003 | Loại plan không phải Fixed Data Plan → hành vi expiry không bị ảnh hưởng ngoài ý muốn

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC1 |

**Precondition:** Hệ thống có loại plan khác Fixed (VD: Unlimited/theo ngày) để so sánh

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Mua 1 plan KHÔNG thuộc loại Fixed Data Plan | VD: Unlimited plan |
| 2 | Kiểm tra thông tin hết hạn của plan này | |

**Expected Result:**
- AC-1 chỉ áp dụng cho **Fixed Data Plan** → các loại plan khác vẫn giữ nguyên logic expiry hiện có (không bị regression, không bị áp nhầm No-Expiry hoặc ngược lại)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Nếu hệ thống không có loại plan nào khác Fixed, đánh dấu SKIP và ghi chú lý do.

---

### TC-EP-NOEXP-004 | Lot issued trước 01/06/2026, chưa mua gì mới → vẫn giữ hạn 2 năm

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Cần tài khoản test có sẵn data lot (paid hoặc free) được issue **trước 01/06/2026** — cần phối hợp BE/DB để seed data test này vì ngày hiện tại đã qua mốc.

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Đăng nhập account có lot cũ (issued trước 01/06/2026) | |
| 2 | Không thực hiện mua thêm plan nào | |
| 3 | Vào Data Balance, kiểm tra ngày hết hạn của lot cũ | |
| 4 | Gọi API lấy danh sách data wallet, kiểm tra field expiry | |

**Expected Result:**
- Lot cũ vẫn hiển thị hạn dùng 2 năm kể từ ngày issue (không tự động convert sang No-Expiry)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Cần data test đặc thù — liên hệ BE để seed account có lot issue trước cutover date.

---

### TC-EP-NOEXP-005 | Mua paid plan mới → TẤT CẢ lot cũ (paid+free) convert ngay sang No-Expiry

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Account test có ≥2 lot cũ (issue trước 01/06/2026), gồm cả paid và free, còn hạn 2 năm

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Đăng nhập account có lot cũ như trên | |
| 2 | Kiểm tra hạn dùng hiện tại của các lot (trước khi mua) | |
| 3 | Thực hiện mua 1 paid Data Plan mới và confirm | |
| 4 | Ngay sau khi purchase confirm thành công, vào lại Data Balance | |
| 5 | Kiểm tra hạn dùng của TẤT CẢ lot cũ (paid + free) | |

**Expected Result:**
- Ngay tại thời điểm purchase được confirm, TẤT CẢ lot cũ trên account (cả paid lẫn free) chuyển sang trạng thái **No-Expiry**
- Plan vừa mua cũng là No-Expiry (theo AC1)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NOEXP-006 | Point-of-purchase screen hiển thị disclosure conversion trước khi confirm

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Account test có ít nhất 1 lot cũ (issue trước 01/06/2026) còn hạn 2 năm

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Đăng nhập account có lot cũ | |
| 2 | Chọn 1 paid plan để mua, đi tới màn hình xác nhận (point-of-purchase) | |
| 3 | Quan sát nội dung màn hình TRƯỚC khi bấm Confirm/Pay | |

**Expected Result:**
- Màn hình xác nhận mua hiển thị rõ thông báo/disclosure rằng việc mua sẽ khiến các data plan hiện có được chuyển sang No-Expiry
- Nội dung thông báo dễ hiểu, hiển thị trước khi user confirm (không phải sau khi đã thanh toán)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Đối chiếu wording với file `No Expiry - New Policy.docx` nếu có nội dung liên quan.

---

### TC-EP-NOEXP-007 | Account chỉ có free lot cũ → mua paid mới → free lot cũng được convert

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC2 |

**Precondition:** Account test chỉ có free data lot (không có paid lot) issue trước 01/06/2026

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Đăng nhập account chỉ có free lot cũ | |
| 2 | Mua 1 paid plan mới và confirm | |
| 3 | Kiểm tra free lot cũ sau khi mua | |

**Expected Result:**
- Free lot cũ cũng được convert sang No-Expiry giống paid lot (AC-2 áp dụng cho "paid and/or free")

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NOEXP-008 | User hủy purchase (không confirm) → lot cũ KHÔNG bị convert

| Field | Nội dung |
|-------|---------|
| **Loại** | Negative |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Account test có lot cũ còn hạn 2 năm

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Đăng nhập account có lot cũ | |
| 2 | Vào flow mua plan, tới màn hình point-of-purchase (thấy disclosure) | |
| 3 | Hủy/thoát khỏi màn hình mà KHÔNG bấm Confirm/Pay | |
| 4 | Kiểm tra lại hạn dùng lot cũ | |

**Expected Result:**
- Vì giao dịch chưa được confirm/hoàn tất, các lot cũ **giữ nguyên** hạn 2 năm ban đầu, không bị convert

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NOEXP-009 | API danh sách data plan trả đúng flag No-Expiry sau khi convert

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Đã thực hiện convert theo TC-EP-NOEXP-005

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Sau khi purchase convert thành công, gọi API lấy danh sách data plan/data wallet | |
| 2 | Kiểm tra response cho từng lot | |

**Expected Result:**
- HTTP 200
- Từng lot (kể cả lot cũ vừa convert) trả về đúng field/flag No-Expiry, không còn trả về `expiredDate` cũ

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NOEXP-010 | Transfer data No-Expiry từ User A → User B giữ nguyên No-Expiry

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC3 |

**Precondition:** User A có ít nhất 1 lot đang ở trạng thái No-Expiry; User B là account hợp lệ để nhận transfer

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Đăng nhập User A, chọn lot No-Expiry để transfer | |
| 2 | Thực hiện transfer sang User B, hoàn tất | |
| 3 | Đăng nhập User B, kiểm tra lot vừa nhận | |

**Expected Result:**
- Lot nhận được ở account User B vẫn giữ nguyên trạng thái **No-Expiry**

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NOEXP-011 | Sau transfer, toàn bộ plan còn hạn 2 năm khác của User B cũng convert sang No-Expiry

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC3 |

**Precondition:** User B có sẵn ≥1 lot khác đang còn hạn 2 năm (chưa convert) trước khi nhận transfer

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Kiểm tra hạn dùng các lot hiện có của User B trước khi nhận transfer | |
| 2 | User A transfer 1 lot No-Expiry sang User B | |
| 3 | Sau khi transfer hoàn tất, kiểm tra lại TẤT CẢ lot của User B | |

**Expected Result:**
- Không chỉ lot vừa nhận, mà TẤT CẢ lot khác của User B (đang còn hạn 2 năm) cũng được convert sang No-Expiry ngay khi transfer hoàn tất

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NOEXP-012 | User B chưa có plan nào trước khi nhận transfer No-Expiry

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC3 |

**Precondition:** User B là account mới, chưa có bất kỳ data plan nào

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | User A transfer 1 lot No-Expiry sang User B (account trắng) | |
| 2 | Đăng nhập User B, kiểm tra Data Balance | |

**Expected Result:**
- User B nhận đúng lot với trạng thái No-Expiry, không lỗi, không crash

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NOEXP-013 | Transfer data còn hạn 2 năm bình thường → không tự convert ngoài phạm vi AC3

| Field | Nội dung |
|-------|---------|
| **Loại** | Negative |
| **Priority** | P2 |
| **AC** | AC3 |

**Precondition:** User A có lot còn hạn 2 năm (KHÔNG phải No-Expiry) để transfer

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | User A transfer 1 lot còn hạn 2 năm (chưa convert) sang User B | |
| 2 | Kiểm tra lot nhận được ở User B | |

**Expected Result:**
- AC-3 chỉ quy định hành vi khi data transfer là **No-Expiry**; nếu data transfer vẫn còn hạn 2 năm bình thường thì giữ nguyên hạn đó ở account User B (không tự phát sinh No-Expiry ngoài đặc tả) — cần xác nhận với BE/PO nếu hành vi thực tế khác

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Đây là test case suy luận thêm ngoài AC được ghi rõ — cần confirm lại với PO/BE nếu behavior khác với expected ở trên.

---

### TC-EP-NOEXP-014 | API transfer-data-plan trả đúng expiry status cho cả 2 account

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC3 |

**Precondition:** Có thể mở DevTools Network khi thực hiện transfer

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Mở DevTools Network | |
| 2 | Thực hiện transfer lot No-Expiry từ User A sang User B | |
| 3 | Tìm API call `/api/Esims/transfer-data-plan` | |
| 4 | Kiểm tra response, sau đó gọi thêm API lấy data wallet của cả 2 account | |

**Expected Result:**
- API transfer trả về HTTP 200, `isSuccess: true`
- Data wallet của User B phản ánh đúng No-Expiry cho lot nhận và các lot khác bị convert

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NOEXP-015 | Trang T&C hiển thị nội dung mới đúng theo file đính kèm

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC4 |

**Precondition:** Đã tải file `No Expiry - New Policy.docx` từ Jira attachment để đối chiếu

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Mở file `No Expiry - New Policy.docx` để lấy nội dung chuẩn | |
| 2 | Vào trang Terms & Condition trên eCommerce site / App | |
| 3 | Đối chiếu từng đoạn nội dung liên quan đến No-Expiry với file gốc | |

**Expected Result:**
- Nội dung T&C trên UI khớp với nội dung trong file đính kèm (không thiếu đoạn, không sai chính tả/số liệu, ví dụ mốc ngày 01/06/2026, quy định 2 năm...)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NOEXP-016 | Nội dung T&C cập nhật đúng ở các ngôn ngữ khác (nếu đa ngôn ngữ)

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC4 |

**Precondition:** Site/app hỗ trợ đa ngôn ngữ cho trang T&C

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Chuyển ngôn ngữ khác (nếu có) trên site/app | |
| 2 | Vào lại trang T&C | |
| 3 | Kiểm tra nội dung liên quan No-Expiry đã được dịch/cập nhật | |

**Expected Result:**
- Nội dung mới xuất hiện đầy đủ ở các ngôn ngữ được hỗ trợ, không bị fallback nhầm về nội dung cũ hoặc để trống

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Nếu hệ thống chỉ có 1 ngôn ngữ, đánh dấu SKIP và ghi chú.

---

### TC-EP-NOEXP-017 | API `content-page/customer` trả về nội dung T&C đã update

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P2 |
| **AC** | AC4 |

**Precondition:** Biết content key tương ứng trang T&C

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Mở DevTools Network, vào trang T&C | |
| 2 | Tìm API call `GET /api/content-page/customer` | |
| 3 | Kiểm tra response body, đối chiếu nội dung trả về | |

**Expected Result:**
- HTTP 200
- Nội dung trả về khớp với nội dung mới hiển thị trên UI (đã cập nhật, không phải cache nội dung cũ)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Nếu nội dung bị cache cũ, kiểm tra thêm API `GET /api/content-page/Cache-language` / `Get-cache` xem có cần clear cache sau khi update không.

---

### TC-EP-NOEXP-018 | Admin chỉnh sửa/xem nội dung T&C qua CMS Content Page

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P2 |
| **AC** | AC4 |

**Precondition:** Đăng nhập Admin Portal với quyền quản lý Content Page

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Đăng nhập Admin Portal | |
| 2 | Vào module Content Page, tìm content key của trang T&C | |
| 3 | Mở chi tiết, kiểm tra nội dung hiện tại khớp bản đã update | |
| 4 | (Nếu cần) thử edit nhỏ rồi revert lại, xác nhận save thành công | |

**Expected Result:**
- Admin thấy đúng nội dung T&C mới trong CMS
- Update qua `PUT /api/content-page` hoạt động bình thường, không lỗi

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

## Kết luận

| Tổng TC | PASS | FAIL | BLOCKED | SKIP |
|---------|------|------|---------|------|
| 18 | — | — | — | — |

> Chưa thực thi — file này là test plan/test case chuẩn bị cho EP-5745. Cập nhật cột Actual Result / Status sau khi thực hiện test trên môi trường Staging.

**Cần chuẩn bị trước khi test:**
- Tải thủ công file `No Expiry - New Policy.docx` từ Jira attachment để đối chiếu nội dung T&C (AC-4)
- Phối hợp BE/DB seed 2 account test có data lot issued **trước 01/06/2026** (paid + free) để test AC-2, AC-3 (vì ngày hệ thống hiện tại đã qua mốc, không thể tạo lot "cũ" bằng thao tác mua thông thường)
- Xác nhận với BE/PO hành vi kỳ vọng cho TC-EP-NOEXP-013 (transfer data chưa No-Expiry) vì đây là case suy luận thêm ngoài AC gốc
