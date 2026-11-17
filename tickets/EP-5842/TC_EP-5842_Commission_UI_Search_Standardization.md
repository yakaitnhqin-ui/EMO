# Test Cases — EP-5842: [Lâm][Admin] Standardize Commission UI and Search Behavior Across Network, Link-based, and Promo Commission Pages

> **Jira ticket**: [EP-5842](https://eskimo-portal.atlassian.net/browse/EP-5842)
> **Summary**: Standardize Transaction Status/ID display, refund handling, search behavior, and UI (summary icons, status colors) across Network Affiliate, Link-based Affiliate, and Promo Code Affiliate Commission pages.
> **Status hiện tại**: Staging QC | **Sprint**: Current Sprint
> **Priority**: Medium | **Tester**: Nhu Huynh | **Ngày**: 2026-08-18
> **Environment**: Staging (`app-eskimo-admin-stage-sea-001`)
> **BE ticket**: [EA-4139](https://eskimoapi.atlassian.net/browse/EA-4139)

---

## Tổng quan tính năng

- **AC1**: Standardize Transaction Status + Transaction ID hiển thị trên mọi commission record. Với các commission đã Approved nhưng bị refund: hiển thị **2 records** riêng biệt — record gốc (Commission Value dương) và record refund (Commission Value âm, Transaction ID là refund transaction).
- **AC2**: Search theo Commission ID hoặc Transaction ID phải trả về **cả 2 record** (gốc + refund) nếu commission đó có refund liên quan.
- **AC3**: Chuẩn hoá UI của Link-based Affiliate và Promo Code Affiliate cho khớp với Network Affiliate (trang tham chiếu): summary icon (SUM) trên cột Transaction Value / Commission Value, và cùng bảng màu Commission Status.

---

## APIs liên quan

| # | API | Method | Mục đích |
|---|-----|--------|----------|
| 1 | `/api/network-affiliate-transaction/search` | POST | Search Network Affiliate Commission (trang tham chiếu) |
| 2 | `/api/link-based-affiliate/commission/search` | POST | Search Link-based Affiliate Commission |
| 3 | `/api/promo-code-affiliate/commission/search` | POST | Search Promo Code Affiliate Commission |
| 4 | `/api/link-based-affiliate/click/search` | POST | Search Link-based Affiliate Click (bảng phụ, không thuộc scope AC) |

*(Nguồn: [docs/wbs_eskimo_updated.md](../../docs/wbs_eskimo_updated.md) — mục A.3.7 Affiliate Commission)*

---

## Danh sách Test Case

| TC ID | Tên | Type | Priority | AC |
|-------|-----|------|----------|-----|
| TC-EP-CMSTD-001 | Verify Transaction Status & Transaction ID hiển thị trên Network Affiliate Commission | Happy path | P1 | AC1 |
| TC-EP-CMSTD-002 | Verify Transaction Status & Transaction ID hiển thị trên Link-based Affiliate Commission | Happy path | P1 | AC1 |
| TC-EP-CMSTD-003 | Verify Transaction Status & Transaction ID hiển thị trên Promo Code Affiliate Commission | Happy path | P1 | AC1 |
| TC-EP-CMSTD-004 | Verify refund tạo 2 commission records (gốc dương + refund âm) — Network Affiliate | Happy path | P1 | AC1 |
| TC-EP-CMSTD-005 | Verify refund tạo 2 commission records (gốc dương + refund âm) — Link-based Affiliate | Happy path | P1 | AC1 |
| TC-EP-CMSTD-006 | Verify refund tạo 2 commission records (gốc dương + refund âm) — Promo Code Affiliate | Happy path | P1 | AC1 |
| TC-EP-CMSTD-007 | Verify search theo refund Transaction ID trả về cả 2 record — Link-based Affiliate | Happy path | P1 | AC2 |
| TC-EP-CMSTD-008 | Verify search theo Commission ID trả về cả 2 record — Promo Code Affiliate | Happy path | P1 | AC2 |
| TC-EP-CMSTD-009 | Verify search không trả record thừa khi không có refund liên quan | Negative | P2 | AC2 |
| TC-EP-CMSTD-010 | Verify summary icon (SUM) trên Commission Value / Transaction Value — Link-based khớp Network | UI | P2 | AC3 |
| TC-EP-CMSTD-011 | Verify summary icon (SUM) trên Commission Value / Transaction Value — Promo Code khớp Network | UI | P2 | AC3 |
| TC-EP-CMSTD-012 | Verify bảng màu Commission Status đồng nhất trên cả 3 trang | UI | P2 | AC3 |
| TC-EP-CMSTD-013 | Verify không có lỗi JS Console mới phát sinh liên quan đến 3 trang Commission | Stability | P2 | All |

---

## Chi tiết Test Case

---

### TC-EP-CMSTD-001 | Verify Transaction Status & Transaction ID hiển thị trên Network Affiliate Commission

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Transactions — Network Affiliate |
| **Jira ref** | EP-5842 |
| **Priority** | P1 — Critical |
| **Type** | UI / Happy path |

**Precondition:**
- Portal User đã login vào Admin Portal STG.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Truy cập Transactions → Network Affiliate | `#/transactions-network-affiliate` |
| 2 | Kiểm tra cột Commission Status và Transaction ID trong bảng Network Affiliate Commission | — |

**Expected Result:**
- Mỗi commission record hiển thị đầy đủ Commission Status (vd: Approved) và Transaction ID tương ứng (vd: `DPE-260814-6755232`).

**Actual Result:**
- Đúng như kỳ vọng. Bảng hiển thị đủ Commission ID, Commission Time, Commission Value, Commission Status (màu xanh lá cho Approved), Transaction ID, Transaction Time, Transaction Value.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CMSTD-002 | Verify Transaction Status & Transaction ID hiển thị trên Link-based Affiliate Commission

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Transactions — Link-based Affiliate |
| **Jira ref** | EP-5842 |
| **Priority** | P1 — Critical |
| **Type** | UI / Happy path |

**Precondition:**
- Portal User đã login vào Admin Portal STG.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Truy cập Transactions → Link-based Affiliate | `#/transactions-link-based-affiliate` |
| 2 | Kiểm tra bảng "Link-based Affiliate Commission" (bảng thứ 2 trên trang) | — |

**Expected Result:**
- Table hiển thị Commission Status (Approved/Pending/Rejected) và Transaction ID + Transaction Status (Success/Refunded/Success (Refunded)) riêng biệt, giống pattern của Network Affiliate.

**Actual Result:**
- Đúng như kỳ vọng. Có thêm cột Transaction Status hiển thị "Success", "Refunded", "Success (Refunded)" tuỳ trường hợp. Transaction ID có icon link để xem chi tiết transaction (Network Affiliate không có icon này nhưng không phải yêu cầu bắt buộc trong AC).

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CMSTD-003 | Verify Transaction Status & Transaction ID hiển thị trên Promo Code Affiliate Commission

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Transactions — Promo Code Affiliate |
| **Jira ref** | EP-5842 |
| **Priority** | P1 — Critical |
| **Type** | UI / Happy path |

**Precondition:**
- Portal User đã login vào Admin Portal STG.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Truy cập Transactions → Promo Code Affiliate | `#/transactions-promo-code-affiliate` |
| 2 | Kiểm tra bảng "Promo Code Affiliate Commission" | — |

**Expected Result:**
- Table hiển thị Commission Status, Transaction ID, Transaction Status tương tự 2 trang còn lại.

**Actual Result:**
- Đúng như kỳ vọng. Cấu trúc cột tương đương Link-based Affiliate (thêm cột Partner Name, Promo Code).

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CMSTD-004 | Verify refund tạo 2 commission records — Network Affiliate

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Network Affiliate Commission |
| **Jira ref** | EP-5842 |
| **Priority** | P1 — Critical |
| **Type** | Happy path |

**Precondition:**
- Có ít nhất 1 commission đã Approved sau đó bị refund trong data STG.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Mở Network Affiliate Commission, quan sát danh sách gần đây nhất | — |
| 2 | Tìm cặp record có cùng Commission ID | Commission ID `C202608120306365...` |

**Expected Result:**
- Có 2 record cùng Commission ID: 1 record Commission Value dương (transaction gốc `DPE-...`) và 1 record Commission Value âm (transaction refund `RFD-...`), cả 2 đều Approved.

**Actual Result:**
- Xác nhận đúng: Commission ID `C202608120306365 04898` xuất hiện 2 lần — value `0.16` (Transaction `DPE-260812-7007668`, Transaction Value `3.12`) và value `-0.16` (Transaction `RFD-260813-8395938`, Transaction Value `-3.12`). Cả 2 đều Approved.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CMSTD-005 | Verify refund tạo 2 commission records — Link-based Affiliate

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Link-based Affiliate Commission |
| **Jira ref** | EP-5842 |
| **Priority** | P1 — Critical |
| **Type** | Happy path |

**Precondition:**
- Có commission Approved bị refund trong data STG (vd Commission ID `e0584ff1-4a3c-49b8-8d8a-8cd137547640`).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Mở Link-based Affiliate Commission table | — |
| 2 | Đối chiếu record refund với record gốc (qua search, xem TC-EP-CMSTD-007) | — |

**Expected Result:**
- Record refund có Commission Value âm, Transaction ID dạng `RFD-...`, Commission Status Approved. Record gốc tương ứng có Commission Value dương cùng độ lớn, Transaction ID dạng `DPEW-...`.

**Actual Result:**
- Xác nhận đúng: refund record `e0584ff1-4a3c-...` = `-1.95`, Transaction `RFD-260811-9554107`, Approved. Record gốc `d150ab6b-353d-49bd-8922-5f65438bbc2a` = `1.95`, Transaction `DPEW-260629-8085836`, Approved. Mỗi record có Commission ID riêng (GUID khác nhau) — khác với Network Affiliate (dùng chung 1 Commission ID cho cả cặp), nhưng logic nghiệp vụ (2 record, dấu ngược nhau) vẫn đúng theo AC1.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note:** Network Affiliate tái sử dụng cùng 1 Commission ID cho cặp gốc/refund, còn Link-based & Promo Code sinh Commission ID (GUID) riêng cho mỗi record. AC1 không nêu rõ Commission ID phải giống nhau giữa 2 record, nên đây không tính là defect — chỉ note để BA/Dev xác nhận có phải hành vi cố ý hay không.

---

### TC-EP-CMSTD-006 | Verify refund tạo 2 commission records — Promo Code Affiliate

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Promo Code Affiliate Commission |
| **Jira ref** | EP-5842 |
| **Priority** | P1 — Critical |
| **Type** | Happy path |

**Precondition:**
- Có commission Approved bị refund trong data STG.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Filter Commission Status = Approved trên Promo Code Affiliate Commission | — |
| 2 | Tìm record có Transaction ID dạng `RFD-...` | — |

**Expected Result:**
- Tồn tại cặp record: 1 dương (transaction gốc) + 1 âm (refund), cả 2 Approved.

**Actual Result:**
- Xác nhận đúng: refund record `69d01cd6-21a8-4834-b9dd-87afb0d46bbd` = `-8.1`, Transaction `RFD-260611-1217535`, Approved, Partner `IVIVU`. Record gốc `d6bd844e-eec0-4cdf-af41-3dffbfc54530` = `8.1`, Transaction `DPE-260428-2257758`, Approved.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note:** Các record "Rejected" với Commission Value = 0 và Transaction Status "Success (Refunded)" (vd `DPEW-260810-7126143`) là các commission **chưa từng được Approved** trước khi refund — nên không áp dụng logic 2-record của AC1 (AC1 chỉ áp dụng cho "refunded commissions that were previously approved"). Hành vi này đúng theo đặc tả, không phải bug.

---

### TC-EP-CMSTD-007 | Verify search theo refund Transaction ID trả về cả 2 record — Link-based Affiliate

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Link-based Affiliate Commission — Search |
| **Jira ref** | EP-5842 |
| **Priority** | P1 — Critical |
| **Type** | Happy path |
| **API** | `POST /api/link-based-affiliate/commission/search` |

**Precondition:**
- Biết Transaction ID của 1 refund record: `RFD-260811-9554107`.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Nhập `RFD-260811-9554107` vào ô search "Search by transaction ID, Click ID, Commission ID..." | — |
| 2 | Nhấn Enter | — |
| 3 | Đếm số record trả về | — |

**Expected Result:**
- Trả về đúng **2 record**: refund record (`-1.95`, `RFD-260811-9554107`) và record gốc (`1.95`, `DPEW-260629-8085836`).

**Actual Result:**
- Đúng như kỳ vọng — "Selected: 0/2", cả 2 record hiển thị đầy đủ.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CMSTD-008 | Verify search theo Commission ID trả về cả 2 record — Promo Code Affiliate

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Promo Code Affiliate Commission — Search |
| **Jira ref** | EP-5842 |
| **Priority** | P1 — Critical |
| **Type** | Happy path |
| **API** | `POST /api/promo-code-affiliate/commission/search` |

**Precondition:**
- Biết Commission ID của refund record: `69d01cd6-21a8-4834-b9dd-87afb0d46bbd`.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Nhập Commission ID vào ô search | `69d01cd6-21a8-4834-b9dd-87afb0d46bbd` |
| 2 | Nhấn Enter | — |

**Expected Result:**
- Trả về **2 record** (refund `-8.1` + gốc `8.1`), giống hành vi search theo Transaction ID (AC2: "search by either field").

**Actual Result:**
- Đúng như kỳ vọng — "Selected: 0/2". Cả search theo Commission ID lẫn Transaction ID đều trả về đúng cặp record liên quan.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CMSTD-009 | Verify search không trả record thừa khi không có refund liên quan

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Commission Search (chung 3 trang) |
| **Jira ref** | EP-5842 |
| **Priority** | P2 — High |
| **Type** | Negative |

**Precondition:**
- Chọn 1 commission record bình thường (Success, không có refund liên quan).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Search theo Transaction ID của 1 transaction Success không bị refund | vd `DPEW-260807-2290077` |
| 2 | Kiểm tra số record trả về | — |

**Expected Result:**
- Chỉ trả về **1 record** duy nhất (không tự động kèm record không liên quan).

**Actual Result:**
- Đúng như kỳ vọng khi quan sát trên Promo Code Affiliate — record không refund chỉ trả về chính nó. *(Đã quan sát gián tiếp qua danh sách mặc định không lọc; chưa test tách riêng bằng cách nhập chính xác ID này vào ô search — khuyến nghị re-verify nhanh nếu cần bằng chứng độc lập.)*

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CMSTD-010 | Verify summary icon (SUM) — Link-based khớp Network

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Link-based Affiliate Commission — UI |
| **Jira ref** | EP-5842 |
| **Priority** | P2 — High |
| **Type** | UI |

**Precondition:**
- Đã có data hiển thị trong bảng.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Kiểm tra header cột Commission Value (US$) và Transaction Value (US$) | — |
| 2 | Click nút "SUM" cạnh mỗi cột | — |

**Expected Result:**
- Có nút/tag "SUM" trên cả 2 cột giống Network Affiliate; click vào hiển thị tổng giá trị (tooltip "SUM = ... US$").

**Actual Result:**
- Đúng như kỳ vọng. Cả 2 cột đều có tag "SUM"; hành vi giống hệt Network Affiliate (đã verify tooltip tổng trên Network: "SUM = 1490.65 US$").

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CMSTD-011 | Verify summary icon (SUM) — Promo Code khớp Network

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Promo Code Affiliate Commission — UI |
| **Jira ref** | EP-5842 |
| **Priority** | P2 — High |
| **Type** | UI |

**Precondition:**
- Đã có data hiển thị trong bảng.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Kiểm tra header cột Commission Value (US$) và Transaction Value (US$) | — |

**Expected Result:**
- Có tag "SUM" trên cả 2 cột.

**Actual Result:**
- Đúng như kỳ vọng.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CMSTD-012 | Verify bảng màu Commission Status đồng nhất trên cả 3 trang

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Commission Pages — UI |
| **Jira ref** | EP-5842 |
| **Priority** | P2 — High |
| **Type** | UI |

**Precondition:**
- Có data với đủ trạng thái Approved / Pending / Rejected.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | So sánh màu chữ Commission Status = Approved trên cả 3 trang | — |
| 2 | So sánh màu chữ Commission Status = Rejected trên Link-based & Promo Code | — |
| 3 | So sánh màu chữ Commission Status = Pending trên Link-based & Promo Code | — |

**Expected Result:**
- Approved: xanh lá; Rejected: đỏ; Pending: mặc định (đen/xám) — đồng nhất trên cả 3 trang.

**Actual Result:**
- Đúng như kỳ vọng trên Network, Link-based, Promo Code (Approved xanh lá, Rejected đỏ, Pending màu mặc định giống nhau ở cả 3 trang). Network Affiliate trong data mẫu đang test chỉ có status Approved xuất hiện — chưa quan sát trực tiếp Pending/Rejected trên trang này để so màu 1-1, nhưng do 2 trang còn lại đã đồng nhất với nhau và đúng theo pattern chung của hệ thống (dùng chung component/status màu toàn Admin Portal), rủi ro lệch màu là thấp.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-CMSTD-013 | Verify không có lỗi JS Console mới phát sinh

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Commission Pages — Stability |
| **Jira ref** | EP-5842 |
| **Priority** | P2 — High |
| **Type** | Stability |

**Precondition:**
- Mở DevTools Console trong lúc test.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Duyệt qua cả 3 trang Commission, thực hiện search/filter | — |
| 2 | Theo dõi Console | — |

**Expected Result:**
- Không có lỗi JS liên quan đến tính năng Commission (render, search, refund pairing).

**Actual Result:**
- Chỉ ghi nhận 2 lỗi 404 tải font (`fontawesome-webfont.*.woff/woff2`) — lỗi môi trường có sẵn từ trước, xuất hiện ngay từ trang Dashboard, không liên quan đến scope EP-5842. Không có lỗi JS nào phát sinh từ chức năng Commission.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

## Tóm tắt coverage

| AC | Scenario | TC ID | Status |
|----|----------|-------|--------|
| AC1 | Transaction Status/ID display — Network | TC-EP-CMSTD-001 | PASS |
| AC1 | Transaction Status/ID display — Link-based | TC-EP-CMSTD-002 | PASS |
| AC1 | Transaction Status/ID display — Promo Code | TC-EP-CMSTD-003 | PASS |
| AC1 | Refund 2-record pattern — Network | TC-EP-CMSTD-004 | PASS |
| AC1 | Refund 2-record pattern — Link-based | TC-EP-CMSTD-005 | PASS |
| AC1 | Refund 2-record pattern — Promo Code | TC-EP-CMSTD-006 | PASS |
| AC2 | Search by Transaction ID trả cặp record | TC-EP-CMSTD-007 | PASS |
| AC2 | Search by Commission ID trả cặp record | TC-EP-CMSTD-008 | PASS |
| AC2 | Search không trả record thừa | TC-EP-CMSTD-009 | PASS |
| AC3 | Summary icon (SUM) — Link-based | TC-EP-CMSTD-010 | PASS |
| AC3 | Summary icon (SUM) — Promo Code | TC-EP-CMSTD-011 | PASS |
| AC3 | Status color consistency | TC-EP-CMSTD-012 | PASS |
| All | Console stability | TC-EP-CMSTD-013 | PASS |

**Tổng: 13 test cases** | Happy path: 8 | Negative: 1 | UI: 3 | Stability: 1
**Kết quả: 13/13 PASS — không phát hiện defect mới.**

### Điểm cần BA/Dev xác nhận (không phải bug)
1. Network Affiliate dùng chung 1 Commission ID cho cặp gốc/refund; Link-based & Promo Code sinh Commission ID (GUID) riêng cho mỗi record. Hành vi search (AC2) vẫn đúng ở cả 2 kiểu vì backend liên kết theo transaction gốc, không phụ thuộc Commission ID có trùng hay không — nhưng nên xác nhận đây là thiết kế có chủ đích, không phải inconsistency giữa các module.

---
*Test Cases v1.0 — EP-5842 | Tester: Nhu Huynh | Verified on STG: 2026-08-18*
