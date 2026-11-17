# Test Cases — EP-5814: [Lâm][Partner Portal] Add Purchase Credit and Payment Method for Merchant in Partner Portal

> **Jira ticket**: [EP-5814](https://eskimo-portal.atlassian.net/browse/EP-5814) (sub-task: [EP-5822](https://eskimo-portal.atlassian.net/browse/EP-5822))
> **Summary**: Add Purchase Credit and Payment Method for Merchant in Partner Portal
> **Status hiện tại**: QC | **Sprint**: Sprint 99 (active)
> **Priority**: Medium | **Tester**: Chi Nguyen | **Ngày**: 2026-07-14
> **BE link**: [EA-4121](https://eskimoapi.atlassian.net/browse/EA-4121)
> **Figma**: [UI Add New Partner/Partner Details](https://www.figma.com/design/RRNUauy5Tq6qGQXswY5j79/Eskimo--Portal-?node-id=17271-61957)
> **Test partner**: PN153886 (test_net) — Merchant Program enabled, Payment method = Prepaid. Truy cập qua Admin Portal → Partnership → Partners → search PN153886 → Edit → nút **Self Support** để mở Partner Portal đúng phiên của partner này.

---

## Tổng quan tính năng

Bổ sung tính năng **Purchase Credit** và **Payment Method** cho Merchant tại Partner Portal → Partner Sales → Vouchers (chỉ áp dụng cho partner có chương trình **Pre-paid Merchant**), đồng thời cập nhật Payment History và đảm bảo luồng mua/thanh toán dùng chung logic với Corporate > Payment.

---

## AC chính

- **AC1**: Thêm feature Purchase Credit / Payment Method vào Partner Sales > Vouchers, chỉ hiển thị cho partner Program = Pre-paid Merchant.
- **AC2**: Cập nhật Payment History — Transaction ID (format `transaction id (request id)` nếu có request id), phân biệt Transaction Type (Request Top Up / Purchase Credit), Status theo loại, có Download.
- **AC3**: Purchase Credit flow giống Corporate > Payment; Payment ID prefix `MERC-`; pricing giống Corporate; lưu record ở Admin > Transactions > Prepaid > Prepaid Transaction với Transaction Type = Merchant Credit; invoice/email giống format Corporate; validate minimum purchase ($200 lần đầu / $100 các lần sau), disable nút trừ khi đạt ngưỡng, cảnh báo đỏ khi nhập dưới ngưỡng.
- **AC4**: Payment Method dùng chung giữa Corporate và Merchant (thêm ở 1 bên thì bên kia cũng thấy).

---

## APIs liên quan (đối chiếu WBS)

| # | API | Method | Mục đích |
|---|-----|--------|---------|
| 1 | Purchase Credit (Merchant) | POST | Tạo giao dịch mua credit, payment ID prefix `MERC-` |
| 2 | Payment Method (Stripe) | GET/POST | Lấy/thêm thẻ thanh toán — dùng chung Corporate & Merchant |
| 3 | Payment History (Merchant) | GET | Danh sách Purchase Credit / Request Top Up |
| 4 | Prepaid Transaction (Admin) | GET | Đối chiếu record Transaction Type = Merchant Credit |

---

## Danh sách Test Case

| TC ID | Tên | Type | Priority | AC | Status |
|-------|-----|------|----------|----|--------|
| TC-EP-MPC-001 | Verify Merchant Program partner thấy nút Purchase Credit / Payment Method / Request Top-up | Happy path | P1 | AC1 | PASS |
| TC-EP-MPC-002 | Verify validation chặn mua dưới $100 (subsequent purchase) | Negative | P1 | AC3 | PASS |
| TC-EP-MPC-003 | Verify boundary đúng $100 — nút trừ disable, Complete Order enable | Edge | P1 | AC3 | PASS |
| TC-EP-MPC-004 | Verify Purchase Credit thành công — Transaction Number prefix `MERC-` | Happy path | P1 | AC3 | PASS |
| TC-EP-MPC-005 | Verify record lưu đúng ở Admin > Transactions > Pre-Paid > Prepaid Transaction, Type = Merchant Credit | Happy path | P1 | AC3 | PASS |
| TC-EP-MPC-006 | Verify email/invoice format Merchant giống Corporate | Happy path | P2 | AC3 | PASS |
| TC-EP-MPC-007 | Verify Payment Method dùng chung giữa Corporate và Merchant | Happy path | P1 | AC4 | PASS |
| TC-EP-MPC-008 | Verify format Transaction ID `transaction id (request id)` cho Request Top Up đã Approved | Negative | P2 | AC2 | FAIL → **PASS** (retest 2026-07-20, PN665580) |
| TC-EP-MPC-009 | Verify search transaction trong Payment History (Merchant) | Happy path | P1 | AC2 | FAIL → **PASS** (retest 2026-07-20, PN665580) |
| TC-EP-MPC-010 | Verify minimum purchase $200 cho lần mua đầu tiên | Negative | P2 | AC3 | Chưa test — cần partner chưa từng purchase |
| TC-EP-MPC-011 | Verify partner KHÔNG có Merchant Program thì không thấy feature | Negative | P2 | AC1 | Chưa test — cần partner đối chứng không có Merchant Program |

---

## Chi tiết Test Case

---

### TC-EP-MPC-001 | Verify Merchant Program partner thấy nút Purchase Credit / Payment Method / Request Top-up

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Partner Sales — Vouchers |
| **Jira ref** | EP-5814 (AC1) |
| **Priority** | P1 |
| **Type** | Happy path |

**Precondition:** Partner PN153886 (test_net) có Merchant Program Status = Enabled, Payment method = Prepaid (xác nhận tại Admin Portal > Partnership > Partners > Edit).

**Test Steps:**
1. Admin Portal → Partnership → Partners → search "PN153886" → Edit → click **Self Support**.
2. Trên Partner Portal mới mở, vào `#/merchant-vouchers` (Partner Sales > Vouchers).
3. Quan sát các nút action phía trên bảng Payment History.

**Expected Result:** Hiển thị đủ 3 nút: **Purchase Credit**, **Payment Method**, **Request Top-up**.

**Actual Result:** Cả 3 nút hiển thị đầy đủ, đúng như kỳ vọng.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-MPC-002 | Verify validation chặn mua dưới $100 (subsequent purchase)

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Purchase Credit modal |
| **Jira ref** | EP-5814 (AC3) |
| **Priority** | P1 |
| **Type** | Negative |

**Precondition:** Partner đã có lịch sử purchase trước đó (không phải lần đầu) → minimum áp dụng = $100.

**Test Steps:**
1. Click **Purchase Credit** → modal Secure Checkout mở, mặc định 500 credit.
2. Nhập giá trị `50` vào ô credit.
3. Quan sát cảnh báo và trạng thái nút.

**Expected Result:** Cảnh báo đỏ "Minimum purchase amount is $100 USD." hiển thị ngay dưới field; nút trừ (–) và Complete Order bị disable.

**Actual Result:** Đúng như kỳ vọng — cảnh báo đỏ hiển thị, nút "-" và "Complete Order" đều disabled khi giá trị = 50.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-MPC-003 | Verify boundary đúng $100 — nút trừ disable, Complete Order enable

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Purchase Credit modal |
| **Jira ref** | EP-5814 (AC3) |
| **Priority** | P1 |
| **Type** | Edge case |

**Test Steps:**
1. Trong modal Secure Checkout, nhập giá trị `100`.
2. Quan sát nút trừ (–) và Complete Order.

**Expected Result:** Không hiển thị cảnh báo; nút trừ (–) disable (ngăn giảm dưới ngưỡng); Complete Order enable.

**Actual Result:** Đúng như kỳ vọng.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-MPC-004 | Verify Purchase Credit thành công — Transaction Number prefix `MERC-`

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Purchase Credit modal |
| **Jira ref** | EP-5814 (AC3) |
| **Priority** | P1 |
| **Type** | Happy path |

**Test Steps:**
1. Với giá trị 100 credit, tick checkbox điều khoản, click **Complete Order**.
2. Quan sát popup PAYMENT SUCCESSFUL.

**Expected Result:** Popup hiển thị US$ 100.00, Transaction Number có prefix `MERC-`, Payment Method hiển thị đúng thẻ đã chọn.

**Actual Result:** PAYMENT SUCCESSFUL — Transaction Number = `MERC-260714-7317387`, Payment Time = 14 Jul 2026 04:56:14, Payment Method = Mastercard(****4444). Đúng kỳ vọng.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-MPC-005 | Verify record lưu đúng ở Admin > Transactions > Pre-Paid > Prepaid Transaction, Type = Merchant Credit

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Transactions — Pre-Paid |
| **Jira ref** | EP-5814 (AC3) |
| **Priority** | P1 |
| **Type** | Happy path |

**Test Steps:**
1. Admin Portal → Transactions → Pre-Paid.
2. Tại section "Pre Paid Transaction", search `MERC-260714-7317387`.

**Expected Result:** Tìm thấy 1 record, Transaction Type = "Merchant Credit", Partner Name = "test_net", Amount Paid = 100.

**Actual Result:** Đúng kỳ vọng — record xuất hiện với đầy đủ thông tin chính xác. Search cũng hoạt động tốt ở bảng này (khác với bug search ở Partner Portal — xem TC-EP-MPC-009).

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-MPC-006 | Verify email/invoice format Merchant giống Corporate

| Field | Nội dung |
|-------|---------|
| **Module** | Email invoice (yopmail) |
| **Jira ref** | EP-5814 (AC3) |
| **Priority** | P2 |
| **Type** | Happy path |

**Test Steps:**
1. Mở email "Eskimo Merchant - Credit Purchase Receipt" cho transaction `MERC-260714-7317387`.
2. So sánh cấu trúc với email "Eskimo Corporate Plan - Credits Transaction Receipt" gần nhất (transaction `CORP-260713-4461467`).

**Expected Result:** Cùng cấu trúc field: Transaction ID, Purchase Time, Admin Name, Amount Paid, Eskimo Credit, cùng footer công ty.

**Actual Result:** Cấu trúc giống hệt nhau ở cả 2 email, chỉ khác tiêu đề/câu mở đầu phù hợp ngữ cảnh Merchant/Corporate. **Cả 2 email đều hiển thị "Admin Name: Owner"** — xác nhận đây là behavior nhất quán (không phải lỗi riêng của Merchant, xem ghi chú ở [EP-5863](https://eskimo-portal.atlassian.net/browse/EP-5863) — để nguyên ticket theo yêu cầu, chưa đóng).

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-MPC-007 | Verify Payment Method dùng chung giữa Corporate và Merchant

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Payment Method modal |
| **Jira ref** | EP-5814 (AC4) |
| **Priority** | P1 |
| **Type** | Happy path |

**Test Steps:**
1. Mở Payment Method từ Merchant Vouchers — ghi nhận danh sách thẻ.
2. Mở Payment Method từ Corporate > Payment — so sánh danh sách thẻ.

**Expected Result:** Danh sách thẻ (số lượng, thẻ PRIMARY) giống hệt nhau ở cả 2 nơi.

**Actual Result:** Giống hệt nhau — 4 thẻ Mastercard ****4444, cùng 1 thẻ PRIMARY ở cả Corporate và Merchant.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-MPC-008 | Verify format Transaction ID `transaction id (request id)` cho Request Top Up đã Approved

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Payment History (Merchant) |
| **Jira ref** | EP-5814 (AC2) |
| **Priority** | P2 |
| **Type** | Negative |

**Test Steps:**
1. Vào Payment History (merchant-vouchers).
2. Tìm dòng Transaction Type = "Request Top Up", Status = "Approved" (VD: 13/07/2026 19:08).
3. Quan sát cột Transaction ID.

**Expected Result:** Hiển thị format `transaction id (request id)`, VD: `MERC-260714-092133 (1133)`.

**Actual Result (lần đầu):** Hiển thị `MERC-260714-092133-1133` — nối bằng dấu gạch ngang, không có dấu ngoặc đơn theo AC.

**Status:** `[ ] PASS  [x] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Defect: [EP-5864](https://eskimo-portal.atlassian.net/browse/EP-5864) — Merchant Payment History Transaction ID does not follow "transaction id (request id)" format for approved Request Top Up records.

---

**RETEST — 2026-07-20 | Partner PN665580 (S3-CORP), data mới seed cho EP-5822**

**Test Steps:** Vào Payment History (merchant-vouchers) → quan sát dòng Request Top Up đã Approved (20/07/2026 14:28).

**Actual Result:** Hiển thị `MERC-260720-072818-0365 (TUMER-000259)` — đúng format `transaction id (request id)` theo AC2.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Fix confirmed trên STG. Đã comment + chuyển [EP-5864](https://eskimo-portal.atlassian.net/browse/EP-5864) sang **Staging QC**.

---

### TC-EP-MPC-009 | Verify search transaction trong Payment History (Merchant)

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Payment History (Merchant) |
| **Jira ref** | EP-5822 / EP-5814 (AC2) |
| **Priority** | P1 |
| **Type** | Happy path |

**Test Steps:**
1. Ghi nhận 1 Transaction ID có sẵn trong bảng (không filter), VD `MERC-260713-6142773`.
2. Nhập đúng Transaction ID đó vào ô "Search by transaction".

**Expected Result:** Bảng hiển thị đúng 1 dòng khớp transaction đó.

**Actual Result (lần đầu):** Bảng trả về "No Data" dù transaction tồn tại trong danh sách không lọc.

**Status:** `[ ] PASS  [x] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Defect: [EP-5861](https://eskimo-portal.atlassian.net/browse/EP-5861) — Search by transaction ID in Payment History returns No Data even though the transaction exists.

---

**RETEST — 2026-07-20 | Partner PN665580 (S3-CORP), data mới seed cho EP-5822**

**Test Steps:** Search `MERC-260720-0694072` (full Transaction ID) → sau đó search `TUMER-000259` (request ID riêng).

**Actual Result:** Cả 2 lần search đều trả về đúng 1 dòng khớp, không còn "No Data".

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Fix confirmed trên STG. Đã comment + chuyển [EP-5861](https://eskimo-portal.atlassian.net/browse/EP-5861) sang **Staging QC**.

---

### TC-EP-MPC-010 | Verify minimum purchase $200 cho lần mua đầu tiên

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Purchase Credit modal |
| **Jira ref** | EP-5814 (AC3) |
| **Priority** | P2 |
| **Type** | Negative |

**Precondition:** Cần 1 partner Merchant Program **chưa từng** purchase credit lần nào (first-time).

**Test Steps:** *(chưa thực hiện — PN153886 đã có lịch sử 36 giao dịch, không phải first-time)*
1. Mở Purchase Credit với partner merchant chưa từng mua.
2. Nhập giá trị dưới $200 (VD: 150).
3. Quan sát cảnh báo.

**Expected Result:** Cảnh báo "Minimum purchase amount for your first credit purchase is $200 USD."

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

**Note / Evidence:** Cần cấp 1 partner merchant mới (chưa có giao dịch) để test case này.

---

### TC-EP-MPC-011 | Verify partner KHÔNG có Merchant Program thì không thấy feature

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Partner Sales |
| **Jira ref** | EP-5814 (AC1) |
| **Priority** | P2 |
| **Type** | Negative |

**Precondition:** Cần 1 partner không bật Merchant Program.

**Test Steps:** *(chưa thực hiện — chỉ có PN153886 trong scope hiện tại, partner này có bật Merchant Program)*
1. Login Partner Portal bằng partner không có Merchant Program.
2. Kiểm tra menu Partner Sales > Vouchers có xuất hiện không, hoặc nút Purchase Credit/Payment Method có ẩn không.

**Expected Result:** Không hiển thị feature Purchase Credit/Payment Method cho partner không thuộc Pre-paid Merchant.

**Actual Result:** *(chưa test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [x] SKIP`

**Note / Evidence:** Cần partner đối chứng (non-merchant) để hoàn thành test case này.

---

## Tổng kết Bug phát hiện

| Ticket | Mô tả | Severity | Retest |
|--------|-------|----------|--------|
| [EP-5861](https://eskimo-portal.atlassian.net/browse/EP-5861) | Search by transaction ID trong Payment History (Merchant) trả về No Data dù transaction tồn tại | High | **PASS** 2026-07-20 (PN665580) — chuyển **Staging QC** |
| [EP-5863](https://eskimo-portal.atlassian.net/browse/EP-5863) | Admin Name hiển thị "Owner" trong email invoice Merchant — **lưu ý: kiểm tra chéo cho thấy Corporate cũng hiển thị "Owner" tương tự, khả năng cao đây là behavior đúng chứ không phải bug. Ticket đang giữ nguyên theo yêu cầu, cần dev/PM xác nhận lại trước khi fix.** | Low (cần re-verify) | Chưa retest |
| [EP-5864](https://eskimo-portal.atlassian.net/browse/EP-5864) | Transaction ID cho Request Top Up đã Approved không đúng format `transaction id (request id)`, hiển thị nối dấu gạch ngang thay vì ngoặc đơn | Low | **PASS** 2026-07-20 (PN665580) — chuyển **Staging QC** |
